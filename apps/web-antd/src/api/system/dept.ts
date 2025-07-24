import type { PageResult } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    deptId: string;
    deptName: string;
    parentId: string;
    status: string;
    createTime: string;
    manager?: string;
    description?: string;
  }

  export interface DeptOption {
    value: string;
    label: string;
    children?: DeptOption[];
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptList(params?: any) {
  return requestClient.get<PageResult<SystemDeptApi.SystemDept>>(
    '/system/dept/list',
    { params },
  );
}

/**
 * 获取部门选项数据（树形结构）
 */
async function getDeptOptions() {
  return requestClient.get<Array<SystemDeptApi.DeptOption>>(
    '/system/dept/options',
  );
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function addDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post('/system/dept', data);
}

/**
 * 更新部门
 *
 * @param data 部门数据
 */
async function updateDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(`/system/dept`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: string) {
  return requestClient.delete(`/system/dept/${id}`);
}

export { addDept, deleteDept, getDeptList, getDeptOptions, updateDept };
