import type { PageResult } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DashBoardMessageType {
  export interface UserMessageListVo {
    /** 消息ID */
    id?: number;
    /** 消息标题 */
    title?: string;
    /** 消息类型 */
    type?: MessageSendMethod;
    /** 消息级别 */
    level?: MessageLevel;
    /** 是否已读 */
    isRead?: number;
    /** 发送者名称 */
    senderName?: string;
    /** 概要内容 */
    content?: string;
    /** 创建时间(发送时间) */
    createTime?: string;
  }

  export interface UserMessageListQueryRequest {
    /** 消息标题 */
    title?: string;
    /** 消息类型 */
    type?: MessageType;
    /** 消息级别 */
    level?: MessageLevel;
    /** 是否已读 */
    isRead?: number;
    /** 发送者名称 */
    senderName?: string;
    /** 当前页码 */
    current?: number;
    /** 每页大小 */
    size?: number;
  }

  export interface UserMessageVo {
    /** 消息ID */
    id?: number;
    /** 消息标题 */
    title?: string;
    /** 消息内容 */
    content?: string;
    /** 消息类型 */
    type?: MessageType;
    /** 消息级别 */
    level?: MessageLevel;
    /** 是否已读 */
    isRead?: number;
    /** 发送者ID */
    senderId?: number;
    /** 发送者名称 */
    senderName?: string;
    /** 接收者ID */
    receiverId?: number;
    /** 接收者名称 */
    receiverName?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
  }

  export interface UnreadCountResponse {
    /** 总数量 */
    total: number;
    /** 已读数量 */
    read: number;
    /** 未读数量 */
    unRead: number;
  }

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

  export enum MessageType {
    /** 公告消息 */
    ANNOUNCEMENT = 'announcement',
    /** 通知消息 */
    NOTICE = 'notice',
    /** 系统消息 */
    SYSTEM = 'system',
  }

  export enum MessageLevel {
    /** 重要 */
    IMPORTANT = 'important',
    /** 普通 */
    NORMAL = 'normal',
    /** 紧急 */
    URGENT = 'urgent',
  }
}

/**
 * 获取用户消息列表
 * @param params 查询参数
 */
async function listUserMessageList(
  params: DashBoardMessageType.UserMessageListQueryRequest,
) {
  return requestClient.get<PageResult<DashBoardMessageType.UserMessageListVo>>(
    '/dashboard/message/list',
    {
      params,
    },
  );
}

/**
 * 根据ID获取消息详情
 * @param id 消息ID
 */
async function getMessageDetailById(id: number) {
  return requestClient.get<DashBoardMessageType.UserMessageVo>(
    `/dashboard/message/${id}`,
  );
}

/**
 * 获取未读和已读消息数量
 */
async function getUnreadCount() {
  return requestClient.get<DashBoardMessageType.UnreadCountResponse>(
    '/dashboard/message/count',
  );
}

/**
 * 标记消息为已读 (支持批量标记)
 * @param ids 消息ID列表
 */
async function markMessageAsRead(ids: Array<number>) {
  return requestClient.put(`/dashboard/message/read/${ids.join(',')}`);
}

/**
 * 标记消息为未读 (支持批量标记)
 * @param ids 消息ID列表
 */
async function markMessageAsUnRead(ids: Array<number>) {
  return requestClient.put(`/dashboard/message/unread/${ids.join(',')}`);
}

/**
 * 删除消息 (支持批量删除)
 * @param ids 消息ID列表
 */
async function deleteMessages(ids: Array<number>) {
  return requestClient.delete(`/dashboard/message/${ids.join(',')}`);
}

export {
  deleteMessages,
  getMessageDetailById,
  getUnreadCount,
  listUserMessageList,
  markMessageAsRead,
  markMessageAsUnRead,
};
