export namespace JobGroupType {
  export interface SysJobGroupListVo {
    /** 任务组ID */
    id?: number;
    /** 任务组名称 */
    groupName?: string;
    /** 任务组编码 */
    groupCode?: string;
    /** 任务组描述 */
    groupDescription?: string;
    /** 状态（0正常 1停用） */
    status?: number;
    /** 状态描述 */
    statusDesc?: string;
    /** 排序 */
    sort?: number;
    /** 任务数量 */
    jobCount?: number;
    /** 创建时间 */
    createTime?: string;
    /** 备注 */
    remark?: string;
  }

  export interface SysJobGroupQueryRequest {
    /** 任务组名称 */
    groupName?: string;
    /** 任务组编码 */
    groupCode?: string;
    /** 状态（0正常 1停用） */
    status?: number;
  }

  export interface SysJobGroupVo {
    /** 任务组ID */
    id?: number;
    /** 任务组名称 */
    groupName?: string;
    /** 任务组编码 */
    groupCode?: string;
    /** 任务组描述 */
    groupDescription?: string;
    /** 状态（0正常 1停用） */
    status?: number;
    /** 状态描述 */
    statusDesc?: string;
    /** 排序 */
    sort?: number;
    /** 任务数量 */
    jobCount?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 创建者 */
    createBy?: string;
    /** 更新者 */
    updateBy?: string;
    /** 备注 */
    remark?: string;
  }

  export interface SysJobGroupAddRequest {
    /** 任务组名称 */
    groupName: string;
    /** 任务组编码 */
    groupCode: string;
    /** 任务组描述 */
    groupDescription?: string;
    /** 状态（0正常 1停用） */
    status?: number;
    /** 排序 */
    sort?: number;
    /** 备注 */
    remark?: string;
  }

  /**
   * 定时任务组更新请求
   *
   * @author Chuang
   */
  export interface SysJobGroupUpdateRequest {
    /** 任务组ID */
    id: number;
    /** 任务组名称 */
    groupName: string;
    /** 任务组编码 */
    groupCode: string;
    /** 任务组描述 */
    groupDescription?: string;
    /** 状态（0正常 1停用） */
    status?: number;
    /** 排序 */
    sort?: number;
    /** 备注 */
    remark?: string;
  }
}
