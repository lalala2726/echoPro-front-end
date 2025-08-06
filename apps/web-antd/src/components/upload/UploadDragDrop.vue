<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue';

import type {
  BaseUploadProps,
  ExtendedUploadFile,
  FileUploadResponse,
  ImageUploadResponse,
  UploadEmits,
} from './types/types';

import { ref } from 'vue';

import { message, Upload } from 'ant-design-vue';

import { FileApi } from '#/api/common/file';

interface Props extends BaseUploadProps {
  /** 拖拽区域高度 */
  height?: number;
  /** 提示文本 */
  tip?: string;
  /** 子提示文本 */
  subTip?: string;
}

defineOptions({
  name: 'UploadDragDrop',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: false,
  maxSize: 10,
  accept: () => [],
  maxCount: 10,
  disabled: false,
  height: 200,
  tip: '点击或拖拽文件到此区域上传',
  subTip: '支持单个或批量上传',
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
</script>

<template>
  <div class="upload-drag-wrapper">
    <Upload.Dragger
      v-model:file-list="fileList"
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      :max-count="maxCount"
      :multiple="maxCount > 1"
      @change="handleChange"
      @remove="handleRemove"
    >
      <div :style="{ minHeight: `${height}px` }" class="upload-drag-content">
        <div class="upload-drag-icon">
          <svg
            class="h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </div>
        <p class="upload-drag-text">{{ tip }}</p>
        <p v-if="subTip" class="upload-drag-hint">{{ subTip }}</p>
        <div v-if="accept.length > 0" class="upload-drag-accept">
          支持格式: {{ accept.join(', ') }}
        </div>
        <div class="upload-drag-size">最大文件大小: {{ maxSize }}MB</div>
      </div>
    </Upload.Dragger>
  </div>
</template>

<style scoped>
.upload-drag-wrapper {
  width: 100%;
}

.upload-drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-drag-icon {
  margin-bottom: 16px;
}

.upload-drag-text {
  margin: 0 0 8px;
  font-size: 16px;
  color: rgb(0 0 0 / 85%);
}

.upload-drag-hint {
  margin: 0 0 12px;
  font-size: 14px;
  color: rgb(0 0 0 / 45%);
}

.upload-drag-accept {
  margin-bottom: 4px;
  font-size: 12px;
  color: rgb(0 0 0 / 45%);
}

.upload-drag-size {
  font-size: 12px;
  color: rgb(0 0 0 / 45%);
}
</style>
