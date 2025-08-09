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
  /** 上传模式 */
  mode?:
    | 'avatar'
    | 'button'
    | 'custom'
    | 'drag'
    | 'list'
    | 'manual'
    | 'picture';
  /** 文件列表 */
  fileList?: UploadFile[];
  /** 是否显示上传列表 */
  showUploadList?: boolean;
  /** 列表类型 */
  listType?: 'picture' | 'picture-card' | 'text';
  /** 是否支持多选 */
  multiple?: boolean;
  /** 上传按钮文本 */
  buttonText?: string;
  /** 提示文本 */
  tip?: string;
}

defineOptions({
  name: 'Upload',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: false,
  maxSize: 10,
  accept: () => [],
  maxCount: 1,
  disabled: false,
  mode: 'button',
  fileList: () => [],
  showUploadList: true,
  listType: 'text',
  multiple: false,
  buttonText: '上传文件',
  tip: '',
});

const emit = defineEmits<UploadEmits>();

const internalFileList = ref<ExtendedUploadFile[]>([]);
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
  internalFileList.value = newFileList as ExtendedUploadFile[];
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
  <div class="upload-wrapper">
    <Upload
      v-model:file-list="internalFileList"
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      :list-type="listType"
      :max-count="maxCount"
      :multiple="multiple"
      :show-upload-list="showUploadList"
      @change="handleChange"
      @remove="handleRemove"
    >
      <slot>
        <div v-if="mode === 'drag'" class="upload-drag-area">
          <p class="ant-upload-drag-icon">
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
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p v-if="tip" class="ant-upload-hint">{{ tip }}</p>
        </div>
        <button
          v-else-if="mode === 'button'"
          :disabled="disabled"
          class="upload-button"
          type="button"
        >
          {{ buttonText }}
        </button>
      </slot>
    </Upload>

    <!-- 提示信息 -->
    <div v-if="tip && mode !== 'drag'" class="upload-tip">
      {{ tip }}
    </div>
  </div>
</template>

<style scoped>
.upload-wrapper {
  width: 100%;
}

.upload-drag-area {
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.upload-drag-area:hover {
  border-color: #1890ff;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5715;
  color: rgb(0 0 0 / 85%);
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.upload-button:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.upload-button:disabled {
  color: rgb(0 0 0 / 25%);
  cursor: not-allowed;
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: rgb(0 0 0 / 45%);
}

.ant-upload-drag-icon {
  margin-bottom: 16px;
}

.ant-upload-text {
  margin: 0 0 4px;
  font-size: 16px;
  color: rgb(0 0 0 / 85%);
}

.ant-upload-hint {
  margin: 0;
  font-size: 14px;
  color: rgb(0 0 0 / 45%);
}
</style>
