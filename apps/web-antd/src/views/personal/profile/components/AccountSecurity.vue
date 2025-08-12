<script setup lang="ts">
import { computed, ref } from 'vue';

import { Eye, EyeOff, Key } from '@vben/icons';

import { updatePassword } from '#/api/personal/profile';

import DeviceManagement from './DeviceManagement.vue';
import SecurityLogs from './SecurityLogs.vue';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

// 响应式状态
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isPasswordLoading = ref(false);
const showPasswordForm = ref(false);

// 密码要求验证
const passwordRequirements = computed<PasswordRequirement[]>(() => [
  {
    text: '至少8个字符',
    met: newPassword.value.length >= 8,
  },
  {
    text: '包含大写字母',
    met: /[A-Z]/.test(newPassword.value),
  },
  {
    text: '包含小写字母',
    met: /[a-z]/.test(newPassword.value),
  },
  {
    text: '包含数字',
    met: /\d/.test(newPassword.value),
  },
  {
    text: '包含特殊字符',
    met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value),
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
</script>

<template>
  <div class="space-y-6">
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

    <!-- 设备管理组件 -->
    <DeviceManagement />
    <!-- 安全日志组件 -->
    <SecurityLogs />
  </div>
</template>
