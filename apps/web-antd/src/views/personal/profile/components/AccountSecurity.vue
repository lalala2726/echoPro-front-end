<script setup lang="ts">
import type { profileType } from '#/api/personal/profile';

import { computed, onMounted, ref } from 'vue';

import { confirm } from '@vben/common-ui';
import { Eye, EyeOff, Key, Shield, Smartphone } from '@vben/icons';

import { message, Pagination } from 'ant-design-vue';

import {
  deleteDevice,
  getDeviceList,
  getSecurityLogList,
  updatePassword,
} from '#/api/personal/profile';

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

// 使用现有的类型定义
type SessionDevice = profileType.SessionDevice;
type SecurityLog = profileType.UserSecurityLog;

// 响应式状态
const passwordForm = ref<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isPasswordLoading = ref(false);
const isDevicesLoading = ref(false);
const isSecurityLogsLoading = ref(false);
const showPasswordForm = ref(false);
const loading = ref(true);

const devices = ref<SessionDevice[]>([]);
const securityLogs = ref<SecurityLog[]>([]);

// 分页相关状态
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
});

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

// 密码要求验证
const passwordRequirements = computed<PasswordRequirement[]>(() => [
  {
    text: '至少8个字符',
    met: passwordForm.value.newPassword.length >= 8,
  },
  {
    text: '包含大写字母',
    met: /[A-Z]/.test(passwordForm.value.newPassword),
  },
  {
    text: '包含小写字母',
    met: /[a-z]/.test(passwordForm.value.newPassword),
  },
  {
    text: '包含数字',
    met: /\d/.test(passwordForm.value.newPassword),
  },
  {
    text: '包含特殊字符',
    met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.value.newPassword),
  },
]);

const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true;
  return newPassword.value === confirmPassword.value;
});

const passwordStrength = computed(() => {
  const password = newPassword.value;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  return Math.min(strength, 4);
});

const canSubmitPassword = computed(() => {
  return (
    currentPassword.value &&
    newPassword.value &&
    confirmPassword.value &&
    passwordsMatch.value &&
    passwordStrength.value >= 2
  );
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
      devicePagination.value.total = response.total;
    }
    if (response.pageNum !== undefined) {
      devicePagination.value.current = response.pageNum;
    }
    if (response.pageSize !== undefined) {
      devicePagination.value.pageSize = response.pageSize;
    }
  } catch {
    console.warn('获取设备列表失败');
  } finally {
    isDevicesLoading.value = false;
  }
};

const loadSecurityLogs = async (pageNum?: number, pageSize?: number) => {
  isSecurityLogsLoading.value = true;
  try {
    const response = await getSecurityLogList({
      pageNum: pageNum || pagination.value.current,
      pageSize: pageSize || pagination.value.pageSize,
    });

    // 检查响应结构，可能数据在不同的字段中
    if (response.rows) {
      securityLogs.value = response.rows;
    } else if (Array.isArray(response)) {
      // 如果直接返回数组
      securityLogs.value = response;
      pagination.value.total = response.length;
    } else {
      console.warn('未知的响应结构:', response);
      securityLogs.value = [];
    }

    if (response.total !== undefined) {
      pagination.value.total = response.total;
    }
    if (response.pageNum !== undefined) {
      pagination.value.current = response.pageNum;
    }
    if (response.pageSize !== undefined) {
      pagination.value.pageSize = response.pageSize;
    }
  } catch (error) {
    console.error('获取安全日志失败:', error);
  } finally {
    isSecurityLogsLoading.value = false;
  }
};

