<script lang="ts" setup>
import type { SysNoticeVo } from '#/api/system/notice/types';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

const noticeData = ref<SysNoticeVo>();

const getTitle = computed(() => {
  return '预览公告';
});

const getNoticeTypeText = computed(() => {
  const type = noticeData.value?.noticeType;
  return type === '1' ? '通知' : '公告';
});

const getNoticeTypeColor = computed(() => {
  const type = noticeData.value?.noticeType;
  return type === '1' ? 'blue' : 'green';
});

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  onOpenChange(isOpen) {
    noticeData.value = isOpen ? modalApi.getData<SysNoticeVo>() : undefined;
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <div class="mx-4">
      <!-- 公告标题 -->
      <div class="mb-6">
        <h2 class="mb-2 text-2xl font-bold text-gray-800">
          {{ noticeData?.noticeTitle }}
        </h2>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <Tag :color="getNoticeTypeColor">
            {{ getNoticeTypeText }}
          </Tag>
          <span>创建者：{{ noticeData?.createBy }}</span>
          <span>创建时间：{{ noticeData?.createTime }}</span>
        </div>
      </div>

      <!-- 公告内容 -->
      <div class="mb-6">
        <div class="mb-2 text-sm font-medium text-gray-700">公告内容</div>
        <div class="min-h-[300px] rounded-md border border-gray-200 bg-white p-4" v-html="noticeData?.noticeContent">
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
/* 富文本内容样式 */
:deep(.ql-editor) {
  padding: 0;
}

:deep(.ql-editor h1) {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

:deep(.ql-editor h2) {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
}

:deep(.ql-editor h3) {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: bold;
}

:deep(.ql-editor p) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

:deep(.ql-editor ul),
:deep(.ql-editor ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.ql-editor blockquote) {
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
  border-left: 4px solid #e5e7eb;
}

:deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
  margin: 0.5rem 0;
}

:deep(.ql-editor table) {
  width: 100%;
  margin: 0.5rem 0;
  border-collapse: collapse;
}

:deep(.ql-editor table td),
:deep(.ql-editor table th) {
  padding: 0.5rem;
  text-align: left;
  border: 1px solid #e5e7eb;
}

:deep(.ql-editor table th) {
  font-weight: bold;
  background-color: #f9fafb;
}
</style>
