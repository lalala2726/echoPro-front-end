import type { Option, PageResult, Recordable } from '@vben/types';

import type {
  AliyunOssConfigSaveRequest,
  AmazonS3ConfigSaveRequest,
  MinioConfigSaveRequest,
  StorageConfigListVo,
  StorageConfigQueryRequest,
  StorageConfigUnifiedVo,
  StorageConfigUpdateRequest,
  TencentCosConfigSaveRequest,
} from './types';

import { exportFile } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取存储配置列表
 * @param params 查询参数
 */
async function getStorageConfigList(params?: StorageConfigQueryRequest) {
  return await requestClient.get<PageResult<StorageConfigListVo[]>>(
    '/system/storage/config/list',
    { params },
  );
}

/**
 * 添加Minio存储配置
 * @param data 存储配置数据
 */
async function addMinioStorageConfig(data: MinioConfigSaveRequest) {
  return await requestClient.post('/system/storage/config/minio', data);
}

/**
 * 添加阿里云OSS存储配置
 * @param data 存储配置数据
 */
async function addAliyunOssStorageConfig(data: AliyunOssConfigSaveRequest) {
  return await requestClient.post('/system/storage/config/aliyun', data);
}

/**
 * 添加腾讯云COS存储配置
 * @param data 存储配置数据
 */
async function addTencentCosStorageConfig(data: TencentCosConfigSaveRequest) {
  return await requestClient.post('/system/storage/config/tencent', data);
}

/**
 * 添加AmazonS3存储配置
 * @param data 存储配置数据
 */
async function addAmazonS3StorageConfig(data: AmazonS3ConfigSaveRequest) {
  return await requestClient.post('/system/storage/config/amazon', data);
}

/**
 * 获取存储配置详情
 * @param id 存储配置ID
 */
async function getStorageConfigById(id: string) {
  return await requestClient.get<StorageConfigUnifiedVo>(
    `/system/storage/config/${id}`,
  );
}

/**
 * 修改存储配置
 * @param data 存储配置数据
 */
async function updateStorageConfig(data: StorageConfigUpdateRequest) {
  return await requestClient.put('/system/storage/config', data);
}

/**
 * 删除存储配置
 * @param ids 存储配置ID
 */
async function deleteStorageConfig(ids: Array<string>) {
  return await requestClient.delete(`/system/storage/config/${ids.join(',')}`);
}

/**
 * 设置默认存储配置
 * @param id 存储配置ID
 */
async function updatePrimaryConfig(id: string) {
  return await requestClient.put(`/system/storage/config/primary/${id}`);
}

/**
 *  刷新缓存
 */
async function refreshCache() {
  return await requestClient.put(`/system/storage/config/refreshCache`);
}

/**
 * 检查存储键名是否存在
 * @param storageKey 存储键名
 * @param id 存储配置ID（编辑时传入）
 */
async function isStorageKeyExists(storageKey: string, id?: string) {
  return await requestClient.get<boolean>('/system/storage/config/key-exists', {
    params: { storageKey, id },
  });
}

/**
 * 获取存储配置键名选项
 */
async function getConfigKeyOptions() {
  return await requestClient.get<Option<{ label: string; value: string }>>(
    '/system/storage/config/key-option',
  );
}

/**
 * 取消主配置
 */
async function cancelPrimary() {
  return await requestClient.put('/system/storage/config/cancelPrimary');
}

/**
 * 导出存储配置列表
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
  cancelPrimary,
  deleteStorageConfig,
  exportStorageConfigList,
  getConfigKeyOptions,
  getStorageConfigById,
  getStorageConfigList,
  isStorageKeyExists,
  refreshCache,
  updatePrimaryConfig,
  updateStorageConfig,
};
