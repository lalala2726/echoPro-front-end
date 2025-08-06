<script lang="ts" setup>
import { computed } from 'vue';

import { Mail, Shield, User } from '@vben/icons';

interface Props {
  activeSection: string;
}

interface Emits {
  (e: 'sectionChange', section: string): void;
}

defineOptions({
  name: 'ProfileNavigation',
});

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Navigation menu items
const menuItems = computed(() => [
  {
    key: 'overview',
    label: '概览',
    icon: User,
    description: '基本个人信息和资料概览',
  },
  {
    key: 'security',
    label: '账户安全',
    icon: Shield,
    description: '安全设置、密码管理和登录选项',
  },
  {
    key: 'contact',
    label: '联系方式',
    icon: Mail,
    description: '手机号码和邮箱地址管理',
  },
]);

// Handle menu item click
function handleMenuClick(key: string) {
  emit('sectionChange', key);
}
</script>

<template>
  <div class="rounded-lg bg-white shadow-sm dark:bg-[rgb(24,24,32)]">
    <!-- Navigation Header -->
    <div class="border-b border-gray-200 p-4 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        账户中心
      </h3>
    </div>

    <!-- Navigation Menu -->
    <nav class="p-2">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.key">
          <button
            class="group flex w-full items-start rounded-lg p-3 text-left transition-colors duration-200"
            :class="[
              props.activeSection === item.key
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
            @click="handleMenuClick(item.key)"
          >
            <!-- Icon -->
            <div
              class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
              :class="[
                props.activeSection === item.key
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600',
              ]"
            >
              <component :is="item.icon" class="h-4 w-4" />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div
                class="text-sm font-medium"
                :class="[
                  props.activeSection === item.key
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ item.label }}
              </div>
              <div
                class="mt-1 text-xs"
                :class="[
                  props.activeSection === item.key
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                {{ item.description }}
              </div>
            </div>

            <!-- Active Indicator -->
            <div
              v-if="props.activeSection === item.key"
              class="ml-2 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"
            ></div>
          </button>
        </li>
      </ul>
    </nav>
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

.group {
  cursor: pointer;
}

/* Ensure text elements don't show text cursor when clickable */
button * {
  cursor: inherit;
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
ul,
li,
nav {
  cursor: default;
}

/* Clickable text elements should have pointer cursor */
.cursor-pointer {
  cursor: pointer;
}
</style>
