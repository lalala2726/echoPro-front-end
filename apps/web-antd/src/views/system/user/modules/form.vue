<script lang="ts" setup>
import type { Option } from '@vben/types';

import type { SysUserType } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDeptOptions } from '#/api/system/dept';
import { getOptions as getPostOptions } from '#/api/system/post';
import { getRoleOption } from '#/api/system/role';
import { addUser, getUserById, updateUser } from '#/api/system/user';
import { UploadAvatar } from '#/components/Upload';

import { useFormSchema } from '../data';

interface DeptOption {
  value: string;
  label: string;
  children?: DeptOption[];
}

const emit = defineEmits(['success']);
const formData = ref<Partial<SysUserType.SysUser>>();
const userAvatar = ref<string>('');
const deptOptions = ref<DeptOption[]>([]);
const roleOptions = ref<Option[]>([]);
const postOptions = ref<Option<string>[]>([]);

const getTitle = computed(() => {
  return formData.value?.userId ? '修改用户' : '新增用户';
});
const [Form, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2 md:col-span-1',
  },
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

/**
 * 加载部门选项
 */
async function loadDeptOptions() {
  try {
    const result = await getDeptOptions();
    deptOptions.value = result || [];

    // 更新表单中部门选择器的选项
    await formApi.updateSchema([
      {
        fieldName: 'deptId',
        componentProps: {
          options: deptOptions.value,
        },
      },
    ]);
  } catch (error) {
    console.error('加载部门选项失败:', error);
  }
}

/**
 * 加载角色选项
 */
async function loadRoleOptions() {
  try {
    const result = await getRoleOption();
    // getRoleOption返回的是Option[]数组，直接使用
    roleOptions.value = result || [];

    // 更新表单中角色选择器的选项
    formApi.updateSchema([
      {
        fieldName: 'roleIds',
        componentProps: {
          options: roleOptions.value,
        },
      },
    ]);
  } catch (error) {
    console.error('加载角色选项失败:', error);
  }
}

/**
 * 加载岗位选项
 */
async function loadPostOptions() {
  try {
    const result = await getPostOptions();
    postOptions.value = result || [];
    formApi.updateSchema([
      {
        fieldName: 'postId',
        componentProps: {
          options: postOptions.value,
        },
      },
    ]);
  } catch (error) {
    console.error('加载岗位选项失败:', error);
  }
}

/**
 * 加载用户详情数据
 */
async function loadUserData(userId: number) {
  try {
    const userDetail = await getUserById(userId);
    formData.value = userDetail;
    userAvatar.value = userDetail.avatar || '';

    // 提取用户的角色ID数组
    let roleIds: string[] = [];
    if (userDetail.sysRoles && Array.isArray(userDetail.sysRoles)) {
      roleIds = userDetail.sysRoles.map((role: any) => role.roleId || role.id);
    } else if (userDetail.roleIds && Array.isArray(userDetail.roleIds)) {
      roleIds = userDetail.roleIds;
    }

    // 设置表单数据，确保部门ID、角色ID和岗位ID正确设置
    const deptIdValue =
      (userDetail as any).deptId ?? userDetail.sysDept?.deptId;
    const postIdValue = (userDetail as any).postId;
    
    // 岗位ID已经是string类型，无需转换
    await formApi.setValues({
      ...userDetail,
      deptId: deptIdValue === null ? undefined : String(deptIdValue),
      roleIds,
      postId: postIdValue === null || postIdValue === undefined ? undefined : postIdValue,
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      drawerApi.lock();
      const data = await formApi.getValues();
      try {
        // 出参类型转换：后端要求使用数字ID（除了岗位ID是string类型）
        const payload: any = {
          ...data,
          avatar: userAvatar.value || data.avatar,
          deptId:
            data.deptId !== undefined && data.deptId !== null
              ? Number(data.deptId)
              : undefined,
          roleIds: Array.isArray(data.roleIds)
            ? (data.roleIds as Array<number | string>).map(Number)
            : [],
          // 岗位ID保持string类型，无需转换
          postId:
            data.postId !== undefined && data.postId !== null && data.postId !== ''
              ? data.postId
              : undefined,
        };

        await (formData.value?.userId
          ? updateUser({
              ...payload,
              userId: formData.value.userId,
            } as unknown as SysUserType.SysUserUpdateRequest)
          : addUser(payload as unknown as SysUserType.SysUserAddRequest));
        await drawerApi.close();
        emit('success');
      } finally {
        drawerApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      // 设置Drawer的loading状态
      drawerApi.setState({ loading: true });

      // 使用nextTick确保DOM更新后再执行异步操作
      nextTick(async () => {
        try {
          // 并行加载基础数据
          await Promise.all([
            loadDeptOptions(),
            loadRoleOptions(),
            loadPostOptions(),
          ]);

          const data = drawerApi.getData<SysUserType.SysUser>();
          if (data && data.userId) {
            // 编辑模式：加载完整的用户详情
            formData.value = data;
            await loadUserData(data.userId);
          } else {
            // 新增模式：重置表单
            formData.value = {};
            userAvatar.value = '';
            await formApi.resetForm();
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          // 关闭Drawer的loading状态
          drawerApi.setState({ loading: false });
        }
      });
    } else {
      // 弹窗关闭时立即重置状态
      formData.value = {};
      userAvatar.value = '';
      drawerApi.setState({ loading: false });
    }
  },
});

defineExpose(drawerApi);
</script>

<template>
  <Drawer :title="getTitle" class="w-[40%]">
    <div class="mx-4">
      <!-- 顶部：用户头像（独占一行） -->
      <div class="mb-4 text-center">
        <div class="flex justify-center">
          <UploadAvatar v-model:value="userAvatar" :size="80" />
        </div>
      </div>

      <!-- 表单：两列布局 -->
      <Form />
    </div>
  </Drawer>
</template>

<style scoped></style>
