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
    /**
     * 消息发送方式，取值说明：
     * 0 - 按用户ID发送
     * 1 - 按角色发送
     * 2 - 按部门发送
     */
    sendMethod: number;
    /**
     * 接收者ID列表，根据发送方式指定不同类型的ID：
     * 发送方式为0时是用户ID列表
     * 发送方式为1时是角色ID列表
     * 发送方式为2时是部门ID列表
     */
    receiveId?: number[];
    /**
     * 要发送的消息内容详情
     */
    message: MessageRequest;
  }

  export interface MessageRequest {
    /** 消息标题 */
    title?: string;
    /** 消息内容 */
    content?: string;
    /** 消息类型：1-系统消息 2-通知消息 3-公告消息 */
    type?: number;
    /** 消息级别：1-普通 2-重要 3-紧急 */
    level?: number;
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
async function updateMessage(data: SystemMessageManageType.MessageRequest) {
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
