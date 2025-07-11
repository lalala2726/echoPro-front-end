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
