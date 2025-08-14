import type { Option, PageResult, Recordable } from '@vben/types';

import type {
  PostListVo,
  PostQueryRequest,
  PostUpdateRequest,
  PostVo,
  SysPostAddRequest,
} from '#/api/system/post/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取岗位列表
 */
async function getPostList(params?: PostQueryRequest) {
  return requestClient.get<PageResult<PostListVo[]>>('/system/post/list', {
    params,
  });
}

/**
 * 获取岗位详情
 */
async function getPostById(id: string) {
  return requestClient.get<PostVo>(`/system/post/${id}`);
}

/**
 * 获取岗位下拉选项
 */
async function getOptions() {
  return requestClient.get<Array<Option<string>>>('/system/post/options');
}

/**
 * 新增岗位
 */
async function addPost(data: SysPostAddRequest) {
  return requestClient.post('/system/post', data);
}

/**
 * 修改岗位
 */
async function updatePost(data: PostUpdateRequest) {
  return requestClient.put('/system/post', data);
}

/**
 * 删除岗位
 * @param ids 岗位ID列表
 */
async function deletePost(ids: Array<string>) {
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
