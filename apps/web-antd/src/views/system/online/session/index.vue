<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemSessionTypes } from '#/api/system/online/session';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteSession,
  exportSessionList,
  getSessionDetail,
  sessionList,
} from '#/api/system/online/session';

import { useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';

const detailModalRef = ref();

// 导出状态管理
const isExporting = ref<boolean>(false);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['accessTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await sessionList({
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'accessTokenId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemSessionTypes.SessionListVo>,
});

async function onActionClick({
  code,
  row,
}: {
  code: string;
  row: SystemSessionTypes.SessionListVo;
}) {
  switch (code) {
    case 'delete': {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该会话吗？删除后用户将被强制下线。',
        onOk: async () => {
          try {
            await deleteSession(row.accessTokenId);
            message.success('删除成功');
            gridApi.reload();
          } catch {
            message.error('删除失败');
          }
        },
      });
      break;
    }
    case 'detail': {
      // 打开详情弹窗并显示加载状态
      detailModalRef.value?.setLoading(true);
      detailModalRef.value?.modalApi.open();

      try {
        // 调用API获取详情数据
        const data = await getSessionDetail(row.accessTokenId);
        // 设置详情数据
        detailModalRef.value?.setDetailData(data);
      } catch {
        message.error('获取会话详情失败');
        detailModalRef.value?.modalApi.close();
      } finally {
        detailModalRef.value?.setLoading(false);
      }
      break;
    }
  }
}

/**
 * 导出会话列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出会话列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportSessionList(formValues);

    message.success({
      content: '会话列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    // 使用具体的错误消息，如果没有则使用默认消息
    const errorMessage = error?.message || '会话列表导出失败';
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
    <Detail ref="detailModalRef" />
    <Page auto-content-height>
      <Grid table-title="在线会话列表">
        <template #toolbar-tools>
          <Button
            :loading="isExporting"
            :disabled="isExporting"
            @click="onExport"
          >
            {{ isExporting ? '导出中...' : '导出' }}
          </Button>
        </template>
        <template #action="{ row }">
          <Button
            size="small"
            type="link"
            @click="onActionClick({ code: 'detail', row })"
          >
            详情
          </Button>
          <Button
            danger
            size="small"
            type="link"
            @click="onActionClick({ code: 'delete', row })"
          >
            删除
          </Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
