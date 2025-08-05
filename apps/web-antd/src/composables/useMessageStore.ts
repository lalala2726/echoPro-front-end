import { ref } from 'vue';

import { getUnreadCount, listUserMessageList } from '#/api/system/message';

// 全局消息状态管理
const globalUnreadCount = ref(0);
const globalReadCount = ref(0);

// 用于通知布局组件刷新消息列表的回调函数
let refreshLayoutMessages: (() => void) | null = null;

export function useMessageStore() {
  // 从消息列表API获取未读数量（使用新的API响应格式）
  const fetchUnreadCountFromList = async () => {
    try {
      const response = await listUserMessageList({
        current: 1,
        size: 1, // 只需要获取计数信息，不需要实际消息数据
      });

      // 使用新的API响应格式
      const unreadCount = Math.abs(Number(response.extra?.unread || 0));
      const readCount = Number(response.extra?.read || 0);

      globalUnreadCount.value = unreadCount;
      globalReadCount.value = readCount;

      return unreadCount;
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      return 0;
    }
  };

  // 获取未读消息数量（保持向后兼容）
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      globalUnreadCount.value = response.count || 0;
      return globalUnreadCount.value;
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      // 如果旧API失败，尝试使用新API
      return await fetchUnreadCountFromList();
    }
  };

  // 更新未读数量
  const updateUnreadCount = (count: number) => {
    globalUnreadCount.value = count;
  };

  // 减少未读数量
  const decreaseUnreadCount = (amount: number = 1) => {
    globalUnreadCount.value = Math.max(0, globalUnreadCount.value - amount);
  };

  // 增加未读数量
  const increaseUnreadCount = (amount: number = 1) => {
    globalUnreadCount.value += amount;
  };

  // 设置布局消息刷新回调
  const setLayoutRefreshCallback = (callback: () => void) => {
    refreshLayoutMessages = callback;
  };

  // 触发布局消息刷新
  const triggerLayoutRefresh = () => {
    if (refreshLayoutMessages) {
      refreshLayoutMessages();
    }
  };

  return {
    unreadCount: globalUnreadCount,
    readCount: globalReadCount,
    fetchUnreadCount,
    fetchUnreadCountFromList,
    updateUnreadCount,
    decreaseUnreadCount,
    increaseUnreadCount,
    setLayoutRefreshCallback,
    triggerLayoutRefresh,
  };
}
