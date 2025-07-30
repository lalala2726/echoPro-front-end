import type { PageResult, Recordable } from '@vben/types';

import type { JobGroupType } from '#/api/tool/job/type/groupType';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取任务组列表
 * @param params 查询参数
 */
async function groupList(params?: JobGroupType.SysJobGroupQueryRequest) {
  return requestClient.get<PageResult<JobGroupType.SysJobGroupListVo[]>>(
    '/tool/job/group/list',
    { params },
  );
}

/**
 * 获取任务组信息
 * @param id 任务组ID
 */
async function getGroupInfoById(id: number) {
  return requestClient.get<JobGroupType.SysJobGroupVo>(`/tool/job/group/${id}`);
}

/**
 * 新增任务组
 * @param data 任务组信息
 */
async function addGroup(data: JobGroupType.SysJobGroupAddRequest) {
  return requestClient.post<JobGroupType.SysJobGroupAddRequest>(
    '/tool/job/group',
    { data },
  );
}

/**
 * 修改任务组
 * @param data 任务组信息
 */
async function updateGroup(data: JobGroupType.SysJobGroupUpdateRequest) {
  return requestClient.put<JobGroupType.SysJobGroupUpdateRequest>(
    '/tool/job/group',
    { data },
  );
}

/**
 * 删除任务组
 * @param ids 任务组ID
 */
async function deleteGroup(ids: Array<number>) {
  return requestClient.delete<Array<number>>(
    `/tool/job/group/${ids.join(',')}`,
  );
}

/**
 * 导出任务组列表
 * @param params 查询参数
 */
async function exportGroupList(params?: Recordable<any>) {
  return exportFile('/tool/job/group/export', { params });
}

export {
  addGroup,
  deleteGroup,
  exportGroupList,
  getGroupInfoById,
  groupList,
  updateGroup,
};
