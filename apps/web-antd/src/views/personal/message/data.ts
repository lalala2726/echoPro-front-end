import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DashBoardMessageType } from '#/api/personal/message';

import { useAccess } from '@vben/access';

const { hasAccessByCodes } = useAccess();

// 消息类型选项
const MESSAGE_TYPE_OPTIONS = [
  { label: '系统消息', value: 'system' },
  { label: '通知消息', value: 'notice' },
  { label: '公告消息', value: 'announcement' },
];

// 消息级别选项
const MESSAGE_LEVEL_OPTIONS = [
  { label: '普通', value: 'normal' },
  { label: '重要', value: 'important' },
  { label: '紧急', value: 'urgent' },
];

// 已读状态选项
const READ_STATUS_OPTIONS = [
  { label: '已读', value: 1 },
  { label: '未读', value: 0 },
];

/**
 * 表格搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: '消息标题',
      componentProps: {
        placeholder: '请输入消息标题',
      },
    },
    {
      component: 'Select',
      fieldName: 'type',
      label: '消息类型',
      componentProps: {
        allowClear: true,
        placeholder: '请选择消息类型',
        options: MESSAGE_TYPE_OPTIONS,
      },
    },
    {
      component: 'Select',
      fieldName: 'level',
      label: '消息级别',
      componentProps: {
        allowClear: true,
        placeholder: '请选择消息级别',
        options: MESSAGE_LEVEL_OPTIONS,
      },
    },
    {
      component: 'Select',
      fieldName: 'isRead',
      label: '已读状态',
      componentProps: {
        allowClear: true,
        placeholder: '请选择已读状态',
        options: READ_STATUS_OPTIONS,
      },
    },
    {
      component: 'Input',
      fieldName: 'senderName',
      label: '发送者',
      componentProps: {
        placeholder: '请输入发送者名称',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '发送时间',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
      },
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns<T = DashBoardMessageType.UserMessageListVo>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'left',
      title: '消息标题',
      type: 'checkbox',
      width: 200,
      fixed: 'left',
      formatter: ({ row }: any) => {
        return row.title || '--';
      },
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'blue', label: '系统消息', value: 'system' },
          { color: 'green', label: '通知消息', value: 'notice' },
          { color: 'orange', label: '公告消息', value: 'announcement' },
        ],
      },
      field: 'type',
      title: '消息类型',
      width: 120,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'default', label: '普通', value: 'normal' },
          { color: 'warning', label: '重要', value: 'important' },
          { color: 'error', label: '紧急', value: 'urgent' },
        ],
      },
      field: 'level',
      title: '消息级别',
      width: 100,
    },
    {
      field: 'content',
      title: '消息概要',
      minWidth: 200,
      showOverflow: 'tooltip',
      formatter: ({ cellValue }) => {
        if (!cellValue) return '--';
        // 移除HTML标签并截取前50个字符
        const plainText = cellValue.replaceAll(/<[^>]*>/g, '');
        return plainText.length > 50
          ? `${plainText.slice(0, 50)}...`
          : plainText;
      },
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'green', label: '已读', value: 1 },
          { color: 'blue', label: '未读', value: 0 },
        ],
      },
      field: 'isRead',
      title: '已读状态',
      width: 100,
    },
    {
      field: 'createTime',
      title: '发送时间',
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'title',
          nameTitle: '消息',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'view',
            text: '查看',
            show: () => hasAccessByCodes(['dashboard:message:view']),
          },
          {
            code: 'markRead',
            text: '标记已读',
            show: (row: any) =>
              row.isRead === 0 && hasAccessByCodes(['dashboard:message:read']),
          },
          {
            code: 'markUnread',
            text: '标记未读',
            show: (row: any) =>
              row.isRead === 1 && hasAccessByCodes(['dashboard:message:read']),
          },
          {
            code: 'delete',
            text: '删除',
            show: () => hasAccessByCodes(['dashboard:message:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 200,
    },
  ];
}
