<script lang="ts" setup>
import type { SysUserType } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { resetUserPassword } from '#/api/system/user';

const emit = defineEmits(['success']);
const userData = ref<Partial<SysUserType.SysUser>>();

const getTitle = computed(() => {
  return `重置密码 - ${userData.value?.username || ''}`;
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      componentProps: {
        disabled: true,
        placeholder: '用户名',
      },
    },
    {
      component: 'VbenInputPassword',
      fieldName: 'password',
      label: '新密码',
      rules: z.string().min(1, '请输入新密码'),
      componentProps: {
        placeholder: '请输入新密码',
      },
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  confirmText: '确认重置',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid && userData.value?.userId) {
      modalApi.lock();
      const formData = await formApi.getValues();
      try {
        await resetUserPassword({
          userId: userData.value.userId,
          password: formData.password,
        });
        await modalApi.close();
        // 发送成功事件
        emit('success', {
          username: userData.value.username,
        });
      } finally {
        modalApi.lock(false);
      }
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<SysUserType.SysUser>();
      if (data) {
        userData.value = data;
        // 设置表单默认值
        await formApi.setValues({
          username: data.username,
          password: '123456', // 默认密码
        });
      }
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
