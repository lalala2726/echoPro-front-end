<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDeptOptions } from '#/api/system/dept';
import { addUser, getUserById, updateUser } from '#/api/system/user';

import { useFormSchema } from '../data';

interface DeptOption {
  value: string;
  label: string;
  children?: DeptOption[];
}

const emit = defineEmits(['success']);
const formData = ref<Partial<SystemUserApi.SysUser>>();
const deptOptions = ref<DeptOption[]>([]);

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
 * 加载用户详情数据
 */
async function loadUserData(userId: number) {
  try {
    const userDetail = await getUserById(userId);
    formData.value = userDetail;

    // 设置表单数据，确保部门ID正确设置
    await formApi.setValues({
      ...userDetail,
      deptId: userDetail.deptId || userDetail.sysDept?.deptId,
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
  }
}

const [Modal, modalApi] = useVbenModal({
  footer: true,
  showCancelButton: true,
  showConfirmButton: true,
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
          } as SystemUserApi.SysUser)
          : addUser(data as SystemUserApi.SysUser));
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      await loadDeptOptions();
      const data = modalApi.getData<SystemUserApi.SysUser>();
      if (data && data.userId) {
        // 编辑模式：加载完整的用户详情
        formData.value = data;
        await loadUserData(data.userId);
      } else {
        // 新增模式：重置表单
        formData.value = {};
        await formApi.resetForm();
      }
    }
  },
});

defineExpose(modalApi);
</script>

<template>
  <Modal :title="getTitle" class="w-full !max-w-2xl">
    <Form class="pr-2" />
  </Modal>
</template>

<style scoped></style>
