import type { PageResult, Recordable } from '@vben/types';

import type {
  SysOperationLog,
  SysOperationLogListVo,
  SysOperationLogQueryRequest,
} from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取操作日志列表
 * @param params 查询参数
 */
async function getOperationLogList(params?: SysOperationLogQueryRequest) {
  return requestClient.get<PageResult<SysOperationLogListVo[]>>(
    '/system/log/operation/list',
    { params },
  );
}

/**
 * 获取操作日志详情
 * @param id 主键
 */
async function getOperationById(id: string) {
  return requestClient.get<SysOperationLog>(`/system/log/operation/${id}`);
}

/**
 * 删除操作日志
 * @param ids 主键数组
 */
async function deleteOperationLog(ids: Array<string>) {
  return requestClient.delete(`/system/log/operation/${ids.join(',')}`);
}

/**
 * 清空操作日志
 */
async function cleanOperationLog() {
  return requestClient.delete('/system/log/operation/clean');
}

/**
 * 导出操作日志列表
 * @param params 查询参数
 */
async function exportOperationList(params?: Recordable<any>) {
  return exportFile('/system/log/operation/export', {
    params,
  });
}

export {
  cleanOperationLog,
  deleteOperationLog,
  exportOperationList,
  getOperationById,
  getOperationLogList,
};
