<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysNoticeVo } from '#/api/system/notice/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteNotice,
  exportNoticeList,
  noticeById,
  noticeList,
} from '#/api/system/notice/notice';

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
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'noticeTitle',
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
          return await noticeList({
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
  } as VxeTableGridOptions<SysNoticeVo>,
});

function onActionClick({ code, row }: OnActionClickParams<SysNoticeVo>) {
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
 * 编辑公告
 */
function onEdit(row: SysNoticeVo) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

/**
 * 预览公告
 */
async function onPreview(row: SysNoticeVo) {
  try {
    message.loading({
      content: '正在加载公告详情...',
      duration: 0,
      key: 'preview_loading_msg',
    });

    const response = await noticeById(row.id!);
    message.destroy('preview_loading_msg');

    previewModalApi.setData(response);
    previewModalApi.open();
  } catch (error) {
    message.destroy('preview_loading_msg');
    console.error('Preview error:', error);
    message.error('加载公告详情失败');
  }
}

/**
 * 删除公告
 */
function onDelete(row: SysNoticeVo) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除公告 "${row.noticeTitle}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: `正在删除 ${row.noticeTitle} ...`,
        duration: 0,
        key: 'action_process_msg',
      });
      deleteNotice([row.id!])
        .then(() => {
          message.success({
            content: `${row.noticeTitle} 删除成功`,
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

/**
 * 创建新公告
 */
function onCreate() {
  formDrawerApi.setData({});
  formDrawerApi.open();
}

/**
 * 批量删除公告
 */
function onBatchDelete() {
  const selectedRows = gridApi.grid.getCheckboxRecords() as SysNoticeVo[];
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的公告');
    return;
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.length} 个公告吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const ids = selectedRows
        .map((row: SysNoticeVo) => {
          return row.id;
        })
        .filter((id: any) => !id && id !== undefined) as string[];

      if (ids.length === 0) {
        message.error('选中的公告中没有有效的ID');
        return;
      }

      const hideLoading = message.loading({
        content: `正在删除 ${ids.length} 个公告...`,
        duration: 0,
        key: 'action_process_msg',
      });

      deleteNotice(ids)
        .then(() => {
          message.success({
            content: `成功删除 ${ids.length} 个公告`,
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
 * 导出公告列表
 */
function onExport() {
  isExporting.value = true;
  const hideLoading = message.loading({
    content: '正在导出公告列表...',
    duration: 0,
    key: 'export_process_msg',
  });

  exportNoticeList()
    .then(() => {
      message.success({
        content: '公告列表导出成功',
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
          <Button
            v-if="hasAccessByCodes(['system:notice:add'])"
            type="primary"
            @click="onCreate"
          >
            <Plus class="size-5" />
            新增公告
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:notice:delete'])"
            type="primary"
            danger
            @click="onBatchDelete"
          >
            批量删除
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:notice:export'])"
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
