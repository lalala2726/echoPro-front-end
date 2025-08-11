<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { Mail, Phone } from '@vben/icons';

import { Input, message } from 'ant-design-vue';

import { sendEmailCaptcha, sendPhoneCaptcha } from '#/api/common/captcha';
import {
  getEmail,
  getPhone,
  updateEmail,
  updatePhone,
} from '#/api/personal/profile';

// 响应式状态
const loading = ref(true);
const currentPhone = ref('');
const currentEmail = ref('');
const showPhoneForm = ref(false);
const showEmailForm = ref(false);
const phoneCountdown = ref(0);
const emailCountdown = ref(0);
const isPhoneLoading = ref(false);
const isEmailLoading = ref(false);

// 表单数据
const phoneForm = ref({
  phone: '',
  code: '',
});

const emailForm = ref({
  email: '',
  code: '',
});

// 计算属性
const canSendPhoneCode = computed(() => {
  return phoneForm.value.phone && phoneCountdown.value === 0;
});

const canSendEmailCode = computed(() => {
  return emailForm.value.email && emailCountdown.value === 0;
});

const canSubmitPhone = computed(() => {
  return phoneForm.value.phone && phoneForm.value.code;
});

const canSubmitEmail = computed(() => {
  return emailForm.value.email && emailForm.value.code;
});

// 加载联系信息
const loadContactInfo = async () => {
  loading.value = true;
  try {
    const [phoneResponse, emailResponse] = await Promise.all([
      getPhone(),
      getEmail(),
    ]);
    // 根据用户提供的JSON结构处理数据
    currentPhone.value = phoneResponse?.phone || '';
    currentEmail.value = emailResponse?.email || '';
  } finally {
    loading.value = false;
  }
};

// 发送手机验证码
const sendPhoneVerificationCode = async () => {
  if (!canSendPhoneCode.value) return;

  await sendPhoneCaptcha(phoneForm.value.phone);
  message.success('验证码已发送');
  startPhoneCountdown();
};

// 发送邮箱验证码
const sendEmailVerificationCode = async () => {
  if (!canSendEmailCode.value) return;

  await sendEmailCaptcha(emailForm.value.email);
  message.success('验证码已发送');
  startEmailCountdown();
};

