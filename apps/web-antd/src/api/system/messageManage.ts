import type { PageResult, Recordable, TimeRange } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemMessageManageType {
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

  export interface SysMessageListVo {
    /** 消息ID */
    id?: number;
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

  export interface SysSendMessageRequest {
    /** 接收类型 */
    receiveType: MessageSendMethod;
    /** 接收者ID */
    receiveId?: number[];
    /** 消息 */
    message: MessageRequest;
  }

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

  export interface SysMessageVo {
    /** 消息ID */
    id?: number;
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

  export interface SysMessageUpdateRequest {
    /** 消息ID */
    id: number;
    /** 消息标题 */
    title: string;
    /** 消息内容 */
    content: string;
    /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
    type: number;
    /** 消息级别：1-普通 2-重要 3-紧急 */
    level: number;
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
 * 获取消息列表
 * @param params 查询参数
 */
async function getMessageList(
  params?: SystemMessageManageType.SysMessageQueryRequest,
) {
  return requestClient.get<
    PageResult<SystemMessageManageType.SysMessageListVo[]>
  >('/system/message/manage/list', { params });
}

/**
 * 发送消息
 * @param data 发送消息参数
 */
async function sendMessage(
  data: SystemMessageManageType.SysSendMessageRequest,
) {
  return requestClient.post('/system/message/manage/send', data);
}

/**
 * 修改消息
 * @param data 修改消息参数
 */
async function updateMessage(
  data: SystemMessageManageType.SysMessageUpdateRequest,
) {
  return requestClient.put('/system/manage/message', data);
}

/**
 * 删除消息
 * @param ids 消息ID数组
 */
async function deleteMessage(ids: Array<number>) {
  return requestClient.delete(`/system/manage/message/${ids.join(',')}`);
}

/**
 * 获取消息详情
 * @param id 消息ID
 */
async function getMessageById(id: number) {
  return requestClient.get(`/system/message/manage/${id}`);
}

/**
 * 导出消息列表
 * @param params 查询参数
 */
async function exportMessage(
  params?: Recordable<SystemMessageManageType.SysMessageQueryRequest>,
) {
  return exportFile('/system/message/manage/export', params);
}

export {
  deleteMessage,
  exportMessage,
  getMessageById,
  getMessageList,
  sendMessage,
  updateMessage,
};
