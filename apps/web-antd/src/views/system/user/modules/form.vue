<script lang="ts" setup>
import type { Option } from '@vben/types';

import type { SysUserType } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDeptOptions } from '#/api/system/dept';
import { getRoleOption } from '#/api/system/role';
import { addUser, getUserById, updateUser } from '#/api/system/user';

import { useFormSchema } from '../data';

interface DeptOption {
  value: string;
  label: string;
  children?: DeptOption[];
}

const emit = defineEmits(['success']);
const formData = ref<Partial<SysUserType.SysUser>>();
const deptOptions = ref<DeptOption[]>([]);
const roleOptions = ref<Option[]>([]);

const getTitle = computed(() => {
  return formData.value?.userId ? '修改用户' : '新增用户';
});
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
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
          treeData: deptOptions.value,
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
    await formApi.updateSchema([
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
 * 加载用户详情数据
 */
async function loadUserData(userId: number) {
  try {
    const userDetail = await getUserById(userId);
    formData.value = userDetail;

    // 提取用户的角色ID数组
    let roleIds: string[] = [];
    if (userDetail.sysRoles && Array.isArray(userDetail.sysRoles)) {
      roleIds = userDetail.sysRoles.map((role: any) => role.roleId || role.id);
    } else if (userDetail.roleIds && Array.isArray(userDetail.roleIds)) {
      roleIds = userDetail.roleIds;
    }

    // 设置表单数据，确保部门ID和角色ID正确设置
    await formApi.setValues({
      ...userDetail,
      deptId: userDetail.deptId || userDetail.sysDept?.deptId,
      roleIds,
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
  }
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.userId
          ? updateUser({
              ...data,
              userId: formData.value.userId,
            } as SysUserType.SysUser)
          : addUser(data as SysUserType.SysUser));
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      // 设置Modal的loading状态
      modalApi.setState({ loading: true });

      // 使用nextTick确保DOM更新后再执行异步操作
      nextTick(async () => {
        try {
          // 并行加载基础数据
          await Promise.all([loadDeptOptions(), loadRoleOptions()]);

          const data = modalApi.getData<SysUserType.SysUser>();
          if (data && data.userId) {
            // 编辑模式：加载完整的用户详情
            formData.value = data;
            await loadUserData(data.userId);
          } else {
            // 新增模式：重置表单
            formData.value = {};
            await formApi.resetForm();
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          // 关闭Modal的loading状态
          modalApi.setState({ loading: false });
        }
      });
    } else {
      // 弹窗关闭时立即重置状态
      formData.value = {};
      modalApi.setState({ loading: false });
    }
  },
});

defineExpose(modalApi);
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
  </Modal>
</template>

<style scoped></style>
