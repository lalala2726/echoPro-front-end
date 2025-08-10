<script lang="ts" setup>
import { nextTick, watch } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { DashBoardMessageType } from '#/api/dashboard/message';

import { getRowClassName, getRowEvents, useColumns } from '../data';

interface Props {
  messageList: DashBoardMessageType.UserMessageListVo[];
  selectedRowKeys: number[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}

interface Emits {
  (e: 'rowSelect', id: number, checked: boolean): void;
  (e: 'rowClick', record: DashBoardMessageType.UserMessageListVo): void;
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

// 事件处理
const handleRowClick = (record: DashBoardMessageType.UserMessageListVo) => {
  emit('rowClick', record);
};

const handlePageChange = (page: number, size: number) => {
  emit('pageChange', page, size);
};

// VxeTable 配置
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    data: props.messageList,
    columns: useColumns(handleRowClick),
    height: 'auto',
    loading: props.loading,
    checkboxConfig: {
      highlight: true,
      labelField: 'title',
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    pagerConfig: {
      enabled: true,
      currentPage: props.currentPage,
      pageSize: props.pageSize,
      total: props.total,
      pageSizes: [10, 20, 50, 100],
      layouts: [
        'PrevPage',
        'JumpNumber',
        'NextPage',
        'Sizes',
        'FullJump',
        'Total',
      ],
    },
    // 自定义行样式
    rowClassName: ({ row }) => getRowClassName(row),
    // 行事件
    rowEvents: getRowEvents(handleRowClick),
    // 禁用默认的代理配置，使用外部数据
    proxyConfig: {
      enabled: false,
    },
    // 空状态配置
    emptyText: '暂无消息',
    showOverflow: true,
  },
});

// 监听选择变化
const handleCheckboxChange = ({
  records,
}: {
  records: DashBoardMessageType.UserMessageListVo[];
}) => {
  const selectedIds = records.map((record) => record.id!);
  // 发出选择变化事件
  selectedIds.forEach((id) => {
    const isSelected = props.selectedRowKeys.includes(id);
    if (!isSelected) {
      emit('rowSelect', id, true);
    }
  });

  // 处理取消选择的情况
  props.selectedRowKeys.forEach((id) => {
    if (!selectedIds.includes(id)) {
      emit('rowSelect', id, false);
    }
  });
};

// 监听全选变化
const handleCheckboxAll = ({ checked }: { checked: boolean }) => {
  emit('selectAll', checked);
};

// 监听分页变化
const handlePageChangeEvent = ({
  currentPage,
  pageSize,
}: {
  currentPage: number;
  pageSize: number;
}) => {
  handlePageChange(currentPage, pageSize);
};

// 监听数据变化，更新表格
watch(
  () => props.messageList,
  (newData) => {
    nextTick(() => {
      gridApi.loadData(newData);
    });
  },
  { deep: true },
);

// 监听选中状态变化，同步到表格
watch(
  () => props.selectedRowKeys,
  (newKeys) => {
    nextTick(() => {
      const records = props.messageList.filter((item) =>
        newKeys.includes(item.id!),
      );
      gridApi.setCheckboxRow(records, true);
    });
  },
  { deep: true },
);

// 监听加载状态变化
watch(
  () => props.loading,
  (loading) => {
    nextTick(() => {
      gridApi.setLoading(loading);
    });
  },
);

// 监听分页参数变化
watch(
  [() => props.currentPage, () => props.pageSize, () => props.total],
  ([currentPage, pageSize, total]) => {
    nextTick(() => {
      gridApi.setPagerConfig({
        currentPage,
        pageSize,
        total,
      });
    });
  },
);
</script>

<template>
  <div class="message-list-table">
    <Grid
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxAll"
      @page-change="handlePageChangeEvent"
    />
  </div>
</template>

<style scoped>
/* VxeTable 基础样式 */
.message-list-table :deep(.vxe-table) {
  @apply transition-colors duration-200;
}

/* 表头样式 */
.message-list-table
  :deep(
    .vxe-table--header-wrapper
      .vxe-table--header
      .vxe-header--row
      .vxe-header--column
  ) {
  @apply border-b border-gray-200 bg-gray-50 dark:border-gray-700;
  background-color: rgb(248 250 252);
}

