<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import type { SystemMessageType } from '#/api/system/message';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import { Mail, User } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { listUserMessageList } from '#/api/system/message';
import { useMessageStore } from '#/composables/useMessageStore';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const router = useRouter();

// 消息相关状态
const notifications = ref<NotificationItem[]>([]);
const messageList = ref<SystemMessageType.UserMessageListVo[]>([]);
const notificationLoading = ref(false);
const { unreadCount, fetchUnreadCount, setLayoutRefreshCallback } =
  useMessageStore();

// 消息类型映射
const MESSAGE_TYPES = {
  1: { label: '系统消息', color: 'blue' },
  2: { label: '通知消息', color: 'green' },
  3: { label: '公告消息', color: 'orange' },
} as const;

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();

const showDot = computed(() => unreadCount.value > 0);

// 获取消息列表 - 只获取前10条未读消息用于顶部导航显示
const fetchMessageList = async (showLoading = false) => {
  try {
    if (showLoading) {
      notificationLoading.value = true;
    }
    const response = await listUserMessageList({
      current: 1,
      size: 10, // 只获取10条消息用于通知显示
      isRead: 0, // 只获取未读消息
    });

    messageList.value = response.rows || [];

    // 转换为通知格式 - 只显示未读消息
    notifications.value = messageList.value.map((msg) => ({
      id: msg.id?.toString(),
      title: msg.title || '无标题',
      message:
        MESSAGE_TYPES[msg.type as keyof typeof MESSAGE_TYPES]?.label || '消息',
      date: msg.createTime || '',
      isRead: false, // 因为我们只获取未读消息，所以都是未读状态
      // 移除avatar字段，不再显示头像
    }));
  } catch (error) {
    console.error('获取消息列表失败:', error);
  } finally {
    if (showLoading) {
      notificationLoading.value = false;
    }
  }
};

const menus = computed(() => [
  {
    handler: () => {
      router.push('/profile');
    },
    icon: User,
    text: '个人中心',
  },
  {
    handler: () => {
      router.push('/message');
    },
    icon: Mail,
    text: '站内消息',
    badge: unreadCount.value > 0 ? unreadCount.value : undefined,
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

// 移除清空功能，按要求不显示清空按钮
function handleNoticeClear() {
  // 不执行任何操作，因为要求移除清空按钮
}

function handleMakeAll() {}

// 处理通知点击，导航到消息详情
function handleNotificationClick(notification: NotificationItem) {
  if (notification.id) {
    router.push(`/message/detail/${notification.id}`);
  }
}

// 处理查看所有消息
function handleViewAllMessages() {
  router.push('/message');
}

// 处理通知下拉框打开事件 - 实时获取最新数据
async function handleNotificationOpen() {
  // 立即显示加载状态，清空之前的消息列表
  notificationLoading.value = true;
  notifications.value = []; // 清空旧数据，避免显示过期内容

  try {
    // 先获取未读数量，再获取消息列表
    await fetchUnreadCount(); // 更新未读数量徽章
    await fetchMessageList(false); // 不再传true，因为我们已经手动设置了loading状态
  } finally {
    notificationLoading.value = false;
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  // 首先获取未读数量，确保徽标能正确显示
  await fetchUnreadCount();

  // 然后获取消息列表用于下拉显示
  await fetchMessageList(false);

  // 注册布局消息刷新回调
  setLayoutRefreshCallback(() => fetchMessageList(false));
});
watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.nickname}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.nickname"
        :description="userStore.userInfo?.email"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        :unread-count="unreadCount"
        :loading="notificationLoading"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
        @notification-click="handleNotificationClick"
        @view-all="handleViewAllMessages"
        @open="handleNotificationOpen"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
