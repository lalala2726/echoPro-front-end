<script lang="ts" setup>
import { ref } from 'vue';

import AccountSecurity from './components/AccountSecurity.vue';
import Email from './components/Email.vue';
import PhoneNumber from './components/PhoneNumber.vue';
import ProfileNavigation from './components/ProfileNavigation.vue';
import ProfileOverview from './components/ProfileOverview.vue';

defineOptions({
  name: 'ProfilePage',
});

// Current active section
const activeSection = ref('overview');

// Handle section change from navigation
function handleSectionChange(section: string) {
  activeSection.value = section;
}

// Handle edit profile action
function handleEditProfile() {
  // This will be handled within the ProfileOverview component
  console.log('Edit profile triggered');
}

// Handle change password action from Account Security
function handleChangePassword() {
  activeSection.value = 'security';
  // Focus will be handled within the AccountSecurity component
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          个人资料
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          管理您的个人信息和账户设置
        </p>
      </div>

      <!-- Main Content Layout -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <!-- Left Navigation Menu (1/4 width) -->
        <div class="lg:col-span-1">
          <ProfileNavigation
            :active-section="activeSection"
            @section-change="handleSectionChange"
          />
        </div>

        <!-- Right Content Area (3/4 width) -->
        <div class="lg:col-span-3">
          <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <!-- Dynamic Content Based on Active Section -->
            <ProfileOverview
              v-if="activeSection === 'overview'"
              @edit-profile="handleEditProfile"
            />
            <AccountSecurity
              v-else-if="activeSection === 'security'"
              @change-password="handleChangePassword"
            />
            <PhoneNumber v-else-if="activeSection === 'phone'" />
            <Email v-else-if="activeSection === 'email'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
