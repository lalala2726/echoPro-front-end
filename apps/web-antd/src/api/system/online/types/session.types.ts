import type { BaseRequest } from '@vben/types';

/**
 * 会话列表视图对象
 */
export interface SessionListVo {
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  accessTokenId: string;
  /** 用户名 */
  username?: string;
  /** 登录IP地址 */
  ip?: string;
  /** 登录地点 */
  location?: string;
  /** 最近访问时间 */
  accessTime?: number;
}

/**
 * 在线用户查询请求参数
 */
export interface OnlineUserQueryRequest extends BaseRequest {
  /** 用户名 */
  username?: string;
  /** 会话ID */
  accessTokenId: string;
  /** 用户ID */
  userId?: string;
  /** 登录IP */
  ip?: string;
  /** 登录地点 */
  region?: string;
}

/**
 * 在线登录用户信息
 */
export interface OnlineLoginUser {
  /** 会话ID */
  accessTokenId?: string;
  /** 刷新令牌ID */
  refreshTokenId?: string;
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
