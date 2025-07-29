<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { MonitorTypes } from '#/api/monitor/types/metrics';

import { computed, onMounted, onUnmounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card, Descriptions, Statistic, Table, Tag } from 'ant-design-vue';

import { getRedisMetrics } from '#/api/monitor/metrics';

const loading = ref(false);
const redisData = ref<MonitorTypes.RedisMetricsDTO>({});
const refreshTimer = ref<NodeJS.Timeout | null>(null);

// 内存使用图表
const memoryChartRef = ref<EchartsUIType>();
const { renderEcharts: renderMemoryChart } = useEcharts(memoryChartRef);

// 性能指标图表
const performanceChartRef = ref<EchartsUIType>();
const { renderEcharts: renderPerformanceChart } =
  useEcharts(performanceChartRef);

// 格式化字节数
const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// 格式化运行时间
const formatUptime = (seconds: number): string => {
  if (!seconds) return '0s';
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

// 键空间表格列定义
const keyspaceColumns = [
  {
    title: '数据库',
    dataIndex: 'db',
    key: 'db',
  },
  {
    title: '键数量',
    dataIndex: 'keys',
    key: 'keys',
  },
  {
    title: '过期键数量',
    dataIndex: 'expires',
    key: 'expires',
  },
  {
    title: '平均TTL',
    dataIndex: 'avgTtl',
    key: 'avgTtl',
    customRender: ({ text }: { text: number }) => (text ? `${text}ms` : 'N/A'),
  },
];

// 键空间数据
const keyspaceData = computed(() => {
  const keyspace = redisData.value.keyspace || {};
  return Object.entries(keyspace).map(([db, stats]) => ({
    key: db,
    db,
    ...stats,
  }));
});

// 命令统计表格列定义
const commandColumns = [
  {
    title: '命令',
    dataIndex: 'command',
    key: 'command',
  },
  {
    title: '调用次数',
    dataIndex: 'calls',
    key: 'calls',
  },
  {
    title: '总耗时(μs)',
    dataIndex: 'usec',
    key: 'usec',
  },
  {
    title: '平均耗时(μs)',
    dataIndex: 'usecPerCall',
    key: 'usecPerCall',
    customRender: ({ text }: { text: number }) => text?.toFixed(2),
  },
];

// 命令统计数据
const commandData = computed(() => {
  const commands = redisData.value.commandStats?.commands || {};
  return Object.entries(commands).map(([command, stats]) => ({
    key: command,
    command,
    ...stats,
  }));
});

// 获取Redis监控数据
const fetchRedisData = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }
    redisData.value = await getRedisMetrics();

    // 更新图表
    updateCharts();
  } catch (error) {
    console.error('获取Redis监控数据失败:', error);
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

// 更新图表
const updateCharts = () => {
  // 更新内存使用图表
  const memory = redisData.value.memory;
  if (memory) {
    const usedMemory = memory.usedMemory || 0;
    const maxMemory = memory.maxMemory || 0;
    const availableMemory = maxMemory > 0 ? maxMemory - usedMemory : 0;

    renderMemoryChart({
      title: {
        text: 'Redis内存使用情况',
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
          name: 'Redis内存',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data:
            maxMemory > 0
              ? [
                  {
                    value: usedMemory,
                    name: `已使用 (${memory.usedMemoryHuman})`,
                    itemStyle: { color: '#ff7875' },
                  },
                  {
                    value: availableMemory,
                    name: `可用 (${formatBytes(availableMemory)})`,
                    itemStyle: { color: '#73d13d' },
                  },
                ]
              : [
                  {
                    value: usedMemory,
                    name: `已使用 (${memory.usedMemoryHuman})`,
                    itemStyle: { color: '#ff7875' },
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

  // 更新性能指标图表
  const performance = redisData.value.performance;
  if (performance) {
    const hitRate = performance.hitRate || 0;
    const missRate = 100 - hitRate;

    renderPerformanceChart({
      title: {
        text: '缓存命中率',
        left: 'center',
        textStyle: {
          fontSize: 14,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}%',
      },
      legend: {
        bottom: '5%',
        left: 'center',
      },
      series: [
        {
          name: '缓存命中',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          data: [
            {
              value: hitRate,
              name: `命中 (${hitRate.toFixed(2)}%)`,
              itemStyle: { color: '#52c41a' },
            },
            {
              value: missRate,
              name: `未命中 (${missRate.toFixed(2)}%)`,
              itemStyle: { color: '#ff4d4f' },
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
    fetchRedisData(false); // 定时刷新时不显示loading
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
  fetchRedisData(true); // 初始加载显示loading
  startRefresh();
});

onUnmounted(() => {
  stopRefresh();
});
</script>

<template>
  <div class="redis-metrics">
    <!-- Redis基本信息 -->
    <div class="metrics-section">
      <Card title="Redis基本信息" :loading="loading" class="info-card">
        <Descriptions :column="3" bordered size="small">
          <Descriptions.Item label="版本">
            <Tag color="blue">{{ redisData.info?.version || 'Unknown' }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="模式">
            <Tag color="green">{{ redisData.info?.mode || 'Unknown' }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="端口">
            {{ redisData.info?.tcpPort || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="进程ID">
            {{ redisData.info?.processId || 'Unknown' }}
          </Descriptions.Item>
          <Descriptions.Item label="运行时间">
            {{ formatUptime(redisData.info?.uptimeInSeconds || 0) }}
          </Descriptions.Item>
          <Descriptions.Item label="配置文件">
            {{ redisData.info?.configFile || 'Unknown' }}
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
              title="已使用内存"
              :value="redisData.memory?.usedMemoryHuman || '0'"
              :value-style="{ color: '#ff7875' }"
            />
            <Statistic
              title="RSS内存"
              :value="formatBytes(redisData.memory?.usedMemoryRss || 0)"
              :value-style="{ color: '#40a9ff' }"
            />
            <Statistic
              title="峰值内存"
              :value="redisData.memory?.usedMemoryPeakHuman || '0'"
              :value-style="{ color: '#faad14' }"
            />
            <Statistic
              title="碎片率"
              :value="redisData.memory?.memFragmentationRatio || 0"
              :precision="2"
              :value-style="{
                color:
                  (redisData.memory?.memFragmentationRatio || 0) > 1.5
                    ? '#cf1322'
                    : '#3f8600',
              }"
            />
          </div>
        </Card>
        <Card title="内存使用分布" :loading="loading" class="chart-card">
          <div class="chart-container">
            <EchartsUI ref="memoryChartRef" style="height: 100%" />
          </div>
        </Card>
      </div>

      <!-- 连接统计 -->
      <div class="metric-row">
        <Card title="连接统计" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-2 gap-6">
            <Statistic
              title="当前连接数"
              :value="redisData.connections?.connectedClients || 0"
              :value-style="{ color: '#1890ff' }"
            />
            <Statistic
              title="最大连接数"
              :value="redisData.connections?.maxClients || 0"
              :value-style="{ color: '#52c41a' }"
            />
            <Statistic
              title="阻塞客户端"
              :value="redisData.connections?.blockedClients || 0"
              :value-style="{
                color:
                  (redisData.connections?.blockedClients || 0) > 0
                    ? '#cf1322'
                    : '#3f8600',
              }"
            />
            <Statistic
              title="总连接数"
              :value="redisData.connections?.totalConnectionsReceived || 0"
              :value-style="{ color: '#722ed1' }"
            />
          </div>
        </Card>
        <Card title="缓存命中率" :loading="loading" class="chart-card">
          <div class="chart-container">
            <EchartsUI ref="performanceChartRef" style="height: 100%" />
          </div>
        </Card>
      </div>

      <!-- 性能统计 -->
      <div class="metrics-section">
        <Card title="性能统计" :loading="loading" class="metrics-card">
          <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Statistic
              title="命中次数"
              :value="redisData.performance?.keyspaceHits || 0"
              :value-style="{ color: '#52c41a' }"
            />
            <Statistic
              title="未命中次数"
              :value="redisData.performance?.keyspaceMisses || 0"
              :value-style="{ color: '#ff4d4f' }"
            />
            <Statistic
              title="命中率"
              :value="redisData.performance?.hitRate || 0"
              suffix="%"
              :precision="2"
              :value-style="{
                color:
                  (redisData.performance?.hitRate || 0) > 90
                    ? '#3f8600'
                    : '#fa8c16',
              }"
            />
            <Statistic
              title="每秒操作数"
              :value="redisData.commandStats?.instantaneousOpsPerSec || 0"
              :value-style="{ color: '#1890ff' }"
            />
          </div>
        </Card>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="metrics-section" v-if="keyspaceData.length > 0">
      <Card title="键空间统计" :loading="loading" class="table-card">
        <Table
          :columns="keyspaceColumns"
          :data-source="keyspaceData"
          :pagination="false"
          size="small"
          row-key="key"
        />
      </Card>
    </div>

    <div class="metrics-section" v-if="commandData.length > 0">
      <Card title="命令统计" :loading="loading" class="table-card">
        <Table
          :columns="commandColumns"
          :data-source="commandData.slice(0, 10)"
          :pagination="false"
          size="small"
          row-key="key"
        />
      </Card>
    </div>
  </div>
</template>

<style scoped>
.redis-metrics {
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

.redis-metrics :deep(.ant-table-thead > tr > th) {
  @apply bg-gray-50/80 font-semibold text-gray-700;
}
</style>
