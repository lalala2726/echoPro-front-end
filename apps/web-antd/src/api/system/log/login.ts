import type { PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemLoginLogApi {
  export interface SysLoginLog {
    /** 主键 */
    id?: number;
    /** 用户名 */
    username?: string;
    /** 账号状态 */
    status?: number;
    /** IP地址 */
    ip?: string;
    /** 地区 */
    region?: string;
    /** 浏览器 */
    browser?: string;
    /** 操作系统 */
    os?: string;
    /** 登录时间 */
    loginTime?: string;
    /** 创建者 */
    createBy?: string;
  }

  export interface SysLoginLogListVo {
    /** 主键 */
    id?: number;
    /** 用户名 */
    username?: string;
    /** 账号状态 */
    status?: number;
    /** 登录IP */
    ip?: string;
    /** 地址 */
    region?: string;
    /** 浏览器 */
    browser?: string;
    /** 操作系统 */
    os?: string;
    /** 创建时间 */
    loginTime?: string;
    /** 创建者 */
    createBy?: string;
  }

  export interface SysLoginLogQueryRequest {
    /** 主键 */
    id?: number;
    /** 用户名 */
    username?: string;
    /** 账号状态 */
    status?: number;
    /** ip地址 */
    address?: string;
    /** 地区 */
    region?: string;
    /** 浏览器 */
    browser?: string;
    /** 操作系统 */
    os?: string;
    /** 创建时间 */
    loginTime?: string;
  }
}

/**
 * 获取登录日志列表
 * @param params 查询参数
 */
async function getLoginLogList(
  params?: SystemLoginLogApi.SysLoginLogQueryRequest,
) {
  return requestClient.get<PageResult<SystemLoginLogApi.SysLoginLogListVo[]>>(
    '/system/log/login/list',
    { params },
  );
}

/**
 * 获取登录日志详情
 * @param id 主键
 */
async function getLoginLogById(id: number) {
  return requestClient.get<SystemLoginLogApi.SysLoginLog>(
    `/system/log/login/${id}`,
  );
}

/**
 * 删除登录日志
 * @param ids 主键数组
 */
async function deleteLoginLog(ids: Array<number>) {
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
 * @param fileName 文件名
 * @param params 查询参数
 */
async function exportLoginList(fileName?: string, params?: Recordable<any>) {
  return exportFile('/system/log/login/export', {
    fileName: fileName || '登录日志列表',
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
