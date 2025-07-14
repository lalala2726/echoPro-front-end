<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system/dict';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDictKey, updateDictKey } from '#/api/system/dict';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemDictApi.SystemDictKey>();
const getTitle = computed(() => {
  return formData.value?.id ? '修改字典' : '新增字典';
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.id
          ? updateDictKey({
              id: formData.value.id,
              ...data,
            } as SystemDictApi.SystemDictKey)
          : createDictKey(data as any));
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDictApi.SystemDictKey>();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm"> 重置</Button>
      </div>
    </template>
  </Modal>
</template>
