import type { BaseType } from '@vben/types';

/**
 * 系统角色
 */
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

/**
 * 更新角色权限请求参数
 */
export interface UpdateRolePermissionRequest {
  /** 角色ID */
  roleId: string;
  /** 分配的菜单ID */
  allocatedMenuId: Array<string>;
}