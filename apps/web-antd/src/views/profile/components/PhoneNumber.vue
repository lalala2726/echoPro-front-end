<script lang="ts" setup>
import { reactive, ref } from 'vue';

import {
  AlertCircle,
  CheckCircle,
  Edit,
  MessageSquare,
  Phone,
  Shield,
} from '@vben/icons';

defineOptions({
  name: 'PhoneNumber',
});

// Current phone info
const phoneInfo = ref({
  number: '+86 138****1234',
  verified: true,
  bindDate: '2023-01-15',
  countryCode: '+86',
  fullNumber: '13812341234',
});

// Form states
const showChangeForm = ref(false);
const showVerifyForm = ref(false);

// Change phone form
const changeForm = reactive({
  newPhone: '',
  verificationCode: '',
  countryCode: '+86',
});

// Verification form
const verifyForm = reactive({
  verificationCode: '',
});

// Verification countdown
const countdown = ref(0);
const canSendCode = ref(true);

// Phone usage statistics
const phoneUsage = ref([
  {
    action: '登录验证',
    date: '2024-08-01',
    description: '用于账户登录验证',
  },
  {
    action: '密码重置',
    date: '2024-06-15',
    description: '通过短信重置密码',
  },
  {
    action: '安全验证',
    date: '2024-05-20',
    description: '敏感操作安全验证',
  },
]);

// Country codes
const countryCodes = ref([
  { code: '+86', name: '中国' },
  { code: '+1', name: '美国' },
  { code: '+44', name: '英国' },
  { code: '+81', name: '日本' },
]);

// Send verification code
function sendVerificationCode(_type: 'change' | 'verify') {
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

// Handle phone change
function handlePhoneChange() {
  if (!changeForm.newPhone || !changeForm.verificationCode) {
    console.warn('请填写完整信息');
    return;
  }

  // Phone change submitted
  showChangeForm.value = false;
  // TODO: Implement phone change API call
}

// Handle phone verification
function handlePhoneVerification() {
  if (!verifyForm.verificationCode) {
    console.warn('请输入验证码');
    return;
  }

  // Phone verification submitted
  showVerifyForm.value = false;
  phoneInfo.value.verified = true;
  // TODO: Implement phone verification API call
}

// Toggle change form
function toggleChangeForm() {
  showChangeForm.value = !showChangeForm.value;
  if (showChangeForm.value) {
    showVerifyForm.value = false;
  }
}

// Toggle verify form
function toggleVerifyForm() {
  showVerifyForm.value = !showVerifyForm.value;
  if (showVerifyForm.value) {
    showChangeForm.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 骨架屏加载状态 -->
    <div v-if="false" class="space-y-6">
      <!-- 当前手机号骨架屏 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4">
            <div
              class="h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            ></div>
            <div class="space-y-3">
              <div
                class="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            </div>
          </div>
          <div class="flex space-x-2">
            <div
              class="h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
            <div
              class="h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>
      </div>

      <!-- 使用统计骨架屏 -->
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
            v-for="i in 3"
            :key="i"
            class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="space-y-3">
              <div
                class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
              <div
                class="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Section Header -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">手机号码</h2>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        管理您的手机号码和相关设置
      </p>
    </div>

    <!-- Current Phone Number -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-4">
          <div class="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
            <Phone class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              当前手机号
            </h3>
            <div class="mt-2 space-y-2">
              <div class="flex items-center space-x-2">
                <span class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ phoneInfo.number }}
                </span>
                <span
                  v-if="phoneInfo.verified"
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
              <p class="text-sm text-gray-600 dark:text-gray-400">
                绑定时间：{{ phoneInfo.bindDate }}
              </p>
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            v-if="!phoneInfo.verified"
            class="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            @click="toggleVerifyForm"
          >
            验证手机
          </button>
          <button
            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="toggleChangeForm"
          >
            <Edit class="mr-1 h-4 w-4" />
            更换手机
          </button>
        </div>
      </div>
    </div>

    <!-- Change Phone Form -->
    <div
      v-if="showChangeForm"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        更换手机号码
      </h3>
      <form @submit.prevent="handlePhoneChange" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <!-- Country Code -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              国家/地区
            </label>
            <select
              v-model="changeForm.countryCode"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
            >
              <option
                v-for="country in countryCodes"
                :key="country.code"
                :value="country.code"
              >
                {{ country.code }} {{ country.name }}
              </option>
            </select>
          </div>

          <!-- New Phone Number -->
          <div class="sm:col-span-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              新手机号码
            </label>
            <input
              v-model="changeForm.newPhone"
              type="tel"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-500 dark:bg-[rgb(32,32,42)] dark:text-white"
              placeholder="请输入新的手机号码"
              required
            />
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

    <!-- Verify Phone Form -->
    <div
      v-if="showVerifyForm"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        验证手机号码
      </h3>
      <form @submit.prevent="handlePhoneVerification" class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          我们将向 {{ phoneInfo.number }} 发送验证码
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
              @click="sendVerificationCode('verify')"
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
            @click="showVerifyForm = false"
          >
            取消
          </button>
          <button
            type="submit"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            验证手机
          </button>
        </div>
      </form>
    </div>

    <!-- Phone Security Features -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <div class="mb-4 flex items-center space-x-3">
        <div class="rounded-lg bg-green-100 p-2 dark:bg-green-500/20">
          <Shield class="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            安全功能
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            手机号码相关的安全设置
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
          <div class="flex items-center space-x-3">
            <MessageSquare class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">
                短信验证
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                登录和敏感操作验证
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
          <div class="flex items-center space-x-3">
            <Shield class="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">
                安全通知
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                账户异常活动提醒
              </p>
            </div>
          </div>
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
          v-for="usage in phoneUsage"
          :key="usage.date"
          class="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600"
        >
          <div class="rounded-full bg-blue-100 p-1 dark:bg-blue-500/20">
            <Phone class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ usage.action }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ usage.date }} • {{ usage.description }}
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
