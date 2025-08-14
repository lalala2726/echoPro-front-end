<script lang="ts" setup>
import type {
  SysOperationLog,
  SysOperationLogListVo,
} from '#/api/system/log/types';

import { computed, nextTick, ref } from 'vue';

import { JsonViewer, useVbenModal } from '@vben/common-ui';

import { Card, Col, message, Row, Tag } from 'ant-design-vue';

import { getOperationById } from '#/api/system/log/operation';

const detailData = ref<SysOperationLog>();

const getTitle = computed(() => {
  return '操作日志详情';
});

/**
 * 加载操作日志详情数据
 */
async function loadOperationLogData(logId: string) {
  try {
    detailData.value = await getOperationById(logId);
  } catch (error) {
    console.error('获取操作日志详情失败:', error);
  }
}

const [Modal, modalApi] = useVbenModal({
  showCancelButton: false,
  confirmText: '确定',
  class: 'w-[900px] min-w-[600px]', // 设置弹窗宽度和响应式
  contentClass: 'overflow-auto', // 设置内容区域最大高度和滚动
  fullscreen: false,
  fullscreenButton: true,
  async onConfirm() {
    await modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      // 设置Modal的loading状态
      modalApi.setState({ loading: true });

      // 使用nextTick确保DOM更新后再执行异步操作
      nextTick(async () => {
        try {
          const data = modalApi.getData<SysOperationLogListVo>();
          if (data && data.id) {
            const logId = data.id;
            if (!Number.isNaN(logId)) {
              await loadOperationLogData(logId);
            }
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          // 关闭Modal的loading状态
          modalApi.setState({ loading: false });
        }
      });
    } else {
      // 弹窗关闭时立即重置状态
      detailData.value = undefined;
      modalApi.setState({ loading: false });
    }
  },
});

/**
 * 获取状态标签
 */
function getStatusTag(status?: number) {
  switch (status) {
    case 0: {
      return { color: 'success', text: '成功' };
    }
    case 1: {
      return { color: 'error', text: '失败' };
    }
    case 2: {
      return { color: 'warning', text: '未知' };
    }
    // No default
  }
  return { color: 'default', text: '未知' };
}

/**
 * 解析JSON字符串
 */
function parseJsonString(jsonStr?: string) {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr);
  } catch {
    // 如果不是有效的JSON，返回原字符串
    return jsonStr;
  }
}

/**
 * 检查是否为有效的JSON字符串
 */
function isValidJson(str?: string): boolean {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * JSON复制成功回调
 */
function handleJsonCopied() {
  message.success('JSON已复制到剪贴板');
}
</script>

<template>
  <Modal :title="getTitle">
    <div v-if="detailData" class="mx-4">
      <Card title="基本信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >日志ID:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.id || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >用户ID:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.userId || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >用户名:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.userName || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作状态:
              </span>
              <span class="flex-1">
                <Tag :color="getStatusTag(detailData.operationStatus).color">
                  {{ getStatusTag(detailData.operationStatus).text }}
                </Tag>
              </span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >请求方式:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.requestMethod || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作时间:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.createTime || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="网络信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作IP:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.operationIp || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作地区:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.operationRegion || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="操作信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作模块:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.module || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作类型:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.operationType || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="8">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >耗时:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.costTime !== undefined
                  ? `${detailData.costTime}ms`
                  : '--'
              }}</span>
            </div>
          </Col>
          <Col :span="24">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >方法名称:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.methodName || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="24">
            <div class="flex items-start">
              <span
                class="mr-3 mt-1 w-20 text-right text-gray-600 dark:text-gray-300"
                >请求地址:
              </span>
              <span class="flex-1 break-all font-medium">{{
                detailData.requestUrl || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>

      <!-- 请求参数 -->
      <Card
        v-if="detailData.requestParams === ''"
        title="请求参数"
        size="small"
        class="mb-4"
      >
        <div v-if="isValidJson(detailData.requestParams)">
          <JsonViewer
            :value="parseJsonString(detailData.requestParams)"
            :expand-depth="2"
            copyable
            boxed
            @copied="handleJsonCopied"
          />
        </div>
        <div v-else class="rounded border bg-gray-50 p-3 dark:bg-gray-800">
          <pre
            class="max-h-40 overflow-y-auto whitespace-pre-wrap break-all text-sm"
            >{{ detailData.requestParams }}
          </pre>
        </div>
      </Card>

      <!-- 操作结果 -->
      <Card
        v-if="detailData.responseResult"
        title="操作结果"
        size="small"
        class="mb-4"
      >
        <div v-if="isValidJson(detailData.responseResult)">
          <JsonViewer
            :value="parseJsonString(detailData.responseResult)"
            :expand-depth="2"
            copyable
            boxed
            @copied="handleJsonCopied"
          />
        </div>
        <div v-else class="rounded border bg-gray-50 p-3 dark:bg-gray-800">
          <pre
            class="max-h-40 overflow-y-auto whitespace-pre-wrap break-all text-sm"
            >{{ detailData.responseResult }}
          </pre>
        </div>
      </Card>

      <!-- 错误信息 -->
      <Card v-if="detailData.errorMsg" title="错误信息" size="small">
        <div
          class="rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
        >
          <pre
            class="max-h-40 overflow-y-auto whitespace-pre-wrap break-all text-sm text-red-600 dark:text-red-400"
            >{{ detailData.errorMsg }}
          </pre>
        </div>
      </Card>
    </div>
  </Modal>
</template>
