/**
 * 分页结果
 */
export interface PageResult<T = any> {
  /** 总数量 */
  total: number;
  /** 当前页码 */
  pageNum: number;
  /** 每页数量 */
  pageSize: number;
  /** 数据列表 */
  rows: T[];
}

/**
 * 选项
 */
export interface Option<T = any> {
  /** 标签 */
  label: string;
  /** 值 */
  value: T;
  /** 子选项 */
  children?: Option<T>[];
}

export interface BaseType {
  /** 创建时间 */
  createTime?: string;
  /** 修改时间 */
  updateTime?: Date;
  /** 创建人 */
  createUser?: string;
  /** 修改人 */
  updateUser?: string;
  /** 备注 */
  remark?: string;
}
