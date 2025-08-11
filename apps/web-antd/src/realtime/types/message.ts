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
