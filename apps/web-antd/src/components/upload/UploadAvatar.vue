<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue';

import type {
  BaseUploadProps,
  ImageUploadResponse,
  UploadEmits,
} from './types/types';

import { computed, ref } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

import { IconifyIcon } from '@vben/icons';

import { Button, message, Modal, Space, Upload } from 'ant-design-vue';

import { FileApi } from '#/api/common/file';

interface Props extends BaseUploadProps {
  /** 头像大小 */
  size?: number;
  /** 头像值 */
  value?: string;
  /** 是否显示上传按钮 */
  showButton?: boolean;
  /** 裁剪框宽高比 */
  aspectRatio?: number;
  /** 裁剪框固定尺寸 */
  fixedBox?: boolean;
}

defineOptions({
  name: 'UploadAvatar',
});

const props = withDefaults(defineProps<Props>(), {
  enableCompression: true,
  maxSize: 5,
  accept: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxCount: 1,
  disabled: false,
  size: 100,
  value: '',
  showButton: false,
  aspectRatio: 1,
  fixedBox: true,
});

const emit = defineEmits<
  UploadEmits & {
    (e: 'update:value', value: string): void;
  }
>();

// 响应式数据
const showCropModal = ref(false);
const originalImageSrc = ref('');
const originalFile = ref<File | null>(null);
const cropperRef = ref<any>(null);
const uploading = ref(false);

// 计算属性
const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));

const hasAvatar = computed(() => !!props.value);

// 文件选择处理
function customRequest(options: any) {
  const { file } = options;

  if (!beforeUpload(file)) {
    return;
  }

  originalFile.value = file;

  // 读取文件内容
  const reader = new FileReader();
  reader.addEventListener('load', (e) => {
    originalImageSrc.value = e.target?.result as string;
    showCropModal.value = true;
  });
  reader.readAsDataURL(file);
}

