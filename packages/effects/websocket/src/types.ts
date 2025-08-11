import type { Client } from '@stomp/stompjs';

export interface WebSocketConfig {
  /** WebSocket 服务器 URL */
  url: string;
  /** 调试模式 */
  debug?: boolean;
  /** 默认订阅的主题列表 */
  defaultSubscriptions?: string[];
  /** 重连配置 */
  reconnect?: {
    /** 是否启用自动重连 */
    enabled: boolean;
    /** 重连间隔(毫秒) */
    interval: number;
    /** 最大重连次数 */
    maxAttempts: number;
  };
}

export interface WebSocketService {
  /** STOMP 客户端实例 */
  client: Client | null;
  /** 连接状态 */
  isConnected: boolean;
  /** 连接到服务器 */
  connect(token?: string): Promise<void>;
  /** 断开连接 */
  disconnect(): void;
  /** 订阅主题 */
  subscribe(destination: string, callback: (message: any) => void): void;
  /** 取消订阅 */
  unsubscribe(destination: string): void;
  /** 发送消息 */
  send(destination: string, message: any): void;
}

export interface MessageNotification {
  /** 消息ID */
  id?: string;
  /** 消息标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  type?: 'error' | 'info' | 'success' | 'warning';
  /** 时间戳 */
  timestamp?: string;
  /** 发送者 */
  sender?: string;
}

export interface WebSocketEvents {
  /** 连接成功 */
  connected: () => void;
  /** 连接断开 */
  disconnected: (error?: any) => void;
  /** 连接错误 */
  error: (error: any) => void;
  /** 收到消息 */
  message: (message: MessageNotification) => void;
}
