import type { BaseType, Option, PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api/download';
import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole extends BaseType {
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
  }

  /**
   * 菜单树节点
   */
  export interface MenuTreeNode {
    /** 菜单ID */
    id: string;
    /** 菜单名称 */
    title: string;
    /** 父级菜单ID */
    parentId: string;
    /** 图标 */
    icon?: string;
    /** 菜单类型：catalog目录，menu菜单，button按钮，link链接 */
    type: 'button' | 'catalog' | 'link' | 'menu';
    /** 状态：0禁用，1启用 */
    status?: 0 | 1;
    /** 子菜单列表 */
    children?: MenuTreeNode[];
  }

  /**
   * 角色菜单树接口返回数据
   */
  export interface RoleMenuTreeResponse {
    /** 角色ID */
    roleId: string;
    /** 角色名称 */
    roleName: string;
    /** 角色唯一标识（权限Key） */
    roleKey: string;
    /** 权限菜单树 */
    sysMenuTree: MenuTreeNode[];
    /** 已选中的菜单ID */
    selectedMenuId: string[];
  }

  export interface updateRolePermissionRequest {
    /** 角色ID */
    roleId: string;
    /** 分配的菜单ID */
    allocatedMenuId: Array<string>;
  }
}

/**
 * 获取角色列表
 */
async function getRoleList() {
  return requestClient.get<PageResult<SystemRoleApi.SystemRole[]>>(
    '/system/role/list',
  );
}

/**
 * 获取角色选项
 */
async function getRoleOption() {
  return requestClient.get<Option[]>('/system/role/options');
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
 * 获取角色权限
 * @param roleId 角色ID
 */
async function getPermissionByRoleId(roleId: string) {
  return requestClient.get<SystemRoleApi.RoleMenuTreeResponse>(
    `/system/role/permission/${roleId}`,
  );
}

/**
 * 分配角色权限
 * @param data 分配权限数据
 */
async function updateRolePermission(
  data: SystemRoleApi.updateRolePermissionRequest,
) {
  return requestClient.put(`/system/role/permission`, data);
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
 * 导出角色列表
 * @param fileName 文件名（可选，不需要扩展名）
 * @param params 查询参数（可选）
 */
async function exportRoleList(fileName?: string, params?: Recordable<any>) {
  return exportFile('/system/role/export', {
    fileName: fileName || '角色列表',
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
  getRoleList,
  getRoleOption,
  updateRole,
  updateRolePermission,
};
