<script lang="ts" setup>
import { computed } from 'vue';

import { Tabs } from 'ant-design-vue';

import { DashBoardMessageType } from '#/api/dashboard/message';

interface TabItem {
  key: 'all' | DashBoardMessageType.MessageType;
  label: string;
  count?: number;
}

interface Props {
  activeTab: 'all' | DashBoardMessageType.MessageType;
  loading?: boolean;
  unreadCount?: number;
  readCount?: number;
}

interface Emits {
  (e: 'change', key: 'all' | DashBoardMessageType.MessageType): void;
}

defineOptions({
  name: 'MessageFilterTabs',
});

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  unreadCount: 0,
  readCount: 0,
});

const emit = defineEmits<Emits>();

// Tab配置
const tabs = computed<TabItem[]>(() => [
  {
    key: 'all',
    label: '全部消息',
    count: (props.readCount || 0) + (props.unreadCount || 0),
  },
  { key: DashBoardMessageType.MessageType.SYSTEM, label: '系统消息' },
  { key: DashBoardMessageType.MessageType.NOTICE, label: '通知消息' },
  { key: DashBoardMessageType.MessageType.ANNOUNCEMENT, label: '公告消息' },
]);

// Tab切换处理
const handleTabChange = (activeKey: string) => {
  const key = (
    activeKey === 'all'
      ? 'all'
      : (activeKey as DashBoardMessageType.MessageType)
  ) as 'all' | DashBoardMessageType.MessageType;
  emit('change', key);
};
</script>

<template>
  <div class="message-filter-tabs mb-4">
    <Tabs
      :active-key="String(activeTab)"
      :tab-bar-style="{ marginBottom: '0' }"
      @change="handleTabChange"
    >
      <Tabs.TabPane
        v-for="tab in tabs"
        :key="String(tab.key)"
        :disabled="loading"
      >
        <template #tab>
          <span>
            {{ tab.label }}
            <span
              v-if="tab.count !== undefined"
              class="ml-1 text-xs text-gray-500 dark:text-gray-400"
            >
              ({{ tab.count }})
            </span>
          </span>
        </template>
      </Tabs.TabPane>
    </Tabs>
  </div>
</template>

<style scoped>
.message-filter-tabs :deep(.ant-tabs-nav) {
  @apply mb-0;
}

.message-filter-tabs :deep(.ant-tabs-tab) {
  @apply transition-colors duration-200;
}

.message-filter-tabs :deep(.ant-tabs-tab:hover) {
  @apply text-blue-600 dark:text-blue-400;
}

.message-filter-tabs :deep(.ant-tabs-tab-active) {
  @apply text-blue-600 dark:text-blue-400;
}

.message-filter-tabs :deep(.ant-tabs-ink-bar) {
  @apply bg-blue-600 dark:bg-blue-400;
}
</style>
