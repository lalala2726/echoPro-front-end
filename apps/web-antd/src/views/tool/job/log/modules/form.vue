<script lang="ts" setup>
import type { JobLogType } from '#/api/tool/job/type/logType';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Col, Row, Tag } from 'ant-design-vue';

const loading = ref(false);
const data = ref<JobLogType.SysJobLogVo>();

const [Modal, modalApi] = useVbenModal({
  class: 'w-full max-w-4xl',
  confirmText: '关闭',
  contentClass: 'p-0',
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      loading.value = true;
      await nextTick();
      loading.value = false;
    } else {
      data.value = undefined;
      loading.value = false;
    }
  },
  showCancelButton: false,
  title: '任务日志详情',
});

// 格式化时间
const formatTime = (time: Date | number | string | undefined) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 获取执行状态标签
const getStatusTag = (status: number | undefined) => {
  if (status === undefined) return { color: 'default', text: '未知' };

  switch (status) {
    case 0: {
      return { color: 'success', text: '成功' };
    }
    case 1: {
      return { color: 'error', text: '失败' };
    }
    default: {
      return { color: 'default', text: '未知' };
    }
  }
};

// 计算执行耗时
const executionTime = computed(() => {
  if (!data.value?.startTime || !data.value?.endTime) return '-';
  const start = new Date(data.value.startTime).getTime();
  const end = new Date(data.value.endTime).getTime();
  const duration = end - start;
  return `${duration}ms`;
});

defineExpose({
  modalApi,
  setData: (newData: JobLogType.SysJobLogVo) => {
    data.value = newData;
  },
});
</script>

<template>
  <Modal>
    <div v-loading="loading" class="p-6">
      <div v-if="data" class="space-y-6">
        <!-- 基本信息 -->
        <Card title="基本信息" size="small">
          <Row :gutter="[16, 16]">
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">任务名称:</span>
                <span class="font-medium">{{ data.jobName || '-' }}</span>
              </div>
            </Col>
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">任务组名:</span>
                <span>{{ data.jobGroup || '-' }}</span>
              </div>
            </Col>
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">调用目标:</span>
                <span class="break-all">{{ data.invokeTarget || '-' }}</span>
              </div>
            </Col>
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">执行状态:</span>
                <Tag :color="getStatusTag(data.status).color">
                  {{ getStatusTag(data.status).text }}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        <!-- 执行信息 -->
        <Card title="执行信息" size="small">
          <Row :gutter="[16, 16]">
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">开始时间:</span>
                <span>{{ formatTime(data.startTime) }}</span>
              </div>
            </Col>
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">结束时间:</span>
                <span>{{ formatTime(data.endTime) }}</span>
              </div>
            </Col>
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">执行耗时:</span>
                <span>{{ executionTime }}</span>
              </div>
            </Col>
            <Col :span="12">
              <div class="flex items-center">
                <span class="w-20 text-gray-600">创建时间:</span>
                <span>{{ formatTime(data.createTime) }}</span>
              </div>
            </Col>
          </Row>
        </Card>

        <!-- 日志信息 -->
        <Card title="日志信息" size="small">
          <div class="space-y-4">
            <div v-if="data.jobMessage">
              <div class="mb-2 text-sm font-medium text-gray-600">
                执行消息:
              </div>
              <div class="rounded bg-gray-50 p-3 text-sm">
                {{ data.jobMessage }}
              </div>
            </div>
            <div v-if="data.exceptionInfo">
              <div class="mb-2 text-sm font-medium text-red-600">异常信息:</div>
              <div
                class="max-h-60 overflow-auto rounded bg-red-50 p-3 text-sm text-red-700"
              >
                <pre class="whitespace-pre-wrap">{{ data.exceptionInfo }}</pre>
              </div>
            </div>
            <div v-if="!data.jobMessage && !data.exceptionInfo">
              <div class="text-center text-gray-500">暂无日志信息</div>
            </div>
          </div>
        </Card>
      </div>
      <div v-else class="text-center text-gray-500">暂无数据</div>
    </div>
  </Modal>
</template>
