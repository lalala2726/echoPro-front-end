import type { BaseType } from '@vben/types';

/**
 * 用户实体
 */
export interface SysUser extends BaseType {
  /** 用户ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 部门ID */
  deptId: string;
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
  postId?: string;
  /** 部门名称（可能从API返回） */
  deptName?: string;
  /** 部门对象 */
  sysDept?: any;
  /** 角色ID数组 */
  roleIds?: string[];
  /** 角色名称字符串 */
  roleNames?: string;
  /** 角色对象数组 */
  sysRoles?: Array<number>;
}

/**
 * 用户查询参数,用户查询用户列表时筛选条件
 */
export interface SysUserQueryRequest {
  /** 用户名 */
  username?: string;
  /** 部门ID */
  deptId?: string;
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
  userId?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 头像 */
  avatar?: string;
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
  postId?: string;
  /** 角色ID */
  roleIds: string[];
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
  roleIds?: string[];
  /** 头像 */
  avatar?: string;
  /** 性别 0-未知 1-男 2-女 */
  gender?: number;
  /** 所属部门ID */
  deptId?: number;
  /** 岗位ID */
  postId?: string;
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
