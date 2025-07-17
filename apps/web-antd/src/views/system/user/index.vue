<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { ref } from 'vue';

import { ColPage, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  exportUserList,
  getUserList,
  updateUser,
} from '#/api/system/user';

import { useColumns, useGridFormSchema } from './data';
import Dept from './modules/dept.vue';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const selectedDeptId = ref<string>('');

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'username',
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
          return await getUserList({
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            deptId: selectedDeptId.value,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'userId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SysUser>,
});

function onActionClick(e: OnActionClickParams<SystemUserApi.SysUser>) {
  switch (e.code) {
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

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
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
async function onStatusChange(newStatus: number, row: SystemUserApi.SysUser) {
  const status: Recordable<string> = {
    1: '禁用',
    0: '启用',
  };
  try {
    await confirm(
      `你要将${row.username}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateUser({ ...row, status: newStatus as 0 | 1 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑用户
 */
function onEdit(row: SystemUserApi.SysUser) {
  formModalApi.setData(row);
  formModalApi.open();
}

/**
 * 删除用户
 */
function onDelete(row: SystemUserApi.SysUser) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.username} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUser([row.userId])
    .then(() => {
      message.success({
        content: `${row.username} 删除成功`,
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
 * 创建新用户
 */
function onCreate() {
  formModalApi.setData({});
  formModalApi.open();
}

async function onExport() {
  // 获取当前搜索表单的参数
  const formValues = await gridApi.formApi.getValues();
  await exportUserList('用户列表', {
    deptId: selectedDeptId.value,
    ...formValues,
  });
}

/**
 * 处理部门选择
 */
function onDeptSelect(deptId: string) {
  selectedDeptId.value = deptId;
  onRefresh();
}

/**
 * 批量删除用户
 */
async function onBatchDelete() {
  const selectRecords = gridApi.grid.getCheckboxRecords();
  if (selectRecords.length === 0) {
    message.warning('请选择要删除的用户');
    return;
  }

  try {
    await confirm(
      `确定要删除这 ${selectRecords.length} 个用户吗？`,
      '批量删除确认',
    );

    const userIds = selectRecords.map(
      (record: SystemUserApi.SysUser) => record.userId,
    );
    message.loading({
      content: '正在批量删除用户...',
      duration: 0,
      key: 'batch_delete_msg',
    });
    await deleteUser(userIds);
    message.success({
      content: `成功删除 ${selectRecords.length} 个用户`,
      key: 'batch_delete_msg',
    });
    onRefresh();
  } catch (error) {
    console.error('批量删除失败:', error);
  }
}
</script>

<template>
  <div>
    <FormModal @success="onRefresh" />
    <ColPage
      auto-content-height
      :resizable="true"
      :split-line="true"
      :split-handle="true"
      :left-collapsible="true"
      :left-width="10"
      :left-min-width="15"
      :left-max-width="35"
      title="用户管理"
      description="管理系统用户信息，包括用户的基本信息、权限设置等"
    >
      <template #left>
        <div class="h-full rounded-lg border border-gray-200 bg-white p-3">
          <Dept
            :selected-dept-id="selectedDeptId"
            @dept-select="onDeptSelect"
          />
        </div>
      </template>

      <Grid table-title="用户列表">
        <template #toolbar-tools>
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            新增用户
          </Button>
          <span class="mx-2"></span>
          <Button danger @click="onBatchDelete"> 批量删除 </Button>
          <span class="mx-2"></span>
          <Button @click="onExport"> 导出</Button>
        </template>
      </Grid>
    </ColPage>
  </div>
</template>
