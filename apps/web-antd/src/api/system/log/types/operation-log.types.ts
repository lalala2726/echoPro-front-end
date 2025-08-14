/**
 * 系统操作日志
 */
export interface SysOperationLog {
  /** 主键 */
  id?: string;
  /** 用户ID */
  userId?: string;
  /** 用户名 */
  userName?: string;
  /** 请求方式 */
  requestMethod?: string;
  /** 操作IP */
  operationIp?: string;
  /** 操作地点 */
  operationRegion?: string;
  /** 操作状态 (0成功1失败2未知) */
  operationStatus?: number;
  /** 操作结果 */
  responseResult?: string;
  /** 操作模块 */
  module?: string;
  /** 操作类型 */
  operationType?: string;
  /** 请求地址 */
  requestUrl?: string;
  /** 方法名称 */
  methodName?: string;
  /** 请求参数 */
  requestParams?: string;
  /** 错误信息 */
  errorMsg?: string;
  /** 耗时（毫秒） */
  costTime?: number;
  /** 操作时间 */
  createTime?: string;
}

/**
 * 系统操作日志列表视图对象
 */
export interface SysOperationLogListVo {
  /** 主键 */
  id?: string;
  /** 用户ID */
  userId?: string;
  /** 用户名 */
  userName?: string;
  /** 操作状态 (0成功1失败2未知) */
  operationStatus?: number;
  /** 请求方式 */
  requestMethod?: string;
  /** 操作IP */
  operationIp?: string;
  /** 操作地区 */
  operationRegion?: string;
  /** 操作结果 */
  operationResult?: string;
  /** 操作模块 */
  module?: string;
  /** 操作类型 */
  operationType?: string;
  /** 请求地址 */
  requestUrl?: string;
  /** 方法名称 */
  methodName?: string;
  /** 耗时（毫秒） */
  costTime?: number;
  /** 操作时间 */
  createTime?: string;
}

/**
 * 系统操作日志查询请求参数
 */
export interface SysOperationLogQueryRequest {
  /** 主键 */
  id?: string;
  /** 用户ID */
  userId?: string;
  /** 用户名 */
  userName?: string;
  /** 请求方式 */
  requestMethod?: string;
  /** 操作IP */
  operationIp?: string;
  /** 操作结果 */
  operationResult?: string;
  /** 操作模块 */
  module?: string;
  /** 操作时间 */
  createTime?: string;
}
