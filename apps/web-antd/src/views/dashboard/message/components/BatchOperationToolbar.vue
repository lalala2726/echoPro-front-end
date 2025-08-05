<script lang="ts" setup>
import { computed } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Checkbox, Divider, Space } from 'ant-design-vue';

interface Props {
  selectedCount: number;
  totalCount: number;
  currentPageCount: number;
  unreadCount?: number;
  loading?: boolean;
}

interface Emits {
  (e: 'selectAll', checked: boolean): void;
  (e: 'batchAction', action: 'delete' | 'read' | 'unread'): void;
}

defineOptions({
  name: 'BatchOperationToolbar',
});

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  unreadCount: 0,
});

const emit = defineEmits<Emits>();

// 计算属性
const hasSelected = computed(() => props.selectedCount > 0);
const isAllSelected = computed(
  () =>
    props.currentPageCount > 0 &&
    props.selectedCount === props.currentPageCount,
);
const isIndeterminate = computed(
  () => props.selectedCount > 0 && props.selectedCount < props.currentPageCount,
);

// 事件处理
const handleSelectAll = (e: any) => {
  const checked = e.target.checked;
  emit('selectAll', checked);
};

const handleBatchAction = (action: 'delete' | 'read' | 'unread') => {
  emit('batchAction', action);
};
</script>

<template>
  <div
    class="batch-operation-toolbar mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
  >
    <!-- 左侧：全选和选择信息 -->
    <div class="flex items-center space-x-4">
      <Checkbox
        :checked="isAllSelected"
        :indeterminate="isIndeterminate"
        :disabled="loading || currentPageCount === 0"
        @change="handleSelectAll"
      >
        全选
      </Checkbox>

      <span class="text-sm text-gray-600 dark:text-gray-400">
        已选择 {{ selectedCount }} 项，共 {{ totalCount }} 项
        <span
          v-if="unreadCount > 0"
          class="ml-2 text-orange-600 dark:text-orange-400"
        >
          ({{ unreadCount }} 条未读)
        </span>
      </span>
    </div>

    <!-- 右侧：批量操作按钮 - 始终显示，根据选择状态启用/禁用 -->
    <div class="flex items-center">
      <Space>
        <Button
          type="text"
          size="small"
          :disabled="!hasSelected"
          :loading="loading"
          @click="handleBatchAction('read')"
          class="hover:bg-transparent"
        >
          <IconifyIcon icon="mdi:email-open" class="mr-1" />
          标记已读
        </Button>

        <Button
          type="text"
          size="small"
          :disabled="!hasSelected"
          :loading="loading"
          @click="handleBatchAction('unread')"
          class="hover:bg-transparent"
        >
          <IconifyIcon icon="mdi:email" class="mr-1" />
          标记未读
        </Button>

        <Divider type="vertical" />

        <Button
          type="text"
          size="small"
          :disabled="!hasSelected"
          :loading="loading"
          @click="handleBatchAction('delete')"
          class="text-red-500 hover:bg-transparent hover:text-red-600 disabled:text-gray-400"
        >
          <IconifyIcon icon="mdi:delete" class="mr-1" />
          删除
        </Button>
      </Space>
    </div>
  </div>
</template>

<style scoped>
.batch-operation-toolbar {
  @apply transition-all duration-200;
}

.batch-operation-toolbar :deep(.ant-checkbox-wrapper) {
  @apply text-gray-700 dark:text-gray-300;
}

.batch-operation-toolbar :deep(.ant-btn) {
  @apply transition-all duration-200;
}

.batch-operation-toolbar :deep(.ant-btn:hover) {
  @apply scale-105 transform;
}

/* 文本按钮样式优化 */
.batch-operation-toolbar :deep(.ant-btn-text) {
  @apply border-0 shadow-none;
}

.batch-operation-toolbar :deep(.ant-btn-text:hover) {
  @apply bg-transparent shadow-none;
}

.batch-operation-toolbar :deep(.ant-btn-text:focus) {
  @apply bg-transparent shadow-none;
}
</style>
