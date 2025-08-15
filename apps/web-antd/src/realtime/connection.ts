import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { createWebSocketService } from '@vben/websocket';

// 全局 WebSocket 服务实例
let globalWebSocketService: null | ReturnType<typeof createWebSocketService> =
  null;

/**
 * 创建 WebSocket 配置（仅负责连接配置，不包含业务订阅）
 */
function createWebSocketConfig() {
  const { apiURL, apiPath, websocketPath } = useAppConfig(
    import.meta.env,
    import.meta.env.PROD,
  );

  const prefix = apiPath && apiPath.trim().length > 0 ? apiPath : '';
  const wsUrl = `${apiURL}${prefix}${websocketPath}`;
  return {
    url: wsUrl,
    debug: !import.meta.env.PROD,
    // 不设置默认订阅，业务订阅由 subscriptions 层管理
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      interval: 3000,
    },
  };
}

/**
 * 获取全局 WebSocket 服务实例（纯连接管理，不包含业务逻辑）
 */
export function getWebSocketService() {
  if (!globalWebSocketService) {
    const config = createWebSocketConfig();
    globalWebSocketService = createWebSocketService(config);

    // 仅设置连接相关的事件处理，业务消息处理由订阅层负责
    globalWebSocketService.on('connected', () => {
      // 连接成功后自动注册业务订阅
      import('./subscriptions').then(({ registerAppSubscriptions }) => {
        registerAppSubscriptions();
      });
    });

    globalWebSocketService.on('disconnected', () => {
      // 连接断开时清理订阅
      import('./subscriptions').then(({ cleanupAppSubscriptions }) => {
        cleanupAppSubscriptions();
      });
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
      // 使用 token 参数进行认证，格式：ws://localhost:8080/ws?token=jwt-token
      await service.connect(token);
    }
  } catch (error) {
    // 不再抛出异常，只记录错误，让应用正常启动
    console.error('[WebSocket] 初始化连接失败，将在后台继续尝试重连:', error);
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
