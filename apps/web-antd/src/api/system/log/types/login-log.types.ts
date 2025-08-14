/**
 * 系统登录日志
 */
export interface SysLoginLog {
  /** 主键 */
  id?: string;
  /** 用户名 */
  username?: string;
  /** 账号状态 */
  status?: number;
  /** IP地址 */
  ip?: string;
  /** 地区 */
  region?: string;
  /** 浏览器 */
  browser?: string;
  /** 操作系统 */
  os?: string;
  /** 登录时间 */
  loginTime?: string;
  /** 创建者 */
  createBy?: string;
}

/**
 * 系统登录日志列表视图对象
 */
export interface SysLoginLogListVo {
  /** 主键 */
  id?: string;
  /** 用户名 */
  username?: string;
  /** 账号状态 */
  status?: number;
  /** 登录IP */
  ip?: string;
  /** 地址 */
  region?: string;
  /** 浏览器 */
  browser?: string;
  /** 操作系统 */
  os?: string;
  /** 创建时间 */
  loginTime?: string;
  /** 创建者 */
  createBy?: string;
}

/**
 * 系统登录日志查询请求参数
 */
export interface SysLoginLogQueryRequest {
  /** 主键 */
  id?: string;
  /** 用户名 */
  username?: string;
  /** 账号状态 */
  status?: number;
  /** ip地址 */
  address?: string;
  /** 地区 */
  region?: string;
  /** 浏览器 */
  browser?: string;
  /** 操作系统 */
  os?: string;
  /** 创建时间 */
  loginTime?: string;
}
