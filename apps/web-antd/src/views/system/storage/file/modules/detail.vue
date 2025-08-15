<script lang="ts" setup>
import type { StorageFileVo } from '#/api/system/storage/types';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { downloadFileFromImageUrl, downloadFileFromUrl } from '@vben/utils';

import {
  Button,
  Card,
  Col,
  Image,
  message,
  Row,
  Tag,
  Typography,
} from 'ant-design-vue';

import { formatFileSize, isPreviewableImage } from '../data';

const { Text } = Typography;

const detailData = ref<StorageFileVo>();

const getTitle = computed(() => {
  return '文件详情';
});

/**
 * 判断是否为可预览的图片
 */
const isImagePreviewable = computed(() => {
  return (
    detailData.value &&
    isPreviewableImage(detailData.value.contentType) &&
    detailData.value.isTrash !== 1
  ); // 回收站中的图片不可预览
});

/**
 * 获取预览图片URL
 */
const previewImageUrl = computed(() => {
  if (!detailData.value) return '';
  return (
    detailData.value.previewImageUrl || detailData.value.originalFileUrl || ''
  );
});

/**
 * 获取原图URL
 */
const originalImageUrl = computed(() => {
  if (!detailData.value) return '';
  return (
    detailData.value.originalFileUrl || detailData.value.previewImageUrl || ''
  );
});

/**
 * 获取文件类型标签颜色
 */
const getFileTypeColor = (contentType?: string) => {
  if (!contentType) return 'default';
  if (contentType.startsWith('image/')) return 'blue';
  if (contentType === 'application/pdf') return 'green';
  if (contentType.includes('document') || contentType.includes('word'))
    return 'orange';
  if (contentType.startsWith('video/')) return 'purple';
  if (contentType.startsWith('audio/')) return 'cyan';
  return 'default';
};

/**
 * 获取存储类型标签颜色
 */
const getStorageTypeColor = (storageType?: string) => {
  switch (storageType) {
    case 'ALIYUN_OSS': {
      return 'orange';
    }
    case 'AMAZON_S3': {
      return 'purple';
    }
    case 'LOCAL': {
      return 'default';
    }
    case 'MINIO': {
      return 'blue';
    }
    case 'TENCENT_COS': {
      return 'green';
    }
    default: {
      return 'default';
    }
  }
};

/**
 * 下载文件 - 与列表下载逻辑保持一致
 */
async function handleDownload() {
  if (!detailData.value) return;

  try {
    message.info('正在下载');

    // 根据文件类型选择下载方式
    const isImage = detailData.value.contentType?.startsWith('image') ?? false;
    await (isImage
      ? downloadFileFromImageUrl({
          fileName: detailData.value.originalName,
          source: detailData.value.originalFileUrl,
        })
      : downloadFileFromUrl({
          fileName: detailData.value.originalName,
          source: detailData.value.originalFileUrl,
        }));

    message.success('文件下载成功');
  } catch (error) {
    console.error('下载文件失败:', error);
    message.error('下载失败');
  }
}

/**
 * 复制文件链接
 */
async function handleCopyLink() {
  const url = originalImageUrl.value || previewImageUrl.value;
  if (!url) {
    message.warning('文件链接不存在');
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    message.success('文件链接已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.append(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      message.success('文件链接已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动复制');
    }
    textArea.remove();
  }
}

/**
 * 跳转到URL - 确保在新窗口中打开，避免代理问题
 */
