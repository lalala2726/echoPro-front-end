<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue';

import type {
  BaseUploadProps,
  ImageUploadResponse,
  UploadEmits,
} from './types';

import { ref } from 'vue';

import { message, Upload } from 'ant-design-vue';

import { FileApi } from '#/api/common/file';

interface Props extends Omit<BaseUploadProps, 'maxCount'> {
  /** 头像URL */
  value?: string;
  /** 头像尺寸 */
  size?: number;
  /** 是否显示上传按钮 */
  showButton?: boolean;
}

defineOptions({
  name: 'UploadAvatar',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: true,
  maxSize: 2,
  accept: () => ['image/jpeg', 'image/png', 'image/webp'],
  disabled: false,
  value: '',
  size: 100,
  showButton: true,
});

const emit = defineEmits<UploadEmits>();

const loading = ref(false);
const imageUrl = ref(props.value);

// 自定义上传函数
async function customRequest(options: any) {
  const { file, onSuccess, onError } = options;

  try {
    loading.value = true;

    // 文件大小检查
    if (file.size > 0 && file.size > props.maxSize * 1024 * 1024) {
      throw new Error(`文件大小不能超过 ${props.maxSize}MB`);
    }

    // 文件类型检查
    if (props.accept.length > 0 && !props.accept.includes(file.type)) {
      throw new Error('文件类型不支持');
    }

    // 上传图片
    const apiResponse = await FileApi.uploadImage(file as File);

    // 转换API响应为标准格式
    const response = {
      fileName: apiResponse.fileName || '',
      fileSize: apiResponse.fileSize || '',
      fileUrl: apiResponse.fileUrl || '',
      fileType: apiResponse.fileType || '',
      ...('previewUrl' in apiResponse && {
        previewUrl: apiResponse.previewUrl,
      }),
    } as ImageUploadResponse;

    imageUrl.value = response.fileUrl;
    onSuccess?.(response, file);

    // 触发成功事件
    emit('success', response, file as UploadFile);
    message.success('头像上传成功');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    onError?.(new Error(errorMessage));
    emit('error', new Error(errorMessage), file as UploadFile);
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

// 上传前检查
function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < props.maxSize;
  if (!isLt2M) {
    message.error(`图片大小不能超过 ${props.maxSize}MB!`);
    return false;
  }

  return true;
}
</script>

<template>
  <div class="avatar-upload">
    <Upload
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      :show-upload-list="false"
      list-type="picture-card"
      class="avatar-uploader"
    >
      <div v-if="imageUrl" class="avatar-container">
        <img
          :src="imageUrl"
          :style="{ width: `${size}px`, height: `${size}px` }"
          alt="avatar"
          class="avatar-image"
        />
        <div v-if="showButton" class="avatar-overlay">
          <div class="avatar-overlay-content">
            <svg
              v-if="!loading"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4v16m8-8H4"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            <svg
              v-else
              class="h-4 w-4 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            <div class="avatar-overlay-text">更换头像</div>
          </div>
        </div>
      </div>
      <div
        v-else
        :style="{ width: `${size}px`, height: `${size}px` }"
        class="avatar-placeholder"
      >
        <svg
          v-if="!loading"
          class="h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 4v16m8-8H4"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
        <svg
          v-else
          class="h-8 w-8 animate-spin text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
        <div class="upload-text">上传头像</div>
      </div>
    </Upload>
  </div>
</template>

<style scoped>
.avatar-upload {
  display: inline-block;
}

.avatar-uploader {
  border: none !important;
  background: transparent !important;
}

.avatar-uploader :deep(.ant-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.ant-upload:hover) {
  border-color: #1890ff;
}

.avatar-container {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay-content {
  text-align: center;
  color: white;
}

.avatar-overlay-text {
  margin-top: 4px;
  font-size: 12px;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-placeholder:hover {
  border-color: #1890ff;
}

.upload-text {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
</style>
