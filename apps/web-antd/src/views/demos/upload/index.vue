<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';

import {
  Upload,
  UploadAvatar,
  UploadButton,
  UploadCustomIcon,
  UploadDragDrop,
  UploadManual,
  UploadPictureCard,
  UploadPictureList,
} from '#/components/upload';

// 头像 URL 状态
const avatarUrl = ref('');
const avatarWithButton = ref('');

function handleUploadSuccess() {
  message.success('文件上传成功');
}

function handleUploadError(error: any) {
  console.error('上传失败:', error);
  message.error(`文件上传失败: ${error.message || '未知错误'}`);
}
</script>

<template>
  <Page description="文件上传组件演示" title="上传组件">
    <Card class="mb-5" title="基础上传">
      <Upload @error="handleUploadError" @success="handleUploadSuccess" />
    </Card>

    <Card class="mb-5" title="头像上传">
      <div class="space-y-6">
        <!-- 基础头像上传 -->
        <div>
          <h4 class="mb-3 text-base font-medium">
            基础头像上传（点击头像区域选择图片）
          </h4>
          <div class="flex items-center space-x-4">
            <UploadAvatar
              v-model:value="avatarUrl"
              :size="100"
              @error="handleUploadError"
              @success="handleUploadSuccess"
            />
            <div class="text-sm text-gray-600">
              <p>• 支持图片裁剪功能</p>
              <p>• 支持缩放、旋转、重置</p>
              <p>• 自动上传裁剪后的图片</p>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            当前头像: {{ avatarUrl || '未设置' }}
          </p>
        </div>

        <!-- 带按钮的头像上传 -->
        <div>
          <h4 class="mb-3 text-base font-medium">带按钮的头像上传</h4>
          <div class="flex items-center space-x-4">
            <UploadAvatar
              v-model:value="avatarWithButton"
              :size="100"
              :show-button="true"
              @error="handleUploadError"
              @success="handleUploadSuccess"
            />
            <div class="text-sm text-gray-600">
              <p>• 提供独立的上传按钮</p>
              <p>• 支持自定义头像尺寸</p>
              <p>• 支持自定义裁剪比例</p>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            当前头像: {{ avatarWithButton || '未设置' }}
          </p>
        </div>

        <!-- 不同尺寸演示 -->
        <div>
          <h4 class="mb-3 text-base font-medium">不同尺寸演示</h4>
          <div class="flex items-end space-x-4">
            <div class="text-center">
              <UploadAvatar
                :size="60"
                @error="handleUploadError"
                @success="handleUploadSuccess"
              />
              <p class="mt-1 text-xs text-gray-500">60px</p>
            </div>
            <div class="text-center">
              <UploadAvatar
                :size="80"
                @error="handleUploadError"
                @success="handleUploadSuccess"
              />
              <p class="mt-1 text-xs text-gray-500">80px</p>
            </div>
            <div class="text-center">
              <UploadAvatar
                :size="100"
                @error="handleUploadError"
                @success="handleUploadSuccess"
              />
              <p class="mt-1 text-xs text-gray-500">100px</p>
            </div>
            <div class="text-center">
              <UploadAvatar
                :size="120"
                @error="handleUploadError"
                @success="handleUploadSuccess"
              />
              <p class="mt-1 text-xs text-gray-500">120px</p>
            </div>
          </div>
        </div>

        <!-- 不同裁剪比例演示 -->
        <div>
          <h4 class="mb-3 text-base font-medium">不同裁剪比例</h4>
          <div class="flex items-center space-x-6">
            <div class="text-center">
              <UploadAvatar
                :size="100"
                :aspect-ratio="1"
                @error="handleUploadError"
                @success="handleUploadSuccess"
              />
              <p class="mt-2 text-xs text-gray-500">1:1 正方形</p>
            </div>
            <div class="text-center">
              <UploadAvatar
                :size="100"
                :aspect-ratio="1.5"
                @error="handleUploadError"
                @success="handleUploadSuccess"
              />
              <p class="mt-2 text-xs text-gray-500">3:2 横向</p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card class="mb-5" title="按钮上传">
      <UploadButton
        button-text="选择文件"
        button-type="primary"
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
    </Card>

    <Card class="mb-5" title="拖拽上传">
      <UploadDragDrop
        :height="200"
        tip="点击或拖拽文件到此区域上传"
        sub-tip="支持单个或批量上传"
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
    </Card>

    <Card class="mb-5" title="手动上传">
      <UploadManual
        select-text="选择文件"
        upload-text="开始上传"
        clear-text="清空"
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
    </Card>

    <Card class="mb-5" title="照片墙">
      <UploadPictureCard
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
    </Card>

    <Card class="mb-5" title="图片列表上传">
      <UploadPictureList
        button-text="上传图片"
        button-type="primary"
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
    </Card>

    <Card class="mb-5" title="自定义图标上传">
      <UploadCustomIcon
        :show-upload-list="true"
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
    </Card>
  </Page>
</template>
