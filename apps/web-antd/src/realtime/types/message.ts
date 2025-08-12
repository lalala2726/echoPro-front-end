export interface MessageNotification {
  /** 消息ID */
  id?: string;
  /** 消息标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  type?: MessageType;
  /** 时间戳 */
  timestamp?: string;
  /** 发送者 */
  sender?: string;
}

export enum MessageType {
  /** 公告消息 */
  ANNOUNCEMENT = 'announcement',
  /** 通知消息 */
  NOTICE = 'notice',
  /** 系统消息 */
  SYSTEM = 'system',
}

/**
 * 用户消息读取数量统计
 */
export interface UserMessageReadCountDto {
  /** 总数量 */
  total: number;
  /** 已读数量 */
  read: number;
  /** 未读数量 */
  unRead: number;
}
