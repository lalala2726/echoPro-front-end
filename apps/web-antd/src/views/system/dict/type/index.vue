<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DictTypeQueryRequest, DictTypeVo } from '#/api/system/dict/types';

import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { refreshCache } from '#/api/system/dict/dictData';
import {
  deleteDictType,
  getDictTypeById,
  getDictTypeList,
  updateDictType,
} from '#/api/system/dict/dictType';
import { useGridFormSchema } from '#/views/system/dict/type/data';

import { useColumns } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const { hasAccessByCodes } = useAccess();

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
          return await getDictTypeList({
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
  } as VxeTableGridOptions<DictTypeQueryRequest>,
});

function onActionClick(e: OnActionClickParams<DictTypeVo>) {
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
async function onStatusChange(newStatus: number, row: DictTypeVo) {
  const status: Recordable<string> = {
    1: '禁用',
    0: '启用',
  };
  try {
    await confirm(
      `你要将${row.dictName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateDictType({
      id: row.id!,
      dictType: row.dictType!,
      dictName: row.dictName!,
      status: newStatus as 0 | 1,
      remark: row.remark,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑字典
 */
async function onEdit(row: DictTypeVo) {
  const res = await getDictTypeById(row.id!);
  formModalApi.setData(res).open();
}

/**
 * 查看字典值
 */
function onViewDict(row: DictTypeVo) {
  router.push({
    path: `/system/dict/data/${row.id}`,
  });
}

/**
 * 删除字典
 */
function onDelete(row: DictTypeVo) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.dictName} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDictType(row.id!)
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

function onRefreshCache() {
  refreshCache();
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
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid table-title="字典列表">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['system:dict-type:add'])"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          新增字典
        </Button>
        <span class="mx-2"></span>
        <Button
          v-if="hasAccessByCodes(['system:dict:refresh'])"
          danger
          @click="onRefreshCache"
        >
          刷新缓存
        </Button>
      </template>
    </Grid>
  </Page>
</template>
