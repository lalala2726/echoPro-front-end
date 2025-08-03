import type { UploadFile } from 'ant-design-vue';

/**
 * 图片上传响应接口
 */
export interface ImageUploadResponse {
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize: string;
  /** 原始图片URL */
  fileUrl: string;
  /** 缩略图URL */
  previewUrl: string;
  /** 文件类型 */
  fileType: string;
}

/**
 * 文件上传响应接口
 */
export interface FileUploadResponse {
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize: string;
  /** 文件URL */
  fileUrl: string;
  /** 文件类型 */
  fileType: string;
}

/**
 * 上传组件基础属性
 */
export interface BaseUploadProps {
  /** 是否启用图片压缩 */
  enableCompression?: boolean;
  /** 最大文件大小(MB) */
  maxSize?: number;
  /** 允许的文件类型 */
  accept?: string[];
  /** 最大上传数量 */
  maxCount?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 上传成功回调 */
  onSuccess?: (
    response: FileUploadResponse | ImageUploadResponse,
    file: UploadFile,
  ) => void;
  /** 上传失败回调 */
  onError?: (error: Error, file: UploadFile) => void;
  /** 文件移除回调 */
  onRemove?: (file: UploadFile) => void;
}

/**
 * 上传组件事件
 */
export interface UploadEmits {
  (
    e: 'success',
    response: FileUploadResponse | ImageUploadResponse,
    file: UploadFile,
  ): void;
  (e: 'error', error: Error, file: UploadFile): void;
  (e: 'remove', file: UploadFile): void;
  (e: 'change', fileList: UploadFile[]): void;
}

/**
 * 上传状态
 */
export type UploadStatus = 'done' | 'error' | 'removed' | 'uploading';

/**
 * 扩展的上传文件类型
 */
export interface ExtendedUploadFile extends UploadFile {
  response?: FileUploadResponse | ImageUploadResponse;
}
