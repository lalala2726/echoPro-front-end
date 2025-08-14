import type { PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemNoticeType {
  export interface SysNoticeQueryRequest {
    /** 公告标题 */
    noticeTitle?: string;
    /** 公告类型（1通知 2公告） */
    noticeType?: string;
    /** 创建者 */
    createBy?: string;
  }

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
   *
   * @author Chuang
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
}

/**
 * 获取公告列表
 * @param params 查询参数
 */
async function noticeList(params?: SystemNoticeType.SysNoticeQueryRequest) {
  return requestClient.get<PageResult<SystemNoticeType.SysNoticeListVo[]>>(
    '/system/notice/list',
    { params },
  );
}

/**
 * 获取公告详情
 * @param id 公告ID
 */
async function noticeById(id: string) {
  return requestClient.get<SystemNoticeType.SysNoticeVo>(
    `/system/notice/${id}`,
  );
}

/**
 * 添加公告
 * @param data 公告数据
 */
async function addNotice(data: SystemNoticeType.SysNoticeVo) {
  return requestClient.post('/system/notice', data);
}

/**
 * 修改公告
 * @param data 公告数据
 */
async function updateNotice(data: SystemNoticeType.SysNoticeVo) {
  return requestClient.put('/system/notice', data);
}

/**
 * 删除公告
 * @param ids 公告ID
 */
async function deleteNotice(ids: Array<string>) {
  return requestClient.delete(`/system/notice/${ids.join(',')}`);
}

/**
 * 导出公告列表
 * @param params 查询参数
 */
async function exportNoticeList(params?: Recordable<any>) {
  return exportFile('/system/notice/export', params);
}

export {
  addNotice,
  deleteNotice,
  exportNoticeList,
  noticeById,
  noticeList,
  updateNotice,
};
