import type { MessageNotification } from '@vben/websocket';

import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { createWebSocketService } from '@vben/websocket';

import { notification } from 'ant-design-vue';

// 全局 WebSocket 服务实例
let globalWebSocketService: null | ReturnType<typeof createWebSocketService> =
  null;

/**
 * 创建 WebSocket 配置
 */
function createWebSocketConfig() {
  // 参考 vite.config.mts 和 use-app-config.ts 的方式获取环境变量
  const { backendURL, websocketPath } = useAppConfig(
    import.meta.env,
    import.meta.env.PROD,
  );

  // 如果没有配置 backendURL，则使用默认值
  const finalBackendUrl = backendURL || 'http://localhost:8080';
  const finalWebsocketPath = websocketPath || '/ws';

  const wsUrl = `${finalBackendUrl}${finalWebsocketPath}`;
  console.log('[WebSocket] 配置地址:', wsUrl);
  console.log('[WebSocket] 环境变量:', { backendURL, websocketPath });

  return {
    url: wsUrl,
    debug: !import.meta.env.PROD,
    defaultSubscriptions: ['/topic/message/new'], // 默认订阅新消息主题
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      interval: 3000,
    },
  };
}

/**
 * 处理消息通知
 */
function handleMessageNotification(message: MessageNotification): void {
  console.log('[WebSocket] 处理消息通知:', message);

  // 使用 Ant Design Vue 的通知组件显示消息
  notification.info({
    message: message.title || '新消息',
    description: message.content,
    duration: 4.5,
    placement: 'topRight',
  });
}

/**
 * 获取全局 WebSocket 服务实例
 */
export function getWebSocketService() {
  if (!globalWebSocketService) {
    const config = createWebSocketConfig();
    globalWebSocketService = createWebSocketService(config);

    // 设置消息通知处理
    globalWebSocketService.on('message', handleMessageNotification);

    // 设置连接事件处理
    globalWebSocketService.on('connected', () => {
      console.log('[WebSocket] 服务连接成功');
    });

    globalWebSocketService.on('disconnected', () => {
      console.log('[WebSocket] 服务连接断开');
    });

    globalWebSocketService.on('error', (error) => {
      console.error('[WebSocket] 服务连接错误:', error);
    });
  }

  return globalWebSocketService;
}

/**
 * 初始化 WebSocket 连接（用于应用启动时）
 */
export async function initWebSocket(): Promise<void> {
  try {
    const accessStore = useAccessStore();
    const token = accessStore.accessToken;

    if (!token) {
      console.warn('[WebSocket] 缺少访问令牌，跳过 WebSocket 连接');
      return;
    }

    const service = getWebSocketService();
    if (!service.isConnected) {
      await service.connect(token);
      console.log('[WebSocket] 初始化连接成功');
    }
  } catch (error) {
    console.error('[WebSocket] 初始化连接失败:', error);
  }
}

/**
 * 断开全局 WebSocket 连接（用于应用退出时）
 */
export function destroyWebSocket(): void {
  if (globalWebSocketService) {
    globalWebSocketService.disconnect();
    globalWebSocketService = null;
  }
}

/**
 * 重新连接 WebSocket（用于重新登录时）
 */
export async function reconnectWebSocket(): Promise<void> {
  try {
    const accessStore = useAccessStore();
    const token = accessStore.accessToken;

    if (!token) {
      console.warn('[WebSocket] 缺少访问令牌，无法重连');
      return;
    }

    const service = getWebSocketService();

    // 如果已经连接，先断开
    if (service.isConnected) {
      service.disconnect();
    }

    // 重新连接
    await service.connect(token);
    console.log('[WebSocket] 重连成功');
  } catch (error) {
    console.error('[WebSocket] 重连失败:', error);
  }
}

/**
 * 获取当前连接状态
 */
export function getWebSocketStatus() {
  const service = globalWebSocketService;
  return {
    isConnected: service?.isConnected || false,
    service,
  };
}
