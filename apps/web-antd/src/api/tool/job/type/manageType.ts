import type { BaseRequest } from '@vben/types';

export namespace JobManageType {
  export interface SysJobListVo {
    /** 任务ID */
    jobId?: number;
    /** 任务名称 */
    jobName?: string;
    /** 任务组ID */
    jobGroup?: string;
    /** 调用目标字符串 */
    invokeTarget?: string;
    /** 调度策略 */
    scheduleType?: number;
    /** 调度策略描述 */
    status?: number;
    /** 任务状态描述 */
    statusDesc?: string;
    /** 任务描述 */
    description?: string;
    /** 任务参数 */
    nextFireTime?: string;
    /** 上次执行时间 */
    previousFireTime?: string;
  }

  export interface SysJobQueryRequest extends BaseRequest {
    /** 任务名称 */
    jobName?: string;
    /** 任务组名 */
    jobGroup?: string;
    /** 任务状态 */
    status?: number;
    /** 调用目标字符串 */
    invokeTarget?: string;
    /** 调度策略 */
    scheduleType?: number;
  }

  /**
   * 定时任务视图对象
   *
   * @author Chuang
   */
  export interface SysJobVo {
    /** 任务ID */
    jobId?: number;
    /** 任务名称 */
    jobName?: string;
    /** 任务组ID */
    jobGroupId?: number;
    /** 任务组名 */
    jobGroup?: string;
    /** 调用目标字符串 */
    invokeTarget?: string;
    /** 调度策略（0=Cron表达式 1=固定频率 2=固定延迟 3=一次性执行） */
    scheduleType?: number;
    /** 调度策略描述 */
    scheduleTypeDesc?: string;
    /** cron执行表达式 */
    cronExpression?: string;
    /** 固定频率间隔（毫秒） */
    fixedRate?: number;
    /** 固定延迟间隔（毫秒） */
    fixedDelay?: number;
    /** 初始延迟时间（毫秒） */
    initialDelay?: number;
    /** 计划执行错误策略（0=默认 1=立即执行 2=执行一次 3=放弃执行） */
    misfirePolicy?: number;
    /** 失火策略描述 */
    misfirePolicyDesc?: string;
    /** 是否并发执行（0允许 1禁止） */
    concurrent?: number;
    /** 任务状态（0正常 1暂停） */
    status?: number;
    /** 任务状态描述 */
    statusDesc?: string;
    /** 任务优先级 */
    priority?: number;
    /** 任务描述 */
    description?: string;
    /** 任务参数 */
    jobData?: string;
    /** 依赖任务ID（多个用逗号分隔） */
    dependentJobIds?: string;
    /** 最大重试次数 */
    maxRetryCount?: number;
    /** 重试间隔（毫秒） */
    retryInterval?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 下次执行时间 */
    nextFireTime?: string;
    /** 上次执行时间 */
    previousFireTime?: string;
  }

  export interface SysJobAddRequest {
    /** 任务名称 */
    jobName: string;
    /** 任务组ID */
    jobGroupId?: number;
    /** 任务组名 */
    jobGroup?: string;
    /** 调用目标字符串 */
    invokeTarget: string;
    /** 调度策略（0=Cron表达式 1=固定频率 2=固定延迟 3=一次性执行） */
    scheduleType: number;
    /** cron执行表达式 */
    cronExpression?: string;
    /** 固定频率间隔（毫秒） */
    fixedRate?: number;
    /** 固定延迟间隔（毫秒） */
    fixedDelay?: number;
    /** 初始延迟时间（毫秒） */
    initialDelay?: number;
    /** 计划执行错误策略（0=默认 1=立即执行 2=执行一次 3=放弃执行） */
    misfirePolicy?: number;
    /** 是否并发执行（0允许 1禁止） */
    concurrent?: number;
    /** 任务状态（0正常 1暂停） */
    status?: number;
    /** 任务优先级 */
    priority?: number;
    /** 任务描述 */
    description?: string;
    /** 任务参数 */
    jobData?: string;
    /** 依赖任务ID（多个用逗号分隔） */
    dependentJobIds?: string;
    /** 最大重试次数 */
    maxRetryCount?: number;
    /** 重试间隔（毫秒） */
    retryInterval?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 备注 */
    remark?: string;
  }

  /**
   * 定时任务更新请求
   *
   * @author Chuang
   */
  export interface SysJobUpdateRequest {
    /** 任务ID */
    jobId: number;
    /** 任务名称 */
    jobName: string;
    /** 任务组ID */
    jobGroupId?: number;
    /** 任务组名 */
    jobGroup?: string;
    /** 调用目标字符串 */
    invokeTarget: string;
    /** 调度策略（0=Cron表达式 1=固定频率 2=固定延迟 3=一次性执行） */
    scheduleType: number;
    /** cron执行表达式 */
    cronExpression?: string;
    /** 固定频率间隔（毫秒） */
    fixedRate?: number;
    /** 固定延迟间隔（毫秒） */
    fixedDelay?: number;
    /** 初始延迟时间（毫秒） */
    initialDelay?: number;
    /** 计划执行错误策略（0=默认 1=立即执行 2=执行一次 3=放弃执行） */
    misfirePolicy?: number;
    /** 是否并发执行（0允许 1禁止） */
    concurrent?: number;
    /** 任务状态（0正常 1暂停） */
    status?: number;
    /** 任务优先级 */
    priority?: number;
    /** 任务描述 */
    description?: string;
    /** 任务参数 */
    jobData?: string;
    /** 依赖任务ID（多个用逗号分隔） */
    dependentJobIds?: string;
    /** 最大重试次数 */
    maxRetryCount?: number;
    /** 重试间隔（毫秒） */
    retryInterval?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 备注 */
    remark?: string;
  }

  export interface SysJobBatchRequest {
    /** 任务ID列表 */
    jobIds: number[];
    /** 操作类型（start=启动, pause=暂停, resume=恢复, delete=删除） */
    operation?: string;
  }
}
