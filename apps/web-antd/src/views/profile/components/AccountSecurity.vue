<script lang="ts" setup>
import { reactive, ref } from 'vue';

import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Lock,
  Shield,
  Smartphone,
} from '@vben/icons';

interface Emits {
  (e: 'change-password'): void;
}

defineOptions({
  name: 'AccountSecurity',
});

const emit = defineEmits<Emits>();

// Password form states
const showChangePasswordForm = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password form data
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Password requirements
const passwordRequirements = ref([
  { text: '至少8个字符', met: false },
  { text: '包含大写字母', met: false },
  { text: '包含小写字母', met: false },
  { text: '包含数字', met: false },
  { text: '包含特殊字符', met: false },
]);

// Login settings
const loginSettings = ref({
  sessionTimeout: 30,
  autoLogout: true,
  rememberLogin: false,
  loginNotification: true,
});

// Password history
const passwordHistory = ref([
  { date: '2024-06-15', action: '密码修改' },
  { date: '2024-03-20', action: '密码重置' },
  { date: '2023-12-10', action: '密码修改' },
]);

// Mock security data
const securityInfo = ref({
  twoFactorEnabled: true,
  lastPasswordChange: '2024-06-15',
  loginDevices: [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: '北京市',
      lastActive: '2024-08-01 14:30',
      current: true,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: '北京市',
      lastActive: '2024-07-30 09:15',
      current: false,
    },
  ],
  securityScore: 85,
  recentActivities: [
    {
      id: 1,
      action: '登录成功',
      time: '2024-08-01 14:30',
      location: '北京市',
      device: 'Chrome on Windows',
    },
    {
      id: 2,
      action: '密码修改',
      time: '2024-06-15 10:20',
      location: '北京市',
      device: 'Chrome on Windows',
    },
  ],
});

// Handle two-factor authentication toggle
function handleTwoFactorToggle() {
  securityInfo.value.twoFactorEnabled = !securityInfo.value.twoFactorEnabled;
  console.log(
    'Two-factor authentication toggled:',
    securityInfo.value.twoFactorEnabled,
  );
}

// Handle device logout
function handleDeviceLogout(deviceId: number) {
  console.log('Logout device:', deviceId);
}

// Handle security scan
function handleSecurityScan() {
  console.log('Security scan initiated');
}

// Check password requirements
function checkPasswordRequirements(password: string) {
  passwordRequirements.value[0].met = password.length >= 8;
  passwordRequirements.value[1].met = /[A-Z]/.test(password);
  passwordRequirements.value[2].met = /[a-z]/.test(password);
  passwordRequirements.value[3].met = /\d/.test(password);
  passwordRequirements.value[4].met = /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

// Handle password change
function handlePasswordChange() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('新密码和确认密码不匹配');
    return;
  }

  const allRequirementsMet = passwordRequirements.value.every((req) => req.met);
  if (!allRequirementsMet) {
    alert('密码不符合安全要求');
    return;
  }

  console.log('Password change submitted');
  showChangePasswordForm.value = false;
  // TODO: Implement password change API call
}

// Handle setting change
function handleSettingChange(setting: string, value: any) {
  (loginSettings.value as any)[setting] = value;
  console.log(`Setting ${setting} changed to:`, value);
}

// Watch new password for requirements
function onNewPasswordInput() {
  checkPasswordRequirements(passwordForm.newPassword);
}

