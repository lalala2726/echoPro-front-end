import type { PageResult, Recordable } from '@vben/types';

import type {
  SysMessageListVo,
  SysMessageQueryRequest,
  SysMessageUpdateRequest,
  SysSendMessageRequest,
} from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取消息列表
 * @param params 查询参数
 */
async function getMessageList(params?: SysMessageQueryRequest) {
  return requestClient.get<PageResult<SysMessageListVo[]>>(
    '/system/manage/message/list',
    { params },
  );
}

/**
 * 发送消息
 * @param data 发送消息参数
 */
async function sendMessage(data: SysSendMessageRequest) {
  return requestClient.post('/system/manage/message/send', data);
}

/**
 * 修改消息
 * @param data 修改消息参数
 */
async function updateMessage(data: SysMessageUpdateRequest) {
  return requestClient.put('/system/manage/message', data);
}

/**
 * 删除消息
 * @param ids 消息ID数组
 */
async function deleteMessage(ids: Array<any>) {
  return requestClient.delete(`/system/manage/message/${ids.join(',')}`);
}

/**
 * 获取消息详情
 * @param id 消息ID
 */
async function getMessageById(id: string) {
  return requestClient.get(`/system/manage/message/${id}`);
}

/**
 * 导出消息列表
 * @param params 查询参数
 */
async function exportMessage(params?: Recordable<SysMessageQueryRequest>) {
  return exportFile('/system/manage/message/export', { params });
}

export {
  deleteMessage,
  exportMessage,
  getMessageById,
  getMessageList,
  sendMessage,
  updateMessage,
};
