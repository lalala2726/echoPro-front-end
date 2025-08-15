import type { createWebSocketService } from '@vben/websocket';

import type { UserMessageReadCountDto } from '../types/message';

import { useMessageStore } from '#/composables/useMessageStore';

type WebSocketService = ReturnType<typeof createWebSocketService>;

/**
 * 注册消息计数订阅
 * 订阅 /queue/message/count 并实时更新未读/已读数量
 */
export function registerMessageCountSubscription(service: WebSocketService) {
  const destination = '/user/queue/message/count';

  const handler = (payload: any) => {
    try {
      const data: Partial<UserMessageReadCountDto> =
        typeof payload === 'string' ? JSON.parse(payload) : payload;

      // 兼容不同字段命名
      const unread =
        (data as any).unRead ??
        (data as any).unread ??
        (data as any).unreadCount;
      const read = (data as any).read ?? (data as any).readCount;

      if (typeof unread === 'number' || typeof read === 'number') {
        const { updateMessageCounts, triggerLayoutRefresh } = useMessageStore();
        // 未提供某一项时不覆盖，先读取当前值
        const currentUnread = useMessageStore().unreadCount.value;
        const currentRead = useMessageStore().readCount.value;
        updateMessageCounts(
          typeof unread === 'number' ? unread : currentUnread,
          typeof read === 'number' ? read : currentRead,
        );
        // 通知头部等布局刷新
        triggerLayoutRefresh();
      }
    } catch {
      // 忽略错误以保证订阅稳定
    }
  };

  service.subscribe(destination, handler);

  return () => {
    service.unsubscribe(destination);
  };
}


