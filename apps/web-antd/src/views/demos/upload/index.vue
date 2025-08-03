<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';

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

function handleUploadSuccess(_response: any) {
  // 上传成功处理
}

function handleUploadError(_error: any) {
  // 上传失败处理
}
</script>

<template>
  <Page description="文件上传组件演示" title="上传组件">
    <Card class="mb-5" title="基础上传">
      <Upload @error="handleUploadError" @success="handleUploadSuccess" />
    </Card>

    <Card class="mb-5" title="头像上传">
      <UploadAvatar
        :size="100"
        :show-button="true"
        @error="handleUploadError"
        @success="handleUploadSuccess"
      />
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