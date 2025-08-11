<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DashBoardMessageType } from '#/api/personal/message';

import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMessages,
  listUserMessageList,
  markMessageAsRead,
  markMessageAsUnRead,
} from '#/api/personal/message';
import { useMessageStore } from '#/composables/useMessageStore';

import { useColumns, useGridFormSchema } from './data';

defineOptions({
  name: 'MessageIndex',
});

const router = useRouter();
const { hasAccessByCodes } = useAccess();

// 全局消息状态
const { fetchUnreadCountFromList, triggerLayoutRefresh } = useMessageStore();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'title',
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
          return await listUserMessageList({
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
  } as VxeTableGridOptions<DashBoardMessageType.UserMessageListVo>,
});

function onActionClick(
  e: OnActionClickParams<DashBoardMessageType.UserMessageListVo>,
) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'markRead': {
      onMarkRead(e.row);
      break;
    }
    case 'markUnread': {
      onMarkUnread(e.row);
      break;
    }
    case 'view': {
      onView(e.row);
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
 * 查看消息详情
 */
function onView(row: DashBoardMessageType.UserMessageListVo) {
  router.push(`/message/detail/${row.id}`);
}

/**
 * 标记消息为已读
 */
async function onMarkRead(row: DashBoardMessageType.UserMessageListVo) {
  try {
    await markMessageAsRead([row.id!]);
    message.success({
      content: `消息已标记为已读`,
      key: 'mark_read_msg',
    });
    onRefresh();
    // 更新全局未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error: any) {
    message.error({
      content: `标记失败: ${error.message || '未知错误'}`,
      key: 'mark_read_msg',
    });
  }
}

/**
 * 标记消息为未读
 */
async function onMarkUnread(row: DashBoardMessageType.UserMessageListVo) {
  message.loading({
    content: `正在标记消息为未读...`,
    duration: 0,
    key: 'mark_unread_msg',
  });
  try {
    await markMessageAsUnRead([row.id!]);
    message.success({
      content: `消息已标记为未读`,
      key: 'mark_unread_msg',
    });
    onRefresh();
    // 更新全局未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error: any) {
    message.error({
      content: `标记失败: ${error.message || '未知错误'}`,
      key: 'mark_unread_msg',
    });
  }
}

/**
 * 删除消息
 */
async function onDelete(row: DashBoardMessageType.UserMessageListVo) {
  try {
    await confirm(`确定要删除消息 "${row.title}" 吗？`, '删除确认');
    message.loading({
      content: `正在删除消息...`,
      duration: 0,
      key: 'delete_msg',
    });
    await deleteMessages([row.id!]);
    message.success({
      content: `消息删除成功`,
      key: 'delete_msg',
    });
    onRefresh();
    // 更新全局未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error({
        content: `删除失败: ${error.message || '未知错误'}`,
        key: 'delete_msg',
      });
    }
  }
}

function onRefresh() {
  gridApi.query();
}

/**
 * 批量标记为已读
 */
async function onBatchMarkRead() {
  const selectRecords = gridApi.grid.getCheckboxRecords();
  if (selectRecords.length === 0) {
    message.warning('请选择要标记的消息');
    return;
  }

  // 过滤出未读消息
  const unreadRecords = selectRecords.filter(
    (record: DashBoardMessageType.UserMessageListVo) => record.isRead === 0,
  );

  if (unreadRecords.length === 0) {
    message.warning('所选消息都已是已读状态');
    gridApi.grid.clearCheckboxRow();
    return;
  }

  try {
    await confirm(
      `确定要将这 ${unreadRecords.length} 条消息标记为已读吗？`,
      '批量标记已读确认',
    );

    const messageIds = unreadRecords.map(
      (record: DashBoardMessageType.UserMessageListVo) => record.id!,
    );
    message.loading({
      content: '正在批量标记为已读...',
      duration: 0,
      key: 'batch_mark_read_msg',
    });
    await markMessageAsRead(messageIds);
    message.success({
      content: `成功标记 ${unreadRecords.length} 条消息为已读`,
      key: 'batch_mark_read_msg',
    });
    onRefresh();
    // 更新全局未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error({
        content: `批量标记失败: ${error.message || '未知错误'}`,
        key: 'batch_mark_read_msg',
      });
    }
  } finally {
    // 无论成功还是失败都清除复选框选择
    gridApi.grid.clearCheckboxRow();
  }
}

/**
 * 批量标记为未读
 */
async function onBatchMarkUnread() {
  const selectRecords = gridApi.grid.getCheckboxRecords();
  if (selectRecords.length === 0) {
    message.warning('请选择要标记的消息');
    return;
  }

  // 过滤出已读消息
  const readRecords = selectRecords.filter(
    (record: DashBoardMessageType.UserMessageListVo) => record.isRead === 1,
  );

  if (readRecords.length === 0) {
    message.warning('所选消息都已是未读状态');
    gridApi.grid.clearCheckboxRow();
    return;
  }

  try {
    await confirm(
      `确定要将这 ${readRecords.length} 条消息标记为未读吗？`,
      '批量标记未读确认',
    );

    const messageIds = readRecords.map(
      (record: DashBoardMessageType.UserMessageListVo) => record.id!,
    );
    message.loading({
      content: '正在批量标记为未读...',
      duration: 0,
      key: 'batch_mark_unread_msg',
    });
    await markMessageAsUnRead(messageIds);
    message.success({
      content: `成功标记 ${readRecords.length} 条消息为未读`,
      key: 'batch_mark_unread_msg',
    });
    onRefresh();
    // 更新全局未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error({
        content: `批量标记失败: ${error.message || '未知错误'}`,
        key: 'batch_mark_unread_msg',
      });
    }
  } finally {
    // 无论成功还是失败都清除复选框选择
    gridApi.grid.clearCheckboxRow();
  }
}

/**
 * 批量删除消息
 */
async function onBatchDelete() {
  const selectRecords = gridApi.grid.getCheckboxRecords();
  if (selectRecords.length === 0) {
    message.warning('请选择要删除的消息');
    return;
  }

  try {
    await confirm(
      `确定要删除这 ${selectRecords.length} 条消息吗？`,
      '批量删除确认',
    );

    const messageIds = selectRecords.map(
      (record: DashBoardMessageType.UserMessageListVo) => record.id!,
    );
    message.loading({
      content: '正在批量删除消息...',
      duration: 0,
      key: 'batch_delete_msg',
    });
    await deleteMessages(messageIds);
    message.success({
      content: `成功删除 ${selectRecords.length} 条消息`,
      key: 'batch_delete_msg',
    });
    onRefresh();
    // 更新全局未读数量并刷新布局
    await fetchUnreadCountFromList();
    triggerLayoutRefresh();
  } catch (error: any) {
    if (error.message !== '已取消') {
      message.error({
        content: `批量删除失败: ${error.message || '未知错误'}`,
        key: 'batch_delete_msg',
      });
    }
  } finally {
    // 无论成功还是失败都清除复选框选择
    gridApi.grid.clearCheckboxRow();
  }
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid table-title="消息中心">
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['dashboard:message:read'])"
            type="primary"
            @click="onBatchMarkRead"
          >
            批量标记已读
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['dashboard:message:read'])"
            @click="onBatchMarkUnread"
          >
            批量标记未读
          </Button>
          <span class="mx-2"></span>
          <Button
            v-if="hasAccessByCodes(['dashboard:message:delete'])"
            danger
            @click="onBatchDelete"
          >
            批量删除
          </Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>

<style scoped>
/* 可以添加自定义样式 */
</style>
