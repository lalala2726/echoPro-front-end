<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { Button, Card, message, notification, Space } from 'ant-design-vue';

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

type NotificationType = 'error' | 'info' | 'success' | 'warning';

function info() {
  message.info('How many roads must a man walk down');
}

function error() {
  message.error({
    content: 'Once upon a time you dressed so fine',
    duration: 2500,
  });
}

function warning() {
  message.warning('How many roads must a man walk down');
}
function success() {
  message.success('Cause you walked hand in hand With another man in my place');
}

function notify(type: NotificationType) {
  notification[type]({
    duration: 2500,
    message: '说点啥呢',
    type,
  });
}

function handleUploadSuccess(_response: any) {
  message.success('上传成功！');
}

function handleUploadError(_error: any) {
  message.error('上传失败！');
}
</script>

<template>
  <Page
    description="支持多语言，主题功能集成切换等"
    title="Ant Design Vue组件使用演示"
  >
    <Card class="mb-5" title="按钮">
      <Space>
        <Button>Default</Button>
        <Button type="primary"> Primary </Button>
        <Button> Info </Button>
        <Button danger> Error </Button>
      </Space>
    </Card>
    <Card class="mb-5" title="Message">
      <Space>
        <Button @click="info"> 信息 </Button>
        <Button danger @click="error"> 错误 </Button>
        <Button @click="warning"> 警告 </Button>
        <Button @click="success"> 成功 </Button>
      </Space>
    </Card>

    <Card class="mb-5" title="Notification">
      <Space>
        <Button @click="notify('info')"> 信息 </Button>
        <Button danger @click="notify('error')"> 错误 </Button>
        <Button @click="notify('warning')"> 警告 </Button>
        <Button @click="notify('success')"> 成功 </Button>
      </Space>
    </Card>

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
      <Space>
        <UploadButton
          button-text="选择文件"
          button-type="primary"
          @error="handleUploadError"
          @success="handleUploadSuccess"
        />
        <UploadButton
          button-text="上传图片"
          button-type="default"
          :show-upload-list="false"
          @error="handleUploadError"
          @success="handleUploadSuccess"
        />
      </Space>
    </Card>

    <Card class="mb-5" title="拖拽上传">
      <UploadDragDrop
        :height="200"
        tip="点击或拖拽文件到此区域上传"
        sub-tip="支持单个或批量上传，严禁上传公司数据或其他敏感信息"
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
