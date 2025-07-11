<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenu, getMenuById, getMenuList } from '#/api/system/menu';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          return await getMenuList();
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
      zoom: true,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: false,
    },
  } as VxeTableGridOptions,
});

function onActionClick({ code, row }: OnActionClickParams<any>) {
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
    default: {
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

async function onEdit(row: any) {
  const menu = await getMenuById(row.id);
  formDrawerApi.setData(menu).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onAppend(row: any) {
  formDrawerApi.setData({ parentId: row.id }).open();
}

function onDelete(row: any) {
  const hideLoading = message.loading({
    content: `正在删除 ${row.title} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenu(row.id)
    .then(() => {
      message.success({
        content: `${row.title} 删除成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增菜单
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
            <IconifyIcon v-if="row.type === 'button'" icon="carbon:security" class="size-full" />
            <IconifyIcon v-else-if="row?.icon" :icon="row?.icon || 'carbon:circle-dash'" class="size-full" />
          </div>
          <span class="flex-auto">{{ row.title }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge v-if="row?.badgeType" class="menu-badge" :badge="row.badge" :badge-type="row.badgeType"
          :badge-variants="row.badgeVariants" />
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  &> :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
