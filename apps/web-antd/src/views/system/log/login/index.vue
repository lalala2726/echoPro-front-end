<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysLoginLogListVo } from '#/api/system/log/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, prompt, useVbenModal } from '@vben/common-ui';

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
const { hasAccessByCodes } = useAccess();

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
  } as VxeTableGridOptions<SysLoginLogListVo>,
});

function onActionClick({ code, row }: OnActionClickParams<SysLoginLogListVo>) {
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
function onDetail(row: SysLoginLogListVo) {
  detailModalApi.setData(row);
  detailModalApi.open();
}

/**
 * 删除登录日志
 */
function onDelete(row: SysLoginLogListVo) {
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
  const selectedRows = gridApi.grid.getCheckboxRecords() as SysLoginLogListVo[];
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
        .map((row: SysLoginLogListVo) => {
          return row.id;
        })
        .filter(
          (id: any) => id !== undefined && id !== null && id !== '',
        ) as string[];

      if (ids.length === 0) {
        message.error('选中的登录日志中没有有效的ID');
        return;
      }

      const hideLoading = message.loading({
        content: `正在删除 ${ids.length} 条登录日志...`,
        duration: 0,
        key: 'batch_delete_msg',
      });

      deleteLoginLog(ids)
        .then(() => {
          message.success({
            content: `成功删除 ${ids.length} 条登录日志`,
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
async function onCleanAll() {
  try {
    await prompt<string>({
      content:
        '确定要清空所有登录日志吗？此操作不可恢复！请输入"确认清空"来继续操作：',
      componentProps: {
        placeholder: '请输入"确认清空"',
      },
      icon: 'warning',
      title: '确认清空登录日志',
      async beforeClose({ isConfirm, value }) {
        if (isConfirm && value?.trim() !== '确认清空') {
          message.error('请输入"确认清空"以继续操作');
          return false;
        }
        return true;
      },
    })
      .then(async () => {
        const hideLoading = message.loading({
          content: '正在清空登录日志...',
          duration: 0,
          key: 'clean_all_msg',
        });

        try {
          await cleanLoginLog();
          message.success({
            content: '登录日志清空成功',
            key: 'clean_all_msg',
          });
          onRefresh();
        } catch (error) {
          hideLoading();
          console.error('清空失败:', error);
          message.error({
            content: '清空失败，请重试',
            key: 'clean_all_msg',
          });
        }
      })
      .catch(() => {
        // 用户取消操作，不需要提示
      });
  } catch (error) {
    console.error('清空登录日志操作失败:', error);
  }
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
    await exportLoginList(formValues);

    message.success({
      content: '登录日志列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    // 使用具体的错误消息，如果没有则使用默认消息
    const errorMessage = error?.message || '登录日志列表导出失败';
    message.error({
      content: errorMessage,
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
          <Button
            v-if="hasAccessByCodes(['system:log-login:delete'])"
            danger
            @click="onBatchDelete"
          >
            批量删除
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:log-login:clean'])"
            danger
            @click="onCleanAll"
          >
            清空日志
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:log-login:export'])"
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
