<script setup lang="ts">
import type { profileType } from '#/api/personal/profile';

import { onMounted, ref } from 'vue';

import { Smartphone } from '@vben/icons';

import { message, Modal, Pagination } from 'ant-design-vue';

import { deleteDevice, getDeviceList, logoutAll } from '#/api/personal/profile';

// 使用现有的类型定义
type SessionDevice = profileType.SessionDevice;

// 响应式状态
const isDevicesLoading = ref(false);
const devices = ref<SessionDevice[]>([]);

// 设备分页相关状态
const devicePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
});

// 数据加载函数
const loadDevices = async (pageNum?: number, pageSize?: number) => {
  isDevicesLoading.value = true;
  try {
    const response = await getDeviceList({
      pageNum: pageNum || devicePagination.value.current,
      pageSize: pageSize || devicePagination.value.pageSize,
    });

    devices.value = response.rows || [];

    if (response.total !== undefined) {
      devicePagination.value.total = Number(response.total);
    }
    if (response.pageNum !== undefined) {
      devicePagination.value.current = Number(response.pageNum);
    }
    if (response.pageSize !== undefined) {
      devicePagination.value.pageSize = Number(response.pageSize);
    }
  } catch {
    console.warn('获取设备列表失败');
  } finally {
    isDevicesLoading.value = false;
  }
};

// 设备管理
const handleLogoutDevice = async (sessionId: string, deviceInfo?: string) => {
  Modal.confirm({
    title: '确认注销设备',
    content: `确定要注销设备 "${deviceInfo || '该设备'}" 吗？注销后该设备将无法访问您的账户。`,
    okText: '确认注销',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        await deleteDevice(sessionId);
        console.warn('设备注销成功');
        await loadDevices();
      } catch {
        console.warn('设备注销失败');
      }
    },
  });
};

const handleLogoutAllDevices = () => {
  Modal.confirm({
    title: '确认注销所有设备',
    content:
      '确定要注销所有设备吗？注销后所有设备将无法访问您的账户，您需要重新登录。',
    okText: '确认注销',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        await logoutAll();
        message.success('所有设备已注销');
        await loadDevices();
      } catch {
        message.error('注销失败，请稍后重试');
      }
    },
  });
};

// 设备分页处理函数
const handleDevicePageChange = (page: number, pageSize: number) => {
  devicePagination.value.current = page;
  devicePagination.value.pageSize = pageSize;
  loadDevices(page, pageSize);
};

const _formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 初始化数据
onMounted(async () => {
  await loadDevices();
});
</script>

<template>
  <!-- 登录设备管理 -->
  <div
    class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
  >
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="rounded-lg bg-green-100 p-2 dark:bg-green-500/20">
          <Smartphone class="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            登录设备管理
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            管理已登录的设备，保护账户安全
          </p>
        </div>
      </div>
      <button
        class="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-[rgb(24,24,32)] dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:focus:ring-offset-gray-800"
        @click="handleLogoutAllDevices"
      >
        全部注销
      </button>
    </div>

    <div v-if="isDevicesLoading" class="space-y-4">
      <div
        v-for="i in 3"
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
          <div
            class="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
      </div>
    </div>

    <div v-else-if="devices.length === 0" class="py-8 text-center">
      <div class="text-sm text-gray-500 dark:text-gray-400">暂无登录设备</div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="device in devices"
        :key="device.refreshTokenId"
        class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <div class="flex items-center space-x-4">
          <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            <Smartphone class="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-white">
              {{ device.deviceName || device.deviceType }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ _formatDate(device.loginTime || '') }} •
              {{ device.location }} • IP: {{ device.ip }}
            </div>
          </div>
        </div>
        <button
          class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-gray-400 dark:hover:bg-gray-500/10 dark:hover:text-gray-300 dark:focus:ring-offset-gray-800"
          @click="
            handleLogoutDevice(
              device.refreshTokenId || '',
              `${device.deviceName || device.deviceType} - ${device.location}`,
            )
          "
        >
          注销
        </button>
      </div>

      <!-- 设备分页组件 -->
      <div v-if="devicePagination.total > 0" class="flex justify-center pt-4">
        <Pagination
          v-model:current="devicePagination.current"
          v-model:page-size="devicePagination.pageSize"
          :total="devicePagination.total"
          :show-size-changer="devicePagination.showSizeChanger"
          :show-quick-jumper="devicePagination.showQuickJumper"
          :show-total="devicePagination.showTotal"
          @change="handleDevicePageChange"
          @show-size-change="handleDevicePageChange"
        />
      </div>
    </div>
  </div>
</template>
