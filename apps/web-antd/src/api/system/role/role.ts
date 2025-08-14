import type { Option, PageResult, Recordable } from '@vben/types';

import type {
  RoleMenuTreeResponse,
  SystemRole,
  UpdateRolePermissionRequest,
} from '#/api/system/role/types';

import { exportFile } from '#/api/download';
import { requestClient } from '#/api/request';

/**
 * 获取角色列表
 */
async function getRoleList(params?: any) {
  return requestClient.get<PageResult<SystemRole[]>>('/system/role/list', {
    params,
  });
}

/**
 * 获取角色选项
 */
async function getRoleOption() {
  return requestClient.get<Option[]>('/system/role/options');
}

/**
 * 获取角色详情
 * @param roleId 角色ID
 */
async function getRoleById(roleId: string) {
  return requestClient.get<SystemRole>(`/system/role/${roleId}`);
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRole, 'createTime' | 'id'>) {
  return requestClient.post('/system/role', data);
}

/**
 * 获取角色权限
 * @param roleId 角色ID
 */
async function getPermissionByRoleId(roleId: string) {
  return requestClient.get<RoleMenuTreeResponse>(
    `/system/role/permission/${roleId}`,
  );
}

/**
 * 分配角色权限
 * @param data 分配权限数据
 */
async function updateRolePermission(data: UpdateRolePermissionRequest) {
  return requestClient.put(`/system/role/permission`, data);
}

/**
 * 更新角色
 * @param data 角色数据（只包含id和status）
 */
async function updateRole(data: Pick<SystemRole, 'id' | 'status'>) {
  return requestClient.put(`/system/role`, data);
}

/**
 * 导出角色列表
 * @param params 查询参数（可选）
 */
async function exportRoleList(params?: Recordable<any>) {
  return exportFile('/system/role/export', {
    params,
  });
}

/**
 * 删除角色
 * @param roleId 角色ID
 */
async function deleteRole(roleId: string) {
  return requestClient.delete(`/system/role/${roleId}`);
}

export {
  createRole,
  deleteRole,
  exportRoleList,
  getPermissionByRoleId,
  getRoleById,
  getRoleList,
  getRoleOption,
  updateRole,
  updateRolePermission,
};
