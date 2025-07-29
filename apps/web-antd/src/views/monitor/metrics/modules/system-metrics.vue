<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { computed, h, onMounted, onUnmounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card, Progress, Statistic, Table } from 'ant-design-vue';

import { getSystemMetrics } from '#/api/monitor/metrics';

const loading = ref(false);
const systemData = ref<MonitorTypes.SystemMetricsDTO>({});
const refreshTimer = ref<NodeJS.Timeout | null>(null);

// CPU使用率图表
const cpuChartRef = ref<EchartsUIType>();
const { renderEcharts: renderCpuChart } = useEcharts(cpuChartRef);

// 内存使用图表
const memoryChartRef = ref<EchartsUIType>();
const { renderEcharts: renderMemoryChart } = useEcharts(memoryChartRef);

// 磁盘表格列定义
const diskColumns = [
  {
    title: '磁盘名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '挂载点',
    dataIndex: 'mountPoint',
    key: 'mountPoint',
  },
  {
    title: '文件系统',
    dataIndex: 'fileSystem',
    key: 'fileSystem',
  },
  {
    title: '总空间',
    dataIndex: 'total',
    key: 'total',
    customRender: ({ text }: { text: number }) => formatBytes(text),
  },
  {
    title: '已用空间',
    dataIndex: 'used',
    key: 'used',
    customRender: ({ text }: { text: number }) => formatBytes(text),
  },
  {
    title: '可用空间',
    dataIndex: 'available',
    key: 'available',
    customRender: ({ text }: { text: number }) => formatBytes(text),
  },
  {
    title: '使用率',
    dataIndex: 'usage',
    key: 'usage',
    customRender: ({ text }: { text: number }) =>
      h(Progress, {
        percent: text,
        size: 'small',
        status: text > 90 ? 'exception' : text > 80 ? 'active' : 'success',
      }),
  },
];

// 格式化字节数
const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// 格式化频率
const formatFrequency = (hz: number): string => {
  if (!hz) return '0 Hz';
  const ghz = hz / 1_000_000_000;
  return `${ghz.toFixed(2)} GHz`;
};

// CPU核心使用率数据
const cpuCoreData = computed(() => {
  const coreUsages = systemData.value.cpu?.coreUsages || [];
  return coreUsages.map((usage, index) => ({
    name: `核心 ${index + 1}`,
    value: usage,
  }));
});

