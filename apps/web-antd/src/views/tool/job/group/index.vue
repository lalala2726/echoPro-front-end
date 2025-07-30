<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { JobGroupType } from '#/api/tool/job/type/groupType';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteGroup,
  exportGroupList,
  groupList,
  updateGroup,
} from '#/api/tool/job/group';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
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
      labelField: 'groupName',
    },
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await groupList({
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
  } as VxeTableGridOptions<JobGroupType.SysJobGroupListVo>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<JobGroupType.SysJobGroupListVo>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 状态切换
 */
async function onStatusChange(
  checked: boolean,
  row: JobGroupType.SysJobGroupListVo,
) {
  const status = checked ? 0 : 1;
  const statusText = status === 0 ? '启用' : '停用';

  const hideLoading = message.loading({
    content: `正在${statusText} ${row.groupName} ...`,
    duration: 0,
    key: 'status_change_msg',
  });

  try {
    await updateGroup({
      ...row,
      status,
    } as JobGroupType.SysJobGroupUpdateRequest);
    message.success({
      content: `${row.groupName} ${statusText}成功`,
      key: 'status_change_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
    throw new Error(`${statusText}失败`);
  }
}

/**
 * 编辑任务组
 */
function onEdit(row: JobGroupType.SysJobGroupListVo) {
  formModalApi.setData(row);
  formModalApi.open();
}

/**
 * 删除任务组
 */
function onDelete(row: JobGroupType.SysJobGroupListVo) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除任务组 "${row.groupName}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: `正在删除 ${row.groupName} ...`,
        duration: 0,
        key: 'action_process_msg',
      });
      deleteGroup([row.id!])
        .then(() => {
          message.success({
            content: `${row.groupName} 删除成功`,
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
 * 创建新任务组
 */
function onCreate() {
  formModalApi.setData({});
  formModalApi.open();
}

/**
 * 批量删除任务组
 */
function onBatchDelete() {
  const selectedRows =
    gridApi.grid.getCheckboxRecords() as JobGroupType.SysJobGroupListVo[];
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的任务组');
    return;
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.length} 个任务组吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const ids = selectedRows
        .map((row: JobGroupType.SysJobGroupListVo) => {
          return row.id;
        })
        .filter((id: any) => !Number.isNaN(id) && id !== undefined) as number[];

      if (ids.length === 0) {
        message.error('选中的任务组中没有有效的ID');
        return;
      }

      const hideLoading = message.loading({
        content: `正在删除 ${selectedRows.length} 个任务组...`,
        duration: 0,
        key: 'batch_delete_msg',
      });

      deleteGroup(ids)
        .then(() => {
          message.success({
            content: `成功删除 ${selectedRows.length} 个任务组`,
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
 * 导出任务组列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出任务组列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportGroupList(formValues);

    message.success({
      content: '任务组列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    // 使用具体的错误消息，如果没有则使用默认消息
    const errorMessage = error?.message || '任务组列表导出失败';
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
    <FormModal @success="onRefresh" />
    <Page auto-content-height>
      <Grid table-title="任务组列表">
        <template #toolbar-tools>
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            新增任务组
          </Button>
          <span class="mx-2"></span>
          <Button danger @click="onBatchDelete"> 批量删除 </Button>
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
