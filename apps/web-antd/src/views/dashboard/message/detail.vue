<script lang="ts" setup>
import type { SystemMessageType } from '#/api/system/message';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { IconifyIcon } from '@vben/icons';

import { Button, Card, message, Spin, Tag, Typography } from 'ant-design-vue';

import { getMessageDetailById, markMessageAsRead } from '#/api/system/message';
import { useMessageStore } from '#/composables/useMessageStore';

defineOptions({
  name: 'MessageDetail',
});

const route = useRoute();
const router = useRouter();

// 全局消息状态
const { fetchUnreadCountFromList, triggerLayoutRefresh } = useMessageStore();

// 响应式数据
const loading = ref(false);
const messageDetail = ref<null | SystemMessageType.UserMessageVo>(null);

// 消息类型映射
const MESSAGE_TYPES = {
  0: { label: '全部类型', color: '' },
  1: { label: '系统消息', color: 'blue' },
  2: { label: '通知消息', color: 'green' },
  3: { label: '公告消息', color: 'orange' },
} as const;

// 消息级别映射
const MESSAGE_LEVELS = {
  1: { label: '普通', color: 'default' },
  2: { label: '重要', color: 'warning' },
  3: { label: '紧急', color: 'error' },
} as const;

// 获取消息详情
const fetchMessageDetail = async (id: number) => {
  try {
    loading.value = true;
    const response = await getMessageDetailById(id);
    messageDetail.value = response;

    // 如果消息未读，自动标记为已读
    if (response.isRead === 0) {
      await markMessageAsRead([id]);
      if (messageDetail.value) {
        messageDetail.value.isRead = 1;
      }
      // 更新全局未读数量并刷新布局
      await fetchUnreadCountFromList();
      triggerLayoutRefresh();
    }
  } catch (error) {
    console.error('获取消息详情失败:', error);
    message.error('获取消息详情失败');
  } finally {
    loading.value = false;
  }
};

// 返回消息列表
const handleGoBack = () => {
  router.push('/message');
};

// 组件挂载时获取数据
onMounted(() => {
  const messageId = route.params.id as string;
  if (messageId) {
    fetchMessageDetail(Number(messageId));
  } else {
    message.error('消息ID无效');
    handleGoBack();
  }
});
</script>

