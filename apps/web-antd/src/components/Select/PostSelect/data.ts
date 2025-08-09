import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from '#/adapter/vxe-table';

import { formatDateTime } from '@vben/utils';

// 岗位表格列配置
export const postColumns: VxeGridPropTypes.Columns = [
  {
    align: 'left',
    title: '岗位名称',
    type: 'checkbox',
    width: 120,
  },
  {
    title: '岗位编码',
    field: 'postCode',
    showOverflow: 'tooltip',
    minWidth: 120,
  },
  {
    title: '排序',
    field: 'sort',
    width: 80,
    align: 'center',
  },
  {
    title: '状态',
    field: 'status',
    align: 'center',
    slots: { default: 'status' },
    width: 100,
  },
  {
    title: '创建时间',
    field: 'createTime',
    minWidth: 160,
    formatter: ({ cellValue }) => {
      return cellValue ? formatDateTime(cellValue) : '-';
    },
  },
];

/**
 * 岗位选择组件的搜索表单配置
 */
export function usePostSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
      componentProps: {
        placeholder: '请输入岗位名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        placeholder: '请选择状态',
        options: [
          { label: '正常', value: 0 },
          { label: '停用', value: 1 },
        ],
      },
    },
  ];
}

// 岗位状态映射（0-正常, 1-停用）
export const postStatusMap: Record<number, { color: string; text: string }> = {
  0: { text: '正常', color: 'green' },
  1: { text: '停用', color: 'red' },
};
