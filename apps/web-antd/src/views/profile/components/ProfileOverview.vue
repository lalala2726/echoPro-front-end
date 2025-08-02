<script lang="ts" setup>
import { ref } from 'vue';

import { Briefcase, Calendar, Camera, Edit, MapPin } from '@vben/icons';

interface Emits {
  (e: 'edit-profile'): void;
}

defineOptions({
  name: 'ProfileOverview',
});

const emit = defineEmits<Emits>();

// Edit mode state
const isEditing = ref(false);

// Mock user data
const userInfo = ref({
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  realName: '张创',
  username: 'zhangchuang',
  email: 'chuang@zhangchuangla.cn',
  phone: '+86 138****1234',
  department: '技术部',
  position: '前端开发工程师',
  location: '北京市朝阳区',
  joinDate: '2023-01-15',
  lastLogin: '2024-08-01 14:30:25',
  bio: '专注于前端技术开发，热爱学习新技术，致力于提升用户体验。',
  skills: ['Vue.js', 'TypeScript', 'Node.js', 'React', 'Python'],
  projects: 12,
  contributions: 156,
});

// Edit form data
const editForm = ref({
  realName: userInfo.value.realName,
  bio: userInfo.value.bio,
  position: userInfo.value.position,
  location: userInfo.value.location,
  skills: [...userInfo.value.skills],
});

// Handle avatar upload
function handleAvatarUpload() {
  // TODO: Implement avatar upload functionality
  console.log('Avatar upload clicked');
}

// Handle edit profile
function handleEditProfile() {
  isEditing.value = true;
  // Reset form data to current values
  editForm.value = {
    realName: userInfo.value.realName,
    bio: userInfo.value.bio,
    position: userInfo.value.position,
    location: userInfo.value.location,
    skills: [...userInfo.value.skills],
  };
  emit('edit-profile');
}

// Handle save profile
function handleSaveProfile() {
  // Update user info with form data
  userInfo.value.realName = editForm.value.realName;
  userInfo.value.bio = editForm.value.bio;
  userInfo.value.position = editForm.value.position;
  userInfo.value.location = editForm.value.location;
  userInfo.value.skills = [...editForm.value.skills];

  isEditing.value = false;
  console.log('Profile saved:', editForm.value);
}

// Handle cancel edit
function handleCancelEdit() {
  isEditing.value = false;
}

// Handle add skill
function handleAddSkill() {
  const skill = prompt('请输入新技能：');
  if (skill && skill.trim()) {
    editForm.value.skills.push(skill.trim());
  }
}

// Handle remove skill
function handleRemoveSkill(index: number) {
  editForm.value.skills.splice(index, 1);
}
</script>

<template>
  <div class="space-y-6">
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
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <!-- Avatar and Basic Info -->
      <div class="flex items-start space-x-6">
        <!-- Avatar -->
        <div class="relative">
          <img
            :src="userInfo.avatar"
            :alt="userInfo.realName"
            class="h-24 w-24 rounded-full object-cover"
          />
          <button
            class="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="handleAvatarUpload"
          >
            <Camera class="h-4 w-4" />
          </button>
        </div>

        <!-- Basic Info -->
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ userInfo.realName }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            @{{ userInfo.username }}
          </p>
          <p class="mt-2 text-gray-700 dark:text-gray-300">
            {{ userInfo.bio }}
          </p>

          <!-- Quick Stats -->
          <div class="mt-4 flex space-x-6">
            <div class="text-center">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ userInfo.projects }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">项目</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ userInfo.contributions }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">贡献</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Information -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Personal Information -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
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
              {{ userInfo.position }}
            </dd>
          </div>
          <div class="flex items-center">
            <dt
              class="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <MapPin class="mr-2 h-4 w-4" />
              位置
            </dt>
            <dd class="ml-auto text-sm text-gray-900 dark:text-white">
              {{ userInfo.location }}
            </dd>
          </div>
          <div class="flex items-center">
            <dt
              class="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <Calendar class="mr-2 h-4 w-4" />
              入职时间
            </dt>
            <dd class="ml-auto text-sm text-gray-900 dark:text-white">
              {{ userInfo.joinDate }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Contact Information -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
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
              {{ userInfo.email }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              手机号码
            </dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ userInfo.phone }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              最后登录
            </dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ userInfo.lastLogin }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Skills -->
    <div
      v-if="!isEditing"
      class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        技能标签
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="skill in userInfo.skills"
          :key="skill"
          class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        >
          {{ skill }}
        </span>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="isEditing" class="space-y-6">
      <!-- Basic Information Edit Form -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          编辑基本信息
        </h4>
        <form class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Real Name -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                姓名
              </label>
              <input
                v-model="editForm.realName"
                type="text"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="请输入姓名"
              />
            </div>

            <!-- Position -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                职位
              </label>
              <input
                v-model="editForm.position"
                type="text"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="请输入职位"
              />
            </div>
          </div>

          <!-- Location -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              位置
            </label>
            <input
              v-model="editForm.location"
              type="text"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="请输入位置"
            />
          </div>

          <!-- Bio -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              个人简介
            </label>
            <textarea
              v-model="editForm.bio"
              rows="3"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="请输入个人简介"
            ></textarea>
          </div>

          <!-- Skills -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              技能标签
            </label>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(skill, index) in editForm.skills"
                :key="index"
                class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {{ skill }}
                <button
                  type="button"
                  class="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-800"
                  @click="handleRemoveSkill(index)"
                >
                  ×
                </button>
              </span>
              <button
                type="button"
                class="inline-flex items-center rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
                @click="handleAddSkill"
              >
                + 添加技能
              </button>
            </div>
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

/* Input and textarea should have text cursor */
input,
textarea {
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
