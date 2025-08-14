<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysUserType } from '#/api/system/user';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { ColPage, useVbenDrawer, useVbenModal } from '@vben/common-ui';
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
import ResetPassword from './modules/reset-password.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ResetPasswordModal, resetPasswordModalApi] = useVbenModal({
  connectedComponent: ResetPassword,
  destroyOnClose: true,
});

const selectedDeptId = ref<string>('');
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
  } as VxeTableGridOptions<SysUserType.UserListVo>,
});

function onActionClick(e: OnActionClickParams<SysUserType.UserListVo>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'resetPassword': {
      onResetPassword(e.row);
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
async function onStatusChange(newStatus: number, row: SysUserType.UserListVo) {
  const status: Recordable<string> = {
    1: '禁用',
    0: '启用',
  };
  try {
    await confirm(
      `你要将${row.username}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateUser({
      userId: row.userId,
      status: newStatus as 0 | 1,
    } as SysUserType.SysUserUpdateRequest);
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑用户
 */
function onEdit(row: SysUserType.UserListVo) {
  formDrawerApi.setData(row as SysUserType.SysUser);
  formDrawerApi.open();
}

/**
 * 删除用户
 */
function onDelete(row: SysUserType.UserListVo) {
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
  formDrawerApi.setData({});
  formDrawerApi.open();
}

/**
 * 导出用户列表
 * 使用状态管理防止重复点击，立即响应用户操作
 */
async function onExport() {
  // 防止重复导出
  if (isExporting.value) {
    message.warning('正在导出中，请耐心等待...');
    return;
  }

  try {
    isExporting.value = true;

    // 显示导出提示
    message.loading({
      content: '正在请求后端生成文件，请耐心等待...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();

    // 调用导出API
    await exportUserList(formValues);

    // 导出成功提示
    message.success({
      content: '用户列表导出成功！',
      key: 'export_loading_msg',
      duration: 3,
    });
  } catch (error: any) {
    console.error('导出失败:', error);
    // 使用具体的错误消息，如果没有则使用默认消息
    const errorMessage = error?.message || '导出失败，请重试';
    message.error({
      content: errorMessage,
      key: 'export_loading_msg',
      duration: 5,
    });
  } finally {
    isExporting.value = false;
  }
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
      (record: SysUserType.UserListVo) => record.userId,
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
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error({
        content: `批量删除失败: ${error.message || '未知错误'}`,
        key: 'batch_delete_msg',
      });
    }
  }
}

/**
 * 重置用户密码
 */
function onResetPassword(row: SysUserType.UserListVo) {
  resetPasswordModalApi.setData(row as SysUserType.SysUser);
  resetPasswordModalApi.open();
}

/**
 * 重置密码成功回调
 */
function onResetPasswordSuccess(username: string) {
  message.success(`用户 ${username} 密码重置成功`);
}
</script>

<template>
  <div>
    <FormDrawer @success="onRefresh" />
    <ResetPasswordModal @success="onResetPasswordSuccess" />
    <ColPage
      auto-content-height
      :resizable="true"
      :split-line="true"
      :split-handle="true"
      :left-collapsible="true"
      :left-width="10"
      :left-min-width="15"
      :left-max-width="35"
    >
      <template #left>
        <div
          class="h-full rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-[#1c1e22]"
        >
          <Dept
            :selected-dept-id="selectedDeptId"
            @dept-select="onDeptSelect"
          />
        </div>
      </template>

      <Grid table-title="用户列表">
        <template #avatar="{ row }">
          <a-image
            :src="row.avatar"
            :preview="false"
            :width="36"
            :height="36"
            style="
              display: block;
              margin: auto;
              object-fit: cover;
              border-radius: 50%;
            "
          />
        </template>
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['system:user:list'])"
            type="primary"
            @click="onCreate"
          >
            <Plus class="size-5" />
            新增用户
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:user:delete'])"
            danger
            @click="onBatchDelete"
          >
            批量删除
          </Button>
          <span class="mx-2"></span>
          <Button
            :loading="isExporting"
            v-if="hasAccessByCodes(['system:user:export'])"
            :disabled="isExporting"
            @click="onExport"
          >
            {{ isExporting ? '导出中...' : '导出' }}
          </Button>
        </template>
      </Grid>
    </ColPage>
  </div>
</template>