// 密码管理
const handlePasswordUpdate = async () => {
  if (!canSubmitPassword.value) {
    console.warn('请填写完整的密码信息');
    return;
  }

  isPasswordLoading.value = true;
  try {
    await updatePassword({
      oldPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    console.warn('密码更新成功');
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    showPasswordForm.value = false;
  } catch {
    console.warn('密码更新失败');
  } finally {
    isPasswordLoading.value = false;
  }
};

// 设备管理
const handleLogoutDevice = async (sessionId: string) => {
  try {
    await deleteDevice(sessionId);
    console.warn('设备注销成功');
    await loadDevices();
  } catch {
    console.warn('设备注销失败');
  }
};

const handleLogoutAllDevices = () => {
  openConfirm();
};

function openConfirm() {
  confirm({
    beforeClose({ isConfirm }) {
      if (!isConfirm) return;
      // 这里可以做一些异步操作
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    },
    centered: false,
    content: '确定要注销所有设备吗？',
    icon: 'question',
  })
    .then(() => {
      message.success('所有设备已注销');
    })
    .catch(() => {
      message.error('操作已取消');
    });
}

// 分页处理函数
const handlePageChange = (page: number, pageSize: number) => {
  pagination.value.current = page;
  pagination.value.pageSize = pageSize;
  loadSecurityLogs(page, pageSize);
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
  loading.value = true;
  try {
    await Promise.all([loadDevices(), loadSecurityLogs()]);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- 页面加载状态 -->
    <div v-if="loading" class="space-y-6">
      <!-- 密码管理骨架屏 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center space-x-3">
          <div
            class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          ></div>
          <div class="space-y-2">
            <div
              class="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
            <div
              class="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>
        <div class="space-y-4">
          <div
            class="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
          <div
            class="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
      </div>

      <!-- 安全活动日志骨架屏 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center space-x-3">
          <div
            class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          ></div>
          <div class="space-y-2">
            <div
              class="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
            <div
              class="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>
        <div class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="space-y-3">
              <div
                class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 登录设备管理骨架屏 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            ></div>
            <div class="space-y-2">
              <div
                class="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            </div>
          </div>
          <div
            class="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
        <div class="space-y-4">
          <div
            v-for="i in 2"
            :key="i"
            class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="flex items-center space-x-4">
              <div
                class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              ></div>
              <div class="space-y-2">
                <div
                  class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
                <div
                  class="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
              </div>
            </div>
            <div
              class="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else class="space-y-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            账户安全
          </h2>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            管理您的密码、查看安全日志和设备登录状态
          </p>
        </div>
      </div>

      <!-- 修改密码 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center space-x-3">
          <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
            <Key class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              密码管理
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              定期更新密码以保护账户安全
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            上次修改时间：2024年1月15日
          </div>
          <button
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            @click="showPasswordForm = !showPasswordForm"
          >
            {{ showPasswordForm ? '取消修改' : '修改密码' }}
          </button>
        </div>

        <!-- 密码修改表单 -->
        <div v-if="showPasswordForm" class="mt-6 space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              for="current-password"
            >
              当前密码
            </label>
            <div class="relative mt-1">
              <input
                id="current-password"
                v-model="currentPassword"
                :type="showOldPassword ? 'text' : 'password'"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="请输入当前密码"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
                @click="showOldPassword = !showOldPassword"
              >
                <Eye v-if="showOldPassword" class="h-4 w-4 text-gray-400" />
                <EyeOff v-else class="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              for="new-password"
            >
              新密码
            </label>
            <div class="relative mt-1">
              <input
                id="new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="请输入新密码"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
                @click="showNewPassword = !showNewPassword"
              >
                <Eye v-if="showNewPassword" class="h-4 w-4 text-gray-400" />
                <EyeOff v-else class="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <!-- 密码强度指示器 -->
            <div class="mt-2">
              <div class="flex space-x-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded-full"
                  :class="[
                    i <= passwordStrength
                      ? passwordStrength === 1
                        ? 'bg-red-500'
                        : passwordStrength === 2
                          ? 'bg-yellow-500'
                          : passwordStrength === 3
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700',
                  ]"
                ></div>
              </div>
              <div class="mt-2 space-y-1">
                <div
                  v-for="requirement in passwordRequirements"
                  :key="requirement.text"
                  class="flex items-center space-x-2 text-xs"
                >
                  <div
                    class="h-1.5 w-1.5 rounded-full"
                    :class="[
                      requirement.met
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600',
                    ]"
                  ></div>
                  <span
                    :class="[
                      requirement.met
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400',
                    ]"
                  >
                    {{ requirement.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              for="confirm-password"
            >
              确认新密码
            </label>
            <div class="relative mt-1">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="请再次输入新密码"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Eye v-if="showConfirmPassword" class="h-4 w-4 text-gray-400" />
                <EyeOff v-else class="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-gray-300 dark:hover:bg-[rgb(40,40,50)] dark:focus:ring-offset-gray-900"
              @click="showPasswordForm = false"
            >
              取消
            </button>
            <button
              :disabled="!canSubmitPassword || isPasswordLoading"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
              @click="handlePasswordUpdate"
            >
              {{ isPasswordLoading ? '更新中...' : '更新密码' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 安全活动日志 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center space-x-3">
          <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-500/20">
            <Shield class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              安全活动日志
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              查看最近的账户安全活动记录
            </p>
          </div>
        </div>

        <div v-if="isSecurityLogsLoading" class="space-y-4">
          <div
            v-for="i in 4"
            :key="i"
            class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="space-y-3">
              <div
                class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            </div>
          </div>
        </div>

        <div v-else-if="securityLogs.length === 0" class="py-8 text-center">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            暂无安全活动记录
          </div>
          <div class="mt-2 text-xs text-gray-400">
            调试信息: isLoading={{ isSecurityLogsLoading }}, 数组长度={{
              securityLogs.length
            }}, total={{ pagination.total }}
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="mb-2 text-xs text-gray-400">
            调试信息: 显示 {{ securityLogs.length }} 条记录，总共
            {{ pagination.total }} 条
          </div>
          <div
            v-for="(log, index) in securityLogs"
            :key="index"
            class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ log.title }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ _formatDate(log.operationTime || '') }} •
                  {{ log.operationRegion }} • IP: {{ log.operationIp }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-500">
                  类型：{{ log.operationType }}
                </div>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <div v-if="pagination.total > 0" class="flex justify-center pt-4">
            <Pagination
              v-model:current="pagination.current"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :show-size-changer="pagination.showSizeChanger"
              :show-quick-jumper="pagination.showQuickJumper"
              :show-total="pagination.showTotal"
              @change="handlePageChange"
              @show-size-change="handlePageChange"
            />
          </div>
        </div>
      </div>

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
          <div class="text-sm text-gray-500 dark:text-gray-400">
            暂无登录设备
          </div>
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
              @click="handleLogoutDevice(device.refreshTokenId || '')"
            >
              注销
            </button>
          </div>

          <!-- 设备分页组件 -->
          <div
            v-if="devicePagination.total > 0"
            class="flex justify-center pt-4"
          >
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
    </div>
  </div>
</template>
