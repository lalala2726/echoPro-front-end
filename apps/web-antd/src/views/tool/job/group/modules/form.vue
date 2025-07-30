<script lang="ts" setup>
import type { JobGroupType } from '#/api/tool/job/type/groupType';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { addGroup, getGroupInfoById, updateGroup } from '#/api/tool/job/group';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<Partial<JobGroupType.SysJobGroupVo>>();
const getTitle = computed(() => {
  return formData.value?.id ? '修改任务组' : '新增任务组';
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

/**
 * 加载任务组详情数据
 */
async function loadGroupData(groupId: number) {
  try {
    const groupDetail = await getGroupInfoById(groupId);
    formData.value = groupDetail;
    await formApi.setValues(groupDetail);
  } catch (error) {
    console.error('获取任务组详情失败:', error);
  }
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.id
          ? updateGroup({
              ...data,
              id: formData.value.id,
            } as JobGroupType.SysJobGroupUpdateRequest)
          : addGroup(data as JobGroupType.SysJobGroupAddRequest));
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
          const data = modalApi.getData<JobGroupType.SysJobGroupVo>();

          if (data && data.id) {
            // 编辑模式：加载完整的任务组详情
            formData.value = data;
            const groupId = data.id;
            await (groupId === null
              ? formApi.setValues(data)
              : loadGroupData(groupId));
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
