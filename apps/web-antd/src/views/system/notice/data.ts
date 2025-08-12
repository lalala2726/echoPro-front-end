import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from '#/adapter/vxe-table';
import type { SystemNoticeType } from '#/api/system/notice';

import { useAccess } from '@vben/access';

import { z } from '#/adapter/form';

/**
 * 表格列配置
 */
export function useColumns(
  onActionClick: (params: {
    code: string;
    row: SystemNoticeType.SysNoticeVo;
  }) => void,
): VxeGridPropTypes.Columns {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      type: 'checkbox',
      title: '公告标题',
      align : 'left',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '通知', value: '1', color: 'blue' },
          { label: '公告', value: '2', color: 'success' },
        ],
      },
      field: 'noticeType',
      title: '类型',
      width: 100,
      align: 'center',
    },
    {
      field: 'createBy',
      title: '创建者',
    },
    {
      field: 'createTime',
      title: '创建时间',
    },

    {
      field: 'action',
      fixed: 'right',
      title: '操作',
      width: 200,
      cellRender: {
        attrs: {
          nameField: 'noticeTitle',
          nameTitle: '公告',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
            tooltip: '编辑公告',
            show: () => hasAccessByCodes(['system:notice:update']),
          },
          {
            code: 'preview',
            text: '预览',
            tooltip: '预览公告',
            show: () => hasAccessByCodes(['system:notice:query']),
          },
          {
            code: 'delete',
            text: '删除',
            tooltip: '删除公告',
            show: () => hasAccessByCodes(['system:notice:delete']),
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
      fieldName: 'noticeTitle',
      label: '公告标题',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '通知', value: '1' },
          { label: '公告', value: '2' },
        ],
        placeholder: '请选择公告类型',
      },
      fieldName: 'noticeType',
      label: '公告类型',
    },
    {
      component: 'Input',
      fieldName: 'createBy',
      label: '创建者',
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
      fieldName: 'noticeTitle',
      label: '公告标题',
      rules: z
        .string()
        .min(1, '公告标题不能为空')
        .max(50, '公告标题不能超过50个字符'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '通知', value: '1' },
          { label: '公告', value: '2' },
        ],
      },
      defaultValue: '1',
      fieldName: 'noticeType',
      label: '公告类型',
      rules: 'required',
    },
  ];
}
