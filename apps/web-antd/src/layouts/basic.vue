<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import type { SystemMessageType } from '#/api/system/message';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, Mail, MdiGithub, User } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { listUserMessageList } from '#/api/system/message';
import { useMessageStore } from '#/composables/useMessageStore';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const router = useRouter();

// 消息相关状态
const notifications = ref<NotificationItem[]>([]);
const messageList = ref<SystemMessageType.UserMessageListVo[]>([]);
const {
  unreadCount,
  readCount,
  fetchUnreadCountFromList,
  setLayoutRefreshCallback,
} = useMessageStore();

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
const fetchMessageList = async () => {
  try {
    const response = await listUserMessageList({
      current: 1,
      size: 10, // 只获取10条消息用于通知显示
      isRead: 0, // 只获取未读消息
    });

    messageList.value = response.rows || [];

    // 更新全局未读和已读数量（使用新的API响应格式）
    const unreadCountFromApi = Math.abs(Number(response.extra?.unread || 0));
    const readCountFromApi = Number(response.extra?.read || 0);

    unreadCount.value = unreadCountFromApi;
    readCount.value = readCountFromApi;

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
  }
};

// 移除本地的fetchUnreadCount，使用全局的

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
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: MdiGithub,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
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

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
  // 这里可以调用API标记所有消息为已读
}

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

// 组件挂载时获取数据
onMounted(() => {
  fetchMessageList(); // 这个函数现在会同时更新未读数量

  // 注册布局消息刷新回调
  setLayoutRefreshCallback(fetchMessageList);
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
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
        @notification-click="handleNotificationClick"
        @view-all="handleViewAllMessages"
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
