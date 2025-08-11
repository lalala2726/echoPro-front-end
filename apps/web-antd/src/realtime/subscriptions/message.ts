import type { createWebSocketService } from '@vben/websocket';

import type { MessageNotification } from '../types/message';

import { h } from 'vue';

import { Button, notification } from 'ant-design-vue';

import { router } from '#/router';

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

      const key = `message_${messageData.id}`;

      // 使用 Ant Design Vue 的通知组件显示消息
      notification.info({
        message: messageData.title || '新消息',
        description: messageData.content,
        duration: 6,
        placement: 'topRight',
        btn: () =>
          h(
            Button,
            {
              type: 'primary',
              size: 'small',
              onClick: () => {
                notification.close(key);
                router.push(`/personal/message/detail/${messageData.id}`);
              },
            },
            { default: () => '查看消息' },
          ),
        key,
      });
    } catch (error) {
      console.warn('[RealTime] 消息解析失败:', error, payload);
    }
  };

  // 订阅主题
  service.subscribe(destination, messageHandler);

  // 返回取消订阅的函数
  return () => {
    service.unsubscribe(destination);
  };
}
