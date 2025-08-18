<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message, Space } from 'ant-design-vue';

import UploadManual from '#/components/Upload/UploadManual.vue';

const emit = defineEmits<{
  success: [];
}>();

const uploadRef = ref();

const [Modal, modalApi] = useVbenModal({
  title: '文件上传',
  class: 'w-[600px] min-w-[400px]',
  onConfirm: handleUpload,
  onCancel: handleCancel,
  onOpenChange(isOpen) {
    if (!isOpen) {
      // 弹窗关闭时重置状态
      uploadRef.value?.clearFiles();
    }
  },
});

// 处理上传
async function handleUpload() {
  try {
    modalApi.setState({ confirmLoading: true });
    // 触发手动上传
    await uploadRef.value?.uploadFiles();
    modalApi.close();
    // 通知父组件上传成功，需要刷新列表
    emit('success');
  } catch (error) {
    console.error('上传失败:', error);
    message.error('文件上传失败');
  } finally {
    modalApi.setState({ confirmLoading: false });
  }
}

// 处理取消
function handleCancel() {
  // 取消时重置上传组件
  uploadRef.value?.clearFiles();
}

// 暴露方法给父组件
defineExpose({
  modalApi,
});
</script>

<template>
  <Modal>
    <div class="p-4">
      <UploadManual
        ref="uploadRef"
        :max-count="10"
        :max-size="100"
        select-text="选择文件"
        upload-text="开始上传"
        clear-text="清空列表"
        @success="() => {}"
        @error="(error) => message.error(error.message || '上传失败')"
      />
    </div>

    <template #footer>
      <Space>
        <Button @click="modalApi.close">取消</Button>
        <Button type="primary" @click="handleUpload">确定上传</Button>
      </Space>
    </template>
  </Modal>
</template>
