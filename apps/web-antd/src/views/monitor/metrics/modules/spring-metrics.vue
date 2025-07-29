<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { computed, h, onMounted, onUnmounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
} from 'ant-design-vue';

import { getSpringMetrics } from '#/api/monitor/metrics';

const loading = ref(false);
const springData = ref<MonitorTypes.SpringMetricsDTO>({});
const refreshTimer = ref<NodeJS.Timeout | null>(null);

// 线程池使用图表
const threadPoolChartRef = ref<EchartsUIType>();
const { renderEcharts: renderThreadPoolChart } = useEcharts(threadPoolChartRef);

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

// 线程池表格列定义
const threadPoolColumns = [
  {
    title: '线程池名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '核心线程数',
    dataIndex: 'corePoolSize',
    key: 'corePoolSize',
  },
  {
    title: '最大线程数',
    dataIndex: 'maximumPoolSize',
    key: 'maximumPoolSize',
  },
  {
    title: '当前线程数',
    dataIndex: 'poolSize',
    key: 'poolSize',
  },
  {
    title: '活跃线程数',
    dataIndex: 'activeCount',
    key: 'activeCount',
  },
  {
    title: '队列大小',
    dataIndex: 'queueSize',
    key: 'queueSize',
  },
  {
    title: '使用率',
    dataIndex: 'usage',
    key: 'usage',
    customRender: ({ text }: { text: number }) =>
      h(Progress, {
        percent: text,
        size: 'small',
        status: text > 90 ? 'exception' : (text > 80 ? 'active' : 'success'),
      }),
  },
];

// 线程池数据
const threadPoolData = computed(() => {
  const threadPools = springData.value.threadPools || {};
  return Object.entries(threadPools).map(([name, pool]) => ({
    key: name,
    name,
    ...pool,
  }));
});

// 获取Spring监控数据
const fetchSpringData = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }
    const response = await getSpringMetrics();
    springData.value = response;

    // 更新图表
    updateCharts();
  } catch (error) {
    console.error('获取Spring监控数据失败:', error);
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

// 更新图表
const updateCharts = () => {
  // 更新线程池使用图表 - 始终显示图表
  const hasThreadPoolData = threadPoolData.value.length > 0;
  renderThreadPoolChart({
    title: {
      text: '线程池使用率',
      left: 'center',
      textStyle: {
        fontSize: 14,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: hasThreadPoolData
        ? threadPoolData.value.map((item) => item.name)
        : ['暂无数据'],
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        type: 'bar',
        data: hasThreadPoolData
          ? threadPoolData.value.map((item) => ({
              value: item.usage || 0,
              itemStyle: {
                color:
                  (item.usage || 0) > 80
                    ? '#ff4d4f'
                    : (item.usage || 0) > 60
                      ? '#faad14'
                      : '#52c41a',
              },
            }))
          : [
              {
                value: 0,
                itemStyle: { color: '#d9d9d9' },
              },
            ],
        barWidth: '60%',
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
  });
};

// 启动定时刷新
const startRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
  }
  refreshTimer.value = setInterval(() => {
    fetchSpringData(false); // 定时刷新时不显示loading
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
  fetchSpringData(true); // 初始加载显示loading
  startRefresh();
});

onUnmounted(() => {
  stopRefresh();
});
</script>

<template>
  <div class="spring-metrics">
    <!-- 应用信息 -->
    <div class="metrics-section">
      <Card title="应用信息" :loading="loading" class="info-card">
        <Descriptions :column="{ xs: 1, sm: 2, md: 3 }" bordered size="small">
          <Descriptions.Item label="应用名称">
            {{ springData.application?.name || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="应用版本">
            {{ springData.application?.version || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="Spring Boot版本">
            {{ springData.application?.springBootVersion || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="启动时间">
            {{ springData.application?.startTime || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="运行时间">
            {{ formatUptime(springData.application?.uptime || 0) }}
          </Descriptions.Item>
          <Descriptions.Item label="活跃配置">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="profile in springData.application?.activeProfiles || []"
                :key="profile"
                color="blue"
              >
                {{ profile }}
              </Tag>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>

    <!-- 资源监控 -->
    <div class="metrics-section">
      <Row :gutter="[16, 16]">
        <Col :xs="24" :xl="12">
          <Card title="数据源统计" :loading="loading" class="metrics-card">
            <div class="metrics-grid">
              <div class="metric-row">
                <Statistic
                  title="活跃连接数"
                  :value="springData.dataSource?.active || 0"
                  :value-style="{ color: '#1890ff' }"
                />
                <Statistic
                  title="最大连接数"
                  :value="springData.dataSource?.max || 0"
                  :value-style="{ color: '#52c41a' }"
                />
              </div>
              <div class="metric-row">
                <Statistic
                  title="空闲连接数"
                  :value="springData.dataSource?.idle || 0"
                  :value-style="{ color: '#722ed1' }"
                />
                <Statistic
                  title="连接池使用率"
                  :value="springData.dataSource?.usage || 0"
                  suffix="%"
                  :precision="1"
                  :value-style="{
                    color:
                      (springData.dataSource?.usage || 0) > 80
                        ? '#cf1322'
                        : '#3f8600',
                  }"
                />
              </div>
              <div class="metric-row">
                <Statistic
                  title="最小连接数"
                  :value="springData.dataSource?.min || 0"
                  :value-style="{ color: '#faad14' }"
                />
                <Statistic
                  title="等待线程数"
                  :value="springData.dataSource?.waitingThreads || 0"
                  :value-style="{ color: '#ff4d4f' }"
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col :xs="24" :xl="12">
          <Card title="线程池使用率" :loading="loading" class="chart-card">
            <EchartsUI ref="threadPoolChartRef" class="chart-container" />
          </Card>
        </Col>
      </Row>
    </div>

    <!-- 详细数据表格 -->
    <div class="metrics-section" v-if="threadPoolData.length > 0">
      <Card title="线程池详情" :loading="loading" class="table-card">
        <Table
          :columns="threadPoolColumns"
          :data-source="threadPoolData"
          :pagination="false"
          size="small"
          row-key="key"
        />
      </Card>
    </div>
  </div>
</template>

<style scoped>
.spring-metrics {
  @apply relative min-h-full bg-gray-50/30;
}

.refresh-control {
  @apply absolute right-4 top-4 z-10 flex items-center gap-2;
}

.refresh-label {
  @apply text-sm text-gray-600;
}

.metrics-section {
  @apply mb-6;
}

.metrics-section:last-child {
  @apply mb-0;
}

.info-card,
.metrics-card,
.chart-card,
.table-card {
  @apply h-full border-0 shadow-sm;
}

.metrics-grid {
  @apply space-y-6;
}

.metric-row {
  @apply grid grid-cols-2 gap-4;
}

.chart-container {
  @apply h-80;
}

.spring-metrics :deep(.ant-card) {
  @apply rounded-lg;
}

.spring-metrics :deep(.ant-card-head) {
  @apply border-b border-gray-100 bg-white/80;
}

.spring-metrics :deep(.ant-card-body) {
  @apply bg-white p-6;
}

.spring-metrics :deep(.ant-statistic-title) {
  @apply mb-2 text-sm font-medium text-gray-600;
}

.spring-metrics :deep(.ant-statistic-content) {
  @apply text-xl font-semibold;
}

.spring-metrics :deep(.ant-descriptions-item-label) {
  @apply font-medium text-gray-700;
}

.spring-metrics :deep(.ant-table) {
  @apply text-sm;
}

.spring-metrics :deep(.ant-table-thead > tr > th) {
  @apply bg-gray-50/80 font-semibold text-gray-700;
}
</style>
