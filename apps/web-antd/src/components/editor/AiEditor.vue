<script setup lang="ts">
import type { AiEditor as AiEditorType } from 'aieditor';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { AiEditor } from 'aieditor';

import { FileApi } from '#/api/common/file';

import 'aieditor/dist/style.css';

interface Props {
  modelValue?: string;
  placeholder?: string;
  height?: number | string;
  theme?: 'dark' | 'light' | undefined;
  editable?: boolean;
  contentFormat?: 'html' | 'markdown';
  contentRetention?: boolean;
  disableAI?: boolean;
  disableTextSelectionBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  height: 600,
  theme: undefined,
  editable: true,
  contentFormat: 'markdown',
  contentRetention: true,
  disableAI: true,
  disableTextSelectionBubble: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'ready', instance: AiEditorType): void;
}>();

const rootEl = ref<HTMLElement | null>(null);
let editor: AiEditorType | null = null;

const computedHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
);

// 封装统一的响应结果为 aieditor 需要的格式
function ok<T extends Record<string, any>>(data: T) {
  return { errorCode: 0, data } as const;
}
function fail(message = 'upload failed') {
  return { errorCode: 500, message } as const;
}

// 自定义上传：图片（统一走 uploadFile）
async function imageUploader(file: File): Promise<Record<string, any>> {
  try {
    const res = await FileApi.uploadFile(file);
    const url = res?.fileUrl;
    if (!url) return fail('no image url');
    return ok({ src: url });
  } catch (error: any) {
    return fail(error?.message || 'image upload error');
  }
}

// 自定义上传：视频（复用通用文件上传）
async function videoUploader(file: File): Promise<Record<string, any>> {
  try {
    const res = await FileApi.uploadFile(file);
    const url = res?.fileUrl;
    if (!url) return fail('no video url');
    return ok({ src: url });
  } catch (error: any) {
    return fail(error?.message || 'video upload error');
  }
}

// 自定义上传：附件（复用通用文件上传）
async function attachmentUploader(file: File): Promise<Record<string, any>> {
  try {
    const res = await FileApi.uploadFile(file);
    const url = res?.fileUrl;
    const name = res?.fileName || file.name;
    if (!url) return fail('no attachment url');
    return ok({ href: url, fileName: name });
  } catch (error: any) {
    return fail(error?.message || 'attachment upload error');
  }
}

onMounted(() => {
  editor = new AiEditor({
    element: rootEl.value as Element,
    placeholder: props.placeholder,
    content: props.modelValue ?? '',
    contentIsMarkdown: props.contentFormat === 'markdown',
    contentRetention: props.contentRetention,
    theme: props.theme,
    editable: props.editable,

    // 关闭 AI、或仅保留常用文本项
    toolbarExcludeKeys: props.disableAI ? ['ai'] : [],
    textSelectionBubbleMenu: props.disableTextSelectionBubble
      ? { enable: false }
      : {
          enable: true,
          items: ['Bold', 'Italic', 'Underline', 'Strike', 'code', 'comment'],
        },

    // 上传集成
    image: {
      uploader: (file) => imageUploader(file),
    },
    video: {
      uploader: (file) => videoUploader(file),
    },
    attachment: {
      uploader: (file) => attachmentUploader(file),
    },

    onChange: (ed) => {
      const value =
        props.contentFormat === 'markdown' ? ed.getMarkdown() : ed.getHtml();
      emit('update:modelValue', value);
      emit('change', value);
    },
  });
  emit('ready', editor);
});

onUnmounted(() => {
  editor && editor.destroy();
  editor = null;
});

watch(
  () => props.modelValue,
  (val) => {
    if (!editor) return;
    const current =
      props.contentFormat === 'markdown'
        ? editor.getMarkdown()
        : editor.getHtml();
    if (val !== current) {
      if (props.contentFormat === 'markdown')
        editor.setMarkdownContent(val || '');
      else editor.setContent(val || '');
    }
  },
);
</script>

<template>
  <div
    ref="rootEl"
    class="ai-editor-host"
    :style="{ height: computedHeight }"
  ></div>
</template>

<style scoped>
:deep(.tippy-content) {
  padding: 0 !important;
}

:deep(.aie-bubble-menu),
:deep(.aie-dropdown-container) {
  border: 1px solid #e9e9e9 !important;
}

:deep(.tippy-box) {
  box-shadow: 0 2px 5px 2px rgba(0, 0, 0, 0.08) !important;
}
</style>
