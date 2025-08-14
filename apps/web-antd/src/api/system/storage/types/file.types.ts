/**
 * 存储文件查询请求参数
 */
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

/**
 * 存储文件列表视图对象
 */
export interface StorageFileListVo {
  /** 主键ID */
  id?: string;
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
 * 存储文件详情视图对象
 */
export interface StorageFileVo {
  /** 主键ID */
  id?: string;
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
