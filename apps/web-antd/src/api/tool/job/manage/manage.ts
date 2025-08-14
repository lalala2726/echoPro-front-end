import type { PageResult, Recordable } from '@vben/types';

import type {
  SysJobAddRequest,
  SysJobBatchRequest,
  SysJobListVo,
  SysJobQueryRequest,
  SysJobUpdateRequest,
  SysJobVo,
} from '#/api/tool/job/manage/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

async function jobList(params?: SysJobQueryRequest) {
  return requestClient.get<PageResult<SysJobListVo[]>>('/tool/job/list', {
    params,
  });
}

async function getJobInfo(jobId: number) {
  return requestClient.get<SysJobVo>(`/tool/job/${jobId}`);
}

async function addJob(data: SysJobAddRequest) {
  return requestClient.post<number>('/tool/job', data);
}

async function updateJob(data: SysJobUpdateRequest) {
  return requestClient.put<boolean>('/tool/job', data);
}

async function deleteJob(ids: Array<number>) {
  return requestClient.delete<boolean>(`/tool/job/${ids.join(',')}`);
}

async function startJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/start/${id}`);
}

async function pauseJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/pause/${id}`);
}

async function resumeJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/resume/${id}`);
}

async function runJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/run/${id}`);
}

async function batchOperateJob(data: SysJobBatchRequest) {
  return requestClient.post<boolean>(`/tool/job/batch`, { data });
}

async function refreshJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/refresh/${id}`);
}

async function exportJobList(params?: Recordable<any>) {
  return exportFile('/tool/job/export', { params });
}

export {
  addJob,
  batchOperateJob,
  deleteJob,
  exportJobList,
  getJobInfo,
  jobList,
  pauseJob,
  refreshJob,
  resumeJob,
  runJob,
  startJob,
  updateJob,
};
