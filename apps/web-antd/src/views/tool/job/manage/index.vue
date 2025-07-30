<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { JobManageType } from '#/api/tool/job/type/manageType';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ChevronDown } from '@vben-core/icons';
import {
  Button,
  Dropdown,
  Menu,
  MenuItem,
  message,
  Modal,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchOperateJob,
  deleteJob,
  exportJobList,
  jobList,
  pauseJob,
  refreshJob,
  resumeJob,
  runJob,
  startJob,
  updateJob,
} from '#/api/tool/job/manage';

import {
  getScheduleTypeTag,
  getStatusTag,
  useColumns,
  useGridFormSchema,
} from './data';
import Form from './modules/form.vue';

const router = useRouter();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

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
      labelField: 'jobId',
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
          return await jobList({
            pageNum: page?.currentPage,
            pageSize: page?.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'jobId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<JobManageType.SysJobListVo>,
});

function onActionClick(e: OnActionClickParams<JobManageType.SysJobListVo>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'log': {
      onViewLog(e.row);
      break;
    }
    case 'pause': {
      onPause(e.row);
      break;
    }
    case 'refresh': {
      onRefreshJob(e.row);
      break;
    }
    case 'resume': {
      onResume(e.row);
      break;
    }
    case 'run': {
      onRun(e.row);
      break;
    }
    case 'start': {
      onStart(e.row);
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
  row: JobManageType.SysJobListVo,
) {
  const status: Recordable<string> = {
    0: '启用',
    1: '禁用',
  };
  try {
    await confirm(
      `你要将${row.jobName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateJob({
      jobId: row.jobId!,
      jobName: row.jobName!,
      jobGroup: row.jobGroup,
      invokeTarget: row.invokeTarget!,
      scheduleType: row.scheduleType || 0,
      status: newStatus as 0 | 1,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 编辑任务
 */
function onEdit(row: JobManageType.SysJobListVo) {
  formDrawerApi.setData(row);
  formDrawerApi.open();
}

/**
 * 删除任务
 */
function onDelete(row: JobManageType.SysJobListVo) {
  message.loading({
    content: `正在删除 ${row.jobName} ...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteJob([row.jobId!])
    .then(() => {
      message.success({
        content: `${row.jobName} 删除成功`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      message.error({
        content: `删除 ${row.jobName} 失败`,
        key: 'action_process_msg',
      });
    });
}

/**
 * 启动任务
 */
async function onStart(row: JobManageType.SysJobListVo) {
  try {
    await confirm(`确定要启动任务 ${row.jobName} 吗？`, '启动任务');
    message.loading({
      content: `正在启动 ${row.jobName} ...`,
      duration: 0,
      key: 'action_process_msg',
    });
    await startJob(row.jobId!);
    message.success({
      content: `${row.jobName} 启动成功`,
      key: 'action_process_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`启动任务失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 暂停任务
 */
async function onPause(row: JobManageType.SysJobListVo) {
  try {
    await confirm(`确定要暂停任务 ${row.jobName} 吗？`, '暂停任务');
    message.loading({
      content: `正在暂停 ${row.jobName} ...`,
      duration: 0,
      key: 'action_process_msg',
    });
    await pauseJob(row.jobId!);
    message.success({
      content: `${row.jobName} 暂停成功`,
      key: 'action_process_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`暂停任务失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 恢复任务
 */
async function onResume(row: JobManageType.SysJobListVo) {
  try {
    await confirm(`确定要恢复任务 ${row.jobName} 吗？`, '恢复任务');
    message.loading({
      content: `正在恢复 ${row.jobName} ...`,
      duration: 0,
      key: 'action_process_msg',
    });
    await resumeJob(row.jobId!);
    message.success({
      content: `${row.jobName} 恢复成功`,
      key: 'action_process_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`恢复任务失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 立即执行任务
 */
async function onRun(row: JobManageType.SysJobListVo) {
  try {
    await confirm(`确定要立即执行任务 ${row.jobName} 吗？`, '立即执行');
    message.loading({
      content: `正在执行 ${row.jobName} ...`,
      duration: 0,
      key: 'action_process_msg',
    });
    await runJob(row.jobId!);
    message.success({
      content: `${row.jobName} 执行成功`,
      key: 'action_process_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`执行任务失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 刷新任务
 */
async function onRefreshJob(row: JobManageType.SysJobListVo) {
  try {
    await confirm(`确定要刷新任务 ${row.jobName} 吗？`, '刷新任务');
    message.loading({
      content: `正在刷新 ${row.jobName} ...`,
      duration: 0,
      key: 'action_process_msg',
    });
    await refreshJob(row.jobId!);
    message.success({
      content: `${row.jobName} 刷新成功`,
      key: 'action_process_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`刷新任务失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 查看任务日志
 */
function onViewLog(row: JobManageType.SysJobListVo) {
  // 跳转到任务日志页面，只传递任务ID参数
  router.push({
    path: '/tool/job/log',
    query: {
      jobId: row.jobId,
    },
  });
}

function onRefresh() {
  gridApi.query();
}

/**
 * 创建新任务
 */
function onCreate() {
  formDrawerApi.setData({});
  formDrawerApi.open();
}

/**
 * 批量删除任务
 */
async function onBatchDelete() {
  const selectedRows = (gridApi as any).getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的任务');
    return;
  }

  try {
    await confirm(
      `确定要删除选中的 ${selectedRows.length} 个任务吗？`,
      '批量删除',
    );
    message.loading({
      content: '正在删除任务...',
      duration: 0,
      key: 'batch_action_msg',
    });
    const jobIds = selectedRows.map(
      (row: JobManageType.SysJobListVo) => row.jobId!,
    );
    await deleteJob(jobIds);
    message.success({
      content: '批量删除成功',
      key: 'batch_action_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`批量删除失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 批量启动任务
 */
async function onBatchStart() {
  const selectedRows = (gridApi as any).getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择要启动的任务');
    return;
  }

  try {
    await confirm(
      `确定要启动选中的 ${selectedRows.length} 个任务吗？`,
      '批量启动',
    );
    message.loading({
      content: '正在启动任务...',
      duration: 0,
      key: 'batch_action_msg',
    });
    const jobIds = selectedRows.map(
      (row: JobManageType.SysJobListVo) => row.jobId!,
    );
    await batchOperateJob({ jobIds, operation: 'start' });
    message.success({
      content: '批量启动成功',
      key: 'batch_action_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`批量启动失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 批量暂停任务
 */
async function onBatchPause() {
  const selectedRows = (gridApi as any).getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择要暂停的任务');
    return;
  }

  try {
    await confirm(
      `确定要暂停选中的 ${selectedRows.length} 个任务吗？`,
      '批量暂停',
    );
    message.loading({
      content: '正在暂停任务...',
      duration: 0,
      key: 'batch_action_msg',
    });
    const jobIds = selectedRows.map(
      (row: JobManageType.SysJobListVo) => row.jobId!,
    );
    await batchOperateJob({ jobIds, operation: 'pause' });
    message.success({
      content: '批量暂停成功',
      key: 'batch_action_msg',
    });
    onRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error(`批量暂停失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 导出任务列表
 */
async function onExport() {
  try {
    isExporting.value = true;
    message.loading({
      content: '正在导出任务列表...',
      duration: 0,
      key: 'export_loading_msg',
    });

    // 获取当前搜索表单的参数
    const formValues = await gridApi.formApi.getValues();
    await exportJobList(formValues);

    message.success({
      content: '任务列表导出成功',
      key: 'export_loading_msg',
    });
  } catch (error: any) {
    const errorMessage = error?.message || '任务列表导出失败';
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
    <FormDrawer @success="onRefresh" />
    <Page auto-content-height>
      <Grid table-title="定时任务管理">
        <template #toolbar-tools>
          <Button type="primary" @click="onCreate">
            <Plus class="mr-1 size-4" />
            新增
          </Button>
          <span class="mx-2"></span>
          <Button @click="onBatchStart"> 批量启动 </Button>
          <span class="mx-2"></span>
          <Button @click="onBatchPause"> 批量暂停 </Button>
          <span class="mx-2"></span>
          <Button danger @click="onBatchDelete"> 批量删除 </Button>
          <span class="mx-2"></span>
          <Button
            :disabled="isExporting"
            :loading="isExporting"
            @click="onExport"
          >
            {{ isExporting ? '导出中...' : '导出' }}
          </Button>
        </template>
        <template #scheduleType="{ row }">
          <Tag :color="getScheduleTypeTag(row.scheduleType || 0).color">
            {{ getScheduleTypeTag(row.scheduleType || 0).text }}
          </Tag>
        </template>
        <template #status="{ row }">
          <Tag :color="getStatusTag(row.status || 0).color">
            {{ getStatusTag(row.status || 0).text }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Button
            v-if="row.status === 0"
            size="small"
            type="link"
            @click="onActionClick({ code: 'pause', row })"
          >
            暂停
          </Button>
          <Button
            v-if="row.status === 1"
            size="small"
            type="link"
            @click="onActionClick({ code: 'resume', row })"
          >
            启动
          </Button>
          <Button
            size="small"
            type="link"
            @click="onActionClick({ code: 'run', row })"
          >
            执行
          </Button>
          <Dropdown>
            <Button size="small" type="link">
              更多
              <ChevronDown class="ml-1 size-3" />
            </Button>
            <template #overlay>
              <Menu>
                <MenuItem key="edit">
                  <Button
                    size="small"
                    type="text"
                    @click="onActionClick({ code: 'edit', row })"
                  >
                    编辑
                  </Button>
                </MenuItem>
                <MenuItem key="log">
                  <Button
                    size="small"
                    type="text"
                    @click="onActionClick({ code: 'log', row })"
                  >
                    日志
                  </Button>
                </MenuItem>
                <MenuItem key="refresh">
                  <Button
                    size="small"
                    type="text"
                    @click="onActionClick({ code: 'refresh', row })"
                  >
                    刷新
                  </Button>
                </MenuItem>
                <MenuItem key="delete">
                  <Button
                    danger
                    size="small"
                    type="text"
                    @click="onActionClick({ code: 'delete', row })"
                  >
                    删除
                  </Button>
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </template>
      </Grid>
    </Page>
  </div>
</template>
