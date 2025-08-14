<script lang="ts" setup>
import type { SystemNoticeType } from '#/api/system/notice';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { addNotice, noticeById, updateNotice } from '#/api/system/notice';
import AiEditor from '#/components/Editor/AiEditor.vue';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<Partial<SystemNoticeType.SysNoticeVo>>();
const noticeContent = ref<string>('');

const getTitle = computed(() => {
  return formData.value?.id ? '修改公告' : '新增公告';
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
  noticeContent.value = formData.value?.noticeContent || '';
}

/**
 * 加载公告详情数据
 */
async function loadNoticeData(noticeId: string) {
  try {
    const noticeDetail = await noticeById(noticeId);
    formData.value = noticeDetail;
    noticeContent.value = noticeDetail.noticeContent || '';
    await formApi.setValues(noticeDetail);
  } catch (error) {
    console.error('获取公告详情失败:', error);
  }
}

/**
 * 富文本内容变化处理
 */
function onContentChange(value: string) {
  noticeContent.value = value;
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      drawerApi.lock();
      const data = await formApi.getValues();
      try {
        const submitData = {
          ...data,
          noticeContent: noticeContent.value,
        };

        await (formData.value?.id
          ? updateNotice({
              ...submitData,
              id: formData.value.id,
            } as SystemNoticeType.SysNoticeVo)
          : addNotice(submitData as SystemNoticeType.SysNoticeVo));
        await drawerApi.close();
        emit('success');
      } finally {
        drawerApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      // 设置Drawer的loading状态
      drawerApi.setState({ loading: true });

      // 使用nextTick确保DOM更新后再执行异步操作
      nextTick(async () => {
        try {
          const data = drawerApi.getData<SystemNoticeType.SysNoticeVo>();

          if (data && data.id) {
            // 编辑模式：加载完整的公告详情
            formData.value = data;
            const noticeId = data.id;
            await (noticeId === null
              ? formApi.setValues(data)
              : loadNoticeData(noticeId));
          } else {
            // 新增模式：重置表单
            formData.value = {};
            noticeContent.value = '';
            await formApi.resetForm();
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          // 关闭Drawer的loading状态
          drawerApi.setState({ loading: false });
        }
      });
    } else {
      // 抽屉关闭时立即重置状态
      formData.value = {};
      noticeContent.value = '';
      drawerApi.setState({ loading: false });
    }
  },
});
</script>

<template>
  <Drawer :title="getTitle" class="w-3/5">
    <div class="mx-4">
      <Form />

      <!-- 富文本编辑器 -->
      <div class="mb-6">
        <label class="mb-2 block text-sm font-medium text-gray-700">
          公告内容 <span class="text-red-500">*</span>
        </label>
        <AiEditor
          v-model="noticeContent"
          :height="1200"
          width="100%"
          placeholder="请输入公告内容..."
          content-format="html"
          @change="onContentChange"
        />
      </div>
    </div>

    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm"> 重置</Button>
      </div>
    </template>
  </Drawer>
</template>
