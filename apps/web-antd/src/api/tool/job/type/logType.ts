import type { BaseRequest, BaseType } from '@vben/types';

export namespace JobLogType {
  export interface SysJobLogListVo {
    /** 任务ID */
    jobId?: number;
    /** 任务名称 */
    jobName?: string;
    /** 任务组名 */
    jobGroup?: string;
    /** 调用目标字符串 */
    invokeTarget?: string;
    /** 调度类型（0=Cron表达式 1=固定频率 2=固定延迟 3=一次性执行） */
    scheduleType?: number;
    /** 调度类型描述 */
    scheduleTypeDesc?: string;
    /** 任务状态（0=正常 1=暂停） */
    status?: number;
    /** 任务状态描述 */
    statusDesc?: string;
    /** 任务描述 */
    description?: string;
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
    /** 任务组名 */
    jobGroup?: string;
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
}
