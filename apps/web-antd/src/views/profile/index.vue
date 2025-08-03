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
}

// Handle change password action from Account Security
function handleChangePassword() {
  activeSection.value = 'security';
  // Focus will be handled within the AccountSecurity component
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-black">
    <div class="mx-auto max-w-none px-6 py-8 sm:px-8 lg:px-12">
      <!-- Main Content Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <!-- Left Navigation Menu (1/5 width) -->
        <div class="lg:col-span-1">
          <ProfileNavigation
            :active-section="activeSection"
            @section-change="handleSectionChange"
          />
        </div>

        <!-- Right Content Area (4/5 width) -->
        <div class="lg:col-span-4">
          <div
            class="rounded-lg bg-white p-6 shadow-sm dark:bg-[rgb(24,24,32)]"
          >
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
