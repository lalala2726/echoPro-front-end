import type { BaseRequest, PageResult } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace profileType {
  export interface ProfileOverviewInfoVo {
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname?: string;
    /** 头像URL */
    avatar?: string;
    /** 性别 */
    gender?: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 地区 */
    region?: string;
    /** 个性签名 */
    signature?: string;
    /** 部门名称 */
    deptName?: string;
    /** 职位 */
    post?: string;
    /** 角色信息 */
    roles?: string[];
  }

  export interface ProfileUpdateRequest {
    /** 昵称 */
    nickName?: string;
    /** 头像 */
    avatar?: string;
    /** 性别 */
    gender?: string;
    /** 地区 */
    region?: string;
    /** 个性签名 */
    signature?: string;
  }

  export interface UserSecurityLog {
    /** 日志ID */
    id?: number;
    /** 日志标题 */
    title?: string;
    /** 操作类型 */
    operationType?: string;
    /** 操作区域 */
    operationRegion?: string;
    /** 操作IP */
    operationIp?: string;
    /** 操作时间 */
    operationTime?: string;
  }

  export interface UpdatePasswordRequest {
    /** 旧密码 */
    oldPassword: string;
    /** 新密码 */
    newPassword: string;
  }

  export interface SessionDevice {
    /** 用户ID */
    userId?: string;
    /** 用户名 */
    username?: string;
    /** 刷新令牌会话ID */
    refreshTokenId?: string;
    /** 设备类型 */
    deviceType?: string;
    /** 设备名称 */
    deviceName?: string;
    /** 登录时间 */
    loginTime?: string;
    /** 登录IP */
    ip?: string;
    /** 登录地点 */
    location?: string;
  }

  export interface UpdateEmailRequest {
    /** 新邮箱 */
    email: string;
    /** 验证码 */
    code?: string;
  }

  export interface UpdatePhoneRequest {
    /** 手机号 */
    phone: string;
    /** 验证码 */
    code?: string;
  }
}

/**
 * 获取用户概览信息
 */
async function overviewInfo() {
  return await requestClient.get<profileType.ProfileOverviewInfoVo>(
    '/personal/profile/overview',
  );
}

/**
 * 修改用户信息
 * @param params
 */
async function updateProfile(params: profileType.ProfileUpdateRequest) {
  return await requestClient.put('/personal/profile', params);
}

/**
 * 获取已登录的登录设备列表
 */
async function getDeviceList(params: BaseRequest) {
  return await requestClient.get<PageResult<profileType.SessionDevice>>(
    '/personal/profile/security/device',
    { params },
  );
}

/**
 * 删除登录设备
 * @param refreshTokenId
 */
async function deleteDevice(refreshTokenId: string) {
  return await requestClient.delete(
    `/personal/profile/security/device/${refreshTokenId}`,
  );
}

/**
 * 获取用户安全日志列表
 */
async function getSecurityLogList(params: BaseRequest) {
  return await requestClient.get<PageResult<profileType.UserSecurityLog>>(
    '/personal/profile/security/log',
    { params },
  );
}

/**
 * 退出所有登录
 */
async function logoutAll() {
  return await requestClient.delete('/personal/profile/security/logoutAll');
}

/**
 * 修改密码
 * @param params
 */
async function updatePassword(params: profileType.UpdatePasswordRequest) {
  return await requestClient.put('/personal/profile/security/password', {
    ...params,
  });
}

/**
 * 获取当前用户的邮箱
 */
async function getEmail() {
  return await requestClient.get('/personal/profile/email');
}

/**
 * 获取当前用户的手机号
 */
async function getPhone() {
  return await requestClient.get('/personal/profile/phone');
}

/**
 * 修改手机号
 * @param data
 */
async function updatePhone(data: profileType.UpdatePhoneRequest) {
  return await requestClient.put('/personal/profile/phone', data);
}

/**
 * 修改邮箱
 * @param data
 */
async function updateEmail(data: profileType.UpdateEmailRequest) {
  return await requestClient.put('/personal/profile/email', data);
}

export {
  deleteDevice,
  getDeviceList,
  getEmail,
  getPhone,
  getSecurityLogList,
  logoutAll,
  overviewInfo,
  updateEmail,
  updatePassword,
  updatePhone,
  updateProfile,
};
