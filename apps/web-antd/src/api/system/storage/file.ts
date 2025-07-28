import type { PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemStorageFileAPi {
  export interface StorageFileQueryRequest {
    /** 文件名 */
    originalName?: string;
    /** 文件类型，如 image/jpeg, application/pdf 等 */
    contentType?: string;
    /** 存储类型 (LOCAL/MINIO/ALIYUN_OSS) */
    storageType?: string;
    /** 存储桶名称（OSS/MINIO 使用） */
    bucketName?: string;
    /** 上传者名称 */
    uploaderName?: string;
    /** 上传时间 */
    uploadTime?: string;
  }

  export interface StorageFileListVo {
    /** 主键ID */
    id?: number;
    /** 文件名 */
    originalName?: string;
    /** 文件类型，如 image/jpeg, application/pdf 等 */
    contentType?: string;
    /** 压缩文件URL，用于图片预览等场景 */
    previewImageUrl?: string;
    /** 原始文件URL，直接访问地址 */
    originalFileUrl: string;
    /** 文件大小 */
    fileSize?: string;
    /** 文件扩展名 */
    fileExtension?: string;
    /** 存储类型 (LOCAL/MINIO/ALIYUN_OSS) */
    storageType?: string;
    /** 存储桶名称（OSS/MINIO 使用） */
    bucketName?: string;
    /** 上传者名称 */
    uploaderName?: string;
    /** 上传时间 */
    uploadTime?: string;
  }

  /**
   * 文件详情
   *
   * @author Chuang
   */
  export interface StorageFileVo {
    /** 主键ID */
    id?: number;
    /** 原始文件名 */
    originalName?: string;
    /** 当前文件名 */
    fileName?: string;
    /** 文件类型，如 image/jpeg, application/pdf 等 */
    contentType?: string;
    /** 文件大小，单位字节 */
    fileSize?: number;
    /** 原始文件URL，直接访问地址 */
    originalFileUrl: string;
    /** 原始文件相对路径，存储在服务器上的路径 */
    originalRelativePath?: string;
    /** 压缩文件URL，用于图片预览等场景 */
    previewImageUrl?: string;
    /** 压缩文件相对路径，存储在服务器上的路径 */
    previewRelativePath?: string;
    /** 文件扩展名 */
    fileExtension?: string;
    /** 存储类型 (LOCAL/MINIO/ALIYUN_OSS) */
    storageType?: string;
    /** 存储桶名称 */
    bucketName?: string;
    /** 上传者ID */
    uploaderId?: number;
    /** 上传者名称 */
    uploaderName?: string;
    /** 上传时间 */
    uploadTime?: string;
    /** 源文件回收站路径 */
    originalTrashPath?: string;
    /** 预览图文件回收站路径 */
    previewTrashPath?: string;
    /** 是否回收站 (0-否, 1-是) */
    isTrash?: number;
    /** 更新时间 */
    updateTime?: string;
  }
}

/**
 * 获取文件列表
 *
 * @author Chuang
 */
async function getStorageFileList(
  params?: SystemStorageFileAPi.StorageFileQueryRequest,
) {
  return await requestClient.get<
    PageResult<SystemStorageFileAPi.StorageFileListVo[]>
  >('/system/storage/file/list', { params });
}

/**
 * 获取文件详情
 *
 * @author Chuang
 */
async function getStorageFileById(id: number) {
  return await requestClient.get<SystemStorageFileAPi.StorageFileVo>(
    `/system/storage/file/${id}`,
  );
}

/**
 * 删除文件
 *
 * @author Chuang
 */
async function deleteStorageFile(ids: Array<number>) {
  return await requestClient.delete('/system/storage/file', {
    data: ids,
  });
}

/**
 * 获取文件回收站列表
 *
 * @author Chuang
 */
async function listFileTrash(
  params?: SystemStorageFileAPi.StorageFileQueryRequest,
) {
  return await requestClient.get<
    PageResult<SystemStorageFileAPi.StorageFileListVo[]>
  >('/system/storage/file/trash/list', { params });
}

/**
 * 删除文件回收站
 *
 * @author Chuang
 */
async function deleteTrashFile(ids: Array<number>) {
  return await requestClient.delete(
    `/system/storage/file/trash/${ids.join(',')}`,
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
  deleteStorageFile,
  deleteTrashFile,
  exportStorageFileList,
  getStorageFileList,
  getStorageFileById,
  listFileTrash,
};
