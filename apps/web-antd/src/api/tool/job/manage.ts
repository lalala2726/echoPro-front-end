import type { PageResult, Recordable } from '@vben/types';

import type { JobManageType } from '#/api/tool/job/type/manageType';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取任务列表
 * @param params 查询参数
 */
async function jobList(params?: JobManageType.SysJobQueryRequest) {
  return requestClient.get<PageResult<JobManageType.SysJobListVo[]>>(
    '/tool/job/list',
    { params },
  );
}

/**
 * 获取任务详情
 * @param jobId 任务ID
 */
async function getJobInfo(jobId: number) {
  return requestClient.get<JobManageType.SysJobVo>(`/tool/job/${jobId}`);
}

/**
 * 新增任务
 * @param data 任务信息
 */
async function addJob(data: JobManageType.SysJobAddRequest) {
  return requestClient.post<number>('/tool/job', data);
}

/**
 * 修改任务
 * @param data 岗位信息
 */
async function updateJob(data: JobManageType.SysJobUpdateRequest) {
  return requestClient.put<boolean>('/tool/job', data);
}

/**
 * 删除任务
 * @param ids 任务ID
 */
async function deleteJob(ids: Array<number>) {
  return requestClient.delete<boolean>(`/tool/job/${ids.join(',')}`);
}

/**
 * 启动任务
 * @param id 任务ID
 */
async function startJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/start/${id}`);
}

/**
 * 暂停任务
 * @param id 任务ID
 */
async function pauseJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/pause/${id}`);
}

/**
 * 恢复任务
 * @param id 任务ID
 */
async function resumeJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/resume/${id}`);
}

/**
 * 立即执行任务
 * @param id 任务ID
 */
async function runJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/run/${id}`);
}

/**
 * 批量操作任务
 * @param data 批量操作任务参数
 */
async function batchOperateJob(data: JobManageType.SysJobBatchRequest) {
  return requestClient.post<boolean>(`/tool/job/batch`, {
    data,
  });
}

/**
 * 刷新任务
 * @param id 任务ID
 */
async function refreshJob(id: number) {
  return requestClient.post<boolean>(`/tool/job/refresh/${id}`);
}

/**
 * 导出任务列表
 * @param params 导出参数
 */
async function exportJobList(params?: Recordable<any>) {
  return exportFile('/tool/job/export', {
    params,
  });
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
