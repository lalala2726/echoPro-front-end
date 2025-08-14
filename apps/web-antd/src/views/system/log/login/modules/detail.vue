<script lang="ts" setup>
import type { SysLoginLog, SysLoginLogListVo } from '#/api/system/log/types';

import { computed, nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, Col, Row, Tag } from 'ant-design-vue';

import { getLoginLogById } from '#/api/system/log/login';

const detailData = ref<SysLoginLog>();

const getTitle = computed(() => {
  return '登录日志详情';
});

/**
 * 加载登录日志详情数据
 */
async function loadLoginLogData(logId: string) {
  try {
    detailData.value = await getLoginLogById(logId);
  } catch (error) {
    console.error('获取登录日志详情失败:', error);
  }
}

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
          const data = modalApi.getData<SysLoginLogListVo>();
          if (data && data.id) {
            const logId = data.id;
            if (logId) {
              await loadLoginLogData(logId);
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
  if (status === 0) {
    return { color: 'success', text: '成功' };
  } else if (status === 1) {
    return { color: 'error', text: '失败' };
  }
  return { color: 'default', text: '未知' };
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
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >日志ID:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.id || '--'
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
                >登录状态:
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
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >登录时间:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.loginTime || '--'
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
                detailData.region || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="设备信息" size="small" class="mb-4">
        <Row :gutter="[16, 16]">
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >浏览器:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.browser || '--'
              }}</span>
            </div>
          </Col>
          <Col :span="12">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >操作系统:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.os || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="其他信息" size="small">
        <Row :gutter="[16, 16]">
          <Col :span="24">
            <div class="flex items-center">
              <span
                class="mr-3 w-20 text-right text-gray-600 dark:text-gray-300"
                >创建者:
              </span>
              <span class="flex-1 font-medium">{{
                detailData.createBy || '--'
              }}</span>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  </Modal>
</template>
