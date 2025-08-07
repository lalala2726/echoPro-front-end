<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorDeviceApi } from '#/api/system/online/device';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDevice,
  deviceList,
  exportDeviceList,
} from '#/api/system/online/device';

import { useColumns, useGridFormSchema } from './data';

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
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await deviceList({
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'refreshTokenId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<MonitorDeviceApi.deviceList>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorDeviceApi.deviceList>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 删除设备
 */
function onDelete(row: MonitorDeviceApi.deviceList) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要强制下线设备 "${row.deviceName}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: `正在强制下线 ${row.deviceName} ...`,
        duration: 0,
        key: 'action_process_msg',
      });
      deleteDevice(row.refreshTokenId!)
        .then(() => {
          message.success({
            content: `${row.deviceName} 强制下线成功`,
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
 * 导出设备列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出设备列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportDeviceList(formValues);

    message.success({
      content: '设备列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    // 使用具体的错误消息，如果没有则使用默认消息
    const errorMessage = error?.message || '设备列表导出失败';
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
    <Page auto-content-height>
      <Grid table-title="在线设备列表">
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['system:online-device:export'])"
            :loading="isExporting"
            :disabled="isExporting"
            @click="onExport"
          >
            {{ isExporting ? '导出中...' : '导出' }}
          </Button>
        </template>
        <template #action="{ row }">
          <Button
            v-if="hasAccessByCodes(['system:online-device:delete'])"
            danger
            size="small"
            type="link"
            @click="onActionClick({ code: 'delete', row })"
          >
            强制下线
          </Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
