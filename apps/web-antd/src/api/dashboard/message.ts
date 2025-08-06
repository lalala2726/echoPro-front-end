import { requestClient } from '#/api/request';

export namespace SystemMessageType {
  export interface UserMessageListVo {
    /** 消息ID */
    id?: number;
    /** 消息标题 */
    title?: string;
    /** 消息类型 */
    type?: number;
    /** 消息级别 */
    level?: number;
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
    /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
    type?: number;
    /** 消息级别：1-普通 2-重要 3-紧急 */
    level?: number;
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
    type?: number;
    /** 消息级别 */
    level?: number;
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

  export interface UserMessageListResponse {
    /** 消息列表 */
    rows: UserMessageListVo[];
    /** 总数 - API返回字符串格式 */
    total: string;
    /** 页码 - API返回字符串格式 */
    pageNum: string;
    /** 每页大小 - API返回字符串格式 */
    pageSize: string;
    /** 额外信息 */
    extra: {
      /** 已读消息数量 - API返回字符串格式 */
      read: string;
      /** 未读消息数量 - API返回字符串格式 */
      unread: string;
    };
  }

  export interface UnreadCountResponse {
    /** 总数量 */
    total: number;
    /** 已读数量 */
    read: number;
    /** 未读数量 */
    unRead: number;
  }
}

/**
 * 获取用户消息列表
 * @param params 查询参数
 */
async function listUserMessageList(
  params: SystemMessageType.UserMessageListQueryRequest,
) {
  return requestClient.get<SystemMessageType.UserMessageListResponse>(
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
  return requestClient.get<SystemMessageType.UserMessageVo>(
    `/dashboard/message/${id}`,
  );
}

/**
 * 获取未读和已读消息数量
 */
async function getUnreadCount() {
  return requestClient.get<SystemMessageType.UnreadCountResponse>(
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
  return requestClient.delete(`/dashboard/message/delete/${ids.join(',')}`);
}

export {
  deleteMessages,
  getMessageDetailById,
  getUnreadCount,
  listUserMessageList,
  markMessageAsRead,
  markMessageAsUnRead,
};
