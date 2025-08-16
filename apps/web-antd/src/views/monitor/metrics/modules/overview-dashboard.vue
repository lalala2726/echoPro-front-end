<script lang="ts" setup>
import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { computed, onMounted, onUnmounted, ref } from 'vue';

import { Card, Col, Descriptions, Row, Statistic, Tag } from 'ant-design-vue';

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

// 格式化运行时间
const formatUptime = (uptime: number): string => {
  if (!uptime) return '0s';
  const seconds = Math.floor(uptime / 1000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${secs}秒`;
  } else {
    return `${secs}秒`;
  }
};

// 计算卡片数据
const cardData = computed<OverviewCardData[]>(() => {
  const data = overviewData.value;
  return [
    {
      title: 'CPU使用率',
      value: data.system?.cpuUsage || 0,
      suffix: '%',
      precision: 2,
      valueStyle: {
        color: (data.system?.cpuUsage || 0) > 80 ? '#cf1322' : '#3f8600',
      },
    },
    {
      title: '内存使用率',
      value: data.system?.memoryUsage || 0,
      suffix: '%',
      precision: 2,
      valueStyle: {
        color: (data.system?.memoryUsage || 0) > 85 ? '#cf1322' : '#3f8600',
      },
    },
    {
      title: '磁盘数量',
      value: data.system?.diskCount || 0,
      valueStyle: {
        color: '#52c41a',
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
      title: 'JVM非堆内存',
      value: data.jvm?.nonHeapUsage || 0,
      suffix: '%',
      precision: 2,
      valueStyle: {
        color: (data.jvm?.nonHeapUsage || 0) > 95 ? '#cf1322' : '#3f8600',
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
      title: 'JVM GC次数',
      value: data.jvm?.gcCount || '0',
      valueStyle: {
        color: '#722ed1',
      },
    },
    {
      title: 'Redis连接数',
      value: data.redis?.connectedClients || 0,
      valueStyle: {
        color: '#fa8c16',
      },
    },
    {
      title: 'Redis内存',
      value: data.redis?.usedMemory || '0B',
      valueStyle: {
        color: '#13c2c2',
      },
    },
    {
      title: 'Redis每秒操作',
      value: data.redis?.opsPerSec || 0,
      valueStyle: {
        color: '#eb2f96',
      },
    },
    {
      title: 'Redis命中率',
      value: data.redis?.hitRate || 0,
      suffix: '%',
      precision: 1,
      valueStyle: {
        color: (data.redis?.hitRate || 0) > 90 ? '#3f8600' : '#fa8c16',
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
    <!-- 系统状态 - 最上面占据一行 -->
    <Row :gutter="[16, 16]" class="mb-4">
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

    <!-- 应用信息 - 第二行占据一行 -->
    <Row :gutter="[16, 16]" class="mb-4">
      <Col :span="24">
        <Card title="应用信息" :loading="loading" class="info-card">
          <Descriptions :column="{ xs: 1, sm: 2, md: 3 }" bordered size="small">
            <Descriptions.Item label="应用名称">
              {{ overviewData.springOverview?.name || 'Unknown' }}
            </Descriptions.Item>
            <Descriptions.Item label="启动时间">
              {{ overviewData.springOverview?.startTime || 'Unknown' }}
            </Descriptions.Item>
            <Descriptions.Item label="运行时间">
              {{ formatUptime(overviewData.springOverview?.uptime || 0) }}
            </Descriptions.Item>
            <Descriptions.Item label="活跃配置">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="profile in overviewData.springOverview
                    ?.activeProfiles || []"
                  :key="profile"
                  color="blue"
                >
                  {{ profile }}
                </Tag>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>

    <!-- 监控指标卡片 -->
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
  </div>
</template>

<style scoped>
.overview-dashboard {
  @apply p-4;
}

.info-card {
  @apply dark:bg-card dark:border-border h-full border-0 shadow-sm;
}
</style>
