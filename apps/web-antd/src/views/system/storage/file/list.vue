<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { StorageFileListVo } from '#/api/system/storage/types';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { downloadFileFromUrl } from '@vben/utils';

import { useDebounceFn } from '@vueuse/core';
import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteStorageFile,
  deleteTrashFile,
  exportStorageFileList,
  getStorageFileList,
  listFileTrash,
} from '#/api/system/storage/file';

import { useColumns, useGridFormSchema } from './data';

const props = withDefaults(defineProps<Props>(), {
  showToolbar: true,
  showSearchForm: true,
  showPager: true,
  extraParams: () => ({}),
});

// 定义事件
const emit = defineEmits<{
  /** 操作按钮点击事件 */
  actionClick: [params: OnActionClickParams<StorageFileListVo>];
  /** 行点击事件 */
  rowClick: [row: StorageFileListVo];
  /** 选中行变化事件 */
  selectionChange: [rows: StorageFileListVo[]];
}>();

// 定义组件属性
interface Props {
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示搜索表单 */
  showSearchForm?: boolean;
  /** 是否显示分页 */
  showPager?: boolean;
  /** 额外的查询参数 */
  extraParams?: Record<string, any>;
}

// 加载状态管理
const isDestroyed = ref(false);
const downloadingIds = ref(new Set<string>());

// 防抖下载函数
const debouncedDownload = useDebounceFn(async (row: StorageFileListVo) => {
  if (isDestroyed.value || !row.id) return;

  // 检查是否正在下载
  if (downloadingIds.value.has(row.id)) {
    message.warning('文件正在下载中，请勿重复点击');
    return;
  }

  try {
    downloadingIds.value.add(row.id);
    message.info('正在下载');

    // 根据文件类型选择下载方式
    await downloadFileFromUrl({
      fileName: row.originalName,
      source: row.originalFileUrl,
    });

    if (!isDestroyed.value) {
      message.success('文件下载成功');
    }
  } catch (error) {
    console.error('下载文件失败:', error);
    if (!isDestroyed.value) {
      message.error('下载失败');
    }
  } finally {
    if (row.id) {
      downloadingIds.value.delete(row.id);
    }
  }
}, 1000); // 1秒防抖

// 组件卸载前设置标记
onBeforeUnmount(() => {
  isDestroyed.value = true;
  downloadingIds.value.clear();
});

/**
 * 处理操作按钮点击事件
 */
async function onActionClick(params: OnActionClickParams<StorageFileListVo>) {
  if (isDestroyed.value) return;

  const { code, row } = params;

  switch (code) {
    case 'delete': {
      // 删除文件
      if (row.id) {
        try {
          // 根据是否为回收站模式选择不同的删除API
          const isTrashMode = props.extraParams?.isTrash === 1;
          await (isTrashMode
            ? deleteTrashFile([row.id])
            : deleteStorageFile([row.id]));

          if (!isDestroyed.value) {
            const action = isTrashMode ? '彻底删除' : '删除';
            message.success(`${action}成功`);
            await gridApi.reload();
          }
        } catch (error) {
          console.error('删除文件失败:', error);
          if (!isDestroyed.value) {
            message.error('删除失败');
          }
        }
      }
      break;
    }
    case 'detail': {
      // 触发父组件的操作事件，由父组件处理详情显示
      if (!isDestroyed.value) {
        emit('actionClick', params);
      }
      break;
    }
    case 'download': {
      // 使用防抖下载功能
      await debouncedDownload(row);
      break;
    }
    default: {
      // 触发父组件的操作事件
      if (!isDestroyed.value) {
        emit('actionClick', params);
      }
      break;
    }
  }
}

/**
 * 处理批量删除
 */
