<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { computed, h, onMounted, onUnmounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card, Descriptions, Progress, Statistic, Table } from 'ant-design-vue';

import { getJvmMetrics } from '#/api/monitor/metrics';

const loading = ref(false);
const jvmData = ref<MonitorTypes.JvmMetricsDTO>({});
const refreshTimer = ref<NodeJS.Timeout | null>(null);

// 内存使用图表
const memoryChartRef = ref<EchartsUIType>();
const { renderEcharts: renderMemoryChart } = useEcharts(memoryChartRef);

// 线程状态图表
const threadChartRef = ref<EchartsUIType>();
const { renderEcharts: renderThreadChart } = useEcharts(threadChartRef);

// 格式化字节数
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === -1) return 'N/A';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

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

// 内存池表格列定义
const memoryPoolColumns = [
  {
    title: '内存池名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '已使用',
    dataIndex: 'used',
    key: 'used',
    customRender: ({ text }: { text: number }) => formatBytes(text),
  },
  {
    title: '已提交',
    dataIndex: 'committed',
    key: 'committed',
    customRender: ({ text }: { text: number }) => formatBytes(text),
  },
  {
    title: '最大值',
    dataIndex: 'max',
    key: 'max',
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

// 内存池数据
const memoryPoolData = computed(() => {
  const pools = jvmData.value.memory?.memoryPools || {};
  return Object.entries(pools).map(([name, pool]) => ({
    key: name,
    name,
    ...pool,
  }));
});

// GC表格列定义
const gcColumns = [
  {
    title: 'GC名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '回收次数',
    dataIndex: 'collectionCount',
    key: 'collectionCount',
  },
  {
    title: '总时间(ms)',
    dataIndex: 'collectionTime',
    key: 'collectionTime',
  },
  {
    title: '平均时间(ms)',
    dataIndex: 'averageCollectionTime',
    key: 'averageCollectionTime',
    customRender: ({ text }: { text: number }) => text?.toFixed(2),
  },
];

// 线程状态数据
const threadStateData = computed(() => {
  const states = jvmData.value.threads?.threadStates || {};
  return Object.entries(states).map(([state, count]) => ({
    name: state,
    value: count,
  }));
});

// 获取JVM监控数据
const fetchJvmData = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }
    const response = await getJvmMetrics();
    jvmData.value = response;

    // 更新图表
    updateCharts();
  } catch (error) {
    console.error('获取JVM监控数据失败:', error);
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

// 更新图表
const updateCharts = () => {
  // 更新内存使用图表
  const memory = jvmData.value.memory;
  if (memory?.heap && memory?.nonHeap) {
    renderMemoryChart({
      title: {
        text: 'JVM内存使用情况',
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
          name: 'JVM内存',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data: [
            {
              value: memory.heap.used || 0,
              name: `堆内存已使用 (${formatBytes(memory.heap.used || 0)})`,
              itemStyle: { color: '#ff7875' },
            },
            {
              value: (memory.heap.committed || 0) - (memory.heap.used || 0),
              name: `堆内存可用 (${formatBytes((memory.heap.committed || 0) - (memory.heap.used || 0))})`,
              itemStyle: { color: '#73d13d' },
            },
            {
              value: memory.nonHeap.used || 0,
              name: `非堆内存 (${formatBytes(memory.nonHeap.used || 0)})`,
              itemStyle: { color: '#40a9ff' },
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

  // 更新线程状态图表
  if (threadStateData.value.length > 0) {
    renderThreadChart({
      title: {
        text: '线程状态分布',
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
        data: threadStateData.value.map((item) => item.name),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          data: threadStateData.value.map((item) => ({
            value: item.value,
            itemStyle: {
              color: getThreadStateColor(item.name),
            },
          })),
          barWidth: '60%',
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    });
  }
};

// 获取线程状态颜色
const getThreadStateColor = (state: string): string => {
  const colorMap: Record<string, string> = {
    RUNNABLE: '#52c41a',
    WAITING: '#faad14',
    TIMED_WAITING: '#1890ff',
    BLOCKED: '#ff4d4f',
    NEW: '#722ed1',
    TERMINATED: '#8c8c8c',
  };
  return colorMap[state] || '#8c8c8c';
};

// 启动定时刷新
const startRefresh = () => {
  refreshTimer.value = setInterval(() => {
    fetchJvmData(false); // 定时刷新时不显示loading
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
  fetchJvmData(true); // 初始加载显示loading
  startRefresh();
});

onUnmounted(() => {
  stopRefresh();
});
</script>

<template>
  <div class="jvm-metrics">
    <!-- JVM基本信息 -->
    <div class="metrics-section">
      <Card title="JVM基本信息" :loading="loading" class="info-card">
        <Descriptions :column="2" bordered size="small">
          <Descriptions.Item label="JVM名称">
            {{ jvmData.jvmInfo?.name || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="JVM版本">
            {{ jvmData.jvmInfo?.version || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="供应商">
            {{ jvmData.jvmInfo?.vendor || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="Java版本">
            {{ jvmData.jvmInfo?.javaVersion || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="启动时间">
            {{ jvmData.jvmInfo?.startTime || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="运行时间">
            {{ formatUptime(jvmData.jvmInfo?.uptime || 0) }}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>

    <!-- 核心指标网格 -->
    <div class="metrics-grid">
      <!-- 内存统计 -->
      <div class="metric-row">
        <Card title="内存统计" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-2 gap-6">
            <Statistic
              title="堆内存使用率"
              :value="jvmData.memory?.heap?.usage || 0"
              suffix="%"
              :precision="1"
              :value-style="{
                color:
                  (jvmData.memory?.heap?.usage || 0) > 90
                    ? '#cf1322'
                    : '#3f8600',
              }"
            />
            <Statistic
              title="非堆内存使用率"
              :value="jvmData.memory?.nonHeap?.usage || 0"
              suffix="%"
              :precision="1"
              :value-style="{
                color:
                  (jvmData.memory?.nonHeap?.usage || 0) > 95
                    ? '#cf1322'
                    : '#3f8600',
              }"
            />
            <Statistic
              title="堆内存已使用"
              :value="formatBytes(jvmData.memory?.heap?.used || 0)"
            />
            <Statistic
              title="堆内存最大值"
              :value="formatBytes(jvmData.memory?.heap?.max || 0)"
            />
          </div>
        </Card>
        <Card title="内存使用分布" :loading="loading" class="chart-card">
          <div class="chart-container">
            <EchartsUI ref="memoryChartRef" style="height: 100%" />
          </div>
        </Card>
      </div>

      <!-- 线程统计 -->
      <div class="metric-row">
        <Card title="线程统计" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-2 gap-6">
            <Statistic
              title="当前线程数"
              :value="jvmData.threads?.threadCount || 0"
              :value-style="{ color: '#1890ff' }"
            />
            <Statistic
              title="守护线程数"
              :value="jvmData.threads?.daemonThreadCount || 0"
              :value-style="{ color: '#52c41a' }"
            />
            <Statistic
              title="峰值线程数"
              :value="jvmData.threads?.peakThreadCount || 0"
              :value-style="{ color: '#faad14' }"
            />
            <Statistic
              title="死锁线程数"
              :value="jvmData.threads?.deadlockedThreadCount || 0"
              :value-style="{
                color:
                  (jvmData.threads?.deadlockedThreadCount || 0) > 0
                    ? '#cf1322'
                    : '#3f8600',
              }"
            />
          </div>
        </Card>
        <Card title="线程状态分布" :loading="loading" class="chart-card">
          <div class="chart-container">
            <EchartsUI ref="threadChartRef" style="height: 100%" />
          </div>
        </Card>
      </div>

      <!-- 类加载与GC统计 -->
      <div class="metric-row">
        <Card title="类加载统计" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-3 gap-6">
            <Statistic
              title="已加载类数"
              :value="jvmData.classLoading?.loadedClassCount || 0"
              :value-style="{ color: '#1890ff' }"
            />
            <Statistic
              title="总加载类数"
              :value="jvmData.classLoading?.totalLoadedClassCount || 0"
              :value-style="{ color: '#52c41a' }"
            />
            <Statistic
              title="已卸载类数"
              :value="jvmData.classLoading?.unloadedClassCount || 0"
              :value-style="{ color: '#faad14' }"
            />
          </div>
        </Card>
        <Card title="垃圾回收统计" :loading="loading" class="table-card">
          <Table
            :columns="gcColumns"
            :data-source="jvmData.gc || []"
            :pagination="false"
            size="small"
            row-key="name"
          />
        </Card>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="metrics-section">
      <Card title="内存池详情" :loading="loading" class="table-card">
        <Table
          :columns="memoryPoolColumns"
          :data-source="memoryPoolData"
          :pagination="false"
          size="small"
          row-key="key"
        />
      </Card>
    </div>
  </div>
</template>

<style scoped>
.jvm-metrics {
  @apply min-h-full bg-gray-50/30;
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

.jvm-metrics :deep(.ant-card) {
  @apply rounded-lg;
}

.jvm-metrics :deep(.ant-card-head) {
  @apply border-b border-gray-100 bg-white/80;
}

.jvm-metrics :deep(.ant-card-body) {
  @apply bg-white p-6;
}

.jvm-metrics :deep(.ant-statistic-title) {
  @apply mb-2 text-sm font-medium text-gray-600;
}

.jvm-metrics :deep(.ant-statistic-content) {
  @apply text-xl font-semibold;
}

.jvm-metrics :deep(.ant-descriptions-item-label) {
  @apply font-medium text-gray-700;
}

.jvm-metrics :deep(.ant-table) {
  @apply text-sm;
}

.jvm-metrics :deep(.ant-table-thead > tr > th) {
  @apply bg-gray-50/80 font-semibold text-gray-700;
}
</style>
