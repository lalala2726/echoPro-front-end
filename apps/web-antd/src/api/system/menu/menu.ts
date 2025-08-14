import type { SysMenu, SystemMenuList } from './types';

import { requestClient } from '#/api/request';

/**
 * 获取菜单数据列表
 */
async function getMenuList() {
  return requestClient.get<Array<SystemMenuList>>('/system/menu/list');
}

/**
 *  获取菜单树形结构
 * @returns 菜单树形结构
 */
async function getMenuTree() {
  return requestClient.get<Array<any>>('/system/menu/tree');
}

/**
 * 菜单名称是否存在
 * @param name 菜单名称
 * @param id 菜单ID
 */
async function isMenuNameExists(name: string, id?: number) {
  return requestClient.get<boolean>('/system/menu/name-exists', {
    params: { id, name },
  });
}

async function getMenuById(id: string) {
  return requestClient.get<SysMenu>(`/system/menu/${id}`);
}

async function isMenuPathExists(path: string, id?: number) {
  return requestClient.get<boolean>('/system/menu/path-exists', {
    params: { id, path },
  });
}

/**
 * 创建菜单
 * @param data 菜单数据
 */
async function createMenu(data: SysMenu) {
  return requestClient.post('/system/menu', data);
}

/**
 * 更新菜单
 * @param data 菜单数据
 */
async function updateMenu(data: SysMenu) {
  return requestClient.put('/system/menu', data);
}

/**
 * 删除菜单
 * @param id 菜单 ID
 */
async function deleteMenu(id: string) {
  return requestClient.delete(`/system/menu/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenuById,
  getMenuList,
  getMenuTree,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};