.dark
  .message-list-table
  :deep(
    .vxe-table--header-wrapper
      .vxe-table--header
      .vxe-header--row
      .vxe-header--column
  ) {
  background-color: #2d2d32;
}

/* 行基础样式 */
.message-list-table
  :deep(.vxe-table--body-wrapper .vxe-table--body .vxe-body--row) {
  @apply h-14 transition-all duration-200 ease-in-out;
  cursor: pointer;
}

.message-list-table
  :deep(
    .vxe-table--body-wrapper .vxe-table--body .vxe-body--row .vxe-body--column
  ) {
  @apply px-4 py-2 align-middle;
}

/* 未读消息样式 - 突出显示 */
.message-list-table
  :deep(
    .vxe-table--body-wrapper .vxe-table--body .vxe-body--row.unread-message
  ) {
  @apply border-l-4 border-blue-500 bg-blue-50 font-medium text-gray-900;
  position: relative;
}

.message-list-table
  :deep(
    .vxe-table--body-wrapper
      .vxe-table--body
      .vxe-body--row.unread-message:hover
  ) {
  @apply bg-blue-100;
}

/* 已读消息样式 - 柔和显示 */
.message-list-table
  :deep(.vxe-table--body-wrapper .vxe-table--body .vxe-body--row.read-message) {
  @apply bg-white text-gray-500 opacity-75;
}

.message-list-table
  :deep(
    .vxe-table--body-wrapper .vxe-table--body .vxe-body--row.read-message:hover
  ) {
  @apply bg-gray-50 opacity-100;
}

/* 暗色模式 - 未读消息 */
.dark
  .message-list-table
  :deep(
    .vxe-table--body-wrapper .vxe-table--body .vxe-body--row.unread-message
  ) {
  @apply border-l-4 border-blue-400 bg-blue-950/50 font-medium text-blue-100;
}

.dark
  .message-list-table
  :deep(
    .vxe-table--body-wrapper
      .vxe-table--body
      .vxe-body--row.unread-message:hover
  ) {
  @apply bg-blue-900/60;
}

/* 暗色模式 - 已读消息 */
.dark
  .message-list-table
  :deep(.vxe-table--body-wrapper .vxe-table--body .vxe-body--row.read-message) {
  @apply bg-gray-800/50 text-gray-400 opacity-70;
}

.dark
  .message-list-table
  :deep(
    .vxe-table--body-wrapper .vxe-table--body .vxe-body--row.read-message:hover
  ) {
  @apply bg-gray-700/60 opacity-100;
}

/* 未读消息的Tag样式增强 */
.message-list-table :deep(.vxe-body--row.unread-message .ant-tag) {
  @apply font-medium shadow-sm;
}

.dark .message-list-table :deep(.vxe-body--row.unread-message .ant-tag) {
  @apply font-medium;
}

/* 已读消息的Tag样式柔化 */
.message-list-table :deep(.vxe-body--row.read-message .ant-tag) {
  @apply opacity-70;
}

.dark .message-list-table :deep(.vxe-body--row.read-message .ant-tag) {
  @apply opacity-60;
}

/* 行选择时的样式 */
.message-list-table :deep(.vxe-body--row.row--checked) {
  @apply bg-blue-100 dark:bg-blue-900/40;
}

.message-list-table :deep(.vxe-body--row.unread-message.row--checked) {
  @apply bg-blue-200 dark:bg-blue-800/60;
}

/* 未读消息的左边框动画 */
.message-list-table :deep(.vxe-body--row.unread-message) {
  transition:
    all 0.2s ease-in-out,
    border-left-color 0.3s ease-in-out;
}

.message-list-table :deep(.vxe-body--row.unread-message:hover) {
  @apply border-blue-600 dark:border-blue-300;
}

/* 分页器样式 */
.message-list-table :deep(.vxe-pager) {
  @apply mt-4;
}

.message-list-table :deep(.vxe-pager .vxe-pager--num-btn) {
  @apply text-gray-600 transition-colors dark:text-gray-400;
}
</style>
