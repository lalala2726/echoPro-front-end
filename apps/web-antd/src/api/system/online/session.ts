import type { BaseRequest, PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemSessionTypes {
  export interface SessionListVo {
    /** 用户ID */
    userId?: number;
    /** 会话ID */
    accessTokenId: string;
    /** 用户名 */
    username?: string;
    /** 部门ID */
    deptId?: number;
    /** 登录IP地址 */
    ip?: string;
    /** 登录地点 */
    location?: string;
    /** 最近访问时间 */
    accessTime?: number;
  }

  export interface OnlineUserQueryRequest extends BaseRequest {
    /** 用户名 */
    username?: string;
    /** 会话ID */
    accessTokenId: string;
    /** 用户ID */
    userId?: number;
    /** 登录IP */
    ip?: string;
    /** 登录地点 */
    region?: string;
  }

  export interface OnlineLoginUser {
    /** 会话ID */
    accessTokenId?: string;
    /** 刷新令牌ID */
    refreshTokenId?: string;
    /** 用户ID */
    userId?: number;
    /** 用户名 */
    username?: string;
    /** 部门ID */
    deptId?: number;
    /** 角色权限集合 */
    roles?: string[];
    /** 登录IP地址 */
    ip?: string;
    /** 登录地点 */
    location?: string;
    /** 最近访问时间 */
    accessTime?: number;
    /** userAgent */
    userAgent?: string;
  }
}

/**
 * 获取当前会话列表
 * @param params 查询参数
 */
async function sessionList(params?: SystemSessionTypes.OnlineUserQueryRequest) {
  return requestClient.get<PageResult<SystemSessionTypes.SessionListVo[]>>(
    '/system/session/list',
    { params },
  );
}

/**
 * 查看当前会话列表细节
 * @param accessTokenId 会话ID
 */
async function getSessionDetail(accessTokenId: string) {
  return requestClient.get<SystemSessionTypes.OnlineLoginUser>(
    '/system/session/detail',
    { params: { accessTokenId } },
  );
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
