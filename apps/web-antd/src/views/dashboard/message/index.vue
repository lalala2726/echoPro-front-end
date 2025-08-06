<script lang="ts" setup>
import type { SystemMessageType } from '#/api/dashboard/message';

import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Button, Card, Input, message, Space } from 'ant-design-vue';

import {
  deleteMessages,
  listUserMessageList,
  markMessageAsRead,
  markMessageAsUnRead,
} from '#/api/dashboard/message';
import { useMessageStore } from '#/composables/useMessageStore';

import {
  BatchOperationToolbar,
  MessageFilterTabs,
  MessageListTable,
} from './components';

defineOptions({
  name: 'MessageCenter',
});

const router = useRouter();

// 全局消息状态
const {
  unreadCount,
  readCount,
  fetchUnreadCountFromList,
  triggerLayoutRefresh,
} = useMessageStore();

// 响应式数据
const loading = ref(false);
const messageList = ref<SystemMessageType.UserMessageListVo[]>([]);
const selectedRowKeys = ref<number[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const activeTab = ref<number>(0);
const localReadCount = ref(0); // 本地已读数量，用于当前页面显示
const searchTitle = ref<string>(''); // 搜索标题
const readStatusFilter = ref<number | undefined>(undefined); // 未读/已读状态过滤: undefined-全部, 0-未读, 1-已读

// 查询参数
const queryParams = ref<SystemMessageType.UserMessageListQueryRequest>({
  type: undefined,
});

// 使用全局的fetchUnreadCount

// 获取消息列表
const fetchMessageList = async () => {
  try {
    loading.value = true;
    const params = {
      ...queryParams.value,
      type: activeTab.value === 0 ? undefined : activeTab.value,
      current: currentPage.value,
      size: pageSize.value,
      title: searchTitle.value || undefined,
      isRead: readStatusFilter.value,
    };

    const response = await listUserMessageList(params);

    // 使用新的API响应格式
    messageList.value = response.rows || [];
    total.value = Number(response.total) || 0;

    // 从API响应中获取全局已读和未读数量
    const apiUnreadCount = Math.abs(Number(response.extra?.unread || 0));
    const apiReadCount = Number(response.extra?.read || 0);

    // 更新全局状态
    unreadCount.value = apiUnreadCount;
    readCount.value = apiReadCount;

    // 计算当前页面的已读数量（用于显示）
    localReadCount.value = messageList.value.filter(
      (msg) => msg.isRead === 1,
    ).length;
  } catch (error) {
    console.error('获取消息列表失败:', error);
    message.error('获取消息列表失败');
  } finally {
    loading.value = false;
  }
};

// 标记消息为已读
const handleMarkAsRead = async (ids: number[]) => {
  try {
    await markMessageAsRead(ids);
    message.success('标记成功');

    // 更新本地状态
    messageList.value.forEach((msg) => {
      if (ids.includes(msg.id!)) {
        msg.isRead = 1;
      }
    });

    selectedRowKeys.value = [];

    // 更新未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error) {
    console.error('标记已读失败:', error);
    message.error('标记已读失败');
  }
};

// 标记消息为未读
const handleMarkAsUnread = async (ids: number[]) => {
  try {
    await markMessageAsUnRead(ids);
    message.success('标记成功');

    // 更新本地状态
    messageList.value.forEach((msg) => {
      if (ids.includes(msg.id!)) {
        msg.isRead = 0;
      }
    });

    selectedRowKeys.value = [];

    // 更新未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error) {
    console.error('标记未读失败:', error);
    message.error('标记未读失败');
  }
};

// 删除消息
const handleDeleteMessages = async (ids: number[]) => {
  try {
    await deleteMessages(ids);
    message.success('删除成功');

    // 从本地列表中移除
    messageList.value = messageList.value.filter(
      (msg) => !ids.includes(msg.id!),
    );
    selectedRowKeys.value = [];
    total.value -= ids.length;
  } catch (error) {
    console.error('删除消息失败:', error);
    message.error('删除消息失败');
  }
};

// 全选/取消全选
const handleSelectAll = (checked: boolean) => {
  selectedRowKeys.value = checked
    ? messageList.value.map((msg) => msg.id!)
    : [];
};

// 单行选择
const handleRowSelect = (id: number, checked: boolean) => {
  if (checked) {
    // 避免重复添加
    if (!selectedRowKeys.value.includes(id)) {
      selectedRowKeys.value.push(id);
    }
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== id);
  }
};

