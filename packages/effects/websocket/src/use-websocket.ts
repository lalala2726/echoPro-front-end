import type { WebSocketConfig } from './types';

import { onUnmounted, ref } from 'vue';

import { WebSocketServiceImpl } from './websocket-service';

/**
 * 创建 WebSocket 服务实例
 */
export function createWebSocketService(
  config: WebSocketConfig,
): WebSocketServiceImpl {
  return new WebSocketServiceImpl(config);
}

/**
 * 使用 WebSocket 的 Composable
 */
export function useWebSocket(service: WebSocketServiceImpl) {
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const error = ref<null | string>(null);

  // 更新连接状态
  const updateConnectionStatus = () => {
    isConnected.value = service.isConnected;
  };

  // 连接 WebSocket
  const connect = async (
    token?: string,
    customParams?: Record<string, string>,
  ) => {
    if (isConnecting.value || isConnected.value) {
      return;
    }

    try {
      isConnecting.value = true;
      error.value = null;

      await service.connect(token, customParams);
      updateConnectionStatus();
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : '连接失败';
      console.error('[WebSocket] 连接失败:', error_);
    } finally {
      isConnecting.value = false;
    }
  };

  // 断开连接
  const disconnect = () => {
    service.disconnect();
    updateConnectionStatus();
  };

  // 订阅主题
  const subscribe = (destination: string, callback: (message: any) => void) => {
    service.subscribe(destination, callback);
  };

  // 取消订阅
  const unsubscribe = (destination: string) => {
    service.unsubscribe(destination);
  };

  // 发送消息
  const send = (destination: string, message: any) => {
    service.send(destination, message);
  };

  // 组件卸载时清理
  onUnmounted(() => {
    // 注意：不要在这里断开全局连接，因为其他组件可能还在使用
  });

  // 设置事件监听器来同步状态
  service.on('connected', () => {
    updateConnectionStatus();
  });

  service.on('disconnected', () => {
    updateConnectionStatus();
  });

  service.on('error', (errorMsg) => {
    error.value =
      errorMsg instanceof Error ? errorMsg.message : String(errorMsg);
    updateConnectionStatus();
  });

  // 初始化连接状态
  updateConnectionStatus();

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    service,
  };
}
