<script lang="ts" setup>
import type { NotificationItem } from './types';

import { Bell } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  VbenButton,
  VbenIconButton,
  VbenPopover,
  VbenScrollbar,
} from '@vben-core/shadcn-ui';

import { useToggle } from '@vueuse/core';

interface Props {
  /**
   * 显示圆点
   */
  dot?: boolean;
  /**
   * 消息列表
   */
  notifications?: NotificationItem[];
  /**
   * 未读消息数量
   */
  unreadCount?: number;
  /**
   * 加载状态
   */
  loading?: boolean;
}

defineOptions({ name: 'NotificationPopup' });

const props = withDefaults(defineProps<Props>(), {
  dot: false,
  notifications: () => [],
  unreadCount: 0,
  loading: false,
});

const emit = defineEmits<{
  clear: [];
  makeAll: [];
  notificationClick: [NotificationItem];
  open: [];
  viewAll: [];
}>();

const [open, toggle] = useToggle();

function close() {
  open.value = false;
}

function handleOpen() {
  if (!open.value) {
    emit('open');
  }
  toggle();
}

function handleViewAll() {
  emit('viewAll');
  close();
}

function handleClick(item: NotificationItem) {
  emit('notificationClick', item);
  close();
}
</script>
<template>
  <VbenPopover
    v-model:open="open"
    content-class="relative right-2 w-[360px] p-0"
  >
    <template #trigger>
      <div class="flex-center relative mr-2 h-full" @click.stop="handleOpen()">
        <VbenIconButton class="bell-button text-foreground">
          <Bell class="size-4" />
        </VbenIconButton>

        <!-- Unread count badge - positioned outside button for proper visibility -->
        <span
          v-if="props.unreadCount > 0"
          class="pointer-events-none absolute -right-1 -top-1 z-50 flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white"
        >
          {{ props.unreadCount > 99 ? '99+' : props.unreadCount }}
        </span>
        <!-- Fallback dot indicator - only show when no unread count and dot prop is true -->
        <span
          v-else-if="props.dot && props.unreadCount === 0"
          class="bg-primary pointer-events-none absolute right-0.5 top-0.5 z-10 h-2 w-2 rounded"
        ></span>
      </div>
    </template>

    <div class="relative">
      <div class="flex items-center justify-between p-4 py-3">
        <div class="text-foreground">{{ $t('ui.widgets.notifications') }}</div>
        <!-- 暂时隐藏标记全部已读按钮，以保持徽标显示 -->
        <!-- <VbenIconButton
          :disabled="notifications.length <= 0"
          :tooltip="$t('ui.widgets.markAllAsRead')"
          @click="handleMakeAll"
        >
          <MailCheck class="size-4" />
        </VbenIconButton> -->
      </div>

      <!-- Loading state -->
      <div v-if="props.loading" class="flex-center min-h-[150px] w-full">
        <div class="flex flex-col items-center gap-2">
          <div
            class="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          ></div>
          <span class="text-muted-foreground text-sm">加载中...</span>
        </div>
      </div>

      <!-- Message list -->
      <VbenScrollbar v-else-if="props.notifications.length > 0">
        <ul class="!flex max-h-[360px] w-full flex-col">
          <template v-for="item in props.notifications" :key="item.title">
            <li
              class="hover:bg-accent border-border relative flex w-full cursor-pointer items-start gap-3 border-t px-3 py-3"
              @click="handleClick(item)"
            >
              <span
                v-if="!item.isRead"
                class="bg-primary absolute right-2 top-2 h-2 w-2 rounded"
              ></span>

              <div class="flex w-full flex-col gap-1 leading-none">
                <p class="font-semibold">{{ item.title }}</p>
                <p class="text-muted-foreground my-1 line-clamp-2 text-xs">
                  {{ item.message }}
                </p>
                <p class="text-muted-foreground line-clamp-2 text-xs">
                  {{ item.date }}
                </p>
              </div>
            </li>
          </template>
        </ul>
      </VbenScrollbar>

      <template v-else>
        <div class="flex-center text-muted-foreground min-h-[150px] w-full">
          {{ $t('common.noData') }}
        </div>
      </template>

      <div
        class="border-border flex items-center justify-center border-t px-4 py-3"
      >
        <VbenButton size="sm" @click="handleViewAll">
          {{ $t('ui.widgets.viewAll') }}
        </VbenButton>
      </div>
    </div>
  </VbenPopover>
</template>

<style scoped>
:deep(.bell-button) {
  &:hover {
    svg {
      animation: bell-ring 1s both;
    }
  }
}

@keyframes bell-ring {
  0%,
  100% {
    transform-origin: top;
  }

  15% {
    transform: rotateZ(10deg);
  }

  30% {
    transform: rotateZ(-10deg);
  }

  45% {
    transform: rotateZ(5deg);
  }

  60% {
    transform: rotateZ(-5deg);
  }

  75% {
    transform: rotateZ(2deg);
  }
}
</style>
