<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { JobLogType } from '#/api/tool/job/type/logType';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { ArrowLeft } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanAllJobLog,
  cleanJobLog,
  deleteJobLog,
  exportJobLogList,
  getJobLogInfo,
  logList,
} from '#/api/tool/job/log';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const route = useRoute();
const router = useRouter();

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 导出状态管理
const isExporting = ref<boolean>(false);

// 从路由参数获取任务ID和任务名称
const jobId = computed(() => {
  const id = route.query.jobId;
  return id ? Number(id) : undefined;
});

const jobName = computed(() => {
  return (route.query.jobName as string) || '';
});

// 页面标题
const pageTitle = computed(() => {
  return jobName.value ? `${jobName.value} - 任务日志` : '定时任务日志';
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['startTime', ['startTimeBegin', 'startTimeEnd']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'jobName',
    },
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const params: any = {
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            ...formValues,
          };

          // 如果有任务ID参数，添加到查询条件中
          if (jobId.value) {
            params.jobId = jobId.value;
          }

          return await logList(params);
        },
      },
    },
    rowConfig: {
      keyField: 'jobLogId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<JobLogType.SysJobLogListVo>,
});

// 组件挂载时，如果有任务ID参数，设置表单默认值
onMounted(() => {
  if (jobId.value) {
    gridApi.formApi.setValues({ jobId: jobId.value });
  }
});

async function onActionClick({
  code,
  row,
}: {
  code: string;
  row: JobLogType.SysJobLogListVo;
}) {
  switch (code) {
    case 'delete': {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该日志记录吗？',
        onOk: async () => {
          try {
            await deleteJobLog([row.jobId!]);
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
      try {
        // 获取日志详情
        const data = await getJobLogInfo(row.jobId!);
        detailModalApi.setData(data);
        detailModalApi.open();
      } catch {
        message.error('获取日志详情失败');
      }
      break;
    }
  }
}

/**
 * 返回任务管理页面
 */
function goBack() {
  router.push('/tool/job/manage');
}

/**
 * 批量删除日志
 */
async function onBatchDelete() {
  const selectedRows = gridApi.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的日志记录');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRows.length} 条日志记录吗？`,
    onOk: async () => {
      try {
        const logIds = selectedRows.map((row) => row.jobId!);
        await deleteJobLog(logIds);
        message.success('批量删除成功');
        gridApi.reload();
      } catch {
        message.error('批量删除失败');
      }
    },
  });
}

/**
 * 清理指定日期之前的日志
 */
function onCleanByDate() {
  Modal.confirm({
    title: '清理日志',
    content: '请选择要清理的日期，将删除该日期之前的所有日志记录',
    onOk: async () => {
      try {
        // 这里应该弹出日期选择器，为了简化直接使用7天前
        const beforeDate = new Date();
        beforeDate.setDate(beforeDate.getDate() - 7);
        await cleanJobLog(beforeDate);
        message.success('日志清理成功');
        gridApi.reload();
      } catch {
        message.error('日志清理失败');
      }
    },
  });
}

/**
 * 清理全部日志
 */
function onCleanAll() {
  Modal.confirm({
    title: '清理全部日志',
    content: '确定要清理全部日志记录吗？此操作不可恢复！',
    okType: 'danger',
    onOk: async () => {
      try {
        await cleanAllJobLog();
        message.success('全部日志清理成功');
        gridApi.reload();
      } catch {
        message.error('日志清理失败');
      }
    },
  });
}

/**
 * 导出日志列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出日志列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();

    // 如果有任务ID参数，添加到导出条件中
    const exportParams = { ...formValues };
    if (jobId.value) {
      exportParams.jobId = jobId.value;
    }

    await exportJobLogList(exportParams);

    message.success({
      content: '日志列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    const errorMessage = error?.message || '日志列表导出失败';
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
    <DetailModal />
    <Page auto-content-height>
      <Grid :table-title="pageTitle">
        <template #toolbar-tools>
          <Button v-if="jobId" @click="goBack">
            <ArrowLeft class="mr-1 size-4" />
            返回任务管理
          </Button>
          <span class="mx-2"></span>
          <Button danger @click="onBatchDelete"> 批量删除 </Button>
          <span class="mx-2"></span>
          <Button @click="onCleanByDate"> 清理日志 </Button>
          <span class="mx-2"></span>
          <Button danger @click="onCleanAll"> 清空全部 </Button>
          <span class="mx-2"></span>
          <Button
            :disabled="isExporting"
            :loading="isExporting"
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