function handleOpenUrl(url?: string) {
  if (url) {
    // 直接使用原始URL，不进行任何处理
    // 这样可以避免走前端代理，保持原始的直链访问
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[900px] min-w-[600px]',
  onOpenChange(isOpen) {
    if (isOpen) {
      drawerApi.setState({ loading: true });

      nextTick(async () => {
        try {
          const data = drawerApi.getData<StorageFileVo>();
          if (data) {
            detailData.value = data;
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          drawerApi.setState({ loading: false });
        }
      });
    } else {
      detailData.value = undefined;
      drawerApi.setState({ loading: false });
    }
  },
});

defineExpose({
  drawerApi,
});
</script>

<template>
  <Drawer :title="getTitle" class="w-[900px]">
    <div v-if="detailData" class="mx-4">
      <!-- 图片预览区域 - 只有图片资源才显示 -->
      <Card
        v-if="isImagePreviewable"
        title="图片预览"
        size="small"
        class="mb-4"
      >
        <div class="text-center">
          <Image
            :src="previewImageUrl"
            :alt="detailData.originalName"
            :preview="{
              src: previewImageUrl,
            }"
            class="max-h-80 max-w-full cursor-pointer rounded-lg shadow-sm"
          />
        </div>
      </Card>

      <!-- 基本信息 -->
      <Card title="基本信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                文件ID:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.id || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                原始文件名:
              </Text>
              <Text class="flex-1 font-medium" :title="detailData.originalName">
                {{ detailData.originalName || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                当前文件名:
              </Text>
              <Text class="flex-1 font-medium" :title="detailData.fileName">
                {{ detailData.fileName || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                文件类型:
              </Text>
              <Tag :color="getFileTypeColor(detailData.contentType)">
                {{ detailData.contentType || '--' }}
              </Tag>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                文件大小:
              </Text>
              <Text class="flex-1 font-medium">
                {{
                  detailData.fileSize
                    ? formatFileSize(detailData.fileSize)
                    : '--'
                }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                文件扩展名:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.fileExtension || '--' }}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <!-- 存储信息 -->
      <Card title="存储信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                存储类型:
              </Text>
              <Tag :color="getStorageTypeColor(detailData.storageType)">
                {{ detailData.storageType || '--' }}
              </Tag>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                存储桶:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.bucketName || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                回收站状态:
              </Text>
              <Tag :color="detailData.isTrash === 1 ? 'red' : 'green'">
                {{ detailData.isTrash === 1 ? '已删除' : '正常' }}
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <!-- 上传信息 -->
      <Card title="上传信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                上传者ID:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.uploaderId || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                上传者:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.uploaderName || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                上传时间:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.uploadTime || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <Text
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
              >
                更新时间:
              </Text>
              <Text class="flex-1 font-medium">
                {{ detailData.updateTime || '--' }}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <!-- 文件路径信息 -->
      <Card title="路径信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
            <div class="flex items-start">
              <Text
                class="mr-3 mt-1 w-20 flex-shrink-0 text-right text-gray-600 dark:text-gray-300"
              >
                原始文件URL:
              </Text>
              <div class="flex-1">
                <Text
                  v-if="detailData.originalFileUrl"
                  class="cursor-pointer break-all font-medium text-blue-600 underline hover:text-blue-800"
                  :title="detailData.originalFileUrl"
                  @click="() => handleOpenUrl(detailData?.originalFileUrl)"
                >
                  {{ detailData.originalFileUrl }}
                </Text>
                <Text v-else class="break-all font-medium">--</Text>
              </div>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-start">
              <Text
                class="mr-3 mt-1 w-20 flex-shrink-0 text-right text-gray-600 dark:text-gray-300"
              >
                预览图URL:
              </Text>
              <div class="flex-1">
                <Text
                  v-if="detailData.previewImageUrl"
                  class="cursor-pointer break-all font-medium text-blue-600 underline hover:text-blue-800"
                  :title="detailData.previewImageUrl"
                  @click="() => handleOpenUrl(detailData?.previewImageUrl)"
                >
                  {{ detailData.previewImageUrl }}
                </Text>
                <Text v-else class="break-all font-medium">--</Text>
              </div>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-start">
              <Text
                class="mr-3 mt-1 w-20 flex-shrink-0 text-right text-gray-600 dark:text-gray-300"
              >
                原始相对路径:
              </Text>
              <Text
                class="flex-1 break-all font-medium"
                :title="detailData.originalRelativePath"
              >
                {{ detailData.originalRelativePath || '--' }}
              </Text>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-start">
              <Text
                class="mr-3 mt-1 w-20 flex-shrink-0 text-right text-gray-600 dark:text-gray-300"
              >
                预览相对路径:
              </Text>
              <Text
                class="flex-1 break-all font-medium"
                :title="detailData.previewRelativePath"
              >
                {{ detailData.previewRelativePath || '--' }}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>

    <!-- 自定义footer按钮 -->
    <template #footer>
      <Button
        v-if="detailData && detailData.isTrash !== 1"
        @click="handleCopyLink"
      >
        复制链接
      </Button>
      <Button
        v-if="detailData && detailData.isTrash !== 1"
        @click="handleDownload"
      >
        下载文件
      </Button>
      <Button type="primary" @click="() => drawerApi.close()">确定</Button>
    </template>
  </Drawer>
</template>

<style scoped>
.break-all {
  word-break: break-all;
}
</style>
