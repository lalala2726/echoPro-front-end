import type { PageResult } from '@vben/types';

import type {
  BatchActionParams,
  Message,
  MessageListParams,
} from '#/types/message';

import {
  getMockMessageList,
  mockMessages,
  mockMessageStats,
} from '#/mock/message';

/**
 * 获取消息列表
 */
export async function getMessageList(params?: MessageListParams) {
  // 使用模拟数据，实际项目中应该调用真实API
  const mockResult = getMockMessageList(params || {});

  // 转换为标准的PageResult格式
  return {
    total: mockResult.total,
    pageNum: mockResult.pageNum,
    pageSize: mockResult.pageSize,
    rows: mockResult.list,
  } as PageResult<Message[]>;

  // 真实API调用示例：
  // return requestClient.get<PageResult<Message[]>>('/message/list', { params });
}

/**
 * 获取消息详情
 * @param id 消息ID
 */
export async function getMessageById(id: string) {
  // 使用模拟数据
  const message = mockMessages.find((msg) => msg.id === id);
  if (!message) {
    throw new Error('消息不存在');
  }
  return message;

  // 真实API调用示例：
  // return requestClient.get<Message>(`/message/${id}`);
}

/**
 * 标记消息为已读
 * @param messageIds 消息ID列表
 */
export async function markMessageAsRead(messageIds: string[]) {
  // 模拟API调用
  mockMessages.forEach((msg) => {
    if (messageIds.includes(msg.id)) {
      msg.status = 'read';
    }
  });
  return { success: true };

  // 真实API调用示例：
  // return requestClient.put('/message/mark-read', { messageIds });
}

/**
 * 标记消息为未读
 * @param messageIds 消息ID列表
 */
export async function markMessageAsUnread(messageIds: string[]) {
  // 模拟API调用
  mockMessages.forEach((msg) => {
    if (messageIds.includes(msg.id)) {
      msg.status = 'unread';
    }
  });
  return { success: true };

  // 真实API调用示例：
  // return requestClient.put('/message/mark-unread', { messageIds });
}

/**
 * 删除消息
 * @param messageIds 消息ID列表
 */
export async function deleteMessage(messageIds: string[]) {
  // 模拟API调用
  const indexesToRemove: number[] = [];
  mockMessages.forEach((msg, index) => {
    if (messageIds.includes(msg.id)) {
      indexesToRemove.push(index);
    }
  });

  // 从后往前删除，避免索引变化
  indexesToRemove.reverse().forEach((index) => {
    mockMessages.splice(index, 1);
  });

  return { success: true };

  // 真实API调用示例：
  // return requestClient.delete(`/message/${messageIds.join(',')}`);
}

/**
 * 获取消息统计信息
 */
export async function getMessageStats() {
  return mockMessageStats;

  // 真实API调用示例：
  // return requestClient.get<MessageStats>('/message/stats');
}

/**
 * 批量操作消息
 * @param params 批量操作参数
 */
export async function batchActionMessage(params: BatchActionParams) {
  const { messageIds, action } = params;

  switch (action) {
    case 'delete': {
      return deleteMessage(messageIds);
    }
    case 'mark_read': {
      return markMessageAsRead(messageIds);
    }
    case 'mark_unread': {
      return markMessageAsUnread(messageIds);
    }
    default: {
      throw new Error(`不支持的操作类型: ${action}`);
    }
  }

  // 真实API调用示例：
  // return requestClient.post('/message/batch-action', params);
}
