import type { PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemOperationLogApi {
  export interface SysOperationLog {
    /** 主键 */
    id?: string;
    /** 用户ID */
    userId?: string;
    /** 用户名 */
    userName?: string;
    /** 请求方式 */
    requestMethod?: string;
    /** 操作IP */
    operationIp?: string;
    /** 操作地点 */
    operationRegion?: string;
    /** 操作状态 (0成功1失败2未知) */
    operationStatus?: number;
    /** 操作结果 */
    responseResult?: string;
    /** 操作模块 */
    module?: string;
    /** 操作类型 */
    operationType?: string;
    /** 请求地址 */
    requestUrl?: string;
    /** 方法名称 */
    methodName?: string;
    /** 请求参数 */
    requestParams?: string;
    /** 错误信息 */
    errorMsg?: string;
    /** 耗时（毫秒） */
    costTime?: number;
    /** 操作时间 */
    createTime?: string;
  }

  /**
   * 系统操作日志列表视图对象
   *
   * @author Chuang
   */
  export interface SysOperationLogListVo {
    /** 主键 */
    id?: string;
    /** 用户ID */
    userId?: string;
    /** 用户名 */
    userName?: string;
    /** 操作状态 (0成功1失败2未知) */
    operationStatus?: number;
    /** 请求方式 */
    requestMethod?: string;
    /** 操作IP */
    operationIp?: string;
    /** 操作地区 */
    operationRegion?: string;
    /** 操作结果 */
    operationResult?: string;
    /** 操作模块 */
    module?: string;
    /** 操作类型 */
    operationType?: string;
    /** 请求地址 */
    requestUrl?: string;
    /** 方法名称 */
    methodName?: string;
    /** 耗时（毫秒） */
    costTime?: number;
    /** 操作时间 */
    createTime?: string;
  }

  export interface SysOperationLogQueryRequest {
    /** 主键 */
    id?: string;
    /** 用户ID */
    userId?: string;
    /** 用户名 */
    userName?: string;
    /** 请求方式 */
    requestMethod?: string;
    /** 操作IP */
    operationIp?: string;
    /** 操作结果 */
    operationResult?: string;
    /** 操作模块 */
    module?: string;
    /** 操作时间 */
    createTime?: string;
  }
}

/**
 * 获取操作日志列表
 * @param params 查询参数
 */
async function getOperationLogList(
  params?: SystemOperationLogApi.SysOperationLogQueryRequest,
) {
  return requestClient.get<
    PageResult<SystemOperationLogApi.SysOperationLogListVo[]>
  >('/system/log/operation/list', { params });
}

/**
 * 获取操作日志详情
 * @param id 主键
 */
async function getOperationById(id: string) {
  return requestClient.get<SystemOperationLogApi.SysOperationLog>(
    `/system/log/operation/${id}`,
  );
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
