import type {
  createWebSocketService,
  MessageNotification,
} from '@vben/websocket';

import type { UserMessageReadCountDto } from '../types/message';

import { notification } from 'ant-design-vue';

import { useMessageStore } from '#/composables/useMessageStore';

type WebSocketService = ReturnType<typeof createWebSocketService>;

/**
 * 注册新消息订阅
 * 订阅 /topic/message/new 主题并处理消息通知
 * @param service WebSocket服务实例
 * @returns 取消订阅的函数
 */
export function registerMessageSubscription(service: WebSocketService) {
  const destination = '/user/queue/message';

  const messageHandler = (payload: any) => {
    try {
      // 处理消息数据，支持字符串和对象格式
      const messageData: MessageNotification =
        typeof payload === 'string' ? JSON.parse(payload) : payload;

      // console.log('[RealTime] 收到新消息:', messageData);

      // 使用 Ant Design Vue 的通知组件显示消息
      notification.info({
        message: messageData.title || '新消息',
        description: messageData.content,
        duration: 4.5,
        placement: 'topRight',
      });
    } catch (error) {
      console.warn('[RealTime] 消息解析失败:', error, payload);
    }
  };

  // 订阅主题
  service.subscribe(destination, messageHandler);
  // console.log(`[RealTime] 已订阅主题: ${destination}`);

  // 返回取消订阅的函数
  return () => {
    service.unsubscribe(destination);
    // console.log(`[RealTime] 已取消订阅主题: ${destination}`);
  };
}

/**
 * 注册消息数量变化订阅
 * 订阅 /user/queue/message/count 主题并处理消息数量变化
 * @param service WebSocket服务实例
 * @returns 取消订阅的函数
 */
export function registerMessageCountSubscription(service: WebSocketService) {
  const destination = '/user/queue/message/count';
  const { updateMessageCounts, triggerLayoutRefresh } = useMessageStore();

  const countHandler = (payload: any) => {
    try {
      // 处理消息数量数据，支持字符串和对象格式
      const countData: UserMessageReadCountDto =
        typeof payload === 'string' ? JSON.parse(payload) : payload;

      // console.log('[RealTime] 收到消息数量变化:', countData);

      // 更新全局消息数量（未读和已读）
      updateMessageCounts(countData.unRead, countData.read);

      // 触发布局组件刷新
      triggerLayoutRefresh();
    } catch (error) {
      console.warn('[RealTime] 消息数量解析失败:', error, payload);
    }
  };

  // 订阅主题
  service.subscribe(destination, countHandler);
  // console.log(`[RealTime] 已订阅主题: ${destination}`);

  // 返回取消订阅的函数
  return () => {
    service.unsubscribe(destination);
    // console.log(`[RealTime] 已取消订阅主题: ${destination}`);
  };
}
