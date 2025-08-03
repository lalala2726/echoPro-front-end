<script lang="ts" setup>
import { reactive, ref } from 'vue';

import {
  AlertCircle,
  Bell,
  CheckCircle,
  Edit,
  Mail,
  Plus,
  Trash2,
} from '@vben/icons';

defineOptions({
  name: 'Email',
});

// Primary email info
const primaryEmail = ref({
  address: 'chuang@zhangchuangla.cn',
  verified: true,
  isPrimary: true,
  addDate: '2023-01-15',
});

// Additional emails
const additionalEmails = ref([
  {
    id: 1,
    address: 'zhang.chuang@company.com',
    verified: true,
    isPrimary: false,
    addDate: '2023-03-20',
    type: '工作邮箱',
  },
  {
    id: 2,
    address: 'backup@example.com',
    verified: false,
    isPrimary: false,
    addDate: '2024-01-10',
    type: '备用邮箱',
  },
]);

// Form states
const showChangeForm = ref(false);
const showAddForm = ref(false);
const showVerifyForm = ref(false);
const verifyingEmailId = ref<null | number>(null);

// Change email form
const changeForm = reactive({
  newEmail: '',
  verificationCode: '',
});

// Add email form
const addForm = reactive({
  email: '',
  type: '备用邮箱',
  verificationCode: '',
});

// Verification form
const verifyForm = reactive({
  verificationCode: '',
});

// Email settings
const emailSettings = ref({
  loginNotification: true,
  securityAlert: true,
  marketingEmail: false,
  systemUpdate: true,
});

// Email usage statistics
const emailUsage = ref([
  {
    action: '登录通知',
    date: '2024-08-01',
    email: 'chuang@zhangchuangla.cn',
    description: '新设备登录提醒',
  },
  {
    action: '密码重置',
    date: '2024-06-15',
    email: 'chuang@zhangchuangla.cn',
    description: '通过邮件重置密码',
  },
  {
    action: '安全验证',
    date: '2024-05-20',
    email: 'zhang.chuang@company.com',
    description: '敏感操作验证',
  },
]);

// Email types
const emailTypes = ref(['备用邮箱', '工作邮箱', '个人邮箱', '其他']);

// Verification countdown
const countdown = ref(0);
const canSendCode = ref(true);

// Send verification code
function sendVerificationCode(
  type: 'add' | 'change' | 'verify',
  emailId?: number,
) {
  if (!canSendCode.value) return;

  countdown.value = 60;
  canSendCode.value = false;

  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      canSendCode.value = true;
    }
  }, 1000);

  // Verification code sent
}

// Handle primary email change
function handleEmailChange() {
  if (!changeForm.newEmail || !changeForm.verificationCode) {
    console.warn('请填写完整信息');
    return;
  }

  // Email change submitted
  showChangeForm.value = false;
  // TODO: Implement email change API call
}

// Handle add email
function handleAddEmail() {
  if (!addForm.email || !addForm.verificationCode) {
    console.warn('请填写完整信息');
    return;
  }

  const newEmail = {
    id: Date.now(),
    address: addForm.email,
    verified: true,
    isPrimary: false,
    addDate: new Date().toISOString().split('T')[0],
    type: addForm.type,
  };

  additionalEmails.value.push(newEmail);
  showAddForm.value = false;
  addForm.email = '';
  addForm.verificationCode = '';
  // Email added
}

// Handle email verification
function handleEmailVerification() {
  if (!verifyForm.verificationCode) {
    console.warn('请输入验证码');
    return;
  }

  if (verifyingEmailId.value) {
    const email = additionalEmails.value.find(
      (e) => e.id === verifyingEmailId.value,
    );
    if (email) {
      email.verified = true;
    }
  }

  showVerifyForm.value = false;
  verifyingEmailId.value = null;
  verifyForm.verificationCode = '';
  // Email verification submitted
}

// Remove email
function removeEmail(emailId: number) {
  // Remove email confirmation
  if (true) {
    additionalEmails.value = additionalEmails.value.filter(
      (e) => e.id !== emailId,
    );
    // Email removed
  }
}