// Toggle change password form
function toggleChangePasswordForm() {
  showChangePasswordForm.value = !showChangePasswordForm.value;
  emit('change-password');
}
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
          管理您的账户安全设置和隐私选项
        </p>
      </div>
      <button
        class="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        @click="handleSecurityScan"
      >
        <Shield class="mr-2 h-4 w-4" />
        安全扫描
      </button>
    </div>

    <!-- Security Score -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            安全评分
          </h3>
          <p class="mt-1 text-gray-600 dark:text-gray-400">您的账户安全等级</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold text-green-600">
            {{ securityInfo.securityScore }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">/ 100</div>
        </div>
      </div>
      <div class="mt-4">
        <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-2 rounded-full bg-green-600"
            :style="{ width: `${securityInfo.securityScore}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Two-Factor Authentication -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3">
            <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <Smartphone class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                双重认证
              </h4>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                为您的账户添加额外的安全保护
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <button
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="[
                securityInfo.twoFactorEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700',
              ]"
              @click="handleTwoFactorToggle"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="[
                  securityInfo.twoFactorEnabled
                    ? 'translate-x-5'
                    : 'translate-x-0',
                ]"
              ></span>
            </button>
          </div>
        </div>
        <div class="mt-4">
          <div
            v-if="securityInfo.twoFactorEnabled"
            class="flex items-center text-sm text-green-600 dark:text-green-400"
          >
            <CheckCircle class="mr-2 h-4 w-4" />
            已启用
          </div>
          <div
            v-else
            class="flex items-center text-sm text-orange-600 dark:text-orange-400"
          >
            <AlertTriangle class="mr-2 h-4 w-4" />
            未启用
          </div>
        </div>
      </div>

      <!-- Password Security -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-start space-x-3">
          <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
            <Key class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
              密码安全
            </h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              上次修改：{{ securityInfo.lastPasswordChange }}
            </p>
            <button
              class="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              修改密码
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Devices -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        登录设备
      </h3>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        管理已登录的设备和会话
      </p>
      <div class="mt-4 space-y-4">
        <div
          v-for="device in securityInfo.loginDevices"
          :key="device.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div class="flex items-center space-x-3">
            <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
              <Eye class="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ device.device }}
                </span>
                <span
                  v-if="device.current"
                  class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  当前设备
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ device.location }} • {{ device.lastActive }}
              </div>
            </div>
          </div>
          <button
            v-if="!device.current"
            class="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
            @click="handleDeviceLogout(device.id)"
          >
            注销
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Security Activities -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        安全活动记录
      </h3>
      <p class="mt-1 text-gray-600 dark:text-gray-400">最近的安全相关活动</p>
      <div class="mt-4 space-y-3">
        <div
          v-for="activity in securityInfo.recentActivities"
          :key="activity.id"
          class="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <div class="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
            <Shield class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ activity.action }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ activity.time }} • {{ activity.location }} •
              {{ activity.device }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Management Section -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
            <Lock class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              密码管理
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              上次修改：{{ securityInfo.lastPasswordChange }}
            </p>
          </div>
        </div>
        <button
          class="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="toggleChangePasswordForm"
        >
          <Key class="mr-2 h-4 w-4" />
          {{ showChangePasswordForm ? '取消修改' : '修改密码' }}
        </button>
      </div>

      <!-- Change Password Form -->
      <div
        v-if="showChangePasswordForm"
        class="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700"
      >
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              当前密码
            </label>
            <div class="relative mt-1">
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="请输入当前密码"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <Eye v-if="showCurrentPassword" class="h-4 w-4 text-gray-400" />
                <EyeOff v-else class="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              新密码
            </label>
            <div class="relative mt-1">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="请输入新密码"
                required
                @input="onNewPasswordInput"
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
          </div>

          <!-- Confirm Password -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              确认新密码
            </label>
            <div class="relative mt-1">
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="请再次输入新密码"
                required
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

          <!-- Password Requirements -->
          <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              密码要求：
            </h4>
            <ul class="space-y-1">
              <li
                v-for="requirement in passwordRequirements"
                :key="requirement.text"
                class="flex items-center text-sm"
              >
                <div
                  class="mr-2 flex h-4 w-4 items-center justify-center rounded-full"
                  :class="[
                    requirement.met
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500',
                  ]"
                >
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <span
                  :class="[
                    requirement.met
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400',
                  ]"
                >
                  {{ requirement.text }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              更新密码
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fix cursor styles for interactive elements */
button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

/* Ensure text elements don't show text cursor when clickable */
button * {
  cursor: inherit;
}

/* Input should have text cursor */
input {
  cursor: text;
}

/* Prevent text cursor on all other elements */
div,
span,
p,
h1,
h2,
h3,
h4,
h5,
h6,
label,
dt,
dd,
ul,
li {
  cursor: default;
}

/* Clickable text elements should have pointer cursor */
.cursor-pointer {
  cursor: pointer;
}
</style>
