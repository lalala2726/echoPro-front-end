import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 分页结果接口
 */
interface PageResult<T = any> {
  total: number;
  pageNum: number;
  pageSize: number;
  rows: T[];
}

export namespace SystemRoleApi {
  export interface SystemRole {
    /** 角色ID */
    id: string;
    /** 角色名称 */
    roleName: string;
    /** 角色标识 */
    roleKey: string;
    /** 备注 */
    remark?: string;
    /** 状态：0禁用，1启用 */
    status?: 0 | 1;
    /** 排序 */
    sort?: number;
    /** 创建时间 */
    createTime?: string;
  }
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<PageResult>('/system/role/list', { params });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(
  data: Omit<SystemRoleApi.SystemRole, 'createTime' | 'id'>,
) {
  return requestClient.post('/system/role', data);
}

/**
 * 更新角色
 * @param data 角色数据（只包含id和status）
 */
async function updateRole(
  data: Pick<SystemRoleApi.SystemRole, 'id' | 'status'>,
) {
  return requestClient.put(`/system/role`, data);
}

/**
 * 删除角色
 * @param roleId 角色ID
 */
async function deleteRole(roleId: string) {
  return requestClient.delete(`/system/role/${roleId}`);
}

export { createRole, deleteRole, getRoleList, updateRole };
