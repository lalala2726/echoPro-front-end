import type { BaseRequest, PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace MonitorDeviceApi {
  export interface deviceList {
    /** 用户ID */
    userId?: number;
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
}

/**
 * 获取设备列表
 */
async function deviceList(params?: MonitorDeviceApi.SessionDeviceQueryRequest) {
  return requestClient.get<PageResult<MonitorDeviceApi.deviceList>>(
    '/system/device/list',
    { params },
  );
}

/**
 * 导出设备列表
 * @param params 查询参数
 */
async function exportDeviceList(params?: Recordable<any>) {
  return exportFile('/system/device/export', {
    params,
  });
}

/**
 * 删除设备
 * @param refreshTokenId 刷新令牌会话ID
 */
async function deleteDevice(refreshTokenId: string) {
  return requestClient.delete('/system/device', {
    params: { refreshTokenId },
  });
}

export { deleteDevice, deviceList, exportDeviceList };
