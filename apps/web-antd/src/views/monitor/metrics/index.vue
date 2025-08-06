<script lang="ts" setup>
import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card, Tabs } from 'ant-design-vue';

import { getMonitorConfig } from '#/api/monitor/metrics';

import JvmMetrics from './modules/jvm-metrics.vue';
import OverviewDashboard from './modules/overview-dashboard.vue';
import RedisMetrics from './modules/redis-metrics.vue';
import SpringMetrics from './modules/spring-metrics.vue';
import SystemMetrics from './modules/system-metrics.vue';

const loading = ref(false);
const activeTab = ref('overview');
const config = ref<MonitorTypes.MonitorConfigDTO>({});

// 获取监控配置
const fetchConfig = async () => {
  try {
    loading.value = true;
    const response = await getMonitorConfig();
    config.value = response;
  } catch (error) {
    console.error('获取监控配置失败:', error);
  } finally {
    loading.value = false;
  }
};

// 检查功能是否启用
const isFeatureEnabled = (feature: string): boolean => {
  return config.value.features?.includes(feature) || false;
};

onMounted(() => {
  fetchConfig();
});
</script>

<template>
  <Page>
    <div class="monitoring-dashboard">
      <Card :loading="loading" class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-green-500': config.enabled,
                  'bg-red-500': !config.enabled,
                }"
              ></div>
              <span class="text-sm font-medium">
                监控状态: {{ config.enabled ? '启用' : '禁用' }}
              </span>
            </div>
            <div class="dark:text-muted-foreground text-sm text-gray-500">
              版本: {{ config.version || 'Unknown' }}
            </div>
            <div class="dark:text-muted-foreground text-sm text-gray-500">
              更新时间: {{ config.updateTime || 'Unknown' }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="dark:text-muted-foreground text-sm text-gray-500"
              >启用功能:</span
            >
            <div class="flex space-x-1">
              <span
                v-for="feature in config.features || []"
                :key="feature"
                class="dark:bg-primary/20 dark:text-primary inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                {{ feature.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Tabs v-model:active-key="activeTab" type="card" class="monitoring-tabs">
        <Tabs.TabPane key="overview" tab="监控概览">
          <OverviewDashboard />
        </Tabs.TabPane>

        <Tabs.TabPane
          v-if="isFeatureEnabled('system')"
          key="system"
          tab="系统监控"
        >
          <SystemMetrics />
        </Tabs.TabPane>

        <Tabs.TabPane v-if="isFeatureEnabled('jvm')" key="jvm" tab="JVM监控">
          <JvmMetrics />
        </Tabs.TabPane>

        <Tabs.TabPane
          v-if="isFeatureEnabled('redis')"
          key="redis"
          tab="Redis监控"
        >
          <RedisMetrics />
        </Tabs.TabPane>

        <Tabs.TabPane
          v-if="isFeatureEnabled('spring')"
          key="spring"
          tab="Spring监控"
        >
          <SpringMetrics />
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
