<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysMessageListVo } from '#/api/system/messageManage/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMessage,
  exportMessage,
  getMessageById,
  getMessageList,
} from '#/api/system/messageManage/messageManage';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import Preview from './modules/preview.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [PreviewModal, previewModalApi] = useVbenModal({
  connectedComponent: Preview,
  destroyOnClose: true,
});

// 导出状态管理
const isExporting = ref<boolean>(false);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['publishTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'id',
    },
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getMessageList({
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SysMessageListVo>,
});

function onActionClick({ code, row }: OnActionClickParams<SysMessageListVo>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'preview': {
      onPreview(row);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 编辑消息
 */
function onEdit(row: SysMessageListVo) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

/**
 * 预览消息
 */
async function onPreview(row: SysMessageListVo) {
  try {
    message.loading({
      content: '正在加载消息详情...',
      duration: 0,
      key: 'preview_loading_msg',
    });

    const response = await getMessageById(row.id!);
    message.destroy('preview_loading_msg');

    previewModalApi.setData(response);
    previewModalApi.open();
  } catch (error) {
    message.destroy('preview_loading_msg');
    console.error('Preview error:', error);
    message.error('加载消息详情失败');
  }
}

/**
 * 删除消息
 */
function onDelete(row: SysMessageListVo) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除消息 "${row.title}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: `正在删除 ${row.title} ...`,
        duration: 0,
        key: 'action_process_msg',
      });
      deleteMessage([row.id!])
        .then(() => {
          message.success({
            content: `${row.title} 删除成功`,
            key: 'action_process_msg',
          });
          onRefresh();
        })
        .catch(() => {
          hideLoading();
        });
    },
  });
}

function onRefresh() {
  gridApi.query();
}

// 已移除创建/发送入口：发送功能已迁移至 /system/message/send 页面

/**
 * 批量删除消息
 */
function onBatchDelete() {
  const selectedRows = gridApi.grid.getCheckboxRecords() as SysMessageListVo[];
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的消息');
    return;
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.length} 个消息吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const ids = selectedRows.map((row: SysMessageListVo) => {
        return row.id;
      });

      if (ids.length === 0) {
        message.error('选中的消息中没有有效的ID');
        return;
      }

      const hideLoading = message.loading({
        content: `正在删除 ${ids.length} 个消息...`,
        duration: 0,
        key: 'action_process_msg',
      });

      deleteMessage(ids)
        .then(() => {
          message.success({
            content: `成功删除 ${ids.length} 个消息`,
            key: 'action_process_msg',
          });
          onRefresh();
        })
        .catch(() => {
          hideLoading();
        });
    },
  });
}

/**
 * 导出消息列表
 */
function onExport() {
  isExporting.value = true;
  const hideLoading = message.loading({
    content: '正在导出消息列表...',
    duration: 0,
    key: 'export_process_msg',
  });

  exportMessage()
    .then(() => {
      message.success({
        content: '消息列表导出成功',
        key: 'export_process_msg',
      });
    })
    .catch(() => {
      hideLoading();
    })
    .finally(() => {
      isExporting.value = false;
    });
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <FormDrawer @success="onRefresh" />
      <PreviewModal />
      <Grid>
        <template #toolbar-tools>
          <!-- 已移除新增/发送入口 -->
          <Button
            v-if="hasAccessByCodes(['system:message:delete'])"
            type="primary"
            danger
            @click="onBatchDelete"
          >
            批量删除
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:message:export'])"
            :loading="isExporting"
            @click="onExport"
          >
            导出
          </Button>
          <span class="mx-2"></span>
        </template>
      </Grid>
    </Page>
  </div>
</template>