// 上传前检查
function beforeUpload(file: File): boolean {
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

// 裁剪器操作方法
function zoomIn() {
  cropperRef.value?.changeScale(1);
}

function zoomOut() {
  cropperRef.value?.changeScale(-1);
}

function rotateLeft() {
  cropperRef.value?.rotateLeft();
}

function rotateRight() {
  cropperRef.value?.rotateRight();
}

function resetCropper() {
  cropperRef.value?.refresh();
}

// 确认裁剪并上传
async function confirmCrop() {
  if (!cropperRef.value || !originalFile.value) {
    return;
  }

  try {
    uploading.value = true;

    // 获取裁剪后的图片 Blob
    cropperRef.value.getCropBlob((blob: Blob) => {
      uploadCroppedImage(blob);
    });
  } catch {
    message.error('裁剪失败');
    uploading.value = false;
  }
}

// 上传裁剪后的图片
async function uploadCroppedImage(blob: Blob) {
  try {
    // 将 Blob 转换为 File
    const file = new File([blob], originalFile.value?.name || 'avatar.jpg', {
      type: blob.type || 'image/jpeg',
    });

    // 上传图片
    const response = await FileApi.uploadImage(file);

    // 转换API响应为标准格式
    const uploadResponse: ImageUploadResponse = {
      fileName: response.fileName || '',
      fileSize: response.fileSize || '',
      fileUrl: response.fileUrl || '',
      fileType: response.fileType || '',
      previewUrl: response.previewUrl || response.fileUrl || '',
    };

    // 更新头像值
    emit('update:value', uploadResponse.fileUrl);
    emit(
      'success',
      uploadResponse,
      originalFile.value as unknown as UploadFile,
    );

    message.success('头像上传成功');
    showCropModal.value = false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    emit(
      'error',
      new Error(errorMessage),
      originalFile.value as unknown as UploadFile,
    );
    message.error(errorMessage);
  } finally {
    uploading.value = false;
  }
}

// 取消裁剪
function cancelCrop() {
  showCropModal.value = false;
  originalImageSrc.value = '';
  originalFile.value = null;
}
</script>

<template>
  <div class="upload-avatar">
    <!-- 头像显示区域 -->
    <div class="upload-area" :style="avatarStyle">
      <Upload
        :accept="accept.join(',')"
        :custom-request="customRequest"
        :disabled="disabled"
        :show-upload-list="false"
        class="avatar-uploader"
      >
        <!-- 已有头像时显示图片 -->
        <div v-if="hasAvatar" class="avatar-preview">
          <img :src="value" alt="头像" class="avatar-image" />
          <div class="avatar-overlay">
            <IconifyIcon icon="carbon:camera" class="upload-icon" />
          </div>
        </div>

        <!-- 无头像时显示上传占位符 -->
        <div v-else class="upload-placeholder">
          <IconifyIcon icon="carbon:user-avatar" class="placeholder-icon" />
          <div class="placeholder-text">上传头像</div>
        </div>
      </Upload>
    </div>

    <!-- 可选的上传按钮 -->
    <div v-if="showButton" class="upload-button-wrapper">
      <Upload
        :accept="accept.join(',')"
        :custom-request="customRequest"
        :disabled="disabled"
        :show-upload-list="false"
      >
        <Button :disabled="disabled" type="primary" size="small">
          <IconifyIcon icon="carbon:camera" class="mr-1" />
          选择头像
        </Button>
      </Upload>
    </div>

    <!-- 裁剪模态框 -->
    <Modal
      v-model:open="showCropModal"
      title="裁剪头像"
      :width="800"
      :footer="null"
      @cancel="cancelCrop"
    >
      <div class="crop-container">
        <!-- 裁剪区域 -->
        <div class="crop-area">
          <VueCropper
            v-if="originalImageSrc"
            ref="cropperRef"
            :img="originalImageSrc"
            :output-size="1"
            output-type="jpeg"
            :info="false"
            :full="false"
            :can-move="true"
            :can-move-box="true"
            :original="false"
            :auto-crop="true"
            :auto-crop-width="200"
            :auto-crop-height="200"
            :center-box="true"
            :high="true"
            :fixed="fixedBox"
            :fixed-number="[aspectRatio, 1]"
            :max-img-size="3000"
            :enlarge="1"
            mode="contain"
            class="cropper"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="crop-controls">
          <Space>
            <Button @click="zoomIn" size="small">
              <IconifyIcon icon="carbon:zoom-in" />
            </Button>
            <Button @click="zoomOut" size="small">
              <IconifyIcon icon="carbon:zoom-out" />
            </Button>
            <Button @click="rotateLeft" size="small">
              <IconifyIcon icon="carbon:rotate-counterclockwise" />
            </Button>
            <Button @click="rotateRight" size="small">
              <IconifyIcon icon="carbon:rotate-clockwise" />
            </Button>
            <Button @click="resetCropper" size="small">
              <IconifyIcon icon="carbon:reset" />
            </Button>
          </Space>
        </div>

        <!-- 底部按钮 -->
        <div class="crop-actions">
          <Space>
            <Button @click="cancelCrop" :disabled="uploading"> 取消 </Button>
            <Button type="primary" :loading="uploading" @click="confirmCrop">
              确认上传
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.upload-avatar {
  @apply inline-block;
}

.upload-area {
  @apply relative cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-gray-300 transition-colors duration-200;
}

.upload-area:hover {
  @apply border-blue-400;
}

.avatar-uploader {
  @apply h-full w-full;
}

.avatar-uploader :deep(.ant-upload) {
  @apply h-full w-full;
}

.avatar-preview {
  @apply relative h-full w-full;
}

.avatar-image {
  @apply h-full w-full object-cover;
}

.avatar-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-200;
}

.avatar-preview:hover .avatar-overlay {
  @apply opacity-100;
}

.upload-icon {
  @apply text-2xl text-white;
}

.upload-placeholder {
  @apply flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400;
}

.placeholder-icon {
  @apply mb-2 text-3xl;
}

.placeholder-text {
  @apply text-sm;
}

.upload-button-wrapper {
  @apply mt-3 text-center;
}

.crop-container {
  @apply space-y-4;
}

.crop-area {
  @apply h-96 w-full overflow-hidden rounded-lg bg-gray-100;
}

.cropper {
  @apply h-full w-full;
}

.crop-controls {
  @apply flex justify-center;
}

.crop-actions {
  @apply flex justify-end border-t border-gray-200 pt-4;
}
</style>
