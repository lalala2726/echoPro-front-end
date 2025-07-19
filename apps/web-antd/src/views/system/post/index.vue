<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePost,
  exportPostList,
  getPostList,
  updatePost,
} from '#/api/system/post';

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
      labelField: 'postName',
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
          return await getPostList({
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
  } as VxeTableGridOptions<SystemPostApi.SysPost>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemPostApi.SysPost>) {
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
async function onStatusChange(checked: boolean, row: SystemPostApi.SysPost) {
  const status = checked ? 0 : 1;
  const statusText = status === 0 ? '启用' : '停用';

  const hideLoading = message.loading({
    content: `正在${statusText} ${row.postName} ...`,
    duration: 0,
    key: 'status_change_msg',
  });

  try {
    await updatePost({ ...row, status });
    message.success({
      content: `${row.postName} ${statusText}成功`,
      key: 'status_change_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
    throw new Error(`${statusText}失败`);
  }
}

/**
 * 编辑岗位
 */
function onEdit(row: SystemPostApi.SysPost) {
  formModalApi.setData(row);
  formModalApi.open();
}

/**
 * 删除岗位
 */
function onDelete(row: SystemPostApi.SysPost) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除岗位 "${row.postName}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: `正在删除 ${row.postName} ...`,
        duration: 0,
        key: 'action_process_msg',
      });
      deletePost([row.id!])
        .then(() => {
          message.success({
            content: `${row.postName} 删除成功`,
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
 * 创建新岗位
 */
function onCreate() {
  formModalApi.setData({});
  formModalApi.open();
}

/**
 * 批量删除岗位
 */
function onBatchDelete() {
  const selectedRows = gridApi.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的岗位');
    return;
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.length} 个岗位吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const ids = selectedRows
        .map((row) => {
          const id =
            typeof row.id === 'string' ? Number.parseInt(row.id) : row.id;
          return id;
        })
        .filter((id) => !isNaN(id));

      console.log('Selected rows:', selectedRows); // 调试信息
      console.log('Extracted ids:', ids); // 调试信息

      const hideLoading = message.loading({
        content: `正在删除 ${selectedRows.length} 个岗位...`,
        duration: 0,
        key: 'batch_delete_msg',
      });

      deletePost(ids)
        .then(() => {
          message.success({
            content: `成功删除 ${selectedRows.length} 个岗位`,
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
 * 导出岗位列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出岗位列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportPostList('岗位列表', formValues);

    message.success({
      content: '岗位列表导出成功',
      key: 'export_loading_msg',
    });
  } catch {
    message.error({
      content: '岗位列表导出失败',
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
      <Grid table-title="岗位列表">
        <template #toolbar-tools>
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            新增岗位
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
