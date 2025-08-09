import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from '#/adapter/vxe-table';

import { formatDateTime } from '@vben/utils';

// 角色表格列配置
export const roleColumns: VxeGridPropTypes.Columns = [
  {
    align: 'left',
    type: 'checkbox',
    width: 60,
    title: '选择',
    fixed: 'left',
  },
  {
    title: '角色名称',
    field: 'roleName',
    showOverflow: 'tooltip',
  },
  {
    title: '角色标识',
    field: 'roleCode',
    showOverflow: 'tooltip',
  },
  {
    title: '角色描述',
    field: 'description',
    showOverflow: 'tooltip',
  },
  {
    title: '状态',
    field: 'status',
    align: 'center',
    slots: { default: 'status' },
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
 * 角色选择组件的搜索表单配置
 */
export function useRoleSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: '角色名称',
      componentProps: {
        placeholder: '请输入角色名称',
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
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
  ];
}

// 角色状态映射
export const roleStatusMap: Record<number, { color: string; text: string }> = {
  0: { text: '禁用', color: 'red' },
  1: { text: '启用', color: 'green' },
};
