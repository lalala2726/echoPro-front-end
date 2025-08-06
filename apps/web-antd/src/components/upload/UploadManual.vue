<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue';

import type {
  BaseUploadProps,
  ExtendedUploadFile,
  FileUploadResponse,
  ImageUploadResponse,
  UploadEmits,
} from './types/types';

import { computed, ref } from 'vue';

import { Button, message, Upload } from 'ant-design-vue';

import { FileApi } from '#/api/common/file';

interface Props extends BaseUploadProps {
  /** 选择按钮文本 */
  selectText?: string;
  /** 上传按钮文本 */
  uploadText?: string;
  /** 清空按钮文本 */
  clearText?: string;
}

defineOptions({
  name: 'UploadManual',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: false,
  maxSize: 10,
  accept: () => [],
  maxCount: 10,
  disabled: false,
  selectText: '选择文件',
  uploadText: '开始上传',
  clearText: '清空',
});

const emit = defineEmits<UploadEmits>();

const fileList = ref<ExtendedUploadFile[]>([]);
const uploading = ref(false);

// 自定义上传函数
async function customRequest(options: any) {
  const { file, onSuccess, onError, onProgress } = options;

  try {
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
    message.success(`${file.name} 上传成功`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    onError?.(new Error(errorMessage));
    emit('error', new Error(errorMessage), file as UploadFile);
    message.error(`${file.name} ${errorMessage}`);
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

  return false; // 阻止自动上传
}

// 手动上传所有文件
async function handleUpload() {
  const filesToUpload = fileList.value.filter(
    (file) => file.status !== 'done' && file.status !== 'uploading',
  );

  if (filesToUpload.length === 0) {
    message.warning('没有需要上传的文件');
    return;
  }

  uploading.value = true;

  try {
    for (const file of filesToUpload) {
      if (file.originFileObj) {
        // 更新文件状态为上传中
        file.status = 'uploading';
        file.percent = 0;

        await customRequest({
          file: file.originFileObj,
          onSuccess: (response: any) => {
            file.status = 'done';
            file.percent = 100;
            file.response = response;
          },
          onError: (error: Error) => {
            file.status = 'error';
            file.error = error;
          },
          onProgress: ({ percent }: { percent: number }) => {
            file.percent = percent;
          },
        });
      }
    }
  } finally {
    uploading.value = false;
  }
}

// 清空文件列表
function handleClear() {
  fileList.value = [];
  emit('change', []);
}

// 计算是否有文件可以上传
const hasFilesToUpload = computed(() => {
  return fileList.value.some(
    (file) => file.status !== 'done' && file.status !== 'uploading',
  );
});
</script>

<template>
  <div class="upload-manual-wrapper">
    <Upload
      v-model:file-list="fileList"
      :accept="accept.join(',')"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :max-count="maxCount"
      :multiple="maxCount > 1"
      @change="handleChange"
      @remove="handleRemove"
    >
      <Button :disabled="disabled">
        <svg
          class="upload-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
        {{ selectText }}
      </Button>
    </Upload>

    <div v-if="fileList.length > 0" class="upload-actions">
      <Button
        :disabled="!hasFilesToUpload || uploading"
        :loading="uploading"
        type="primary"
        @click="handleUpload"
      >
        {{ uploadText }}
      </Button>
      <Button :disabled="uploading" @click="handleClear">
        {{ clearText }}
      </Button>
    </div>

    <div v-if="accept.length > 0 || maxSize" class="upload-tips">
      <div v-if="accept.length > 0" class="tip-item">
        支持格式: {{ accept.join(', ') }}
      </div>
      <div class="tip-item">最大文件大小: {{ maxSize }}MB</div>
      <div v-if="maxCount > 1" class="tip-item">
        最多上传 {{ maxCount }} 个文件
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-manual-wrapper {
  width: 100%;
}

.upload-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.upload-tips {
  padding: 8px 12px;
  margin-top: 12px;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
}

.tip-item {
  font-size: 12px;
  line-height: 1.5;
  color: rgb(0 0 0 / 65%);
}

.upload-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}
</style>
