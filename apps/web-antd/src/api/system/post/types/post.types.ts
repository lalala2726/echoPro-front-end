import type { BaseType } from '@vben/types';

/**
 * 岗位查询请求参数
 */
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
  stratTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/**
 * 岗位列表视图对象
 */
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

/**
 * 岗位更新请求参数
 */
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

/**
 * 系统岗位新增请求参数
 */
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

/**
 * 岗位视图对象
 */
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
