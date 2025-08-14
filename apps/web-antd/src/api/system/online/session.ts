import type { PageResult, Recordable } from '@vben/types';

import type {
  OnlineLoginUser,
  OnlineUserQueryRequest,
  SessionListVo,
} from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取当前会话列表
 * @param params 查询参数
 */
async function sessionList(params?: OnlineUserQueryRequest) {
  return requestClient.get<PageResult<SessionListVo[]>>(
    '/system/session/list',
    { params },
  );
}

/**
 * 查看当前会话列表细节
 * @param accessTokenId 会话ID
 */
async function getSessionDetail(accessTokenId: string) {
  return requestClient.get<OnlineLoginUser>('/system/session/detail', {
    params: { accessTokenId },
  });
}

/**
 * 删除当前会话
 * @param accessTokenId 会话ID
 */
async function deleteSession(accessTokenId: string) {
  return requestClient.delete('/system/session', { params: { accessTokenId } });
}

/**
 * 导出在线会话列表
 * @param params 查询参数
 */
async function exportSessionList(params?: Recordable<any>) {
  return exportFile('/system/session/export', {
    params,
  });
}

export { deleteSession, exportSessionList, getSessionDetail, sessionList };
