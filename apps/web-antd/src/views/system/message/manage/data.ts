import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from '#/adapter/vxe-table';
import type { SysMessageListVo } from '#/api/system/messageManage/types';

import { useAccess } from '@vben/access';

import { z } from '#/adapter/form';
import {
  MessageLevel,
  MessageSendMethod,
  MessageType,
} from '#/api/system/messageManage/types';

/**
 * 表格列配置
 */
export function useColumns(
  onActionClick: (params: { code: string; row: SysMessageListVo }) => void,
): VxeGridPropTypes.Columns {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      type: 'checkbox',
      title: 'ID',
      align: 'left',
      width: 100,
    },
    {
      field: 'title',
      title: '消息标题',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            label: '系统消息',
            value: MessageType.SYSTEM,
            color: 'blue',
          },
          {
            label: '通知消息',
            value: MessageType.NOTICE,
            color: 'success',
          },
          {
            label: '公告消息',
            value: MessageType.ANNOUNCEMENT,
            color: 'warning',
          },
        ],
      },
      field: 'type',
      title: '消息类型',
      align: 'center',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            label: '普通',
            value: MessageLevel.NORMAL,
            color: 'default',
          },
          {
            label: '重要',
            value: MessageLevel.IMPORTANT,
            color: 'warning',
          },
          {
            label: '紧急',
            value: MessageLevel.URGENT,
            color: 'error',
          },
        ],
      },
      field: 'level',
      title: '消息级别',
      align: 'center',
    },
    {
      title: '发送者',
      field: 'senderName',
      width: 120,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            label: '指定用户',
            value: MessageSendMethod.USER,
            color: 'blue',
          },
          {
            label: '全部用户',
            value: MessageSendMethod.ALL,
            color: 'success',
          },
          {
            label: '角色用户',
            value: MessageSendMethod.ROLE,
            color: 'warning',
          },
        ],
      },
      field: 'targetType',
      title: '目标类型',
      align: 'center',
    },
    {
      field: 'publishTime',
      title: '发布时间',
      width: 180,
    },
    {
      field: 'action',
      fixed: 'right',
      title: '操作',
      width: 200,
      cellRender: {
        attrs: {
          nameField: 'title',
          nameTitle: '消息',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
            tooltip: '编辑消息',
            show: () => hasAccessByCodes(['system:message:update']),
          },
          {
            code: 'preview',
            text: '预览',
            tooltip: '预览消息',
            show: () => hasAccessByCodes(['system:message:query']),
          },
          {
            code: 'delete',
            text: '删除',
            tooltip: '删除消息',
            show: () => hasAccessByCodes(['system:message:delete']),
          },
        ],
      },
    },
  ];
}

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: '消息标题',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '系统消息',
            value: MessageType.SYSTEM,
          },
          {
            label: '通知消息',
            value: MessageType.NOTICE,
          },
          {
            label: '公告消息',
            value: MessageType.ANNOUNCEMENT,
          },
        ],
        placeholder: '请选择消息类型',
      },
      fieldName: 'type',
      label: '消息类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '普通', value: MessageLevel.NORMAL },
          {
            label: '重要',
            value: MessageLevel.IMPORTANT,
          },
          { label: '紧急', value: MessageLevel.URGENT },
        ],
        placeholder: '请选择消息级别',
      },
      fieldName: 'level',
      label: '消息级别',
    },
    {
      component: 'Input',
      fieldName: 'senderName',
      label: '发送者姓名',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '指定用户',
            value: MessageSendMethod.USER,
          },
          {
            label: '全部用户',
            value: MessageSendMethod.ALL,
          },
          {
            label: '角色用户',
            value: MessageSendMethod.ROLE,
          },
        ],
        placeholder: '请选择目标类型',
      },
      fieldName: 'targetType',
      label: '目标类型',
    },
  ];
}

/**
 * 表单配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: '消息标题',
      rules: z
        .string()
        .min(1, '消息标题不能为空')
        .max(100, '消息标题不能超过100个字符'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '系统消息',
            value: MessageType.SYSTEM,
          },
          {
            label: '通知消息',
            value: MessageType.NOTICE,
          },
          {
            label: '公告消息',
            value: MessageType.ANNOUNCEMENT,
          },
        ],
      },
      defaultValue: '1',
      fieldName: 'type',
      label: '消息类型',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '普通', value: MessageLevel.NORMAL },
          {
            label: '重要',
            value: MessageLevel.IMPORTANT,
          },
          { label: '紧急', value: MessageLevel.URGENT },
        ],
      },
      defaultValue: '1',
      fieldName: 'level',
      label: '消息级别',
      rules: 'required',
    },
  ];
}
