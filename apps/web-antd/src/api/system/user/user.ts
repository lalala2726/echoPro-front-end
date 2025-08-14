import type { PageResult, Recordable } from '@vben/types';

import type {
  SysUser,
  SysUserAddRequest,
  SysUserQueryRequest,
  SysUserUpdateRequest,
  UserListVo,
} from '#/api/system/user/types';

import { exportFile } from '#/api/download';
import { requestClient } from '#/api/request';

/**
 * 获取用户列表
 */
async function getUserList(params?: SysUserQueryRequest) {
  return requestClient.get<PageResult<UserListVo[]>>('/system/user/list', {
    params,
  });
}

/**
 * 重置用户密码
 * @param data 用户数据
 */
async function resetUserPassword(data: { password: string; userId: string }) {
  return requestClient.put('/system/user/resetPassword', data);
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
async function getUserById(id: string) {
  return requestClient.get<SysUser>(`/system/user/${id}`);
}

/**
 * 添加用户
 * @param data 用户数据
 */
async function addUser(data: SysUserAddRequest) {
  return requestClient.post('/system/user', data);
}

/**
 * 更新用户
 * @param data 用户数据
 */
async function updateUser(data: SysUserUpdateRequest) {
  return requestClient.put('/system/user', data);
}

/**
 * 删除用户
 * @param ids 用户ID列表
 */
async function deleteUser(ids: Array<string>) {
  return requestClient.delete(`/system/user/${ids.join(',')}`);
}

/**
 * 导出角色列表
 * @param params 查询参数（可选）
 */
async function exportUserList(params?: Recordable<any>) {
  return exportFile('/system/user/export', params);
}

export {
  addUser,
  deleteUser,
  exportUserList,
  getUserById,
  getUserList,
  resetUserPassword,
  updateUser,
};