async function handleBatchDelete() {
  if (isDestroyed.value) return;

  const selectedRows = gridApi.grid.getCheckboxRecords() as StorageFileListVo[];
  if (selectedRows.length === 0) {
    if (!isDestroyed.value) {
      message.warning('请选择要删除的文件');
    }
    return;
  }

  const ids = selectedRows
    .map((row: StorageFileListVo) => row.id)
    .filter(Boolean) as string[];
  if (ids.length === 0) {
    if (!isDestroyed.value) {
      message.warning('选中的文件中没有有效的ID');
    }
    return;
  }

  try {
    // 根据是否为回收站模式选择不同的删除API
    const isTrashMode = props.extraParams?.isTrash === 1;
    await (isTrashMode ? deleteTrashFile(ids) : deleteStorageFile(ids));

    if (!isDestroyed.value) {
      const action = isTrashMode ? '彻底删除' : '删除';
      message.success(`成功${action} ${ids.length} 个文件`);
      await gridApi.reload();
    }
  } catch (error) {
    console.error('批量删除失败:', error);
    if (!isDestroyed.value) {
      message.error('批量删除失败');
    }
  }
}

/**
 * 处理导出
 */
async function handleExport() {
  if (isDestroyed.value) return;

  try {
    const formValues = gridApi.formApi.getValues();
    await exportStorageFileList('存储文件列表', {
      ...formValues,
      ...props.extraParams,
    });
    if (!isDestroyed.value) {
      message.success('导出成功');
    }
  } catch (error) {
    console.error('导出失败:', error);
    if (!isDestroyed.value) {
      message.error('导出失败');
    }
  }
}

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: props.showSearchForm
    ? {
        fieldMappingTime: [['uploadTime', ['startTime', 'endTime']]],
        schema: useGridFormSchema(),
        submitOnChange: true,
      }
    : undefined,
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'id',
    },
    columns: useColumns(onActionClick, props.extraParams?.isTrash === 1),
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
          const params = {
            pageNum: page?.currentPage || 1,
            pageSize: page?.pageSize || 20,
            ...formValues,
            ...props.extraParams,
          };

          // 根据是否为回收站模式选择不同的API
          const isTrashMode = props.extraParams?.isTrash === 1;
          return isTrashMode
            ? await listFileTrash(params)
            : await getStorageFileList(params);
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
  } as VxeTableGridOptions<StorageFileListVo>,
  gridEvents: {
    checkboxChange: () => {
      if (isDestroyed.value) return;
      try {
        const selectedRows =
          gridApi.grid.getCheckboxRecords() as StorageFileListVo[];
        emit('selectionChange', selectedRows);
      } catch (error) {
        console.warn('选中状态变化事件处理失败:', error);
      }
    },
    cellClick: ({ row }: { row: StorageFileListVo }) => {
      if (isDestroyed.value) return;
      try {
        emit('rowClick', row);
      } catch (error) {
        console.warn('行点击事件处理失败:', error);
      }
    },
  },
});

// 组件挂载时的初始化逻辑
onMounted(() => {
  // 存储键名已改为输入框，无需动态加载选项
});

// 暴露方法给父组件
defineExpose({
  gridApi,
  reload: () => {
    if (isDestroyed.value) return Promise.resolve();
    try {
      return gridApi.reload();
    } catch (error) {
      console.warn('重新加载失败:', error);
      return Promise.resolve();
    }
  },
  getSelectedRows: () => {
    if (isDestroyed.value) return [];
    try {
      return gridApi.grid.getCheckboxRecords() as StorageFileListVo[];
    } catch (error) {
      console.warn('获取选中行失败:', error);
      return [];
    }
  },
  clearSelection: () => {
    if (isDestroyed.value) return;
    try {
      return gridApi.grid.clearCheckboxRow();
    } catch (error) {
      console.warn('清空选中失败:', error);
    }
  },
  handleBatchDelete,
  handleExport,
});
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <!-- 工具栏插槽 -->
        <template #toolbar-actions>
          <slot name="toolbar-actions"></slot>
        </template>

        <template #toolbar-tools>
          <slot name="toolbar-tools"></slot>
        </template>

        <!-- 自定义列插槽 -->
        <template #originalName="{ row }">
          <div class="flex items-center space-x-2">
            <span class="truncate" :title="row.originalName">
              {{ row.originalName || '--' }}
            </span>
          </div>
        </template>
      </Grid>
    </Page>
  </div>
</template>