// 行点击事件 - 导航到详情页面
const handleRowClick = (record: SystemMessageType.UserMessageListVo) => {
  if (record.id) {
    // 使用Vue Router导航到消息详情页面
    router.push(`/message/detail/${record.id}`);
  }
};

// Tab切换
const handleTabChange = (key: number) => {
  activeTab.value = key;
  currentPage.value = 1;
  selectedRowKeys.value = [];
  fetchMessageList();
};

// 搜索标题
const handleSearchTitle = () => {
  currentPage.value = 1;
  selectedRowKeys.value = [];
  fetchMessageList();
};

// 清空搜索
const handleClearSearch = () => {
  searchTitle.value = '';
  currentPage.value = 1;
  selectedRowKeys.value = [];
  fetchMessageList();
};

// 切换已读/未读状态
const handleReadStatusChange = (status: number | undefined) => {
  readStatusFilter.value = status;
  currentPage.value = 1;
  selectedRowKeys.value = [];
  fetchMessageList();
};

// 分页变化
const handlePageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchMessageList();
};

// 单个消息操作已移除 - 所有操作通过批量操作工具栏进行

// 批量操作
const handleBatchAction = async (action: 'delete' | 'read' | 'unread') => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要操作的消息');
    return;
  }

  switch (action) {
    case 'delete': {
      await handleDeleteMessages(selectedRowKeys.value);
      break;
    }
    case 'read': {
      await handleMarkAsRead(selectedRowKeys.value);
      break;
    }
    case 'unread': {
      await handleMarkAsUnread(selectedRowKeys.value);
      break;
    }
  }
};

// 监听Tab变化
watch(activeTab, () => {
  fetchMessageList();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchMessageList(); // 这个函数现在会同时更新未读数量
});
</script>

<template>
  <div class="message-center dark:bg-background min-h-full bg-gray-50/30 p-4">
    <!-- 主要内容卡片 -->
    <Card class="dark:bg-card dark:border-border border-0 shadow-sm">
      <!-- 搜索和过滤区域 -->
      <div
        class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- 未读/已读状态切换 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            状态筛选:
          </span>
          <Space>
            <Button
              :type="readStatusFilter === undefined ? 'primary' : 'default'"
              size="small"
              @click="handleReadStatusChange(undefined)"
            >
              全部
            </Button>
            <Button
              :type="readStatusFilter === 0 ? 'primary' : 'default'"
              size="small"
              @click="handleReadStatusChange(0)"
            >
              未读
            </Button>
            <Button
              :type="readStatusFilter === 1 ? 'primary' : 'default'"
              size="small"
              @click="handleReadStatusChange(1)"
            >
              已读
            </Button>
          </Space>
        </div>

        <!-- 搜索标题 -->
        <div class="flex-shrink-0">
          <Input.Search
            v-model:value="searchTitle"
            placeholder="搜索消息标题..."
            allow-clear
            enter-button="搜索"
            :loading="loading"
            @search="handleSearchTitle"
            @clear="handleClearSearch"
            class="w-80"
          />
        </div>
      </div>

      <!-- Tab导航 -->
      <MessageFilterTabs
        :active-tab="activeTab"
        :loading="loading"
        :unread-count="unreadCount"
        :read-count="readCount"
        @change="handleTabChange"
      />

      <!-- 批量操作工具栏 -->
      <BatchOperationToolbar
        :selected-count="selectedRowKeys.length"
        :total-count="total"
        :current-page-count="messageList.length"
        :unread-count="unreadCount"
        :loading="loading"
        @select-all="handleSelectAll"
        @batch-action="handleBatchAction"
      />

      <!-- 消息列表表格 -->
      <MessageListTable
        :message-list="messageList"
        :selected-row-keys="selectedRowKeys"
        :loading="loading"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @row-select="handleRowSelect"
        @row-click="handleRowClick"
        @page-change="handlePageChange"
        @select-all="handleSelectAll"
      />
    </Card>
  </div>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .message-center {
    @apply p-2;
  }
}

.message-center {
  @apply transition-colors duration-200;
}

/* 消息中心整体样式 */
</style>
