<script lang="ts" setup>
import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { computed, onMounted, onUnmounted, ref } from 'vue';

import { Card, Col, Row, Statistic } from 'ant-design-vue';

import { getMonitorOverview } from '#/api/monitor/metrics';

interface OverviewCardData {
  title: string;
  value: number | string;
  suffix?: string;
  precision?: number;
  valueStyle?: Record<string, any>;
  prefix?: any;
}

const loading = ref(false);
const overviewData = ref<MonitorTypes.MonitorOverviewDTO>({});
const refreshTimer = ref<NodeJS.Timeout | null>(null);

// 计算卡片数据
const cardData = computed<OverviewCardData[]>(() => {
  const data = overviewData.value;
  return [
    {
      title: 'CPU使用率',
      value: data.system?.cpuUsage || 0,
      suffix: '%',
      precision: 1,
      valueStyle: {
        color: (data.system?.cpuUsage || 0) > 80 ? '#cf1322' : '#3f8600',
      },
    },
    {
      title: '内存使用率',
      value: data.system?.memoryUsage || 0,
      suffix: '%',
      precision: 1,
      valueStyle: {
        color: (data.system?.memoryUsage || 0) > 85 ? '#cf1322' : '#3f8600',
      },
    },
    {
      title: 'JVM堆内存',
      value: data.jvm?.heapUsage || 0,
      suffix: '%',
      precision: 1,
      valueStyle: {
        color: (data.jvm?.heapUsage || 0) > 90 ? '#cf1322' : '#3f8600',
      },
    },
    {
      title: 'JVM线程数',
      value: data.jvm?.threadCount || 0,
      valueStyle: {
        color: '#1890ff',
      },
    },
    {
      title: 'Redis连接数',
      value: data.redis?.connectedClients || 0,
      valueStyle: {
        color: '#722ed1',
      },
    },
    {
      title: 'Redis命中率',
      value: data.redis?.hitRate || 0,
      suffix: '%',
      precision: 2,
      valueStyle: {
        color: (data.redis?.hitRate || 0) > 90 ? '#3f8600' : '#fa8c16',
      },
    },
    {
      title: '平均响应时间',
      value: data.spring?.averageResponseTime || 0,
      suffix: 'ms',
      precision: 2,
      valueStyle: {
        color:
          (data.spring?.averageResponseTime || 0) > 1000
            ? '#cf1322'
            : '#3f8600',
      },
    },
    {
      title: '总请求数',
      value: data.spring?.totalRequests || '0',
      valueStyle: {
        color: '#13c2c2',
      },
    },
  ];
});

// 获取概览数据
const fetchOverviewData = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }
    overviewData.value = await getMonitorOverview();
  } catch (error) {
    console.error('获取监控概览数据失败:', error);
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

// 启动定时刷新
const startRefresh = () => {
  refreshTimer.value = setInterval(() => {
    fetchOverviewData(false); // 定时刷新时不显示loading
  }, 5000); // 5秒刷新一次
};

// 停止定时刷新
const stopRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
};

onMounted(() => {
  fetchOverviewData(true); // 初始加载显示loading
  startRefresh();
});

onUnmounted(() => {
  stopRefresh();
});
</script>

<template>
  <div class="overview-dashboard">
    <Row :gutter="[16, 16]">
      <Col
        v-for="(item, index) in cardData"
        :key="index"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="6"
      >
        <Card :loading="loading" class="h-full">
          <Statistic
            :title="item.title"
            :value="item.value"
            :precision="item.precision"
            :suffix="item.suffix"
            :prefix="item.prefix"
            :value-style="item.valueStyle"
          />
        </Card>
      </Col>
    </Row>

    <!-- 系统状态指示器 -->
    <Row :gutter="[16, 16]" class="mt-4">
      <Col :span="24">
        <Card title="系统状态" :loading="loading">
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center space-x-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-green-500': (overviewData.system?.cpuUsage || 0) < 70,
                  'bg-yellow-500':
                    (overviewData.system?.cpuUsage || 0) >= 70 &&
                    (overviewData.system?.cpuUsage || 0) < 85,
                  'bg-red-500': (overviewData.system?.cpuUsage || 0) >= 85,
                }"
              ></div>
              <span class="text-sm text-gray-600">CPU状态</span>
            </div>
            <div class="flex items-center space-x-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-green-500': (overviewData.system?.memoryUsage || 0) < 80,
                  'bg-yellow-500':
                    (overviewData.system?.memoryUsage || 0) >= 80 &&
                    (overviewData.system?.memoryUsage || 0) < 90,
                  'bg-red-500': (overviewData.system?.memoryUsage || 0) >= 90,
                }"
              ></div>
              <span class="text-sm text-gray-600">内存状态</span>
            </div>
            <div class="flex items-center space-x-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-green-500': (overviewData.jvm?.heapUsage || 0) < 85,
                  'bg-yellow-500':
                    (overviewData.jvm?.heapUsage || 0) >= 85 &&
                    (overviewData.jvm?.heapUsage || 0) < 95,
                  'bg-red-500': (overviewData.jvm?.heapUsage || 0) >= 95,
                }"
              ></div>
              <span class="text-sm text-gray-600">JVM状态</span>
            </div>
            <div class="flex items-center space-x-2">
              <div
                class="h-3 w-3 rounded-full"
                :class="{
                  'bg-green-500':
                    (overviewData.redis?.connectedClients || 0) > 0,
                  'bg-red-500':
                    (overviewData.redis?.connectedClients || 0) === 0,
                }"
              ></div>
              <span class="text-sm text-gray-600">Redis状态</span>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.overview-dashboard {
  @apply p-4;
}
</style>
