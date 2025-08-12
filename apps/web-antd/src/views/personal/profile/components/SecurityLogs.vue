<script setup lang="ts">
import type { profileType } from '#/api/personal/profile';

import { onMounted, ref } from 'vue';

import { Shield } from '@vben/icons';

import { Pagination } from 'ant-design-vue';

import { getSecurityLogList } from '#/api/personal/profile';

// 使用现有的类型定义
type UserSecurityLog = profileType.UserSecurityLog;

// 响应式状态
const isSecurityLogsLoading = ref(false);
const securityLogs = ref<UserSecurityLog[]>([]);

// 安全日志分页相关状态
const securityLogPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
});

// 数据加载函数
const loadSecurityLogs = async (pageNum?: number, pageSize?: number) => {
  isSecurityLogsLoading.value = true;
  try {
    const response = await getSecurityLogList({
      pageNum: pageNum || securityLogPagination.value.current,
      pageSize: pageSize || securityLogPagination.value.pageSize,
    });

    securityLogs.value = response.rows || [];

    if (response.total !== undefined) {
      securityLogPagination.value.total = response.total;
    }
    if (response.pageNum !== undefined) {
      securityLogPagination.value.current = response.pageNum;
    }
    if (response.pageSize !== undefined) {
      securityLogPagination.value.pageSize = response.pageSize;
    }
  } catch {
    console.warn('获取安全日志失败');
  } finally {
    isSecurityLogsLoading.value = false;
  }
};

// 安全日志分页处理函数
const handleSecurityLogPageChange = (page: number, pageSize: number) => {
  securityLogPagination.value.current = page;
  securityLogPagination.value.pageSize = pageSize;
  loadSecurityLogs(page, pageSize);
};

const _formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('zh-CN');
};

const _getLogTypeColor = (type: string) => {
  switch (type) {
    case 'LOGIN': {
      return 'text-green-600 dark:text-green-400';
    }
    case 'LOGOUT': {
      return 'text-blue-600 dark:text-blue-400';
    }
    case 'PASSWORD_CHANGE': {
      return 'text-orange-600 dark:text-orange-400';
    }
    case 'SECURITY_SETTING': {
      return 'text-purple-600 dark:text-purple-400';
    }
    default: {
      return 'text-gray-600 dark:text-gray-400';
    }
  }
};

const _getLogTypeText = (type: string) => {
  switch (type) {
    case 'LOGIN': {
      return '登录';
    }
    case 'LOGOUT': {
      return '登出';
    }
    case 'PASSWORD_CHANGE': {
      return '密码修改';
    }
    case 'SECURITY_SETTING': {
      return '安全设置';
    }
    default: {
      return type;
    }
  }
};

// 初始化数据
onMounted(async () => {
  await loadSecurityLogs();
});
</script>

<template>
  <!-- 安全日志 -->
  <div
    class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
  >
    <div class="mb-6 flex items-center space-x-3">
      <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
        <Shield class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          安全日志
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          查看账户的安全操作记录
        </p>
      </div>
    </div>

    <div v-if="isSecurityLogsLoading" class="space-y-4">
      <div
        v-for="i in 5"
        :key="i"
        class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <div class="flex items-center space-x-4">
          <div
            class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          ></div>
          <div>
            <div
              class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
            <div
              class="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="securityLogs.length === 0" class="py-8 text-center">
      <div class="text-sm text-gray-500 dark:text-gray-400">暂无安全日志</div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="log in securityLogs"
        :key="log.id"
        class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <div class="flex items-center space-x-4">
          <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            <Shield class="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-medium text-gray-900 dark:text-white">
                {{ log.title }}
              </span>
              <span
                class="rounded-full px-2 py-1 text-xs font-medium"
                :class="_getLogTypeColor(log.operationType || '')"
              >
                {{ _getLogTypeText(log.operationType || '') }}
              </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ _formatDate(log.operationTime || '') }} • IP:
              {{ log.operationIp }} •
              {{ log.operationRegion }}
            </div>
          </div>
        </div>
      </div>

      <!-- 安全日志分页组件 -->
      <div
        v-if="securityLogPagination.total > 0"
        class="flex justify-center pt-4"
      >
        <Pagination
          v-model:current="securityLogPagination.current"
          v-model:page-size="securityLogPagination.pageSize"
          :total="securityLogPagination.total"
          :show-size-changer="securityLogPagination.showSizeChanger"
          :show-quick-jumper="securityLogPagination.showQuickJumper"
          :show-total="securityLogPagination.showTotal"
          @change="handleSecurityLogPageChange"
          @show-size-change="handleSecurityLogPageChange"
        />
      </div>
    </div>
  </div>
</template>
