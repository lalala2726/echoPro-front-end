<script lang="ts" setup>
import type { SystemMessageManageType } from '#/api/system/messageManage';

import { computed } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Typography } from 'ant-design-vue';

const messageData = defineModel<SystemMessageManageType.SysMessageVo>();

const getTitle = computed(() => {
  return `预览消息 - ${messageData.value?.title || ''}`;
});
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen) {
    if (isOpen) {
      messageData.value =
        modalApi.getData<SystemMessageManageType.SysMessageVo>();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-4/5">
    <div v-if="messageData" class="space-y-6">
      <!-- 消息内容 -->
      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <Typography.Title :level="4" class="mb-4"> 消息内容 </Typography.Title>
        <div
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="messageData.content"
        ></div>
      </div>

      <!-- 目标接收者信息 -->
      <div
        v-if="messageData.targetIds && messageData.targetIds.length > 0"
        class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <Typography.Title :level="4" class="mb-4">
          目标接收者
        </Typography.Title>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">接收者ID列表：</span>
          <span class="ml-2">{{ messageData.targetIds.join(', ') }}</span>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.prose {
  @apply text-gray-700 dark:text-gray-300;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-gray-900 dark:text-gray-100;
}

.prose a {
  @apply text-blue-600 dark:text-blue-400;
}

.prose code {
  @apply rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800;
}

.prose pre {
  @apply rounded-lg bg-gray-100 p-4 dark:bg-gray-800;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic dark:border-gray-600;
}
</style>
