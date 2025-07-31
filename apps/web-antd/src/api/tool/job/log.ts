import type { PageResult, Recordable } from '@vben/types';

import type { JobLogType } from '#/api/tool/job/type/logType';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取任务日志列表
 * @param params 查询参数
 */
async function logList(params?: JobLogType.SysJobLogQueryRequest[]) {
  return requestClient.get<PageResult<JobLogType.SysJobLogListVo[]>>(
    '/tool/job/log/list',
    { params },
  );
}

/**
 * 获取任务日志详情
 * @param jobLogId 日志ID
 */
async function getJobLogInfo(jobLogId: number) {
  return requestClient.get<JobLogType.SysJobLogVo>(`/tool/job/log/${jobLogId}`);
}

/**
 * 删除任务日志
 * @param ids 日志ID
 */
async function deleteJobLog(ids: Array<number>) {
  return requestClient.delete<boolean>(`/tool/job/log/delete/${ids.join(',')}`);
}

/**
 * 清楚日期之前的任务日志
 * @param beforeDate  日期
 */
async function cleanJobLog(beforeDate: Date) {
  return requestClient.delete<boolean>(`/tool/job/log/clean`, {
    params: {
      beforeDate,
    },
  });
}

/**
 * 清除全部日志
 */
async function cleanAllJobLog() {
  return requestClient.delete<boolean>(`/tool/job/log/clean/all`);
}

/**
 * 导出任务日志
 * @param params 查询参数
 */
async function exportJobLogList(params?: Recordable<any>) {
  return exportFile(`/tool/job/log/export`, {
    params,
  });
}

export {
  cleanAllJobLog,
  cleanJobLog,
  deleteJobLog,
  exportJobLogList,
  getJobLogInfo,
  logList,
};
