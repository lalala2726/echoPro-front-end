<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system/dict';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictKey,
  exportDictKeyList,
  getDictKeyList,
  updateDictKey,
} from '#/api/system/dict';
import { useGridFormSchema } from '#/views/system/dict/type/data';

import { useColumns } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  destroyOnClose: true,
  connectedComponent: Form,
});

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
          return await getDictKeyList({
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
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemDictApi.SystemDictKey>,
});

function onActionClick(e: OnActionClickParams<SystemDictApi.SystemDictKey>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'view': {
      onViewDict(e.row);
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
async function onStatusChange(
  newStatus: number,
  row: SystemDictApi.SystemDictKey,
) {
  const status: Recordable<string> = {
    1: '禁用',
    0: '启用',
  };
  try {
    await confirm(
      `你要将${row.dictName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateDictKey({ ...row, status: newStatus as 0 | 1 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑字典
 */
function onEdit(row: SystemDictApi.SystemDictKey) {
  formModalApi.setData(row).open();
}

/**
 * 查看字典值
 */
function onViewDict(row: SystemDictApi.SystemDictKey) {
  router.push({
    path: `/system/dict/${row.id}`,
    query: {
      dictKey: row.dictKey,
      dictName: row.dictName,
    },
  });
}

/**
 * 删除字典
 */
function onDelete(row: SystemDictApi.SystemDictKey) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.dictName} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDictKey(row.id)
    .then(() => {
      message.success({
        content: `${row.dictName} 删除成功`,
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
 * 创建新字典
 */
function onCreate() {
  formModalApi.setData({}).open();
}

/**
 * 导出字典列表
 */
async function onExport() {
  // 获取当前搜索表单的参数
  const formValues = await gridApi.formApi.getValues();
  await exportDictKeyList('字典列表', formValues);
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid table-title="字典列表">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增字典
        </Button>
        <span class="mx-2"></span>
        <Button @click="onExport"> 导出</Button>
      </template>
    </Grid>
  </Page>
</template>
