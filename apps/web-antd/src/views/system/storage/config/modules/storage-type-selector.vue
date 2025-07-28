<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { getStorageTypeOptions } from '../data';

const emit = defineEmits<{
  success: [storageType: string];
}>();

const selectedType = ref<string>('');

const storageTypeOptions = getStorageTypeOptions();

const [Drawer, drawerApi] = useVbenDrawer({
  showConfirmButton: false, // 禁用默认确认按钮
  showCancelButton: true, // 保留取消按钮
  onOpenChange(isOpen) {
    if (isOpen) {
      selectedType.value = '';
    }
  },
});

function selectStorageType(type: string) {
  selectedType.value = type;
}

function handleNext() {
  if (!selectedType.value) {
    // 可以在这里添加提示消息
    return;
  }
  drawerApi.close();
  emit('success', selectedType.value);
}

// 获取存储类型的图标和描述
function getStorageTypeInfo(type: string) {
  const info = {
    minio: {
      icon: 'M',
      color: 'bg-red-500',
      name: 'MinIO',
      description: '兼容 Amazon S3 API 的开源对象存储服务，适合私有化部署',
    },
    aliyun_oss: {
      icon: '阿',
      color: 'bg-orange-500',
      name: '阿里云 OSS',
      description: '阿里云对象存储服务，提供高可靠、高可用的云存储服务',
    },
    tencent_cos: {
      icon: '腾',
      color: 'bg-blue-500',
      name: '腾讯云 COS',
      description: '腾讯云对象存储服务，安全稳定、海量、便捷的数据存储服务',
    },
    amazon_s3: {
      icon: 'S3',
      color: 'bg-yellow-600',
      name: 'Amazon S3',
      description: 'Amazon Simple Storage Service，业界标准的对象存储服务',
    },
  };
  return info[type as keyof typeof info] || info.minio;
}

defineExpose({
  drawerApi,
});
</script>

<template>
  <Drawer class="w-[40%] min-w-[600px]" title="选择存储类型">
    <div class="p-6">
      <div class="mb-8">
        <h3 class="mb-3 text-xl font-semibold text-gray-900">创建存储配置</h3>
        <p class="text-gray-600">
          请选择您要配置的对象存储服务类型，系统将为您打开对应的配置表单
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="option in storageTypeOptions"
          :key="option.value"
          class="relative cursor-pointer rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
          :class="{
            'border-blue-500 bg-blue-50 shadow-lg':
              selectedType === option.value,
            'hover:bg-gray-50': selectedType !== option.value,
          }"
          @click="selectStorageType(option.value)"
        >
          <!-- 选中状态指示器 -->
          <div
            v-if="selectedType === option.value"
            class="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500"
          >
            <svg
              class="h-3 w-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- 存储类型图标 -->
          <div class="flex items-start space-x-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
              :class="[getStorageTypeInfo(option.value).color]"
            >
              {{ getStorageTypeInfo(option.value).icon }}
            </div>

            <div class="min-w-0 flex-1">
              <h4 class="text-lg font-medium text-gray-900">
                {{ getStorageTypeInfo(option.value).name }}
              </h4>
              <p class="mt-2 text-sm leading-relaxed text-gray-500">
                {{ getStorageTypeInfo(option.value).description }}
              </p>
            </div>
          </div>

          <!-- 特性标签 -->
          <div class="mt-4 flex flex-wrap gap-2">
            <template v-if="option.value === 'minio'">
              <span
                class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                开源免费
              </span>
              <span
                class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                S3兼容
              </span>
            </template>
            <template v-else-if="option.value === 'aliyun_oss'">
              <span
                class="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800"
              >
                国内服务
              </span>
              <span
                class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                高可靠性
              </span>
            </template>
            <template v-else-if="option.value === 'tencent_cos'">
              <span
                class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                国内服务
              </span>
              <span
                class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"
              >
                安全稳定
              </span>
            </template>
            <template v-else-if="option.value === 'amazon_s3'">
              <span
                class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
              >
                行业标准
              </span>
              <span
                class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                全球服务
              </span>
            </template>
          </div>
        </div>
      </div>

      <!-- 选择提示 -->
      <div
        v-if="!selectedType"
        class="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-yellow-800">
              请选择一个存储类型后点击"下一步"继续配置
            </p>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="mt-8 rounded-lg bg-blue-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h4 class="text-sm font-medium text-blue-800">选择建议</h4>
            <div class="mt-1 text-sm text-blue-700">
              <p>
                <strong>MinIO:</strong> 适合私有化部署和开发测试环境<br />
                <strong>云服务:</strong> 适合生产环境，提供更好的可靠性和支持
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="drawerApi.close()"
        >
          取消
        </button>
        <button
          type="button"
          :disabled="!selectedType"
          class="rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="[
            selectedType
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-300 text-gray-500',
          ]"
          @click="handleNext"
        >
          下一步
        </button>
      </div>
    </template>
  </Drawer>
</template>
