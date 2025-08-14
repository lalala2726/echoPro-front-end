import type { BaseRequest } from '@vben/types';

/**
 * 字典数据查询请求参数
 */
export interface DictDataQueryRequest extends BaseRequest {
  /** 主键ID */
  id?: string;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典值 */
  dictValue?: string;
  /** 颜色 */
  color?: string;
  /** 状态：1启用，0禁用 */
  status?: number;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/**
 * 字典数据视图对象
 */
export interface DictDataVo {
  /** 主键ID */
  id?: string;
  /** 字典类型 */
  dictType?: string;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典值 */
  dictValue?: string;
  /** 颜色 */
  color?: string;
  /** 排序 */
  sort?: number;
  /** 状态：1启用，0禁用 */
  status?: number;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建人 */
  createBy?: string;
  /** 更新人 */
  updateBy?: string;
}

/**
 * 字典数据新增请求参数
 */
export interface DictDataAddRequest {
  /** 字典类型 */
  dictType: string;
  /** 字典标签 */
  dictLabel: string;
  /** 字典值 */
  dictValue: string;
  /** 颜色 */
  color?: string;
  /** 排序 */
  sort?: number;
  /** 状态：1启用，0禁用 */
  status: number;
  /** 备注 */
  remark?: string;
}

/**
 * 字典数据更新请求参数
 */
export interface DictDataUpdateRequest {
  /** 主键ID */
  id: string;
  /** 字典类型 */
  dictType?: string;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典值 */
  dictValue?: string;
  /** 颜色 */
  color?: string;
  /** 排序 */
  sort?: number;
  /** 状态：1启用，0禁用 */
  status?: number;
  /** 备注 */
  remark?: string;
}
