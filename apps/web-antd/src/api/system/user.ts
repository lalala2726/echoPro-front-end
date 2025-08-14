import type { BaseType, PageResult, Recordable } from '@vben/types';

import type { SystemDeptApi } from '#/api/system/dept';

import { exportFile } from '#/api/download';
import { requestClient } from '#/api/request';

export namespace SysUserType {
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
    /** 岗位ID */
    postId?: number;
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

  /**
   * 用户查询参数,用户查询用户列表时筛选条件
   *
   * @author Chuang
   * <p>
   * created on 2025/1/11 03:59
   */
  export interface SysUserQueryRequest {
    /** 用户名 */
    username?: string;
    /** 部门ID */
    deptId?: number;
    /** 昵称 */
    nickname?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 性别 */
    gender?: number;
    /** 状态 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建人 */
    createBy?: string;
    /** 修改人 */
    updateBy?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  }

  export interface UserListVo {
    /** 用户ID */
    userId?: number;
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /** 性别 */
    gender?: number;
    /** 邮箱 */
    email?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 手机号 */
    phone?: string;
    /** 创建人 */
    createBy?: string;
    /** 更新人 */
    updateBy?: string;
    /** 状态 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 部门名称 */
    deptName?: string;
    /** 岗位名称 */
    postName?: string;
  }

  export interface SysUserAddRequest {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    /** 头像 */
    avatar?: string;
    /** 性别 */
    gender?: number;
    /** 部门ID */
    deptId?: number;
    /** 岗位ID */
    postId?: number;
    /** 角色ID */
    roleIds: number[];
    /** 手机号 */
    phone?: string;
    /** 昵称 */
    nickname?: string;
    /** 邮箱 */
    email?: string;
    /** 状态 */
    status?: number;
    /** 备注 */
    remark?: string;
  }

  export interface SysUserUpdateRequest {
    /** 用户ID */
    userId: number;
    /** 角色ID列表 */
    roleIds?: number[];
    /** 头像 */
    avatar?: string;
    /** 性别 0-未知 1-男 2-女 */
    gender?: number;
    /** 所属部门ID */
    deptId?: number;
    /** 岗位ID */
    postId?: number;
    /** 手机号码 */
    phone?: string;
    /** 登录密码 */
    password?: string;
    /** 用户昵称 */
    nickname?: string;
    /** 电子邮箱地址 */
    email?: string;
    /** 账号状态 0-禁用 1-启用 */
    status?: number;
    /** 用户备注信息 */
    remark?: string;
  }
}

/**
 * 获取用户列表
 */
async function getUserList(params?: SysUserType.UserListVo) {
  return requestClient.get<PageResult<SysUserType.UserListVo[]>>(
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
  return requestClient.get<SysUserType.SysUser>(`/system/user/${id}`);
}

/**
 * 添加用户
 * @param data 用户数据
 */
async function addUser(data: SysUserType.SysUserAddRequest) {
  return requestClient.post('/system/user', data);
}

/**
 * 更新用户
 * @param data 用户数据
 */
async function updateUser(data: SysUserType.SysUserUpdateRequest) {
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
