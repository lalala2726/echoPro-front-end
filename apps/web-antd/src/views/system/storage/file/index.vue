<script lang="ts" setup>
import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SystemStorageFileAPi } from '#/api/system/storage/file';

import { onBeforeUnmount, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { getStorageFileById } from '#/api/system/storage/file';

import StorageFileList from './list.vue';
import FileDetail from './modules/detail.vue';

defineOptions({
  name: 'StorageFile',
});

// 组件引用
const fileListRef = ref();
const trashListRef = ref();
const fileDetailRef = ref();

// 当前激活的标签页
const activeTab = ref('normal');
const isDestroyed = ref(false);
const { hasAccessByCodes } = useAccess();

// 组件卸载前设置标记
onBeforeUnmount(() => {
  isDestroyed.value = true;
});

/**
 * 处理操作按钮点击事件
 */
async function onActionClick(
  params: OnActionClickParams<SystemStorageFileAPi.StorageFileListVo>,
) {
  if (isDestroyed.value) return;

  const { code, row } = params;

  switch (code) {
    case 'detail': {
      // 获取文件详情并打开详情弹窗
      if (row.id) {
        try {
          const fileDetail = await getStorageFileById(row.id);
          if (!isDestroyed.value) {
            fileDetailRef.value?.modalApi.setData(fileDetail).open();
          }
        } catch (error) {
          console.error('获取文件详情失败:', error);
          if (!isDestroyed.value) {
            message.error('获取文件详情失败');
          }
        }
      }
      break;
    }
    default: {
      // 其他操作由列表组件处理
      break;
    }
  }
}

/**
 * 获取当前激活的列表组件引用
 */
function getCurrentListRef() {
  return activeTab.value === 'normal' ? fileListRef.value : trashListRef.value;
}

/**
 * 处理批量删除
 */
async function handleBatchDelete() {
  const currentListRef = getCurrentListRef();
  if (!currentListRef) {
    message.warning('组件未准备就绪');
    return;
  }

  const selectedRows = currentListRef.getSelectedRows() || [];
  if (selectedRows.length === 0) {
    message.warning('请选择要删除的文件');
    return;
  }

  const isTrash = activeTab.value === 'trash';
  const title = isTrash ? '确认彻底删除' : '确认删除';
  const content = isTrash
    ? `确定要彻底删除选中的 ${selectedRows.length} 个文件吗？此操作不可恢复。`
    : `确定要删除选中的 ${selectedRows.length} 个文件吗？删除后将移入回收站。`;

  Modal.confirm({
    title,
    content,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        await currentListRef?.handleBatchDelete();
      } catch (error) {
        console.error('批量删除失败:', error);
        message.error('批量删除失败');
      }
    },
  });
}

/**
 * 处理导出
 */
async function handleExport() {
  if (isDestroyed.value) return;

  try {
    const currentListRef = getCurrentListRef();
    await currentListRef?.handleExport();
  } catch (error) {
    console.error('导出失败:', error);
    if (!isDestroyed.value) {
      message.error('导出失败');
    }
  }
}

/**
 * 处理文件上传（占位功能）
 */
function handleUpload() {
  if (isDestroyed.value) return;
  message.info('文件上传功能待实现');
}
</script>

<template>
  <Page auto-content-height>
    <!-- 普通文件列表 -->
    <StorageFileList
      v-if="activeTab === 'normal'"
      ref="fileListRef"
      @action-click="onActionClick"
    >
      <template #toolbar-tools>
        <Button primary @click="handleUpload">
          <template #icon>
            <Plus />
          </template>
          上传文件
        </Button>
        <span class="mx-2"></span>
        <Button
          v-if="hasAccessByCodes(['system:storage-file:delete'])"
          danger
          @click="handleBatchDelete"
        >
          批量删除
        </Button>
        <span class="mx-2"></span>
        <Button
          v-if="hasAccessByCodes(['system:storage-file:export'])"
          @click="handleExport"
        >
          导出列表
        </Button>
        <span class="mx-2"></span>
        <Button @click="activeTab = 'trash'"> 回收站 </Button>
      </template>
    </StorageFileList>

    <!-- 回收站文件列表 -->
    <StorageFileList
      v-if="activeTab === 'trash'"
      ref="trashListRef"
      :extra-params="{ isTrash: 1 }"
      @action-click="onActionClick"
    >
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['system:storage-file:delete'])"
          danger
          @click="handleBatchDelete"
        >
          彻底删除
        </Button>
        <span class="mx-2"></span>
        <Button
          v-if="hasAccessByCodes(['system:storage-file:export'])"
          @click="handleExport"
        >
          导出列表
        </Button>
        <span class="mx-2"></span>
        <Button @click="activeTab = 'normal'"> 退出回收站 </Button>
      </template>
    </StorageFileList>

    <!-- 文件详情弹窗 -->
    <FileDetail ref="fileDetailRef" />
  </Page>
</template>
