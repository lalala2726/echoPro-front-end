import type { TimeRange } from '@vben/types';

/**
 * 系统消息查询请求参数
 */
export interface SysMessageQueryRequest {
  /** 消息标题 */
  title?: string;
  /** 消息内容 */
  content?: string;
  /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
  type?: number;
  /** 消息级别：1-普通 2-重要 3-紧急 */
  level?: number;
  /** 发送者姓名 */
  senderName?: string;
  /** 目标类型：1-指定用户 2-全部用户 3-角色用户 */
  targetType?: number;
  /** 发布时间范围 */
  publishTimeRange?: TimeRange;
}

/**
 * 系统消息列表视图对象
 */
export interface SysMessageListVo {
  /** 消息ID */
  id?: string;
  /** 消息标题 */
  title?: string;
  /** 消息内容 */
  content?: string;
  /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
  type?: number;
  /** 消息级别：1-普通 2-重要 3-紧急 */
  level?: number;
  /** 发送者姓名 */
  senderName?: string;
  /** 目标类型：1-指定用户 2-全部用户 3-角色用户 */
  targetType?: number;
  /** 发布时间 */
  publishTime?: string;
}

/**
 * 系统发送消息请求参数
 */
export interface SysSendMessageRequest {
  /** 接收类型 */
  receiveType: MessageSendMethod;
  /** 接收者ID */
  receiveId?: number[];
  /** 消息 */
  message: MessageRequest;
}

/**
 * 消息请求参数
 */
export interface MessageRequest {
  /** 消息标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  type?: MessageType;
  /** 消息级别 */
  level?: MessageLevel;
}

/**
 * 系统消息视图对象
 */
export interface SysMessageVo {
  /** 消息ID */
  id?: string;
  /** 消息标题 */
  title?: string;
  /** 消息内容 */
  content?: string;
  /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
  type?: number;
  /** 消息级别：1-普通 2-重要 3-紧急 */
  level?: number;
  /** 目标接受者ID列表 */
  targetIds?: number[];
  /** 发送者姓名 */
  senderName?: string;
  /** 目标类型：1-指定用户 2-全部用户 3-角色用户 */
  targetType?: number;
  /** 发布时间 */
  publishTime?: string;
}

/**
 * 系统消息更新请求参数
 */
export interface SysMessageUpdateRequest {
  /** 消息ID */
  id: string;
  /** 消息标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
  type: number;
  /** 消息级别：1-普通 2-重要 3-紧急 */
  level: number;
}

/**
 * 消息发送方式枚举
 */
export enum MessageSendMethod {
  /** 给所有用户发送消息 */
  ALL = 'all',
  /** 给指定部门发送消息 */
  DEPT = 'dept',
  /** 给指定角色发送消息 */
  ROLE = 'role',
  /** 给指定用户发送消息 */
  USER = 'user',
}

/**
 * 消息类型枚举
 */
export enum MessageType {
  /** 公告消息 */
  ANNOUNCEMENT = 'announcement',
  /** 通知消息 */
  NOTICE = 'notice',
  /** 系统消息 */
  SYSTEM = 'system',
}

/**
 * 消息级别枚举
 */
export enum MessageLevel {
  /** 重要 */
  IMPORTANT = 'important',
  /** 普通 */
  NORMAL = 'normal',
  /** 紧急 */
  URGENT = 'urgent',
}
