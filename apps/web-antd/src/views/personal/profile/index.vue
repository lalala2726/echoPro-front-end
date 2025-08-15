<script lang="ts" setup>
import { ref } from 'vue';

import AccountSecurity from './components/AccountSecurity.vue';
import ContactInfo from './components/ContactInfo.vue';
import ProfileNavigation from './components/ProfileNavigation.vue';
import ProfileOverview from './components/ProfileOverview.vue';

defineOptions({
  name: 'ProfilePage',
});

// 当前活跃的选项卡
const activeSection = ref('overview');

// 处理导航菜单的选项卡切换
function handleSectionChange(section: string) {
  activeSection.value = section;
}

// 处理编辑个人资料操作
function handleEditProfile() {
  // 这将在 ProfileOverview 组件内部处理
}

// 处理来自账户安全的更改密码操作
function handleChangePassword() {
  activeSection.value = 'security';
  // 焦点将在 AccountSecurity 组件内部处理
}
</script>

<template>
  <div class="dark:bg-background min-h-screen bg-gray-50">
    <div class="mx-auto max-w-none px-6 py-8 sm:px-8 lg:px-12">
      <!-- 主要内容布局 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <!-- 左侧导航菜单 (1/5 宽度) -->
        <div class="lg:col-span-1">
          <ProfileNavigation
            :active-section="activeSection"
            @section-change="handleSectionChange"
          />
        </div>

        <!-- 右侧内容区域 (4/5 宽度) -->
        <div class="lg:col-span-4">
          <div
            class="dark:bg-card dark:border-border rounded-lg bg-white p-6 shadow-sm"
          >
            <!-- 基于活跃选项卡的动态内容 -->
            <ProfileOverview
              v-if="activeSection === 'overview'"
              @edit-profile="handleEditProfile"
            />
            <AccountSecurity
              v-else-if="activeSection === 'security'"
              @change-password="handleChangePassword"
            />
            <ContactInfo v-else-if="activeSection === 'contact'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 如有需要可在此添加自定义样式 */
</style>
