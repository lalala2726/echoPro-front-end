import type { BaseType, PageResult, Recordable } from '@vben/types';

import type { SystemDeptApi } from '#/api/system/dept';

import { exportFile } from '#/api/download';
import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  /**
   * 用户实体
   */
  export interface SysUser extends BaseType {
    /** 用户ID */
    userId: number;
    /** 用户名 */
    username: string;
    /** 部门ID */
    deptId: number;
    /** 密码 */
    password: string;
    /** 昵称 */
    nickname: string;
    /** 头像 */
    avatar: string;
    /** 性别 */
    gender: number;
    /** 手机号 */
    phone: string;
    /** 邮箱 */
    email: string;
    /** 状态 */
    status: number;
    /** 部门名称（可能从API返回） */
    deptName?: string;
    /** 部门对象 */
    sysDept?: SystemDeptApi.SystemDept;
    /** 角色ID数组 */
    roleIds?: string[];
    /** 角色名称字符串 */
    roleNames?: string;
    /** 角色对象数组 */
    sysRoles?: Array<number>;
  }
}

/**
 * 获取用户列表
 */
async function getUserList(params?: any) {
  return requestClient.get<PageResult<SystemUserApi.SysUser[]>>(
    '/system/user/list',
    { params },
  );
}

/**
 * 重置用户密码
 * @param data 用户数据
 */
async function resetUserPassword(data: { password: string; userId: number }) {
  return requestClient.put('/system/user/resetPassword', data);
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
async function getUserById(id: number) {
  return requestClient.get<SystemUserApi.SysUser>(`/system/user/${id}`);
}

/**
 * 添加用户
 * @param data 用户数据
 */
async function addUser(data: SystemUserApi.SysUser) {
  return requestClient.post('/system/user', data);
}

/**
 * 更新用户
 * @param data 用户数据
 */
async function updateUser(data: SystemUserApi.SysUser) {
  return requestClient.put('/system/user', data);
}

/**
 * 删除用户
 * @param ids 用户ID列表
 */
async function deleteUser(ids: Array<number>) {
  return requestClient.delete(`/system/user/${ids.join(',')}`);
}

/**
 * 导出角色列表
 * @param fileName 文件名（可选，不需要扩展名）
 * @param params 查询参数（可选）
 */
async function exportUserList(fileName?: string, params?: Recordable<any>) {
  return exportFile('/system/user/export', {
    fileName: fileName || '用户列表',
    params,
  });
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
