import type {
  BaseType,
  Option,
  PageResult,
  Recordable,
  TimeRange,
} from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemPostType {
  export interface PostQueryRequest {
    /** 岗位ID */
    id?: string;
    /** 岗位编码 */
    postCode?: string;
    /** 岗位名称 */
    postName?: string;
    /** 排序 */
    sort?: number;
    /** 状态(0-正常,1-停用) */
    status?: number;
    /** 创建时间 */
    createTime?: TimeRange;
  }

  export interface PostListVo {
    /** 岗位ID */
    id?: string;
    /** 岗位编码 */
    postCode?: string;
    /** 岗位名称 */
    postName?: string;
    /** 排序 */
    sort?: number;
    /** 状态(0-正常,1-停用) */
    status?: number;
    /** 创建时间 */
    createTime?: string;
  }

  export interface PostUpdateRequest {
    /** 岗位ID */
    id: string;
    /** 岗位编码 */
    postCode?: string;
    /** 岗位名称 */
    postName?: string;
    /** 排序 */
    sort?: number;
    /** 状态(0-正常,1-停用) */
    status?: number;
  }

  export interface SysPostAddRequest {
    /** 岗位编码 */
    postCode?: string;
    /** 岗位名称 */
    postName: string;
    /** 排序 */
    sort?: number;
    /** 状态(0-正常,1-停用) */
    status?: number;
  }

  export interface PostVo extends BaseType {
    /** 岗位ID */
    id?: string;
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
async function getPostList(params?: SystemPostType.PostQueryRequest) {
  return requestClient.get<PageResult<SystemPostType.PostListVo[]>>(
    '/system/post/list',
    { params },
  );
}

/**
 * 获取岗位详情
 */
async function getPostById(id: string) {
  return requestClient.get<SystemPostType.PostVo>(`/system/post/${id}`);
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
async function addPost(data: SystemPostType.SysPostAddRequest) {
  return requestClient.post('/system/post', data);
}

/**
 * 修改岗位
 */
async function updatePost(data: SystemPostType.PostUpdateRequest) {
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
