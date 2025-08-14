/**
 * 系统通知查询请求参数
 */
export interface SysNoticeQueryRequest {
  /** 公告标题 */
  noticeTitle?: string;
  /** 公告类型（1通知 2公告） */
  noticeType?: string;
  /** 创建者 */
  createBy?: string;
}

/**
 * 系统通知列表视图对象
 */
export interface SysNoticeListVo {
  /** 公告ID */
  id?: string;
  /** 公告标题 */
  noticeTitle?: string;
  /** 公告类型（1通知 2公告） */
  noticeType?: string;
  /** 创建时间 */
  createTime?: string;
  /** 创建者 */
  createBy?: string;
  /** 备注 */
  remark?: string;
}

/**
 * 公告视图对象
 */
export interface SysNoticeVo {
  /** 公告ID */
  id?: string;
  /** 公告标题 */
  noticeTitle?: string;
  /** 公告内容 */
  noticeContent?: string;
  /** 公告类型（1通知 2公告） */
  noticeType?: string;
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