// 开始手机验证码倒计时
const startPhoneCountdown = () => {
  phoneCountdown.value = 300; // 5分钟
  const timer = setInterval(() => {
    phoneCountdown.value--;
    if (phoneCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 开始邮箱验证码倒计时
const startEmailCountdown = () => {
  emailCountdown.value = 300; // 5分钟
  const timer = setInterval(() => {
    emailCountdown.value--;
    if (emailCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 处理手机号更新
const handlePhoneUpdate = async () => {
  if (!canSubmitPhone.value) return;

  isPhoneLoading.value = true;
  try {
    await updatePhone({
      phone: phoneForm.value.phone,
      code: phoneForm.value.code,
    });
    message.success('手机号更新成功');
    showPhoneForm.value = false;
    phoneForm.value = { phone: '', code: '' };
    await loadContactInfo(); // 刷新数据
  } finally {
    isPhoneLoading.value = false;
  }
};

// 处理邮箱更新
const handleEmailUpdate = async () => {
  if (!canSubmitEmail.value) return;

  isEmailLoading.value = true;
  try {
    await updateEmail({
      email: emailForm.value.email,
      code: emailForm.value.code,
    });
    message.success('邮箱更新成功');
    showEmailForm.value = false;
    emailForm.value = { email: '', code: '' };
    await loadContactInfo(); // 刷新数据
  } finally {
    isEmailLoading.value = false;
  }
};

// 切换表单显示
const togglePhoneForm = () => {
  showPhoneForm.value = !showPhoneForm.value;
  if (!showPhoneForm.value) {
    phoneForm.value = { phone: '', code: '' };
  }
};

const toggleEmailForm = () => {
  showEmailForm.value = !showEmailForm.value;
  if (!showEmailForm.value) {
    emailForm.value = { email: '', code: '' };
  }
};

// 格式化倒计时显示
const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 初始化
onMounted(() => {
  loadContactInfo();
});
</script>

<template>
  <div class="space-y-6">
    <!-- 页面加载状态 -->
    <div v-if="loading" class="space-y-6">
      <!-- 手机号骨架屏 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-4 flex items-center space-x-3">
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

      <!-- 邮箱骨架屏 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-4 flex items-center space-x-3">
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
    </div>

    <!-- 主要内容 -->
    <div v-else class="space-y-6">
      <!-- 手机号管理 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center space-x-3">
          <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
            <Phone class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              手机号码
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              用于登录验证和安全通知
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ currentPhone || '未绑定手机号' }}
          </div>
          <button
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            @click="togglePhoneForm"
          >
            {{ showPhoneForm ? '取消' : currentPhone ? '修改' : '绑定' }}
          </button>
        </div>

        <!-- 手机号修改表单 -->
        <div v-if="showPhoneForm" class="mt-6 space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              手机号码
            </label>
            <Input
              v-model:value="phoneForm.phone"
              addon-before="+86"
              placeholder="请输入手机号码"
              class="mt-1"
            />
          </div>

          <div class="flex space-x-3">
            <div class="flex-1">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                验证码
              </label>
              <Input
                v-model:value="phoneForm.code"
                placeholder="请输入验证码"
                class="mt-1"
              />
            </div>
            <div class="flex items-end">
              <button
                :disabled="!canSendPhoneCode"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-gray-300 dark:hover:bg-[rgb(40,40,50)] dark:focus:ring-offset-gray-900"
                @click="sendPhoneVerificationCode"
              >
                {{
                  phoneCountdown > 0
                    ? formatCountdown(phoneCountdown)
                    : '发送验证码'
                }}
              </button>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-gray-300 dark:hover:bg-[rgb(40,40,50)] dark:focus:ring-offset-gray-900"
              @click="togglePhoneForm"
            >
              取消
            </button>
            <button
              :disabled="!canSubmitPhone || isPhoneLoading"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
              @click="handlePhoneUpdate"
            >
              {{ isPhoneLoading ? '更新中...' : '确认' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 邮箱管理 -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <div class="mb-6 flex items-center space-x-3">
          <div class="rounded-lg bg-green-100 p-2 dark:bg-green-500/20">
            <Mail class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              邮箱地址
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              用于接收重要通知和找回密码
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ currentEmail || '未绑定邮箱' }}
          </div>
          <button
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            @click="toggleEmailForm"
          >
            {{ showEmailForm ? '取消' : currentEmail ? '修改' : '绑定' }}
          </button>
        </div>

        <!-- 邮箱修改表单 -->
        <div v-if="showEmailForm" class="mt-6 space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              邮箱地址
            </label>
            <Input
              v-model:value="emailForm.email"
              type="email"
              placeholder="请输入邮箱地址"
              class="mt-1"
            />
          </div>

          <div class="flex space-x-3">
            <div class="flex-1">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                验证码
              </label>
              <Input
                v-model:value="emailForm.code"
                placeholder="请输入验证码"
                class="mt-1"
              />
            </div>
            <div class="flex items-end">
              <button
                :disabled="!canSendEmailCode"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-gray-300 dark:hover:bg-[rgb(40,40,50)] dark:focus:ring-offset-gray-900"
                @click="sendEmailVerificationCode"
              >
                {{
                  emailCountdown > 0
                    ? formatCountdown(emailCountdown)
                    : '发送验证码'
                }}
              </button>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-[rgb(32,32,42)] dark:text-gray-300 dark:hover:bg-[rgb(40,40,50)] dark:focus:ring-offset-gray-900"
              @click="toggleEmailForm"
            >
              取消
            </button>
            <button
              :disabled="!canSubmitEmail || isEmailLoading"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
              @click="handleEmailUpdate"
            >
              {{ isEmailLoading ? '更新中...' : '确认' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
