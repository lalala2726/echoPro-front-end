<script lang="ts" setup>
import type { SystemMessageManageType } from '#/api/system/messageManage';

import { computed } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Tag, Typography } from 'ant-design-vue';

const messageData = defineModel<SystemMessageManageType.SysMessageVo>();

const getTitle = computed(() => {
  return `预览消息 - ${messageData.value?.title || ''}`;
});

// 消息类型映射
const MESSAGE_TYPES = {
  1: { label: '系统消息', color: 'blue' },
  2: { label: '通知消息', color: 'success' },
  3: { label: '公告消息', color: 'warning' },
} as const;

// 消息级别映射
const MESSAGE_LEVELS = {
  1: { label: '普通', color: 'default' },
  2: { label: '重要', color: 'warning' },
  3: { label: '紧急', color: 'error' },
} as const;

// 目标类型映射
const TARGET_TYPES = {
  1: { label: '指定用户', color: 'blue' },
  2: { label: '全部用户', color: 'success' },
  3: { label: '角色用户', color: 'warning' },
} as const;

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
      <!-- 消息基本信息 -->
      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <Typography.Title :level="4" class="mb-4">
          消息基本信息
        </Typography.Title>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              消息标题：
            </span>
            <span class="ml-2 text-sm text-gray-900 dark:text-gray-100">
              {{ messageData.title }}
            </span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              消息类型：
            </span>
            <Tag
              v-if="messageData.type"
              :color="
                MESSAGE_TYPES[messageData.type as keyof typeof MESSAGE_TYPES]
                  ?.color
              "
              class="ml-2"
            >
              {{
                MESSAGE_TYPES[messageData.type as keyof typeof MESSAGE_TYPES]
                  ?.label
              }}
            </Tag>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              消息级别：
            </span>
            <Tag
              v-if="messageData.level"
              :color="
                MESSAGE_LEVELS[messageData.level as keyof typeof MESSAGE_LEVELS]
                  ?.color
              "
              class="ml-2"
            >
              {{
                MESSAGE_LEVELS[messageData.level as keyof typeof MESSAGE_LEVELS]
                  ?.label
              }}
            </Tag>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              发送者：
            </span>
            <span class="ml-2 text-sm text-gray-900 dark:text-gray-100">
              {{ messageData.senderName || '系统' }}
            </span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              目标类型：
            </span>
            <Tag
              v-if="messageData.targetType"
              :color="
                TARGET_TYPES[
                  messageData.targetType as keyof typeof TARGET_TYPES
                ]?.color
              "
              class="ml-2"
            >
              {{
                TARGET_TYPES[
                  messageData.targetType as keyof typeof TARGET_TYPES
                ]?.label
              }}
            </Tag>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
              发布时间：
            </span>
            <span class="ml-2 text-sm text-gray-900 dark:text-gray-100">
              {{ messageData.publishTime }}
            </span>
          </div>
        </div>
      </div>

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
