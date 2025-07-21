<script lang="ts" setup>
import type { StorageConfigApi } from '#/api/system/storage/config';

import { ref } from 'vue';

import AliyunOssForm from './forms/aliyun-oss-form.vue';
import AmazonS3Form from './forms/amazon-s3-form.vue';
import MinioForm from './forms/minio-form.vue';
import TencentCosForm from './forms/tencent-cos-form.vue';
import StorageTypeSelector from './storage-type-selector.vue';

const emit = defineEmits<{
  success: [];
}>();

const storageTypeSelectorRef = ref();
const minioFormRef = ref();
const aliyunOssFormRef = ref();
const tencentCosFormRef = ref();
const amazonS3FormRef = ref();

// 打开新增配置流程
function openCreateForm() {
  storageTypeSelectorRef.value?.drawerApi.open();
}

// 存储类型选择完成后，打开对应的表单
function handleStorageTypeSelected(storageType: string) {
  switch (storageType) {
    case 'aliyun_oss': {
      aliyunOssFormRef.value?.drawerApi.open();
      break;
    }
    case 'amazon_s3': {
      amazonS3FormRef.value?.drawerApi.open();
      break;
    }
    case 'minio': {
      minioFormRef.value?.drawerApi.open();
      break;
    }
    case 'tencent_cos': {
      tencentCosFormRef.value?.drawerApi.open();
      break;
    }
  }
}

// 直接打开编辑表单（根据数据中的存储类型）
function openEditForm(data: StorageConfigApi.StorageConfigUnifiedVo) {
  const storageType = data.storageType;
  switch (storageType) {
    case 'aliyun_oss': {
      aliyunOssFormRef.value?.drawerApi.setData(data).open();
      break;
    }
    case 'amazon_s3': {
      amazonS3FormRef.value?.drawerApi.setData(data).open();
      break;
    }
    case 'minio': {
      minioFormRef.value?.drawerApi.setData(data).open();
      break;
    }
    case 'tencent_cos': {
      tencentCosFormRef.value?.drawerApi.setData(data).open();
      break;
    }
    default: {
      console.error('未知的存储类型:', storageType);
    }
  }
}

// 打开查看表单（只读模式）
function openViewForm(data: any) {
  const storageType = data?.storageType;
  switch (storageType) {
    case 'aliyun_oss': {
      aliyunOssFormRef.value?.drawerApi.setData(data).open();
      break;
    }
    case 'amazon_s3': {
      amazonS3FormRef.value?.drawerApi.setData(data).open();
      break;
    }
    case 'minio': {
      minioFormRef.value?.drawerApi.setData(data).open();
      break;
    }
    case 'tencent_cos': {
      tencentCosFormRef.value?.drawerApi.setData(data).open();
      break;
    }
    default: {
      console.error('未知的存储类型:', storageType);
    }
  }
}

// 处理表单成功事件
function handleFormSuccess() {
  emit('success');
}

// 暴露方法给父组件
defineExpose({
  openCreateForm,
  openEditForm,
  openViewForm,
});
</script>

<template>
  <!-- 存储类型选择器 -->
  <StorageTypeSelector
    ref="storageTypeSelectorRef"
    @success="handleStorageTypeSelected"
  />

  <!-- MinIO 表单 -->
  <MinioForm ref="minioFormRef" @success="handleFormSuccess" />

  <!-- 阿里云 OSS 表单 -->
  <AliyunOssForm ref="aliyunOssFormRef" @success="handleFormSuccess" />

  <!-- 腾讯云 COS 表单 -->
  <TencentCosForm ref="tencentCosFormRef" @success="handleFormSuccess" />

  <!-- Amazon S3 表单 -->
  <AmazonS3Form ref="amazonS3FormRef" @success="handleFormSuccess" />
</template>
