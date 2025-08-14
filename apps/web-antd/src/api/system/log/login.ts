import type { PageResult, Recordable } from '@vben/types';

import type {
  SysLoginLog,
  SysLoginLogListVo,
  SysLoginLogQueryRequest,
} from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取登录日志列表
 * @param params 查询参数
 */
async function getLoginLogList(params?: SysLoginLogQueryRequest) {
  return requestClient.get<PageResult<SysLoginLogListVo[]>>(
    '/system/log/login/list',
    { params },
  );
}

/**
 * 获取登录日志详情
 * @param id 主键
 */
async function getLoginLogById(id: string) {
  return requestClient.get<SysLoginLog>(`/system/log/login/${id}`);
}

/**
 * 删除登录日志
 * @param ids 主键数组
 */
async function deleteLoginLog(ids: Array<string>) {
  return requestClient.delete(`/system/log/login/${ids.join(',')}`);
}

/**
 * 清空登录日志
 */
async function cleanLoginLog() {
  return requestClient.delete('/system/log/login/clean');
}

/**
 * 导出登录日志
 * @param params 查询参数
 */
async function exportLoginList(params?: Recordable<any>) {
  return exportFile('/system/log/login/export', {
    params,
  });
}

export {
  cleanLoginLog,
  deleteLoginLog,
  exportLoginList,
  getLoginLogById,
  getLoginLogList,
};
