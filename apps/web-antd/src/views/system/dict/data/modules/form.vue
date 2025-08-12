<script lang="ts" setup>
import type { SystemDictDataType } from '#/api/system/dict/dictData';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { addDictData, updateDictData } from '#/api/system/dict/dictData';

const emit = defineEmits(['success']);
const formData = ref<SystemDictDataType.DictDataVo>();

const getTitle = computed(() => {
  return formData.value?.id ? '修改字典值' : '新增字典值';
});

const formSchema = [
  {
    component: 'Input',
    fieldName: 'id',
    label: '字典值ID',
    componentProps: { disabled: true },
    dependencies: {
      triggerFields: ['id'],
      show: (values: any) => !!values.id,
    },
  },
  {
    component: 'Input',
    fieldName: 'dictType',
    label: '字典类型',
    componentProps: { disabled: true },
  },
  {
    component: 'Input',
    fieldName: 'dictLabel',
    label: '字典标签',
    rules: 'required',
    componentProps: {
      placeholder: '请输入字典标签',
    },
  },
  {
    component: 'Input',
    fieldName: 'dictValue',
    label: '字典值',
    rules: 'required',
    componentProps: {
      placeholder: '请输入字典值',
    },
  },
  {
    component: 'Input',
    fieldName: 'color',
    label: '颜色',
    componentProps: {
      placeholder: '请输入颜色',
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'sort',
    label: '排序',
    componentProps: {
      min: 0,
      placeholder: '请输入排序',
      class: 'w-full',
    },
  },
  {
    component: 'RadioGroup',
    fieldName: 'status',
    label: '状态',
    defaultValue: 0,
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '启用', value: 0 },
        { label: '禁用', value: 1 },
      ],
      optionType: 'button',
    },
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: '备注',
    componentProps: {
      placeholder: '请输入备注',
      rows: 3,
    },
  },
];

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: formSchema,
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
          ? updateDictData({
              id: formData.value.id,
              ...data,
            } as SystemDictDataType.DictDataUpdateRequest)
          : addDictData(data as any));
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDictDataType.DictDataVo>();
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
        <Button type="primary" danger @click="resetForm">重置</Button>
      </div>
    </template>
  </Modal>
</template>
