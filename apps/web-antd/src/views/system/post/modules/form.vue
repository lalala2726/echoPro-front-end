<script lang="ts" setup>
import type { SystemPostApi } from '#/api/system/post';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { addPost, getPostById, updatePost } from '#/api/system/post';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<Partial<SystemPostApi.SysPost>>();
const getTitle = computed(() => {
  return formData.value?.id ? '修改岗位' : '新增岗位';
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

/**
 * 加载岗位详情数据
 */
async function loadPostData(postId: number) {
  try {
    const postDetail = await getPostById(postId);
    formData.value = postDetail;
    await formApi.setValues(postDetail);
  } catch (error) {
    console.error('获取岗位详情失败:', error);
  }
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.id
          ? updatePost({
              ...data,
              id: formData.value.id,
            } as SystemPostApi.SysPost)
          : addPost(data as SystemPostApi.SysPost));
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      // 设置Modal的loading状态
      modalApi.setState({ loading: true });

      // 使用nextTick确保DOM更新后再执行异步操作
      nextTick(async () => {
        try {
          const data = modalApi.getData<SystemPostApi.SysPost>();
          console.log('Modal data:', data); // 调试信息

          if (data && data.id) {
            // 编辑模式：加载完整的岗位详情
            formData.value = data;
            const postId =
              typeof data.id === 'string' ? Number.parseInt(data.id) : data.id;
            if (isNaN(postId)) {
              // 如果ID无效，直接使用传入的数据
              await formApi.setValues(data);
            } else {
              await loadPostData(postId);
            }
          } else {
            // 新增模式：重置表单
            formData.value = {};
            await formApi.resetForm();
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          // 关闭Modal的loading状态
          modalApi.setState({ loading: false });
        }
      });
    } else {
      // 弹窗关闭时立即重置状态
      formData.value = {};
      modalApi.setState({ loading: false });
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm"> 重置</Button>
      </div>
    </template>
  </Modal>
</template>
