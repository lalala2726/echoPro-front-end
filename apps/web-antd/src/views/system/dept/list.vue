<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDept } from '#/api/system/dept/types';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDept, getDeptList } from '#/api/system/dept/dept';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params: any, formValues: any) => {
          // 将搜索表单的值传递给API
          return await getDeptList(formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'deptId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'deptId',
      transform: true,
    },
  } as VxeTableGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<SystemDept>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

/**
 * 编辑部门
 */
function onEdit(row: SystemDept) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级部门
 */
function onAppend(row: SystemDept) {
  formModalApi.setData({ parentId: row.deptId }).open();
}

/**
 * 创建新部门
 */
function onCreate() {
  formModalApi.setData({}).open();
}

/**
 * 删除部门
 */
function onDelete(row: SystemDept) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.deptName} ...`,
    duration: 0,
    key: 'action_process_msg',
  });

  deleteDept(row.deptId)
    .then(() => {
      message.success({
        content: `${row.deptName} 删除成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

/**
 * 刷新表格
 */
function onRefresh() {
  gridApi.query();
}

/**
 * 展开全部
 */
function expandAll() {
  gridApi.grid?.setAllTreeExpand(true);
}

/**
 * 折叠全部
 */
function collapseAll() {
  gridApi.grid?.setAllTreeExpand(false);
}

/**
 * 获取部门图标
 */
function getDeptIcon(parentId: string) {
  if (parentId === '0') {
    return 'carbon:enterprise'; // 总公司
  }
  return 'carbon:building'; // 分部/分店
}

/**
 * 获取部门图标颜色
 */
function getDeptIconColor(parentId: string) {
  if (parentId === '0') {
    return 'text-blue-600'; // 总公司用蓝色
  }
  return 'text-green-600'; // 分部/分店用绿色
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid table-title="部门列表">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['system:dept:add'])"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          新增部门
        </Button>
        <span class="mx-2"></span>
        <Button type="default" @click="expandAll"> 展开全部 </Button>
        <span class="mx-1"></span>
        <Button type="default" @click="collapseAll"> 折叠全部 </Button>
      </template>
      <template #deptName="{ row }">
        <div class="flex w-full items-center gap-2 py-1">
          <div class="size-4 flex-shrink-0">
            <IconifyIcon
              :icon="getDeptIcon(row.parentId)"
              class="size-full"
              :class="getDeptIconColor(row.parentId)"
            />
          </div>
          <div class="flex-auto">
            <div class="font-medium text-gray-900">{{ row.deptName }}</div>
          </div>
        </div>
      </template>
    </Grid>
  </Page>
</template>
