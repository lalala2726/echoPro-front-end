<script lang="ts" setup>
import type { OnlineLoginUser } from '#/api/system/online/types';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Col, Row, Tag } from 'ant-design-vue';

interface Props {
  formData?: OnlineLoginUser;
}

withDefaults(defineProps<Props>(), {
  formData: undefined,
});

const detailData = ref<OnlineLoginUser>();

const getTitle = computed(() => {
  return '在线会话详情';
});

const [Modal, modalApi] = useVbenModal({
  showCancelButton: false,
  confirmText: '确定',
  class: 'w-[900px] min-w-[600px]', // 设置弹窗宽度和响应式
  contentClass: 'overflow-auto', // 设置内容区域最大高度和滚动
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
          const data = modalApi.getData<OnlineLoginUser>();
          if (data) {
            detailData.value = data;
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

// 格式化时间戳
function formatTime(timestamp?: number) {
  if (!timestamp) return '--';
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// 获取在线状态标签
function getOnlineStatusTag() {
  return { color: 'success', text: '在线' };
}

// 设置详情数据和加载状态
function setDetailData(data: OnlineLoginUser) {
  detailData.value = data;
}

function setLoading(isLoading: boolean) {
  modalApi.setState({ loading: isLoading });
}

defineExpose({
  modalApi,
  setDetailData,
  setLoading,
});
</script>

<template>
  <Modal :title="getTitle">
    <div v-if="detailData" class="mx-4">
      <Card title="基本信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
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
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >用户名:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.username || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >会话状态:
              </span>
              <span class="flex-1">
                <Tag :color="getOnlineStatusTag().color">
                  {{ getOnlineStatusTag().text }}
                </Tag>
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="会话信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="24">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >会话ID:
              </span>
              <span class="flex-1 break-all font-medium">{{
                detailData.accessTokenId || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >最近访问:
              </span>
              <span class="flex-1 font-medium">{{
                formatTime(detailData.accessTime)
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
                >IP地址:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.ip || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >登录地区:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.location || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="设备信息" size="small">
        <Row :gutter="[16, 16]">
          <Col :span="24">
            <div class="flex items-start">
              <span
                class="mr-3 w-20 flex-shrink-0 text-right text-gray-600 dark:text-gray-300"
                >User Agent:
              </span>
              <span class="flex-1 break-all font-medium">{{
                detailData.userAgent || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  </Modal>
</template>
