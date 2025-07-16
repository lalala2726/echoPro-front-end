<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi as DictDataApi } from '#/api/system/dict/dictData';
import type { SystemDictApi as DictTypeApi } from '#/api/system/dict/dictType';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictData,
  getDictDataById,
  getDictDataList,
  updateDictData,
} from '#/api/system/dict/dictData';
import { getDictTypeById } from '#/api/system/dict/dictType';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

defineOptions({
  name: 'SystemDictData',
});

const route = useRoute();
const router = useRouter();

// 从路由参数获取字典类型ID
const dictTypeId = Number(route.params.id);
const dictTypeInfo = ref<DictTypeApi.SystemDictType | null>(null);
const isLoading = ref(false);

// 页面标题计算
const pageTitle = computed(() =>
  dictTypeInfo.value
    ? `${dictTypeInfo.value.dictName} - 字典值管理`
    : '字典值管理',
);

// 获取字典类型信息
async function fetchDictTypeInfo() {
  try {
    isLoading.value = true;
    dictTypeInfo.value = await getDictTypeById(dictTypeId);
  } catch (error) {
    console.error('获取字典类型信息失败:', error);
    message.error('获取字典类型信息失败');
    router.back();
  } finally {
    isLoading.value = false;
  }
}

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
          // 确保字典类型信息已加载
          if (!dictTypeInfo.value) {
            return { rows: [], total: 0 };
          }
          // 使用字典类型的dictType字段调用接口
          return await getDictDataList(dictTypeInfo.value.dictType, {
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
  } as VxeTableGridOptions<DictDataApi.SystemDictData>,
});

function onActionClick(e: OnActionClickParams<DictDataApi.SystemDictData>) {
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
async function onStatusChange(
  newStatus: number,
  row: DictDataApi.SystemDictData,
) {
  const status: Recordable<string> = {
    1: '禁用',
    0: '启用',
  };
  try {
    await confirm(
      `你要将${row.dictLabel}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateDictData({ ...row, status: newStatus as 0 | 1 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑字典值
 */
async function onEdit(row: DictDataApi.SystemDictData) {
  const res = await getDictDataById(row.id);
  formModalApi.setData(res).open();
}

/**
 * 删除字典值
 */
function onDelete(row: DictDataApi.SystemDictData) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.dictLabel} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDictData([row.id])
    .then(() => {
      message.success({
        content: `删除 ${row.dictLabel} 成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      message.error({
        content: `删除 ${row.dictLabel} 失败`,
        key: 'action_process_msg',
      });
    })
    .finally(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

/**
 * 新增字典值
 */
function onCreate() {
  if (!dictTypeInfo.value) {
    message.error('字典类型信息未加载完成');
    return;
  }

  formModalApi
    .setData({
      dictType: dictTypeInfo.value.dictType,
      isDefault: 0,
      status: 0,
      sort: 0,
    })
    .open();
}

function handleFormSuccess() {
  onRefresh();
}

// 在组件挂载时获取字典类型信息
onMounted(async () => {
  await fetchDictTypeInfo();
  // 字典类型信息加载完成后，触发数据查询
  if (dictTypeInfo.value) {
    onRefresh();
  }
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleFormSuccess" />
    <Grid :table-title="pageTitle">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增字典值
        </Button>
      </template>
    </Grid>
  </Page>
</template>
