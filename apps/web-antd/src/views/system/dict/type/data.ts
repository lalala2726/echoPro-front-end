import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system/dict/dictType';

import { useAccess } from '@vben/access';

const { hasAccessByCodes } = useAccess();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '字典ID',
      componentProps: { disabled: true },
      dependencies: {
        triggerFields: ['id'],
        show: (values) => !!values.id,
      },
    },
    {
      component: 'Input',
      fieldName: 'dictName',
      label: '字典名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: '字典类型',
      rules: 'required',
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
      defaultValue: 0,
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
      fieldName: 'dictName',
      label: '字典名称',
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: '字典类型',
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

export function useColumns<T = SystemDictApi.SystemDictType>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'dictName',
      title: '字典名称',
      width: 200,
    },
    {
      field: 'dictType',
      title: '字典类型',
      width: 200,
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
      width: 120,
    },
    {
      field: 'remark',
      minWidth: 200,
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
          nameField: 'dictName',
          nameTitle: '字典',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'view',
            text: '查看字典值',
            show: () => hasAccessByCodes(['system:dict-type:query']),
          },
          {
            code: 'edit',
            text: '编辑',
            show: () => hasAccessByCodes(['system:dict-type:update']),
          },
          {
            code: 'delete',
            text: '删除',
            show: () => hasAccessByCodes(['system:dict-type:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 180,
    },
  ];
}
