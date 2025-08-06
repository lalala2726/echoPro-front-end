<script lang="ts" setup>
import type { SystemMessageType } from '#/api/system/message';

import { computed } from 'vue';

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
  (e: 'selectAll', checked: boolean): void;
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

// 计算属性
const isAllSelected = computed(
  () =>
    props.messageList.length > 0 &&
    props.selectedRowKeys.length === props.messageList.length,
);
const isIndeterminate = computed(
  () =>
    props.selectedRowKeys.length > 0 &&
    props.selectedRowKeys.length < props.messageList.length,
);

// 表格列配置
const columns = [
  {
    key: 'selection',
    align: 'center' as const,
    width: 50,
  },
  {
    title: '消息类型',
    key: 'type',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '消息标题',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '发送者',
    key: 'senderName',
    width: 180,
    align: 'center' as const,
  },
  {
    title: '发送时间',
    key: 'createTime',
    width: 260,
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

const handleSelectAll = (e: any) => {
  const checked = e.target.checked;
  emit('selectAll', checked);
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
      <!-- 自定义表头 -->
      <template #headerCell="{ column }">
        <template v-if="column.key === 'selection'">
          <Checkbox
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            :disabled="loading || messageList.length === 0"
            @change="handleSelectAll"
          />
        </template>
      </template>

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
          <div class="transition-colors">
            <span class="truncate">{{ record.title }}</span>
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
          <span
            :class="[
              record.isRead === 0
                ? 'font-medium text-gray-700 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400',
            ]"
          >
            {{ record.senderName || '系统' }}
          </span>
        </template>

        <!-- 发送时间列 -->
        <template v-else-if="column.key === 'createTime'">
          <span
            class="text-sm"
            :class="[
              record.isRead === 0
                ? 'font-medium text-gray-600 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-500',
            ]"
          >
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
/* 表头 */
.message-table :deep(.ant-table-thead > tr > th) {
  @apply border-b border-gray-200 bg-gray-50 dark:border-gray-700;

  /* 使用更深的灰色背景 #2d2d32 */
  background-color: rgb(248 250 252); /* light theme - gray-50 */
}

.dark .message-table :deep(.ant-table-thead > tr > th) {
  background-color: #2d2d32; /* dark theme - custom darker gray */
}

/* 行和单元格 */
.message-table :deep(.ant-table-tbody > tr) {
  @apply h-14 transition-colors duration-200;
}

.message-table :deep(.ant-table-tbody > tr > td) {
  @apply overflow-hidden overflow-ellipsis whitespace-nowrap px-4 py-2 align-middle;
}

/* 未读消息样式 - 突出显示 */
.message-table :deep(.ant-table-tbody > tr.unread-message) {
  @apply border-l-4 border-blue-500 bg-blue-50 font-medium text-gray-900;

  position: relative;
}

.message-table :deep(.ant-table-tbody > tr.unread-message:hover) {
  @apply bg-blue-100;
}

/* 未读消息标题加粗 */
.message-table :deep(.ant-table-tbody > tr.unread-message .truncate) {
  @apply font-semibold text-gray-900;
}

/* 已读消息样式 - 柔和显示 */
.message-table :deep(.ant-table-tbody > tr.read-message) {
  @apply bg-white text-gray-500 opacity-75;
}

.message-table :deep(.ant-table-tbody > tr.read-message:hover) {
  @apply bg-gray-50 opacity-100;
}

/* 已读消息标题样式 */
.message-table :deep(.ant-table-tbody > tr.read-message .truncate) {
  @apply font-normal text-gray-600;
}

/* 暗色模式 - 未读消息 */
.dark .message-table :deep(.ant-table-tbody > tr.unread-message) {
  @apply border-l-4 border-blue-400 bg-blue-950/50 font-medium text-blue-100;
}

.dark .message-table :deep(.ant-table-tbody > tr.unread-message:hover) {
  @apply bg-blue-900/60;
}

.dark .message-table :deep(.ant-table-tbody > tr.unread-message .truncate) {
  @apply font-semibold text-blue-100;
}

/* 暗色模式 - 已读消息 */
.dark .message-table :deep(.ant-table-tbody > tr.read-message) {
  @apply bg-gray-800/50 text-gray-400 opacity-70;
}

.dark .message-table :deep(.ant-table-tbody > tr.read-message:hover) {
  @apply bg-gray-700/60 opacity-100;
}

.dark .message-table :deep(.ant-table-tbody > tr.read-message .truncate) {
  @apply font-normal text-gray-300;
}

/* 未读消息的Tag样式增强 */
.message-table :deep(.ant-table-tbody > tr.unread-message .ant-tag) {
  @apply font-medium shadow-sm;
}

.dark .message-table :deep(.ant-table-tbody > tr.unread-message .ant-tag) {
  @apply font-medium;
}

/* 已读消息的Tag样式柔化 */
.message-table :deep(.ant-table-tbody > tr.read-message .ant-tag) {
  @apply opacity-70;
}

.dark .message-table :deep(.ant-table-tbody > tr.read-message .ant-tag) {
  @apply opacity-60;
}

/* 行选择时的样式 */
.message-table :deep(.ant-table-tbody > tr.ant-table-row-selected) {
  @apply bg-blue-100 dark:bg-blue-900/40;
}

.message-table
  :deep(.ant-table-tbody > tr.unread-message.ant-table-row-selected) {
  @apply bg-blue-200 dark:bg-blue-800/60;
}

/* 过渡动画增强 */
.message-table :deep(.ant-table-tbody > tr) {
  @apply transition-all duration-200 ease-in-out;
}

/* 未读消息的左边框动画 */
.message-table :deep(.ant-table-tbody > tr.unread-message) {
  transition:
    all 0.2s ease-in-out,
    border-left-color 0.3s ease-in-out;
}

.message-table :deep(.ant-table-tbody > tr.unread-message:hover) {
  @apply border-blue-600 dark:border-blue-300;
}

/* 分页文字 */
.pagination-custom :deep(.ant-pagination-item a) {
  @apply text-gray-600 transition-colors dark:text-gray-400;
}

/* 其他过渡 */
.message-table :deep(.ant-table-tbody > tr > td .relative > div) {
  @apply transition-all duration-200 ease-in-out;
}
</style>
