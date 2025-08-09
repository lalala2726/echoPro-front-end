import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

/**
 * 用户选择组件的搜索表单配置
 */
export function useUserSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: '昵称',
      componentProps: {
        placeholder: '请输入昵称',
      },
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
      componentProps: {
        placeholder: '请输入手机号',
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

/**
 * 用户选择组件的表格列配置
 * 显示基本字段：用户名、昵称、部门、手机号、状态
 */
export function useUserSelectColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'left',
      title: '用户名',
      type: 'checkbox',
      fixed: 'left',
    },
    {
      field: 'nickname',
      title: '昵称',
    },
    {
      field: 'deptName',
      title: '所属部门',
      formatter: ({ row }) => {
        // 尝试多种可能的部门名称字段
        return (
          row.sysDept?.deptName || row.deptName || row.dept?.deptName || '--'
        );
      },
    },
    {
      field: 'phone',
      title: '手机号',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '已启用', value: 0 },
          { color: 'error', label: '已禁用', value: 1 },
        ],
      },
      field: 'status',
      title: '状态',
    },
  ];
}