// Set as primary email
function setPrimaryEmail(emailId: number) {
  // Set primary email confirmation
  if (true) {
    const email = additionalEmails.value.find((e) => e.id === emailId);
    if (email && email.verified) {
      // Move current primary to additional emails
      additionalEmails.value.push({
        id: Date.now(),
        address: primaryEmail.value.address,
        verified: primaryEmail.value.verified,
        isPrimary: false,
        addDate: primaryEmail.value.addDate,
        type: '原主邮箱',
      });

      // Set new primary
      primaryEmail.value = {
        address: email.address,
        verified: email.verified,
        isPrimary: true,
        addDate: email.addDate,
      };

      // Remove from additional emails
      additionalEmails.value = additionalEmails.value.filter(
        (e) => e.id !== emailId,
      );

      // Primary email changed
    } else {
      console.warn('只有已验证的邮箱才能设为主邮箱');
    }
  }
}

// Verify email
function verifyEmail(emailId: number) {
  verifyingEmailId.value = emailId;
  showVerifyForm.value = true;
}

// Handle setting change
function handleSettingChange(setting: string, value: boolean) {
  (emailSettings.value as any)[setting] = value;
  // Email setting changed
}

// Toggle forms
function toggleChangeForm() {
  showChangeForm.value = !showChangeForm.value;
  if (showChangeForm.value) {
    showAddForm.value = false;
    showVerifyForm.value = false;
  }
}

