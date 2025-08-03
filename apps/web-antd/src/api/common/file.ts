import { requestClient } from '#/api/request';

export namespace FileType {
  export interface SimpleFileVO {
    /** 文件名 */
    fileName?: string;
    /** 文件大小 */
    fileSize?: string;
    /** 文件路径 */
    fileUrl?: string;
    /** 文件类型 */
    fileType?: string;
  }

  export interface ImageVo {
    /** 文件名 */
    fileName?: string;
    /** 文件大小 */
    fileSize?: string;
    /** 文件类型 */
    fileType?: string;
    /** 原始图片URL */
    fileUrl?: string;
    /** 预览图片URL */
    previewUrl?: string;
  }
}

/**
 * 上传文件
 * @param data
 */
async function uploadFile(data: File) {
  return await requestClient.upload<FileType.SimpleFileVO>(
    '/common/file/upload',
    { file: data },
  );
}

/**
 * 上传图片
 * @param data
 */
async function uploadImage(data: File) {
  return await requestClient.upload<FileType.ImageVo>(
    '/common/file/upload/image',
    { file: data },
  );
}

export const FileApi = {
  uploadFile,
  uploadImage,
};
