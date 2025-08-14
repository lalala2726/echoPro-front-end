<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { StorageConfigListVo } from '#/api/system/storage/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, prompt } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelPrimary,
  deleteStorageConfig,
  exportStorageConfigList,
  getStorageConfigById,
  getStorageConfigList,
  refreshCache,
  updatePrimaryConfig,
} from '#/api/system/storage/config';

import { useColumns, useSearchFormSchema } from './data';
import StorageForm from './modules/form.vue';

defineOptions({
  name: 'StorageConfig',
});

const { hasAccessByCodes } = useAccess();

// 导出状态管理
const isExporting = ref<boolean>(false);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useSearchFormSchema(),
    submitOnChange: true,
    // 为搜索表单添加标识
    actionWrapperClass: 'search-form-actions',
  },
  gridOptions: {
    columns: useColumns(onActionClick, onPrimaryChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 20,
      pageSizes: [10, 20, 50, 100],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getStorageConfigList({
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
    // 添加空状态配置
    emptyText: '暂无数据',
    showOverflow: true,
  } as VxeTableGridOptions<StorageConfigListVo>,
});

// 组件引用
const storageFormRef = ref();

/**
 * 主配置切换处理
 */
async function onPrimaryChange(checked: boolean, row: StorageConfigListVo) {
  if (!checked) {
    // 不允许取消主配置
    message.warning('不能取消主配置状态');
    return false;
  }

  const hideLoading = message.loading({
    content: '正在设置主配置...',
    duration: 0,
    key: 'primary_change_msg',
  });

  try {
    await updatePrimaryConfig(row.id);
    message.success({
      content: '主配置设置成功',
      key: 'primary_change_msg',
    });
    onRefresh();
    return true;
  } catch {
    hideLoading();
    return false;
  }
}

/**
 * 操作按钮点击事件
 */
function onActionClick(e: OnActionClickParams<StorageConfigListVo>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'setPrimary': {
      onSetPrimary(e.row);
      break;
    }
  }
}

/**
 * 编辑存储配置
 */
async function onEdit(row: StorageConfigListVo) {
  // 直接打开对应的表单（编辑模式）
  const res = await getStorageConfigById(row.id);
  storageFormRef.value?.openEditForm(res);
}

/**
 * 删除存储配置
 */
async function onDelete(row: StorageConfigListVo) {
  try {
    const result = await prompt<string>({
      content: `确定要删除存储配置 "${row.storageName}" 吗？请输入存储键名来确认删除：`,
      componentProps: {
        placeholder: `请输入：${row.storageKey}`,
      },
      icon: 'warning',
      title: '确认删除存储配置',
      beforeClose: async ({ isConfirm, value }) => {
        if (isConfirm && value !== row.storageKey) {
          message.error(`输入的存储键名不正确，请输入：${row.storageKey}`);
          return false;
        }
        return true;
      },
    });

    if (result === row.storageKey) {
      const hideLoading = message.loading({
        content: `正在删除存储配置 ${row.storageName} ...`,
        duration: 0,
        key: 'action_process_msg',
      });

      try {
        await deleteStorageConfig([row.id!]);
        message.success({
          content: `存储配置 ${row.storageName} 删除成功`,
          key: 'action_process_msg',
        });
        onRefresh();
      } catch {
        hideLoading();
      }
    }
  } catch {
    // 用户取消了操作
  }
}

/**
 * 设置为主配置
 */
function onSetPrimary(row: StorageConfigListVo) {
  Modal.confirm({
    title: '确认设置',
    content: `确定要将 "${row.storageName}" 设置为主配置吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: `正在设置主配置...`,
        duration: 0,
        key: 'action_process_msg',
      });
      updatePrimaryConfig(row.id!)
        .then(() => {
          message.success({
            content: `主配置设置成功`,
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
 * 刷新缓存
 */
function onRefreshCache() {
  Modal.confirm({
    title: '确认刷新缓存',
    content: '确定要刷新存储配置缓存吗？刷新后所有相关缓存将被清除并重新加载。',
    okText: '确定刷新',
    cancelText: '取消',
    onOk: () => {
      const hideLoading = message.loading({
        content: '正在刷新缓存...',
        duration: 0,
        key: 'refresh_cache_msg',
      });
      return refreshCache()
        .then(() => {
          message.success({
            content: '缓存刷新成功',
            key: 'refresh_cache_msg',
          });
        })
        .catch(() => {
          hideLoading();
          throw new Error('刷新失败');
        });
    },
  });
}

/**
 * 取消主配置
 */

function onCancelPrimary() {
  Modal.confirm({
    title: '确定取消主配置设置?',
    content:
      '取消主配置可能导致无法上传文件和预览文件操作?为了保证存储服务的正常运行请保证系统配置中有相关的存储上传配置!',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const hideLoading = message.loading({
        content: '正在取消主配置...',
        duration: 0,
        key: 'reset_primary_msg',
      });
      return cancelPrimary()
        .then(() => {
          message.success({
            content: '主配置取消成功',
            key: 'reset_primary_msg',
          });
          onRefresh();
        })
        .catch(() => {
          hideLoading();
          throw new Error('取消失败');
        });
    },
  });
}

/**
 * 导出存储配置列表
 */
async function onExport() {
  isExporting.value = true;
  try {
    await exportStorageConfigList();
    message.success('存储配置列表导出成功');
  } catch {
    message.error('导出失败');
  } finally {
    isExporting.value = false;
  }
}

function onRefresh() {
  gridApi.reload();
}

/**
 * 表单提交成功后的回调
 */
function onFormSuccess() {
  gridApi.reload();
  message.success('操作成功');
}

/**
 * 创建新存储配置
 */
function onCreate() {
  // 打开新增配置流程
  storageFormRef.value?.openCreateForm();
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <!-- 存储配置表单 -->
      <StorageForm ref="storageFormRef" @success="onFormSuccess" />

      <Grid table-title="存储配置列表">
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['system:storage-config:add'])"
            type="primary"
            @click="onCreate"
          >
            <Plus class="size-5" />
            新增配置
          </Button>
          <span class="mx-2"></span>
          <Button
            danger
            v-if="hasAccessByCodes(['system:storage-config:refresh'])"
            @click="onRefreshCache"
          >
            刷新缓存
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:storage-config:reset'])"
            danger
            @click="onCancelPrimary"
          >
            取消主配置
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['system:storage-config:export'])"
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
