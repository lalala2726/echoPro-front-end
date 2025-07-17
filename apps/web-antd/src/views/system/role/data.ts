import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '角色ID',
      componentProps: { disabled: true },
      dependencies: {
        triggerFields: ['id'],
        show: (values) => !!values.id,
      },
    },
    {
      component: 'Input',
      fieldName: 'roleName',
      label: '角色名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'roleKey',
      label: '角色标识',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        class: 'w-full',
      },
      fieldName: 'sort',
      label: '排序',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '已启用', value: 0 },
          { label: '已禁用', value: 1 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: '角色名称',
    },
    {
      component: 'Input',
      fieldName: 'roleKey',
      label: '角色标识',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '已启用', value: 0 },
          { label: '已禁用', value: 1 },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: '备注',
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'roleName',
      title: '角色名称',
      width: 180,
    },
    {
      field: 'roleKey',
      title: '角色标识',
      width: 150,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: {
          checkedValue: 0,
          unCheckedValue: 1,
          checkedChildren: '启用',
          unCheckedChildren: '禁用',
        },
        options: [
          { color: 'success', label: '已启用', value: 1 },
          { color: 'error', label: '已禁用', value: 0 },
        ],
      },
      field: 'status',
      title: '状态',
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 120,
      title: '备注',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'roleName',
          nameTitle: '角色',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'assign',
            text: '分配权限',
            style: { color: '#52c41a' },
          },
          'delete', // 默认的删除按钮
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 280,
    },
  ];
}
