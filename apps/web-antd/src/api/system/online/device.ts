import type { PageResult, Recordable } from '@vben/types';

import type { DeviceList, SessionDeviceQueryRequest } from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取设备列表
 */
async function deviceList(params?: SessionDeviceQueryRequest) {
  return requestClient.get<PageResult<DeviceList>>('/system/device/list', {
    params,
  });
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
