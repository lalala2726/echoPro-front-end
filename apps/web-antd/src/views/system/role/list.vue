<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRole } from '#/api/system/role/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRole,
  exportRoleList,
  getRoleList,
  updateRole,
} from '#/api/system/role/role';

import { useColumns, useGridFormSchema } from './data';
import Assign from './modules/assign.vue';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Assign,
  destroyOnClose: true,
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();
// 导出状态管理
const isExporting = ref<boolean>(false);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
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
  } as VxeTableGridOptions<SystemRole>,
});

function onActionClick(e: OnActionClickParams<SystemRole>) {
  switch (e.code) {
    case 'assign': {
      onAssign(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function onAssign(row: SystemRole) {
  formDrawerApi.setData(row).open();
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(newStatus: number, row: SystemRole) {
  const status: Recordable<string> = {
    1: '禁用',
    0: '启用',
  };
  try {
    await confirm(
      `你要将${row.roleName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateRole({ id: row.id, status: newStatus as 0 | 1 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑角色
 */
function onEdit(row: SystemRole) {
  formModalApi.setData(row).open();
}

/**
 * 删除角色
 */
function onDelete(row: SystemRole) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.roleName} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteRole(row.id)
    .then(() => {
      message.success({
        content: `${row.roleName} 删除成功`,
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
 * 创建新角色
 */
function onCreate() {
  formModalApi.setData({}).open();
}

async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出角色列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportRoleList(formValues);

    message.success({
      content: '角色列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    // 使用具体的错误消息，如果没有则使用默认消息
    const errorMessage = error?.message || '角色列表导出失败';
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
    <FormDrawer @success="onRefresh" />
    <Page auto-content-height>
      <FormModal @success="onRefresh" />
      <Grid table-title="角色列表">
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['system:role:add'])"
            type="primary"
            @click="onCreate"
          >
            <Plus class="size-5" />
            新增角色
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:role:export'])"
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
