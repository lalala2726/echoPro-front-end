<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemLoginLogApi } from '#/api/system/log/login';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanLoginLog,
  deleteLoginLog,
  exportLoginList,
  getLoginLogList,
} from '#/api/system/log/login';

import { useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: Detail,
  destroyOnClose: true,
});

// 导出状态管理
const isExporting = ref<boolean>(false);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['loginTime', ['startTime', 'endTime']]],
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
          return await getLoginLogList({
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
  } as VxeTableGridOptions<SystemLoginLogApi.SysLoginLogListVo>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemLoginLogApi.SysLoginLogListVo>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'detail': {
      onDetail(row);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 查看详情
 */
function onDetail(row: SystemLoginLogApi.SysLoginLogListVo) {
  detailModalApi.setData(row);
  detailModalApi.open();
}

/**
 * 删除登录日志
 */
function onDelete(row: SystemLoginLogApi.SysLoginLogListVo) {
  const hideLoading = message.loading({
    content: `正在删除登录日志...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteLoginLog([row.id!])
    .then(() => {
      message.success({
        content: `登录日志删除成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

/**
 * 批量删除登录日志
 */
function onBatchDelete() {
  const selectedRows =
    gridApi.grid.getCheckboxRecords() as SystemLoginLogApi.SysLoginLogListVo[];
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的登录日志');
    return;
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.length} 条登录日志吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const ids = selectedRows
        .map((row: SystemLoginLogApi.SysLoginLogListVo) => {
          const id = row.id;
          return id;
        })
        .filter((id: any) => !Number.isNaN(id) && id !== undefined) as number[];

      const hideLoading = message.loading({
        content: `正在删除 ${selectedRows.length} 条登录日志...`,
        duration: 0,
        key: 'batch_delete_msg',
      });

      deleteLoginLog(ids)
        .then(() => {
          message.success({
            content: `成功删除 ${selectedRows.length} 条登录日志`,
            key: 'batch_delete_msg',
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
 * 清空登录日志
 */
function onCleanAll() {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有登录日志吗？此操作不可恢复！',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: '正在清空登录日志...',
        duration: 0,
        key: 'clean_all_msg',
      });

      cleanLoginLog()
        .then(() => {
          message.success({
            content: '登录日志清空成功',
            key: 'clean_all_msg',
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
 * 导出登录日志列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出登录日志列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportLoginList('登录日志列表', formValues);

    message.success({
      content: '登录日志列表导出成功',
      key: 'export_loading_msg',
    });
  } catch {
    message.error({
      content: '登录日志列表导出失败',
      key: 'export_loading_msg',
    });
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <div>
    <DetailModal />
    <Page auto-content-height>
      <Grid table-title="登录日志">
        <template #toolbar-tools>
          <Button danger @click="onBatchDelete"> 批量删除 </Button>
          <span class="mx-2"></span>
          <Button danger @click="onCleanAll"> 清空日志 </Button>
          <span class="mx-2"></span>
          <Button
            :loading="isExporting"
            :disabled="isExporting"
            @click="onExport"
          >
            {{ isExporting ? '导出中...' : '导出' }}
          </Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