// 获取系统监控数据
const fetchSystemData = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }
    systemData.value = await getSystemMetrics();

    // 更新图表
    updateCharts();
  } catch (error) {
    console.error('获取系统监控数据失败:', error);
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

// 更新图表
const updateCharts = () => {
  // 更新CPU核心使用率图表
  renderCpuChart({
    title: {
      text: 'CPU核心使用率',
      left: 'center',
      textStyle: {
        fontSize: 14,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%',
    },
    xAxis: {
      type: 'category',
      data: cpuCoreData.value.map((item) => item.name),
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
        data: cpuCoreData.value.map((item) => ({
          value: item.value,
          itemStyle: {
            color:
                item.value > 80
                  ? '#ff4d4f'
                  : item.value > 60
                    ? '#faad14'
                    : '#52c41a',
          },
        })),
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

  // 更新内存使用图表
  const memoryData = systemData.value.memory;
  if (memoryData) {
    const used = memoryData.used || 0;
    const available = memoryData.available || 0;

    renderMemoryChart({
      title: {
        text: '内存使用分布',
        left: 'center',
        textStyle: {
          fontSize: 14,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        bottom: '5%',
        left: 'center',
      },
      series: [
        {
          name: '内存使用',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data: [
            {
              value: used,
              name: `已使用 (${formatBytes(used)})`,
              itemStyle: { color: '#ff7875' },
            },
            {
              value: available,
              name: `可用 (${formatBytes(available)})`,
              itemStyle: { color: '#73d13d' },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
  }
};

// 启动定时刷新
const startRefresh = () => {
  refreshTimer.value = setInterval(() => {
    fetchSystemData(false); // 定时刷新时不显示loading
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
  fetchSystemData(true); // 初始加载显示loading
  startRefresh();
});

onUnmounted(() => {
  stopRefresh();
});
</script>

<template>
  <div class="system-metrics">
    <!-- 核心指标网格 -->
    <div class="metrics-grid">
      <!-- CPU信息 -->
      <div class="metric-row">
        <Card title="CPU信息" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-2 gap-6">
            <Statistic
              title="CPU名称"
              :value="systemData.cpu?.name || 'Unknown'"
            />
            <Statistic
              title="使用率"
              :value="systemData.cpu?.usage || 0"
              suffix="%"
              :precision="1"
              :value-style="{
                color:
                  (systemData.cpu?.usage || 0) > 80 ? '#cf1322' : '#3f8600',
              }"
            />
            <Statistic
              title="逻辑处理器"
              :value="systemData.cpu?.logicalProcessorCount || 0"
            />
            <Statistic
              title="物理处理器"
              :value="systemData.cpu?.physicalProcessorCount || 0"
            />
            <Statistic
              title="频率"
              :value="formatFrequency(systemData.cpu?.frequency || 0)"
            />
            <Statistic
              title="最大频率"
              :value="formatFrequency(systemData.cpu?.maxFrequency || 0)"
            />
          </div>
        </Card>
        <Card title="CPU核心使用率" :loading="loading" class="chart-card">
          <div class="chart-container">
            <EchartsUI ref="cpuChartRef" style="height: 100%" />
          </div>
        </Card>
      </div>

      <!-- 内存信息 -->
      <div class="metric-row">
        <Card title="内存信息" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-2 gap-6">
            <Statistic
              title="总内存"
              :value="formatBytes(systemData.memory?.total || 0)"
            />
            <Statistic
              title="使用率"
              :value="systemData.memory?.usage || 0"
              suffix="%"
              :precision="1"
              :value-style="{
                color:
                  (systemData.memory?.usage || 0) > 85 ? '#cf1322' : '#3f8600',
              }"
            />
            <Statistic
              title="已使用"
              :value="formatBytes(systemData.memory?.used || 0)"
              :value-style="{ color: '#ff7875' }"
            />
            <Statistic
              title="可用"
              :value="formatBytes(systemData.memory?.available || 0)"
              :value-style="{ color: '#73d13d' }"
            />
          </div>
        </Card>
        <Card title="内存使用分布" :loading="loading" class="chart-card">
          <div class="chart-container">
            <EchartsUI ref="memoryChartRef" style="height: 100%" />
          </div>
        </Card>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="metrics-section">
      <Card title="磁盘信息" :loading="loading" class="table-card">
        <Table
          :columns="diskColumns"
          :data-source="systemData.disks || []"
          :pagination="false"
          size="small"
          row-key="name"
        />
      </Card>
    </div>
  </div>
</template>

<style scoped>
.system-metrics {
  @apply min-h-full bg-gray-50/30;
}

.metrics-section {
  @apply mb-6;
}

.metrics-section:last-child {
  @apply mb-0;
}

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

.system-metrics :deep(.ant-card) {
  @apply rounded-lg;
}

.system-metrics :deep(.ant-card-head) {
  @apply border-b border-gray-100 bg-white/80;
}

.system-metrics :deep(.ant-card-body) {
  @apply bg-white p-6;
}

.system-metrics :deep(.ant-statistic-title) {
  @apply mb-2 text-sm font-medium text-gray-600;
}

.system-metrics :deep(.ant-statistic-content) {
  @apply text-xl font-semibold;
}

.system-metrics :deep(.ant-table) {
  @apply text-sm;
}

.system-metrics :deep(.ant-table-thead > tr > th) {
  @apply bg-gray-50/80 font-semibold text-gray-700;
}
</style>
