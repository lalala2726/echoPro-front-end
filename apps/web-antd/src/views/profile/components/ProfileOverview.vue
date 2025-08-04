<script lang="ts" setup>
import type { profileType } from '#/api/core/profile';

import { onMounted, ref } from 'vue';

import { Briefcase, Camera, Edit, MapPin } from '@vben/icons';

import { Input, Select, Textarea } from 'ant-design-vue';

import { overviewInfo, updateProfile } from '#/api/core/profile';
import { UploadAvatar } from '#/components/upload';

interface Emits {
  (e: 'editProfile'): void;
}

defineOptions({
  name: 'ProfileOverview',
});

const emit = defineEmits<Emits>();

// Loading state
const loading = ref(false);

// Edit mode state
const isEditing = ref(false);

// User data from API
const userInfo = ref<profileType.ProfileOverviewInfoVo>({
  username: '',
  nickname: '',
  avatar: '',
  gender: '',
  email: '',
  phone: '',
  region: '',
  signature: '',
  deptName: '',
  post: '',
  roles: [],
});

// Edit form data (only editable fields)
const editForm = ref<profileType.ProfileUpdateRequest & { phone?: string }>({
  nickName: '',
  avatar: '',
  gender: '',
  region: '',
  signature: '',
});

// Load user profile data
async function loadUserProfile() {
  try {
    loading.value = true;
    const response = await overviewInfo();
    userInfo.value = response as profileType.ProfileOverviewInfoVo;
  } catch (error) {
    console.error('Failed to load user profile:', error);
  } finally {
    loading.value = false;
  }
}

// Handle avatar upload success
async function handleAvatarUploadSuccess(avatarUrl: string) {
  try {
    loading.value = true;

    // 更新头像
    const updateData = {
      nickName: userInfo.value.nickname || '',
      avatar: avatarUrl,
      gender: userInfo.value.gender || '',
      region: userInfo.value.region || '',
      signature: userInfo.value.signature || '',
    };

    await updateProfile(updateData);
    await loadUserProfile();
  } catch (error) {
    console.error('Failed to update avatar:', error);
  } finally {
    loading.value = false;
  }
}

// Handle edit profile
function handleEditProfile() {
  isEditing.value = true;
  editForm.value = {
    nickName: userInfo.value.nickname || '',
    avatar: userInfo.value.avatar || '',
    gender: userInfo.value.gender || '',
    region: userInfo.value.region || '',
    signature: userInfo.value.signature || '',
    phone: userInfo.value.phone || '',
  };
  emit('editProfile');
}

// Handle save profile
async function handleSaveProfile() {
  try {
    loading.value = true;
    await updateProfile(editForm.value);
    await loadUserProfile();
    isEditing.value = false;
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    loading.value = false;
  }
}

// Handle cancel edit
function handleCancelEdit() {
  isEditing.value = false;
}

// Initialize component
onMounted(() => {
  loadUserProfile();
});
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="space-y-6">
    <!-- 用户头像和基本信息骨架屏 -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
    >
      <div class="flex items-center space-x-6">
        <div
          class="h-24 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        ></div>
        <div class="flex-1 space-y-3">
          <div
            class="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
          <div
            class="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
          <div
            class="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
        <div
          class="h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
        ></div>
      </div>
    </div>

    <!-- 详细信息骨架屏 -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div
        v-for="i in 6"
        :key="i"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[rgb(24,24,32)]"
      >
        <div class="flex items-center space-x-3">
          <div
            class="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></div>
          <div class="flex-1 space-y-2">
            <div
              class="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
            <div
              class="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="space-y-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">概览</h2>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          查看和管理您的基本信息
        </p>
      </div>
      <div class="flex space-x-2">
        <button
          v-if="!isEditing"
          class="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          @click="handleEditProfile"
        >
          <Edit class="mr-2 h-4 w-4" />
          编辑资料
        </button>
        <button
          v-if="isEditing"
          class="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          @click="handleSaveProfile"
        >
          保存
        </button>
        <button
          v-if="isEditing"
          class="flex items-center rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          @click="handleCancelEdit"
        >
          取消
        </button>
      </div>
    </div>

    <!-- Profile Card -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
    >
      <!-- Avatar and Basic Info -->
      <div class="flex items-start space-x-6">
        <!-- Avatar with crop upload -->
        <div class="flex flex-col items-center">
          <div class="relative">
            <img
              :src="userInfo.avatar || '/default-avatar.png'"
              :alt="userInfo.nickname || userInfo.username"
              class="h-24 w-24 rounded-full object-cover"
            />
            <UploadAvatar @success="handleAvatarUploadSuccess">
              <div
                class="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Camera class="h-4 w-4" />
              </div>
            </UploadAvatar>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="flex-1">
          <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ userInfo.nickname || userInfo.username }}
            </h3>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            {{ userInfo.username }}
          </p>

          <!-- Role Info -->
          <div class="mt-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in userInfo.roles"
                :key="role"
                class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
              >
                {{ role }}
              </span>
            </div>
          </div>

          <div
            class="mt-2 max-w-[380px] break-words text-sm text-gray-500 dark:text-gray-400"
          >
            {{ userInfo.signature || '-' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Information -->
    <div v-if="!isEditing" class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Personal Information -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          个人信息
        </h4>
        <dl class="space-y-3">
          <div class="flex items-center">
            <dt
              class="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <Briefcase class="mr-2 h-4 w-4" />
              职位
            </dt>
            <dd class="ml-auto text-sm text-gray-900 dark:text-white">
              {{ userInfo.post || '-' }}
            </dd>
          </div>
          <div class="flex items-center">
            <dt
              class="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <MapPin class="mr-2 h-4 w-4" />
              地区
            </dt>
            <dd class="ml-auto text-sm text-gray-900 dark:text-white">
              {{ userInfo.region || '-' }}
            </dd>
          </div>
          <div class="flex items-center">
            <dt
              class="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <Briefcase class="mr-2 h-4 w-4" />
              部门
            </dt>
            <dd class="ml-auto text-sm text-gray-900 dark:text-white">
              {{ userInfo.deptName || '-' }}
            </dd>
          </div>
          <div class="flex items-center">
            <dt
              class="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              性别
            </dt>
            <dd class="ml-auto text-sm text-gray-900 dark:text-white">
              {{ userInfo.gender || '-' }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Contact Information -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          联系方式
        </h4>
        <dl class="space-y-3">
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              邮箱
            </dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ userInfo.email || '-' }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              手机号码
            </dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ userInfo.phone || '-' }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="isEditing" class="space-y-6">
      <!-- Basic Information Edit Form -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-[rgb(24,24,32)]"
      >
        <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          编辑基本信息
        </h4>
        <form class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Nickname -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                昵称
              </label>
              <Input
                v-model:value="editForm.nickName"
                placeholder="请输入昵称"
                class="mt-1"
              />
            </div>

            <!-- Gender -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                性别
              </label>
              <Select
                v-model:value="editForm.gender"
                placeholder="请选择性别"
                class="mt-1 w-full"
              >
                <Select.Option value="男">男</Select.Option>
                <Select.Option value="女">女</Select.Option>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Region -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                地区
              </label>
              <Input
                v-model:value="editForm.region"
                placeholder="请输入地区"
                class="mt-1"
              />
            </div>
          </div>

          <!-- Signature -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              个性签名
            </label>
            <Textarea
              v-model:value="editForm.signature"
              :rows="3"
              placeholder="请输入个性签名"
              class="mt-1"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

button * {
  cursor: inherit;
}

input,
textarea {
  cursor: text;
}

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
</style>
