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

// 导航菜单选项
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

// 处理菜单项点击事件
function handleMenuClick(key: string) {
  emit('sectionChange', key);
}
</script>

<template>
  <div class="dark:bg-card dark:border-border rounded-lg bg-white shadow-sm">
    <!-- 导航头部 -->
    <div class="dark:border-border border-b border-gray-200 p-4">
      <h3 class="dark:text-foreground text-lg font-semibold text-gray-900">
        账户中心
      </h3>
    </div>

    <!-- 导航菜单 -->
    <nav class="p-2">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.key">
          <button
            class="group flex w-full items-start rounded-lg p-3 text-left transition-colors duration-200"
            :class="[
              props.activeSection === item.key
                ? 'bg-blue-50dark:bg-blue-900/20 dark:text-blue-400'
                : 'dark:text-muted-foreground dark:hover:bg-muted text-gray-700 hover:bg-gray-50',
            ]"
            @click="handleMenuClick(item.key)"
          >
            <!-- 图标 -->
            <div
              class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
              :class="[
                props.activeSection === item.key
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400'
                  : 'dark:bg-muted dark:text-muted-foreground dark:group-hover:bg-muted/80 bg-gray-100 text-gray-500 group-hover:bg-gray-200',
              ]"
            >
              <component :is="item.icon" class="h-4 w-4" />
            </div>

            <!-- 内容 -->
            <div class="min-w-0 flex-1">
              <div
                class="text-sm font-medium"
                :class="[
                  props.activeSection === item.key
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'dark:text-foreground text-gray-900',
                ]"
              >
                {{ item.label }}
              </div>
              <div
                class="mt-1 text-xs"
                :class="[
                  props.activeSection === item.key
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'dark:text-muted-foreground text-gray-500',
                ]"
              >
                {{ item.description }}
              </div>
            </div>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
/* 修复交互元素的鼠标样式 */
button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

.group {
  cursor: pointer;
}

/* 确保可点击时文本元素不显示文本光标 */
button * {
  cursor: inherit;
}

/* 防止其他元素显示文本光标 */
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

/* 可点击的文本元素应显示指针光标 */
.cursor-pointer {
  cursor: pointer;
}
</style>
