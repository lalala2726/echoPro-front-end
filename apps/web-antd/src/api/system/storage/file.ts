import type { PageResult, Recordable } from '@vben/types';

import type {
  StorageFileListVo,
  StorageFileQueryRequest,
  StorageFileVo,
} from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取文件列表
 *
 * @author Chuang
 */
async function getStorageFileList(params?: StorageFileQueryRequest) {
  return await requestClient.get<PageResult<StorageFileListVo[]>>(
    '/system/storage/file/list',
    { params },
  );
}

/**
 * 获取文件详情
 *
 * @author Chuang
 */
async function getStorageFileById(id: string) {
  return await requestClient.get<StorageFileVo>(`/system/storage/file/${id}`);
}

/**
 * 删除文件
 *
 * @author Chuang
 */
async function deleteStorageFile(ids: Array<string>) {
  return await requestClient.delete(`/system/storage/file/${ids.join(',')}`);
}

/**
 * 获取文件回收站列表
 *
 * @author Chuang
 */
async function listFileTrash(params?: StorageFileQueryRequest) {
  return await requestClient.get<PageResult<StorageFileListVo[]>>(
    '/system/storage/file/trash/list',
    { params },
  );
}

/**
 * 删除文件回收站
 *
 * @author Chuang
 */
async function deleteTrashFile(ids: Array<string>) {
  return await requestClient.delete(
    `/system/storage/file/trash/${ids.join(',')}`,
  );
}

/**
 * 删除文件记录
 * @param ids
 */
async function deleteFileRecord(ids: Array<string>) {
  return await requestClient.delete(
    `/system/storage/file/record/${ids.join(',')}`,
  );
}

/**
 * 导出文件列表
 *
 * @author Chuang
 */
async function exportStorageFileList(
  fileName?: string,
  params?: Recordable<any>,
) {
  return exportFile('/system/storage/file/export', {
    fileName: fileName || '存储文件列表',
    params,
  });
}

export {
  deleteFileRecord,
  deleteStorageFile,
  deleteTrashFile,
  exportStorageFileList,
  getStorageFileById,
  getStorageFileList,
  listFileTrash,
};
