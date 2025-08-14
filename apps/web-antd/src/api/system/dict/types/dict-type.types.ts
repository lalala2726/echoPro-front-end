/**
 * 字典类型查询请求参数
 */
export interface DictTypeQueryRequest {
  /** 主键ID */
  id?: string;
  /** 字典类型 */
  dictType?: string;
  /** 字典名称 */
  dictName?: string;
  /** 状态：0启用，1禁用 */
  status?: number;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/**
 * 字典类型视图对象
 */
export interface DictTypeVo {
  /** 主键ID */
  id?: string;
  /** 字典类型 */
  dictType?: string;
  /** 字典名称 */
  dictName?: string;
  /** 状态：0启用，1禁用 */
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
 * 字典类型新增请求参数
 */
export interface DictTypeAddRequest {
  /** 字典类型 */
  dictType: string;
  /** 字典名称 */
  dictName: string;
  /** 状态：0启用，1禁用 */
  status: number;
  /** 备注 */
  remark?: string;
}

/**
 * 字典类型更新请求参数
 */
export interface DictTypeUpdateRequest {
  /** 主键ID */
  id: string;
  /** 字典类型 */
  dictType: string;
  /** 字典名称 */
  dictName: string;
  /** 状态：0启用，1禁用 */
  status: number;
  /** 备注 */
  remark?: string;
}
