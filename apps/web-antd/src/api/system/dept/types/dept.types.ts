/**
 * 系统部门信息
 */
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

/**
 * 部门选项
 */
export interface DeptOption {
  value: string;
  label: string;
  children?: DeptOption[];
}
