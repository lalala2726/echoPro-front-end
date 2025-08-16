<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { Tabs } from 'ant-design-vue';

import JvmMetrics from './modules/jvm-metrics.vue';
import OverviewDashboard from './modules/overview-dashboard.vue';
import RedisMetrics from './modules/redis-metrics.vue';
import SystemMetrics from './modules/system-metrics.vue';

const activeTab = ref('overview');
const componentKey = ref(0);

// 监听activeTab变化，强制重新创建组件实例
watch(activeTab, () => {
  componentKey.value++;
});
</script>

<template>
  <Page>
    <div class="monitoring-dashboard">
      <Tabs v-model:active-key="activeTab" type="card" class="monitoring-tabs">
        <Tabs.TabPane key="overview" tab="监控概览">
          <OverviewDashboard
            v-if="activeTab === 'overview'"
            :key="`overview-${componentKey}`"
          />
        </Tabs.TabPane>

        <Tabs.TabPane key="system" tab="系统监控">
          <SystemMetrics
            v-if="activeTab === 'system'"
            :key="`system-${componentKey}`"
          />
        </Tabs.TabPane>

        <Tabs.TabPane key="jvm" tab="JVM监控">
          <JvmMetrics v-if="activeTab === 'jvm'" :key="`jvm-${componentKey}`" />
        </Tabs.TabPane>

        <Tabs.TabPane key="redis" tab="Redis监控">
          <RedisMetrics
            v-if="activeTab === 'redis'"
            :key="`redis-${componentKey}`"
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  </Page>
</template>

<style scoped>
.monitoring-dashboard {
  @apply dark:bg-background min-h-screen bg-gray-50 p-4;
}
</style>