<template>
  <div class="message-detail dark:bg-background min-h-full bg-gray-50/30 p-4">
    <!-- 页面头部 - 移除返回按钮 -->
    <div class="mb-6">
      <Typography.Title :level="3" class="!mb-0"> 消息详情 </Typography.Title>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <Spin size="large" />
    </div>

    <!-- 消息详情内容 -->
    <Card
      v-else-if="messageDetail"
      class="dark:bg-card dark:border-border border-0 shadow-sm"
    >
      <!-- 消息头部信息 -->
      <div class="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
        <div class="mb-4 flex items-start justify-between">
          <div class="flex-1">
            <Typography.Title :level="2" class="!mb-2">
              {{ messageDetail.title }}
            </Typography.Title>
            <div
              class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
            >
              <span class="flex items-center">
                <IconifyIcon icon="mdi:account" class="mr-1" />
                发送者：{{ messageDetail.senderName || '系统' }}
              </span>
              <span class="flex items-center">
                <IconifyIcon icon="mdi:clock" class="mr-1" />
                发送时间：{{ messageDetail.createTime }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <!-- 消息类型标签 -->
            <Tag
              v-if="messageDetail.type"
              :color="
                MESSAGE_TYPES[messageDetail.type as keyof typeof MESSAGE_TYPES]
                  ?.color
              "
            >
              {{
                MESSAGE_TYPES[messageDetail.type as keyof typeof MESSAGE_TYPES]
                  ?.label
              }}
            </Tag>
            <!-- 消息级别标签 -->
            <Tag
              v-if="messageDetail.level"
              :color="
                MESSAGE_LEVELS[
                  messageDetail.level as keyof typeof MESSAGE_LEVELS
                ]?.color
              "
            >
              {{
                MESSAGE_LEVELS[
                  messageDetail.level as keyof typeof MESSAGE_LEVELS
                ]?.label
              }}
            </Tag>
            <!-- 已读状态 -->
            <Tag :color="messageDetail.isRead === 1 ? 'green' : 'blue'">
              {{ messageDetail.isRead === 1 ? '已读' : '未读' }}
            </Tag>
          </div>
        </div>
      </div>

      <!-- 消息内容 -->
      <div class="message-content">
        <Typography.Title :level="4" class="mb-4"> 消息内容 </Typography.Title>
        <div
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="messageDetail.content"
        ></div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700"
      >
        <Button @click="handleGoBack" size="large">
          <IconifyIcon icon="mdi:arrow-left" class="mr-1" />
          返回消息列表
        </Button>

        <div class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="messageDetail.updateTime">
            最后更新：{{ messageDetail.updateTime }}
          </span>
        </div>
      </div>
    </Card>

    <!-- 消息不存在 - 极简设计 -->
    <div v-else class="flex min-h-[60vh] items-center justify-center">
      <div class="text-center">
        <!-- 简约图标 -->
        <div class="mb-6">
          <IconifyIcon
            icon="mdi:message-off-outline"
            class="mx-auto text-6xl text-gray-300 dark:text-gray-600"
          />
        </div>

        <!-- 简洁标题 -->
        <h2 class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200">
          消息不存在
        </h2>

        <!-- 简短描述 -->
        <p class="mb-6 text-gray-500 dark:text-gray-400">该消息可能已被删除</p>

        <!-- 简约按钮 -->
        <Button type="primary" @click="handleGoBack"> 返回消息列表 </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>


@keyframes pulse-dot {
  0%,
  100% {
    @apply scale-100 opacity-50;
  }

  50% {
    @apply scale-110 opacity-100;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-detail {
    @apply p-2;
  }

  .message-detail .flex {
    @apply flex-col space-x-0 space-y-2;
  }

  .message-detail .flex.items-center {
    @apply items-start;
  }
}

.message-detail {
  @apply transition-colors duration-200;
}

/* 消息内容样式 */
.message-content {
  @apply min-h-[200px];
}

/* 富文本内容样式 */
.message-content :deep(.prose) {
  @apply text-gray-700 dark:text-gray-300;
}

.message-content :deep(.prose h1),
.message-content :deep(.prose h2),
.message-content :deep(.prose h3),
.message-content :deep(.prose h4),
.message-content :deep(.prose h5),
.message-content :deep(.prose h6) {
  @apply text-gray-900 dark:text-gray-100;
}

.message-content :deep(.prose p) {
  @apply leading-relaxed;
}

.message-content :deep(.prose a) {
  @apply text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300;
}

.message-content :deep(.prose blockquote) {
  @apply border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-900/20;
}

.message-content :deep(.prose code) {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200;
}

.message-content :deep(.prose pre) {
  @apply bg-gray-100 dark:bg-gray-800;
}

.message-content :deep(.prose table) {
  @apply border-gray-300 dark:border-gray-600;
}

.message-content :deep(.prose th),
.message-content :deep(.prose td) {
  @apply border-gray-300 dark:border-gray-600;
}

.message-content :deep(.prose th) {
  @apply bg-gray-50 dark:bg-gray-800;
}

/* 标签样式优化 */
.message-detail :deep(.ant-tag) {
  @apply transition-all duration-200;
}

/* 按钮样式优化 */
.message-detail :deep(.ant-btn) {
  @apply transition-all duration-200;
}

.message-detail :deep(.ant-btn:hover) {
  @apply scale-105 transform;
}

/* 现代化404页面动画 */
.message-detail :deep(.ant-btn-primary) {
  @apply shadow-lg hover:shadow-xl;
}

/* 装饰性元素动画 */
.message-detail .space-x-2 > div {
  @apply transition-all duration-300;

  animation: pulse-dot 2s infinite;
}

.message-detail .space-x-2 > div:nth-child(2) {
  animation-delay: 0.2s;
}

.message-detail .space-x-2 > div:nth-child(3) {
  animation-delay: 0.4s;
}

/* 消息详情页面样式 */
</style>
