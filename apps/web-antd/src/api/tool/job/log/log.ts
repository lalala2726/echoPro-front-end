import type { PageResult, Recordable } from '@vben/types';

import type {
  SysJobLogListVo,
  SysJobLogQueryRequest,
  SysJobLogVo,
} from '#/api/tool/job/log/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

async function logList(params?: SysJobLogQueryRequest[]) {
  return requestClient.get<PageResult<SysJobLogListVo[]>>(
    '/tool/job/log/list',
    { params },
  );
}

async function getJobLogInfo(jobLogId: number) {
  return requestClient.get<SysJobLogVo>(`/tool/job/log/${jobLogId}`);
}

async function deleteJobLog(ids: Array<number>) {
  return requestClient.delete<boolean>(`/tool/job/log/delete/${ids.join(',')}`);
}

async function cleanJobLog(beforeDate: Date) {
  return requestClient.delete<boolean>(`/tool/job/log/clean`, {
    params: { beforeDate },
  });
}

async function cleanAllJobLog() {
  return requestClient.delete<boolean>(`/tool/job/log/clean/all`);
}

async function exportJobLogList(params?: Recordable<any>) {
  return exportFile(`/tool/job/log/export`, { params });
}

export {
  cleanAllJobLog,
  cleanJobLog,
  deleteJobLog,
  exportJobLogList,
  getJobLogInfo,
  logList,
};
