<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MonitorEndpointType } from '#/api/monitor/types/endpoints';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getEndpointStats,
  getEndpointStatsOverview,
} from '#/api/monitor/endpoints';

import { useColumns, useGridFormSchema } from './data';

const { hasAccessByCodes } = useAccess();

// 概览数据
const overviewData = ref<MonitorEndpointType.EndpointStatsOverview>();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'endpoint',
    },
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 100, // 默认显示100条数据
      pageSizes: [20, 50, 100, 200, 500],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getEndpointStats({
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'endpoint',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<MonitorEndpointType.EndpointStatsDTO>,
});

function onRefresh() {
  gridApi.query();
  loadOverview();
}

/**
 * 加载概览数据
 */
async function loadOverview() {
  try {
    overviewData.value = await getEndpointStatsOverview();
  } catch (error) {
    console.error('加载概览数据失败:', error);
  }
}

// 初始化加载概览数据
loadOverview();
</script>

<template>
  <Page>
    <!-- 概览卡片 -->
    <div
      v-if="overviewData"
      class="mb-4 grid grid-cols-1 gap-4 px-6 md:grid-cols-2 lg:grid-cols-4"
    >
      <div class="rounded-lg bg-white p-4 shadow dark:bg-[#1c1e22]">
        <div class="text-sm text-gray-500 dark:text-gray-400">总端点数</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ overviewData.totalEndpoints || 0 }}
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-[#1c1e22]">
        <div class="text-sm text-gray-500 dark:text-gray-400">总请求数</div>
        <div class="text-2xl font-bold text-green-600">
          {{ overviewData.totalRequests?.toLocaleString() || 0 }}
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-[#1c1e22]">
        <div class="text-sm text-gray-500 dark:text-gray-400">平均响应时间</div>
        <div class="text-2xl font-bold text-orange-600">
          {{ overviewData.averageResponseTime || 0 }}ms
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-[#1c1e22]">
        <div class="text-sm text-gray-500 dark:text-gray-400">整体成功率</div>
        <div class="text-2xl font-bold text-purple-600">
          {{ overviewData.overallSuccessRate || 0 }}%
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['monitor:endpoints:query'])"
            type="primary"
            @click="onRefresh"
          >
            刷新数据
          </Button>
        </template>
      </Grid>
    </Page>
  </Page>
</template>