function toggleAddForm() {
  showAddForm.value = !showAddForm.value;
  if (showAddForm.value) {
    showChangeForm.value = false;
    showVerifyForm.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 骨架屏加载状态 -->
    <div v-if="false" class="space-y-6">
      <!-- 主邮箱骨架屏 -->
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
            class="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
          <div
            class="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
      </div>

      <!-- 其他邮箱骨架屏 -->
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
            class="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
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
                class="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div class="space-y-2">
                <div
                  class="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
                <div
                  class="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
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
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          邮箱地址
        </h2>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          管理您的邮箱地址和邮件设置
        </p>
      </div>
      <button
        class="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        @click="toggleAddForm"
      >
        <Plus class="mr-2 h-4 w-4" />
        添加邮箱
      </button>
    </div>

    <!-- Primary Email -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-4">
          <div class="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
            <Mail class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              主邮箱地址
            </h3>
            <div class="mt-2 space-y-2">
              <div class="flex items-center space-x-2">
                <span class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ primaryEmail.address }}
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  主邮箱
                </span>
                <span
                  v-if="primaryEmail.verified"
                  class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  <CheckCircle class="mr-1 h-3 w-3" />
                  已验证
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                添加时间：{{ primaryEmail.addDate }}
              </p>
            </div>
          </div>
        </div>
        <button
          class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="toggleChangeForm"
        >
          <Edit class="mr-1 h-4 w-4" />
          更换邮箱
        </button>
      </div>
    </div>

    <!-- Change Email Form -->
    <div
      v-if="showChangeForm"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        更换主邮箱地址
      </h3>
      <form @submit.prevent="handleEmailChange" class="space-y-4">
        <!-- New Email -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            新邮箱地址
          </label>
          <input
            v-model="changeForm.newEmail"
            type="email"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
            placeholder="请输入新的邮箱地址"
            required
          />
        </div>

        <!-- Verification Code -->
        <div class="flex space-x-2">
          <div class="flex-1">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              验证码
            </label>
            <input
              v-model="changeForm.verificationCode"
              type="text"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
              placeholder="请输入验证码"
              required
            />
          </div>
          <div class="flex items-end">
            <button
              type="button"
              :disabled="!canSendCode"
              class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @click="sendVerificationCode('change')"
            >
              {{ canSendCode ? '发送验证码' : `${countdown}s后重发` }}
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="showChangeForm = false"
          >
            取消
          </button>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            确认更换
          </button>
        </div>
      </form>
    </div>

    <!-- Add Email Form -->
    <div
      v-if="showAddForm"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        添加邮箱地址
      </h3>
      <form @submit.prevent="handleAddEmail" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Email Address -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              邮箱地址
            </label>
            <input
              v-model="addForm.email"
              type="email"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <!-- Email Type -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              邮箱类型
            </label>
            <select
              v-model="addForm.type"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
            >
              <option v-for="type in emailTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
        </div>

        <!-- Verification Code -->
        <div class="flex space-x-2">
          <div class="flex-1">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              验证码
            </label>
            <input
              v-model="addForm.verificationCode"
              type="text"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
              placeholder="请输入验证码"
              required
            />
          </div>
          <div class="flex items-end">
            <button
              type="button"
              :disabled="!canSendCode"
              class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @click="sendVerificationCode('add')"
            >
              {{ canSendCode ? '发送验证码' : `${countdown}s后重发` }}
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="showAddForm = false"
          >
            取消
          </button>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            添加邮箱
          </button>
        </div>
      </form>
    </div>

    <!-- Verify Email Form -->
    <div
      v-if="showVerifyForm"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        验证邮箱地址
      </h3>
      <form @submit.prevent="handleEmailVerification" class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          我们已向该邮箱发送验证码，请查收邮件
        </p>

        <!-- Verification Code -->
        <div class="flex space-x-2">
          <div class="flex-1">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              验证码
            </label>
            <input
              v-model="verifyForm.verificationCode"
              type="text"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
              placeholder="请输入验证码"
              required
            />
          </div>
          <div class="flex items-end">
            <button
              type="button"
              :disabled="!canSendCode"
              class="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @click="sendVerificationCode('verify', verifyingEmailId!)"
            >
              {{ canSendCode ? '重新发送' : `${countdown}s后重发` }}
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="showVerifyForm = false"
          >
            取消
          </button>
          <button
            type="submit"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            验证邮箱
          </button>
        </div>
      </form>
    </div>

    <!-- Additional Emails -->
    <div
      v-if="additionalEmails.length > 0"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        其他邮箱地址
      </h3>
      <div class="space-y-3">
        <div
          v-for="email in additionalEmails"
          :key="email.id"
          class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600"
        >
          <div class="flex items-center space-x-3">
            <Mail class="h-5 w-5 text-gray-400" />
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ email.address }}
                </span>
                <span
                  class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-[rgb(32,32,42)] dark:text-gray-300"
                >
                  {{ email.type }}
                </span>
                <span
                  v-if="email.verified"
                  class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  <CheckCircle class="mr-1 h-3 w-3" />
                  已验证
                </span>
                <span
                  v-else
                  class="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                >
                  <AlertCircle class="mr-1 h-3 w-3" />
                  未验证
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                添加时间：{{ email.addDate }}
              </div>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="!email.verified"
              class="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400"
              @click="verifyEmail(email.id)"
            >
              验证
            </button>
            <button
              v-if="email.verified"
              class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              @click="setPrimaryEmail(email.id)"
            >
              设为主邮箱
            </button>
            <button
              class="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
              @click="removeEmail(email.id)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Settings -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-6 flex items-center space-x-3">
        <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-500/20">
          <Bell class="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            邮件通知设置
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            配置邮件通知偏好
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              登录通知
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              新设备登录时发送邮件通知
            </p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="[
              emailSettings.loginNotification
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-[rgb(32,32,42)]',
            ]"
            @click="
              handleSettingChange(
                'loginNotification',
                !emailSettings.loginNotification,
              )
            "
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="[
                emailSettings.loginNotification
                  ? 'translate-x-5'
                  : 'translate-x-0',
              ]"
            ></span>
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              安全警报
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              账户安全相关的重要通知
            </p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="[
              emailSettings.securityAlert
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-[rgb(32,32,42)]',
            ]"
            @click="
              handleSettingChange('securityAlert', !emailSettings.securityAlert)
            "
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="[
                emailSettings.securityAlert ? 'translate-x-5' : 'translate-x-0',
              ]"
            ></span>
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              系统更新
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              系统维护和更新通知
            </p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="[
              emailSettings.systemUpdate
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-[rgb(32,32,42)]',
            ]"
            @click="
              handleSettingChange('systemUpdate', !emailSettings.systemUpdate)
            "
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="[
                emailSettings.systemUpdate ? 'translate-x-5' : 'translate-x-0',
              ]"
            ></span>
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              营销邮件
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              产品推广和营销相关邮件
            </p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="[
              emailSettings.marketingEmail
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-[rgb(32,32,42)]',
            ]"
            @click="
              handleSettingChange(
                'marketingEmail',
                !emailSettings.marketingEmail,
              )
            "
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="[
                emailSettings.marketingEmail
                  ? 'translate-x-5'
                  : 'translate-x-0',
              ]"
            ></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Usage History -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        使用记录
      </h3>
      <div class="space-y-3">
        <div
          v-for="usage in emailUsage"
          :key="usage.date"
          class="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600"
        >
          <div class="rounded-full bg-blue-100 p-1 dark:bg-blue-500/20">
            <Mail class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ usage.action }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ usage.date }} • {{ usage.email }} • {{ usage.description }}
            </div>
          </div>
        </div>
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

/* Input and select should have text cursor */
input,
select {
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
dd {
  cursor: default;
}

/* Clickable text elements should have pointer cursor */
.cursor-pointer {
  cursor: pointer;
}
</style>
