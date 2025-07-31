<script lang="ts" setup>
import type { JobLogType } from '#/api/tool/job/type/logType';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Col, Row, Tag } from 'ant-design-vue';

import { getJobLogInfo } from '#/api/tool/job/log';

const detailData = ref<JobLogType.SysJobLogVo>();

const getTitle = computed(() => {
  return '任务日志详情';
});

/**
 * 加载任务日志详情数据
 */
async function loadJobLogData(jobLogId: number) {
  try {
    const logDetail = await getJobLogInfo(jobLogId);
    detailData.value = logDetail;
  } catch (error) {
    console.error('获取任务日志详情失败:', error);
  }
}

const [Modal, modalApi] = useVbenModal({
  showCancelButton: false,
  confirmText: '确定',
  class: 'w-[1000px] min-w-[800px]',
  contentClass: 'overflow-auto',
  async onConfirm() {
    await modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      modalApi.setState({ loading: true });

      nextTick(async () => {
        try {
          const data = modalApi.getData<JobLogType.SysJobLogVo>();
          if (data && data.jobLogId) {
            const jobLogId = data.jobLogId;
            if (!Number.isNaN(jobLogId)) {
              await loadJobLogData(jobLogId);
            }
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          modalApi.setState({ loading: false });
        }
      });
    } else {
      detailData.value = undefined;
      modalApi.setState({ loading: false });
    }
  },
});

/**
 * 获取执行状态标签
 */
function getStatusTag(status?: number) {
  if (status === 0) {
    return { color: 'success', text: '成功' };
  } else if (status === 1) {
    return { color: 'error', text: '失败' };
  }
  return { color: 'default', text: '未知' };
}

/**
 * 格式化执行时间
 */
function formatExecuteTime(executeTime?: number) {
  if (!executeTime) return '--';
  if (executeTime < 1000) {
    return `${executeTime}ms`;
  }
  return `${(executeTime / 1000).toFixed(2)}s`;
}
</script>

<template>
  <Modal :title="getTitle">
    <div v-if="detailData" class="mx-4">
      <Card title="基本信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                日志ID:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.jobLogId || '--' }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                任务ID:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.jobId || '--' }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                任务名称:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.jobName || '--' }}
              </span>
            </div>
          </Col>
          <Col :span="24">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                调用目标:
              </span>
              <span class="flex-1 break-all font-medium">
                {{ detailData.invokeTarget || '--' }}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="执行信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                执行状态:
              </span>
              <span class="flex-1">
                <Tag :color="getStatusTag(detailData.status).color">
                  {{ getStatusTag(detailData.status).text }}
                </Tag>
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                执行耗时:
              </span>
              <span class="flex-1 font-medium">
                {{ formatExecuteTime(detailData.executeTime) }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                开始时间:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.startTime || '--' }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                结束时间:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.endTime || '--' }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                重试次数:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.retryCount || 0 }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                触发器类型:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.triggerType || '--' }}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="服务器信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                服务器IP:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.serverIp || '--' }}
              </span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-24 text-right text-gray-600 dark:text-gray-300"
              >
                服务器名称:
              </span>
              <span class="flex-1 font-medium">
                {{ detailData.serverName || '--' }}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        v-if="detailData.jobData"
        title="任务参数"
        size="small"
        class="mb-4"
      >
        <div class="rounded bg-gray-50 p-3 dark:bg-gray-800">
          <pre class="whitespace-pre-wrap text-sm">
            {{ detailData.jobData }}
          </pre>
        </div>
      </Card>

      <Card
        v-if="detailData.jobMessage"
        title="日志信息"
        size="small"
        class="mb-4"
      >
        <div class="rounded bg-gray-50 p-3 dark:bg-gray-800">
          <pre class="whitespace-pre-wrap text-sm">
            {{ detailData.jobMessage }}
          </pre>
        </div>
      </Card>

      <Card v-if="detailData.exceptionInfo" title="异常信息" size="small">
        <div
          class="rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
        >
          <pre
            class="whitespace-pre-wrap text-sm text-red-600 dark:text-red-400"
          >
            {{ detailData.exceptionInfo }}
          </pre>
        </div>
      </Card>
    </div>
  </Modal>
</template>
