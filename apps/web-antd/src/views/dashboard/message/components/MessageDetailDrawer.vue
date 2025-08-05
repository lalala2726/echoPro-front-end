<script lang="ts" setup>
import type { SystemMessageType } from '#/api/system/message';

import { Drawer } from 'ant-design-vue';

interface Props {
  visible: boolean;
  messageDetail: null | SystemMessageType.UserMessageVo;
  loading?: boolean;
}

interface Emits {
  (e: 'close'): void;
}

defineOptions({
  name: 'MessageDetailDrawer',
});

const emit = defineEmits<Emits>();

props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Drawer
    :open="visible"
    :width="600"
    title="消息详情"
    placement="right"
    @close="handleClose"
  >
    <div v-if="messageDetail" class="message-detail-content">
      <h3>{{ messageDetail.title }}</h3>
      <div v-html="messageDetail.content"></div>
    </div>
    <div v-else class="text-center text-gray-500">暂无消息详情</div>
  </Drawer>
</template>

<style scoped>
.message-detail-content {
  @apply space-y-4;
}
</style>
