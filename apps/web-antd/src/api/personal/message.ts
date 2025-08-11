import type { BaseRequest, PageResult } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DashBoardMessageType {
  export interface UserMessageListVo {
    /** 消息ID */
    id?: number;
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
    /** 概要内容 */
    content?: string;
    /** 创建时间(发送时间) */
    createTime?: string;
  }

  export interface UserMessageListQueryRequest extends BaseRequest {
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
  }
  /**
   * 用户消息视图对象
   *
   * @author Chuang
   */
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
    /** 发送者姓名 */
    senderName?: string;
    /** 发送时间 */
    sentTime?: string;
    /** 上一条消息ID */
    previousId?: number;
    /** 下一条消息ID */
    nextId?: number;
  }

  export interface UnreadCountResponse {
    /** 总数量 */
    total: number;
    /** 已读数量 */
    read: number;
    /** 未读数量 */
    unRead: number;
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
    '/personal/message/list',
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
    `/personal/message/${id}`,
  );
}

/**
 * 获取未读和已读消息数量
 */
async function getUnreadCount() {
  return requestClient.get<DashBoardMessageType.UnreadCountResponse>(
    '/personal/message/count',
  );
}

/**
 * 标记消息为已读 (支持批量标记)
 * @param ids 消息ID列表
 */
async function markMessageAsRead(ids: Array<number>) {
  return requestClient.put(`/personal/message/read/${ids.join(',')}`);
}

/**
 * 标记消息为未读 (支持批量标记)
 * @param ids 消息ID列表
 */
async function markMessageAsUnRead(ids: Array<number>) {
  return requestClient.put(`/personal/message/unread/${ids.join(',')}`);
}

/**
 * 删除消息 (支持批量删除)
 * @param ids 消息ID列表
 */
async function deleteMessages(ids: Array<number>) {
  return requestClient.delete(`/personal/message/${ids.join(',')}`);
}

export {
  deleteMessages,
  getMessageDetailById,
  getUnreadCount,
  listUserMessageList,
  markMessageAsRead,
  markMessageAsUnRead,
};
