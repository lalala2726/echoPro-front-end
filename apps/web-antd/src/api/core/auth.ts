import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    /** 密码 */
    password: string;
    /** 用户名 */
    username: string;
    /** 验证码唯一标识 */
    uuid?: string;
    /** 验证码 */
    code?: string;
    /** 设备类型 */
    deviceType?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(refreshToken: any) {
  return baseRequestClient.post<any>('/auth/refresh', {
    refreshToken,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.delete('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getPermissionCode() {
  return requestClient.get<string[]>('/auth/permission');
}
