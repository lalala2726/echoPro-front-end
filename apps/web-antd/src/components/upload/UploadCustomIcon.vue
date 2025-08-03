<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue';

import type {
  BaseUploadProps,
  ExtendedUploadFile,
  FileUploadResponse,
  ImageUploadResponse,
  UploadEmits,
} from './types';

import { ref } from 'vue';

import { message, Upload } from 'ant-design-vue';

import { FileApi } from '#/api/common/file';

interface Props extends BaseUploadProps {
  /** 是否显示上传列表 */
  showUploadList?: boolean;
}

defineOptions({
  name: 'UploadCustomIcon',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: false,
  maxSize: 10,
  accept: () => [],
  maxCount: 10,
  disabled: false,
  showUploadList: true,
});

const emit = defineEmits<UploadEmits>();

const fileList = ref<ExtendedUploadFile[]>([]);
const uploading = ref(false);

// 自定义上传函数
async function customRequest(options: any) {
  const { file, onSuccess, onError, onProgress } = options;

  try {
    uploading.value = true;
    onProgress?.({ percent: 10 });

    // 文件大小检查
    if (file.size > 0 && file.size > props.maxSize * 1024 * 1024) {
      throw new Error(`文件大小不能超过 ${props.maxSize}MB`);
    }

    // 文件类型检查
    if (props.accept.length > 0 && !props.accept.includes(file.type)) {
      throw new Error('文件类型不支持');
    }

    onProgress?.({ percent: 50 });

    // 根据是否启用压缩选择不同的API
    const apiResponse =
      props.enableCompression && file.type.startsWith('image/')
        ? await FileApi.uploadImage(file as File)
        : await FileApi.uploadFile(file as File);

    // 转换API响应为标准格式
    const response = {
      fileName: apiResponse.fileName || '',
      fileSize: apiResponse.fileSize || '',
      fileUrl: apiResponse.fileUrl || '',
      fileType: apiResponse.fileType || '',
      ...('previewUrl' in apiResponse && {
        previewUrl: apiResponse.previewUrl,
      }),
    } as FileUploadResponse | ImageUploadResponse;

    onProgress?.({ percent: 100 });
    onSuccess?.(response, file);

    // 触发成功事件
    emit('success', response, file as UploadFile);
    message.success('上传成功');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    onError?.(new Error(errorMessage));
    emit('error', new Error(errorMessage), file as UploadFile);
    message.error(errorMessage);
  } finally {
    uploading.value = false;
  }
}

// 文件变化处理
function handleChange({ fileList: newFileList }: { fileList: UploadFile[] }) {
  fileList.value = newFileList as ExtendedUploadFile[];
  emit('change', newFileList);
}

// 文件移除处理
function handleRemove(file: UploadFile) {
  emit('remove', file);
  return true;
}

// 上传前检查
function beforeUpload(file: File) {
  // 文件大小检查
  if (file.size > props.maxSize * 1024 * 1024) {
    message.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false;
  }

  // 文件类型检查
  if (props.accept.length > 0 && !props.accept.includes(file.type)) {
    message.error('文件类型不支持');
    return false;
  }

  return true;
}

// 自定义图标配置
const uploadListConfig = {
  showDownloadIcon: true,
  showRemoveIcon: true,
};
</script>

<template>
  <div class="upload-custom-icon-wrapper">
    <Upload
      v-model:file-list="fileList"
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      :max-count="maxCount"
      :multiple="maxCount > 1"
      :show-upload-list="showUploadList ? uploadListConfig : false"
      @change="handleChange"
      @remove="handleRemove"
    >
      <div class="upload-button">
        <svg
          class="upload-icon"
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
        <div class="upload-text">点击上传</div>
      </div>
    </Upload>
  </div>
</template>

<style scoped>
.upload-custom-icon-wrapper {
  display: inline-block;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-button:hover {
  border-color: #1890ff;
}

.upload-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  color: #999;
}

.upload-text {
  font-size: 14px;
  color: #666;
}
</style>
