<script lang="ts" setup>
import type { SystemMessageType } from '#/api/system/message';

import { IconifyIcon } from '@vben/icons';

import { Checkbox, Pagination, Table, Tag } from 'ant-design-vue';

interface Props {
  messageList: SystemMessageType.UserMessageListVo[];
  selectedRowKeys: number[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

interface Emits {
  (e: 'rowSelect', id: number, checked: boolean): void;
  (e: 'rowClick', record: SystemMessageType.UserMessageListVo): void;
  (e: 'pageChange', page: number, size: number): void;
}

defineOptions({
  name: 'MessageListTable',
});

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// 响应式数据 - 移除hover相关状态

// 消息类型映射
const MESSAGE_TYPES = {
  1: { label: '系统消息', color: 'blue' },
  2: { label: '通知消息', color: 'green' },
  3: { label: '公告消息', color: 'orange' },
} as const;

// 表格列配置
const columns = [
  {
    title: '',
    key: 'selection',
    width: 50,
    align: 'center' as const,
  },
  {
    title: '消息标题',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '消息类型',
    key: 'type',
    width: 100,
    align: 'center' as const,
  },
  {
    title: '发送者',
    key: 'senderName',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '发送时间',
    key: 'createTime',
    width: 180,
    align: 'center' as const,
  },
];

// 事件处理
const handleRowSelect = (id: number, checked: boolean) => {
  emit('rowSelect', id, checked);
};

const handleRowClick = (record: SystemMessageType.UserMessageListVo) => {
  emit('rowClick', record);
};

const handlePageChange = (page: number, size: number) => {
  emit('pageChange', page, size);
};
</script>

<template>
  <div class="message-list-table">
    <!-- 消息列表表格 -->
    <Table
      :columns="columns"
      :data-source="messageList"
      :loading="loading"
      :pagination="false"
      :row-key="(record: SystemMessageType.UserMessageListVo) => record.id!"
      :row-class-name="
        (record: SystemMessageType.UserMessageListVo) =>
          record.isRead === 0 ? 'unread-message' : 'read-message'
      "
      class="message-table"
      :custom-row="
        (record: SystemMessageType.UserMessageListVo) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })
      "
    >
      <!-- 选择框列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'selection'">
          <Checkbox
            :checked="selectedRowKeys.includes(record.id!)"
            @change="(e: any) => handleRowSelect(record.id!, e.target.checked)"
            @click.stop
          />
        </template>

        <!-- 消息标题列 -->
        <template v-else-if="column.key === 'title'">
          <div
            class="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            <div class="flex items-center">
              <IconifyIcon
                v-if="record.isRead === 0"
                icon="mdi:circle"
                class="mr-2 text-xs text-blue-500"
              />
              <span class="truncate">{{ record.title }}</span>
            </div>
          </div>
        </template>

        <!-- 消息类型列 -->
        <template v-else-if="column.key === 'type'">
          <Tag
            :color="
              MESSAGE_TYPES[record.type as keyof typeof MESSAGE_TYPES]?.color
            "
          >
            {{
              MESSAGE_TYPES[record.type as keyof typeof MESSAGE_TYPES]?.label
            }}
          </Tag>
        </template>

        <!-- 发送者列 -->
        <template v-else-if="column.key === 'senderName'">
          <span class="text-gray-600 dark:text-gray-400">
            {{ record.senderName || '系统' }}
          </span>
        </template>

        <!-- 发送时间列 -->
        <template v-else-if="column.key === 'createTime'">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ record.createTime }}
          </span>
        </template>
      </template>
    </Table>

    <!-- 分页 -->
    <div class="mt-4 flex justify-end">
      <Pagination
        :current="currentPage"
        :page-size="pageSize"
        :total="total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="
          (total: number, range: [number, number]) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        "
        @change="handlePageChange"
        class="pagination-custom"
      />
    </div>
  </div>
</template>

<style scoped>
/* 表格样式 */
.message-table :deep(.ant-table-thead > tr > th) {
  @apply border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800;
}

.message-table :deep(.ant-table-tbody > tr) {
  @apply cursor-pointer transition-all duration-200;
}

.message-table :deep(.ant-table-tbody > tr:hover) {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.message-table :deep(.ant-table-tbody > tr.unread-message) {
  @apply bg-blue-50/50 font-medium dark:bg-blue-900/10;
}

.message-table :deep(.ant-table-tbody > tr.read-message) {
  @apply bg-white dark:bg-transparent;
}

/* 分页样式 */
.pagination-custom :deep(.ant-pagination-item) {
  @apply border-gray-300 dark:border-gray-600;
}

.pagination-custom :deep(.ant-pagination-item a) {
  @apply text-gray-600 dark:text-gray-400;
}

.pagination-custom :deep(.ant-pagination-item-active) {
  @apply border-blue-500 dark:border-blue-400;
}

.pagination-custom :deep(.ant-pagination-item-active a) {
  @apply text-blue-600 dark:text-blue-400;
}

/* 动画效果 */
.message-table :deep(.ant-table-tbody > tr > td .relative > div) {
  @apply transition-all duration-200 ease-in-out;
}
</style>
