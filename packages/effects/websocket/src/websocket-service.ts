import type {
  WebSocketConfig,
  WebSocketEvents,
  WebSocketService,
} from './types';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketServiceImpl implements WebSocketService {
  public client: Client | null = null;
  public isConnected = false;

  private config: WebSocketConfig;
  private eventListeners = new Map<
    keyof WebSocketEvents,
    ((...args: any[]) => void)[]
  >();
  private isManualDisconnect = false; // 标记是否为手动断开
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptions = new Map<string, any>();

  constructor(config: WebSocketConfig) {
    this.config = {
      debug: false,
      reconnect: {
        enabled: true,
        maxAttempts: 5,
        interval: 3000,
      },
      ...config,
    };
  }

  /**
   * 连接到 WebSocket 服务器
   */
  public async connect(
    token?: string,
    customParams?: Record<string, string>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isManualDisconnect = false; // 重置手动断开标识

        // 构建 WebSocket URL，将认证信息作为查询参数
        let wsUrl = this.config.url;
        const urlParams = new URLSearchParams();

        // 添加 token 参数（主要认证方式）
        if (token) {
          urlParams.append('token', encodeURIComponent(token));
        }

        // 添加自定义参数
        if (customParams) {
          Object.entries(customParams).forEach(([key, value]) => {
            if (key !== 'token') {
              // 避免重复添加 token
              urlParams.append(key, encodeURIComponent(value));
            }
          });
        }

        // 如果有参数，添加到 URL
        if (urlParams.toString()) {
          wsUrl += (wsUrl.includes('?') ? '&' : '?') + urlParams.toString();
        }

        // eslint-disable-next-line no-console
        console.log('[WebSocket] 连接URL:', wsUrl);
        // eslint-disable-next-line no-console
        console.log('[WebSocket] URL参数传递token认证:', {
          hasToken: !!token,
          tokenPreview: token ? `${token.slice(0, 10)}...` : 'None',
          customParamsCount: customParams
            ? Object.keys(customParams).length
            : 0,
        });

        // 创建 SockJS 连接
        const socket = new SockJS(wsUrl);

        // 创建 STOMP 连接头（协议层面，通常不需要认证信息）
        const connectHeaders: Record<string, string> = {};

        // 创建 STOMP 客户端
        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders,
          debug: this.config.debug
            ? (str: string) => {
                // eslint-disable-next-line no-console
                console.log('[WebSocket Debug]:', str);
              }
            : undefined,
          reconnectDelay: this.config.reconnect?.interval || 3000,
          heartbeatIncoming: 10_000,
          heartbeatOutgoing: 10_000,
        });

        // 连接成功处理
        this.client.onConnect = (frame) => {
          // eslint-disable-next-line no-console
          console.log('[WebSocket] 连接成功:', frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.clearReconnectTimer();

          // 自动订阅消息主题
          this.subscribeToMessageTopic();

          this.emit('connected');
          resolve();
        };

        // 连接断开处理
        this.client.onDisconnect = (frame) => {
          // eslint-disable-next-line no-console
          console.log('[WebSocket] 连接断开:', frame);
          this.isConnected = false;
          this.emit('disconnected');

          // 只有在非手动断开时才自动重连
          if (this.config.reconnect?.enabled && !this.isManualDisconnect) {
            this.attemptReconnect();
          }
        };

        // 错误处理
        this.client.onStompError = (frame) => {
          console.error('[WebSocket] STOMP 错误:', frame);
          this.isConnected = false;
          this.emit('error', frame);
          reject(
            new Error(
              `WebSocket 连接错误: ${frame.headers?.message || 'Unknown error'}`,
            ),
          );
        };

        // 开始连接
        this.client.activate();
      } catch (error) {
        console.error('[WebSocket] 连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    this.isManualDisconnect = true; // 标记为手动断开
    this.clearReconnectTimer();

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (error) {
        console.error('[WebSocket] 断开连接时出错:', error);
      }
      this.client = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * 移除事件监听器
   */
  public off<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K],
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 添加事件监听器
   */
  public on<K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K],
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  /**
   * 发送消息
   */
  public send(destination: string, message: any): void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] 客户端未连接，无法发送消息');
      return;
    }

    try {
      const messageBody =
        typeof message === 'string' ? message : JSON.stringify(message);
      this.client.publish({
        destination,
        body: messageBody,
      });
    } catch (error) {
      console.error('[WebSocket] 消息发送失败:', error);
    }
  }

  /**
   * 订阅主题
   */
  public subscribe(
    destination: string,
    callback: (message: any) => void,
  ): void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] 客户端未连接，无法订阅:', destination);
      return;
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          callback(parsedMessage);
        } catch (error) {
          console.error('[WebSocket] 消息解析失败:', error, message.body);
          callback(message.body);
        }
      });

      this.subscriptions.set(destination, subscription);
    } catch (error) {
      console.error('[WebSocket] 订阅失败:', destination, error);
    }
  }

  /**
   * 取消订阅
   */
  public unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (!this.config.reconnect?.enabled) {
      return;
    }

    if (this.reconnectAttempts >= (this.config.reconnect?.maxAttempts || 5)) {
      console.warn('[WebSocket] 超过最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    const interval = this.config.reconnect?.interval || 3000;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] 重连失败:', error);
        this.attemptReconnect();
      });
    }, interval);
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof WebSocketEvents>(
    event: K,
    ...args: any[]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`[WebSocket] 事件监听器执行错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 自动订阅消息主题
   */
  private subscribeToMessageTopic(): void {
    // 如果配置了默认订阅主题，则自动订阅
    if (this.config.defaultSubscriptions) {
      this.config.defaultSubscriptions.forEach((destination) => {
        this.subscribe(destination, (message: any) => {
          this.emit('message', message);
        });
      });
    }
  }
}
