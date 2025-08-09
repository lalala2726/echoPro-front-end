import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from '#/adapter/vxe-table';

// 部门树表格列配置
export const deptColumns: VxeGridPropTypes.Columns = [
  {
    type: 'checkbox',
    width: 42,
    align: 'left',
  },
  {
    title: '部门名称',
    field: 'deptName',
    treeNode: true,
    showOverflow: 'tooltip',
  },
  {
    title: '状态',
    field: 'status',
    align: 'center',
    slots: { default: 'status' },
  },
];

// 部门选择组件的搜索表单配置
export function useDeptSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'deptName',
      label: '部门名称',
      componentProps: {
        placeholder: '请输入部门名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'manager',
      label: '负责人',
      componentProps: {
        placeholder: '请输入负责人',
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
          { label: '已启用', value: 0 },
          { label: '已禁用', value: 1 },
        ],
      },
    },
  ];
}

// 部门状态映射
export const deptStatusMap: Record<number, { color: string; text: string }> = {
  0: { text: '已启用', color: 'green' },
  1: { text: '已禁用', color: 'red' },
};
