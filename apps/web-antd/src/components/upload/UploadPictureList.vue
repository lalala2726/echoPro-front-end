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

import { Button, message, Upload } from 'ant-design-vue';

import { FileApi } from '#/api/common/file';

interface Props extends BaseUploadProps {
  /** 按钮文本 */
  buttonText?: string;
  /** 按钮类型 */
  buttonType?: 'dashed' | 'default' | 'link' | 'primary' | 'text';
  /** 按钮大小 */
  buttonSize?: 'large' | 'middle' | 'small';
}

defineOptions({
  name: 'UploadPictureList',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: false,
  maxSize: 10,
  accept: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxCount: 10,
  disabled: false,
  buttonText: '上传图片',
  buttonType: 'default',
  buttonSize: 'middle',
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
  <div class="upload-picture-list-wrapper">
    <Upload
      v-model:file-list="fileList"
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :custom-request="customRequest"
      :disabled="disabled"
      :max-count="maxCount"
      :multiple="maxCount > 1"
      list-type="picture"
      @change="handleChange"
      @remove="handleRemove"
    >
      <Button :disabled="disabled" :size="buttonSize" :type="buttonType">
        <svg
          class="upload-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
        {{ buttonText }}
      </Button>
    </Upload>

    <div v-if="accept.length > 0 || maxSize" class="upload-tips">
      <div v-if="accept.length > 0" class="tip-item">
        支持格式: {{ accept.join(', ') }}
      </div>
      <div class="tip-item">最大文件大小: {{ maxSize }}MB</div>
      <div v-if="maxCount > 1" class="tip-item">
        最多上传 {{ maxCount }} 张图片
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-picture-list-wrapper {
  width: 100%;
}

.upload-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.upload-tips {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #f6f8fa;
  border-radius: 4px;
  border: 1px solid #e1e4e8;
}

.tip-item {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
}
</style>
