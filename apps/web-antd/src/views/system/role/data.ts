import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { useAccess } from '@vben/access';

import { getDictOptions, getDictOptionsSync } from '#/utils';

const { hasAccessByCodes } = useAccess();

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
        options: getDictOptions('system_status'),
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
        options: getDictOptions('system_status'), // 使用字典数据
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
          { color: 'success', label: '已启用', value: 0 },
          { color: 'error', label: '已禁用', value: 1 },
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
          {
            code: 'edit',
            text: '编辑',
            show: () => hasAccessByCodes(['system:role:update']),
          },
          {
            code: 'assign',
            text: '分配权限',
            style: { color: '#52c41a' },
            show: () => hasAccessByCodes(['system:role:assign']),
          },
          {
            code: 'delete',
            text: '删除',
            show: () => hasAccessByCodes(['system:role:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 280,
    },
  ];
}

/**
 * 使用字典数据的异步 columns 生成函数
 * 适用于需要从后端获取字典数据的 cellRender 场景
 */
export async function useColumnsWithDict<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): Promise<VxeTableGridOptions['columns']> {
  // 获取状态字典数据
  const statusOptions = await getDictOptionsSync('system_status');

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
        options: statusOptions.map((item) => ({
          color: item.value === '0' ? 'success' : 'error',
          label: item.label,
          value: Number(item.value),
        })),
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
