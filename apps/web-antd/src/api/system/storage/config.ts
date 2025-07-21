import type { BaseType, PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

export namespace StorageConfigApi {
  export interface StorageConfigBaseSaveRequest {
    /** 存储配置名称 */
    storageName: string;
    /** 参数键名 */
    storageKey: string;
  }

  export interface StorageConfigListVo extends BaseType {
    /** 主键ID */
    id: number;
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

  export interface StorageConfigUpdateRequest {
    /** 文件配置ID */
    id: number;
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

  export interface StorageConfigUnifiedVo {
    /** 主键 */
    id: number;
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
}

/**
 * 获取存储配置列表
 * @param params 查询参数
 */
async function getStorageConfigList(
  params?: StorageConfigApi.StorageConfigQueryRequest,
) {
  return await requestClient.get<
    PageResult<StorageConfigApi.StorageConfigListVo[]>
  >('/system/storage/config/list', { params });
}

/**
 * 添加Minio存储配置
 * @param data 存储配置数据
 */
async function addMinioStorageConfig(
  data: StorageConfigApi.MinioConfigSaveRequest,
) {
  return await requestClient.post('/system/storage/config/minio', data);
}

/**
 * 添加阿里云OSS存储配置
 * @param data 存储配置数据
 */
async function addAliyunOssStorageConfig(
  data: StorageConfigApi.AliyunOssConfigSaveRequest,
) {
  return await requestClient.post('/system/storage/config/aliyun', data);
}

/**
 * 添加腾讯云COS存储配置
 * @param data 存储配置数据
 */
async function addTencentCosStorageConfig(
  data: StorageConfigApi.TencentCosConfigSaveRequest,
) {
  return await requestClient.post('/system/storage/config/tencent', data);
}

/**
 * 添加AmazonS3存储配置
 * @param data 存储配置数据
 */
async function addAmazonS3StorageConfig(
  data: StorageConfigApi.AmazonS3ConfigSaveRequest,
) {
  return await requestClient.post('/system/storage/config/amazon', data);
}

/**
 * 获取存储配置详情
 * @param id 存储配置ID
 */
async function getStorageConfigById(id: number) {
  return await requestClient.get<StorageConfigApi.StorageConfigUnifiedVo>(
    `/system/storage/config/${id}`,
  );
}

/**
 * 修改存储配置
 * @param data 存储配置数据
 */
async function updateStorageConfig(
  data: StorageConfigApi.StorageConfigUpdateRequest,
) {
  return await requestClient.put('/system/storage/config', data);
}

/**
 * 删除存储配置
 * @param ids 存储配置ID
 */
async function deleteStorageConfig(ids: Array<number>) {
  return await requestClient.delete(`/system/storage/config/${ids.join(',')}`);
}

/**
 * 设置默认存储配置
 * @param id 存储配置ID
 */
async function updatePrimaryConfig(id: number) {
  return await requestClient.put(`/system/storage/config/primary/${id}`);
}

async function refreshCache() {
  return await requestClient.put(`/system/storage/config/refreshCache`);
}

/**
 * 检查存储键名是否存在
 * @param storageKey 存储键名
 * @param id 存储配置ID（编辑时传入）
 */
async function isStorageKeyExists(storageKey: string, id?: number) {
  return await requestClient.get<boolean>('/system/storage/config/key-exists', {
    params: { storageKey, id },
  });
}

/**
 * 导出角色列表
 * @param fileName 文件名（可选，不需要扩展名）
 * @param params 查询参数（可选）
 */
async function exportStorageConfigList(
  fileName?: string,
  params?: Recordable<any>,
) {
  return exportFile('/system/storage/config/export', {
    fileName: fileName || '存储配置列表',
    params,
  });
}

export {
  addAliyunOssStorageConfig,
  addAmazonS3StorageConfig,
  addMinioStorageConfig,
  addTencentCosStorageConfig,
  deleteStorageConfig,
  exportStorageConfigList,
  getStorageConfigById,
  getStorageConfigList,
  isStorageKeyExists,
  refreshCache,
  updatePrimaryConfig,
  updateStorageConfig,
};
