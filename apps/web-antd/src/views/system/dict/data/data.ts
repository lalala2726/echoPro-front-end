import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDictDataType } from '#/api/system/dict/dictData';

import { useAccess } from '@vben/access';

const { hasAccessByCodes } = useAccess();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入字典标签',
      },
      fieldName: 'dictLabel',
      label: '字典标签',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入字典值',
      },
      fieldName: 'dictValue',
      label: '字典值',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '启用', value: 0 },
          { label: '禁用', value: 1 },
        ],
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function useColumns<T = SystemDictDataType.DictDataVo>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'dictLabel',
      title: '字典标签',
    },
    {
      field: 'dictValue',
      title: '字典值',
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
    },
    {
      field: 'sort',
      title: '排序',
    },
    {
      field: 'remark',
      title: '备注',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'createTime',
      title: '创建时间',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'dictLabel',
          nameTitle: '字典值',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
            show: () => hasAccessByCodes(['system:dict-data:update']),
          },
          {
            code: 'delete',
            text: '删除',
            show: () => hasAccessByCodes(['system:dict-data:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 150,
    },
  ];
}
