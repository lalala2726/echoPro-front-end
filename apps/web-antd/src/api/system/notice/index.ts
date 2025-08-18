import type { PageResult, Recordable } from '@vben/types';

import type {
  SysNoticeListVo,
  SysNoticeQueryRequest,
  SysNoticeVo,
} from '#/api/system/notice/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取公告列表
 * @param params 查询参数
 */
async function noticeList(params?: SysNoticeQueryRequest) {
  return requestClient.get<PageResult<SysNoticeListVo[]>>(
    '/system/notice/list',
    { params },
  );
}

/**
 * 获取公告详情
 * @param id 公告ID
 */
async function noticeById(id: string) {
  return requestClient.get<SysNoticeVo>(`/system/notice/${id}`);
}

/**
 * 添加公告
 * @param data 公告数据
 */
async function addNotice(data: SysNoticeVo) {
  return requestClient.post('/system/notice', data);
}

/**
 * 修改公告
 * @param data 公告数据
 */
async function updateNotice(data: SysNoticeVo) {
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
  return exportFile('/system/notice/export', { params });
}

export {
  addNotice,
  deleteNotice,
  exportNoticeList,
  noticeById,
  noticeList,
  updateNotice,
};
