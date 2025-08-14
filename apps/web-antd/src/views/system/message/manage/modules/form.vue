<script lang="ts" setup>
import type {
  MessageRequest,
  SysMessageUpdateRequest,
  SysMessageVo,
  SysSendMessageRequest,
} from '#/api/system/messageManage/types';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  getMessageById,
  sendMessage,
  updateMessage,
} from '#/api/system/messageManage/messageManage';
import { MessageSendMethod } from '#/api/system/messageManage/types';
import AiEditor from '#/components/Editor/AiEditor.vue';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<Partial<SysMessageVo>>();
const messageContent = ref<string>('');

const getTitle = computed(() => {
  return formData.value?.id ? '修改消息' : '新增消息';
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
  messageContent.value = formData.value?.content || '';
}

/**
 * 加载消息详情数据
 */
async function loadMessageData(messageId: string) {
  try {
    const messageDetail = await getMessageById(messageId);
    formData.value = messageDetail;
    messageContent.value = messageDetail.content || '';
    await formApi.setValues(messageDetail);
  } catch (error) {
    console.error('获取消息详情失败:', error);
  }
}

/**
 * 富文本内容变化处理
 */
function onContentChange(value: string) {
  messageContent.value = value;
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
          content: messageContent.value,
        };

        await (formData.value?.id
          ? updateMessage({
              ...(submitData as unknown as SysMessageUpdateRequest),
              id: formData.value.id!,
            })
          : sendMessage({
              receiveType: MessageSendMethod.ALL,
              receiveId: [],
              message: submitData as MessageRequest,
            } as SysSendMessageRequest));

        await drawerApi.close();
        emit('success');
      } catch (error) {
        console.error('提交失败:', error);
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
          const data = drawerApi.getData<SysMessageVo>();

          if (data && data.id) {
            // 编辑模式：加载完整的消息详情
            formData.value = data;
            const messageId = data.id;
            await (messageId === null
              ? formApi.setValues(data)
              : loadMessageData(messageId));
          } else {
            // 新增模式：重置表单
            formData.value = {};
            messageContent.value = '';
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
      messageContent.value = '';
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
          消息内容 <span class="text-red-500">*</span>
        </label>
        <AiEditor
          v-model="messageContent"
          :height="600"
          width="100%"
          placeholder="请输入消息内容..."
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
