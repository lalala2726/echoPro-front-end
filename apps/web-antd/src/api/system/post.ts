import type { BaseType, Option, PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemPostApi {
  export interface SysPost extends BaseType {
    /** 岗位ID */
    id?: number;
    /** 岗位编码 */
    postCode?: string;
    /** 岗位名称 */
    postName?: string;
    /** 排序 */
    sort?: number;
    /** 状态(0-正常,1-停用) */
    status?: number;
  }
}

/**
 * 获取岗位列表
 */
async function getPostList(params?: any) {
  return requestClient.get<PageResult<SystemPostApi.SysPost[]>>(
    '/system/post/list',
    { params },
  );
}

/**
 * 获取岗位详情
 */
async function getPostById(id: number) {
  return requestClient.get<SystemPostApi.SysPost>(`/system/post/${id}`);
}

async function getOptions() {
  return requestClient.get<Array<Option<number>>>('/system/post/options');
}

/**
 * 新增岗位
 */
async function addPost(data: SystemPostApi.SysPost) {
  return requestClient.post('/system/post', data);
}

/**
 * 修改岗位
 */
async function updatePost(data: SystemPostApi.SysPost) {
  return requestClient.put('/system/post', data);
}

/**
 * 删除岗位
 * @param ids 岗位ID列表
 */
async function deletePost(ids: Array<number>) {
  return requestClient.delete(`/system/post/${ids.join(',')}`);
}

/**
 * 导出岗位列表
 * @param params 查询参数（可选）
 */
async function exportPostList(params?: Recordable<any>) {
  return exportFile('/system/post/export', {
    params,
  });
}

export {
  addPost,
  deletePost,
  exportPostList,
  getOptions,
  getPostById,
  getPostList,
  updatePost,
};
