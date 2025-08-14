import type { BaseType } from '@vben/types';

/**
 * 存储配置基础保存请求
 */
export interface StorageConfigBaseSaveRequest {
  /** 存储配置名称 */
  storageName: string;
  /** 参数键名 */
  storageKey: string;
}

/**
 * 存储配置列表视图对象
 */
export interface StorageConfigListVo extends BaseType {
  /** 主键ID */
  id: string;
  /** 参数名称 */
  storageName?: string;
  /** 参数键名 */
  storageKey?: string;
  /** 存储类型 */
  storageType?: string;
  /** 是否主配置 */
  isPrimary?: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 存储配置查询请求参数
 */
export interface StorageConfigQueryRequest {
  /** 存储名称 */
  storageName?: string;
  /** 存储键名 */
  storageKey?: string;
  /** 存储类型 */
  storageType?: string;
  /** 备注 */
  remark?: string;
}

/**
 * MinIO配置保存请求
 */
export interface MinioConfigSaveRequest extends StorageConfigBaseSaveRequest {
  /** 存储配置名称 */
  storageName: string;
  /** 参数键名 */
  storageKey: string;
  /** MinIO 服务器的端点。 */
  endpoint: string;
  /** MinIO 的访问密钥。 */
  accessKey: string;
  /** MinIO 的密钥。 */
  secretKey: string;
  /** MinIO 的存储桶名称。 */
  bucketName: string;
  /** MinIO 的文件访问域名。 */
  fileDomain: string;
  /** 是否真实删除 */
  realDelete: boolean;
}

/**
 * 阿里云OSS配置保存请求
 */
export interface AliyunOssConfigSaveRequest
  extends StorageConfigBaseSaveRequest {
  /** 存储配置名称 */
  storageName: string;
  /** 参数键名 */
  storageKey: string;
  /** 访问端点 */
  endpoint: string;
  /** 访问密钥 */
  accessKeyId: string;
  /** 密钥 */
  accessKeySecret: string;
  /** 存储桶名称 */
  bucketName: string;
  /** 文件域名 */
  fileDomain: string;
  /** 是否真实删除 */
  realDelete: boolean;
}

/**
 * 腾讯云COS配置保存请求
 */
export interface TencentCosConfigSaveRequest
  extends StorageConfigBaseSaveRequest {
  /** 存储配置名称 */
  storageName: string;
  /** 参数键名 */
  storageKey: string;
  /** 访问区域 */
  region: string;
  /** 访问密钥 */
  secretId: string;
  /** 访问密钥 */
  secretKey: string;
  /** 存储桶名称 */
  bucketName: string;
  /** 文件访问域名 */
  fileDomain: string;
  /** 是否真实删除 */
  realDelete: boolean;
}

/**
 * AmazonS3配置保存请求
 */
export interface AmazonS3ConfigSaveRequest
  extends StorageConfigBaseSaveRequest {
  /** 存储配置名称 */
  storageName: string;
  /** 参数键名 */
  storageKey: string;
  /** 存储服务地址 */
  endpoint: string;
  /** 访问密钥 */
  accessKey: string;
  /** 密钥 */
  secretKey: string;
  /** 存储桶名称 */
  bucketName: string;
  /** 存储桶区域 */
  region: string;
  /** 文件访问域名 */
  fileDomain: string;
  /** 是否真实删除文件 */
  realDelete: boolean;
}

/**
 * 存储配置更新请求
 */
export interface StorageConfigUpdateRequest {
  /** 文件配置ID */
  id: string;
  /** 存储配置名称 */
  storageName: string;
  /** 阿里云存储配置 */
  aliyunOss?: AliyunOssConfigSaveRequest;
  /** AmazonS3 存储配置 */
  amazonS3?: AmazonS3ConfigSaveRequest;
  /** 腾讯云COS 存储配置 */
  tencentCos?: TencentCosConfigSaveRequest;
  /** 阿里云OSS 存储配置 */
  minio?: MinioConfigSaveRequest;
}

/**
 * 存储配置统一视图对象
 */
export interface StorageConfigUnifiedVo {
  /** 主键 */
  id: string;
  /** 参数名称 */
  storageName?: string;
  /** 参数键名 */
  storageKey?: string;
  /** 存储类型 */
  storageType?: string;
  /** 是否主配置 */
  isPrimary?: boolean;
  /** 阿里云OSS配置 */
  aliyunOssStorageConfigVo?: AliyunOssStorageConfigVo;
  /** 腾讯云COS配置 */
  amazonS3StorageConfigVo?: AmazonS3StorageConfigVo;
  /** Minio配置 */
  minioStorageConfigVo?: MinioStorageConfigVo;
  /** 腾讯云COS配置 */
  tencentCosStorageConfigVo?: TencentCosStorageConfigVo;
}

/**
 * 阿里云OSS存储配置视图对象
 */
export interface AliyunOssStorageConfigVo {
  /** 访问端点 */
  endpoint: string;
  /** 阿里云账号AccessKey */
  accessKeyId: string;
  /** 阿里云账号AccessKey Secret */
  accessKeySecret?: string;
  /** 存储空间名称 */
  bucketName?: string;
  /** 文件访问域名 */
  fileDomain?: string;
  /** 是否真实删除 */
  realDelete?: boolean;
}

/**
 * AmazonS3存储配置视图对象
 */
export interface AmazonS3StorageConfigVo {
  /** 存储服务地址 */
  endpoint?: string;
  /** 访问密钥ID */
  accessKey?: string;
  /** 访问密钥 */
  secretKey?: string;
  /** 存储桶名称 */
  bucketName?: string;
  /** 存储桶区域 */
  region?: string;
  /** 文件访问域名 */
  fileDomain?: string;
  /** 是否真实删除 */
  realDelete?: boolean;
}

/**
 * MinIO存储配置视图对象
 */
export interface MinioStorageConfigVo {
  /** 访问端点 */
  endpoint?: string;
  /** 访问密钥 */
  accessKey?: string;
  /** 密钥 */
  secretKey?: string;
  /** 存储桶名称 */
  bucketName?: string;
  /** 文件访问域名 */
  fileDomain?: string;
  /** 存储桶区域 */
  bucketRegion?: string;
  /** 是否真实删除 */
  realDelete?: boolean;
}

/**
 * 腾讯云COS存储配置视图对象
 */
export interface TencentCosStorageConfigVo {
  /** 服务区域 */
  region?: string;
  /** 密钥ID */
  secretId?: string;
  /** 密钥Key */
  secretKey?: string;
  /** 存储桶名称 */
  bucketName?: string;
  /** 文件域名 */
  fileDomain?: string;
  /** 是否真实删除 */
  realDelete?: boolean;
}
