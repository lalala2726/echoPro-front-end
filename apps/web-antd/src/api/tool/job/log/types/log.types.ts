import type { BaseRequest, BaseType } from '@vben/types';

export interface SysJobLogListVo {
  /** 任务日志ID */
  jobLogId: number;
  /** 任务ID */
  jobId?: number;
  /** 任务名称 */
  jobName?: string;
  /** 任务组名 */
  jobGroup?: string;
  /** 调用目标字符串 */
  invokeTarget?: string;
  /** 执行状态（0正常 1失败） */
  status?: number;
  /** 上次执行时间 */
  previousFireTime?: string;
  /** 下次执行时间 */
  nextFireTime?: string;
}

export interface SysJobLogQueryRequest extends BaseRequest {
  /** 任务ID */
  jobId?: number;
  /** 任务名称 */
  jobName?: string;
  /** 任务组名 */
  jobGroup?: string;
  /** 执行状态（0正常 1失败） */
  status?: number;
  /** 开始时间-开始 */
  startTimeBegin?: string;
  /** 开始时间-结束 */
  startTimeEnd?: string;
}

export interface SysJobLogVo extends BaseType {
  /** 任务日志ID */
  jobLogId?: number;
  /** 任务ID */
  jobId?: number;
  /** 任务名称 */
  jobName?: string;
  /** 调用目标字符串 */
  invokeTarget?: string;
  /** 任务参数 */
  jobData?: string;
  /** 日志信息 */
  jobMessage?: string;
  /** 执行状态（0正常 1失败） */
  status?: number;
  /** 执行状态描述 */
  statusDesc?: string;
  /** 异常信息 */
  exceptionInfo?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 执行耗时（毫秒） */
  executeTime?: number;
  /** 服务器IP */
  serverIp?: string;
  /** 服务器名称 */
  serverName?: string;
  /** 重试次数 */
  retryCount?: number;
  /** 触发器类型 */
  triggerType?: string;
}
