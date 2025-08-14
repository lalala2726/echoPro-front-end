import type { BaseRequest } from '@vben/types';

/**
 * 设备列表视图对象
 */
export interface DeviceList {
  /** 用户ID */
  userId?: string;
  /** 用户名 */
  username?: string;
  /** 刷新令牌会话ID */
  refreshTokenId?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 设备名称 */
  deviceName?: string;
  /** 登录时间 */
  loginTime?: string;
  /** 登录IP */
  ip?: string;
  /** 登录地点 */
  location?: string;
}

/**
 * 会话设备查询请求参数
 */
export interface SessionDeviceQueryRequest extends BaseRequest {
  /** 设备类型 */
  deviceType?: string;
  /** 设备名称 */
  deviceName?: string;
  /** 登录时间 */
  loginTime?: number;
  /** 登录IP */
  ip?: string;
  /** 登录地点 */
  location?: string;
}
