import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridPropTypes } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SystemPostType } from '#/api/system/post';

import { useAccess } from '@vben/access';
import { z } from '@vben/common-ui';

const { hasAccessByCodes } = useAccess();

/**
 * 获取表单配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '岗位ID',
      componentProps: { disabled: true },
      dependencies: {
        triggerFields: ['id'],
        show: (values) => !!values.id,
      },
    },
    {
      component: 'Input',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入岗位编码',
      },
      fieldName: 'postCode',
      label: '岗位编码',
      rules: z
        .string()
        .min(2, '岗位编码至少2个字符')
        .max(50, '岗位编码最多50个字符'),
    },
    {
      component: 'Input',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入岗位名称',
      },
      fieldName: 'postName',
      label: '岗位名称',
      rules: z
        .string()
        .min(2, '岗位名称至少2个字符')
        .max(50, '岗位名称最多50个字符'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        max: 9999,
        class: 'w-full',
        placeholder: '请输入排序',
      },
      fieldName: 'sort',
      label: '排序',
      defaultValue: 0,
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '正常', value: 0 },
          { label: '停用', value: 1 },
        ],
        optionType: 'button',
        class: 'w-full',
      },
      defaultValue: 0,
      fieldName: 'status',
      label: '状态',
    },
  ];
}

/**
 * 获取搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postCode',
      label: '岗位编码',
      componentProps: {
        placeholder: '请输入岗位编码',
      },
    },
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
      componentProps: {
        allowClear: true,
        options: [
          { label: '正常', value: 0 },
          { label: '停用', value: 1 },
        ],
        placeholder: '请选择状态',
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
    },
  ];
}

/**
 * 获取表格列配置
 */
export function useColumns(
  onActionClick?: (
    params: OnActionClickParams<SystemPostType.PostListVo>,
  ) => void,
  onStatusChange?: (
    checked: boolean,
    row: SystemPostType.PostListVo,
  ) => Promise<void>,
): VxeGridPropTypes.Columns<SystemPostType.PostListVo> {
  return [
    {
      title: '岗位名称',
      align: 'left',
      type: 'checkbox',
      width: 180,
    },
    {
      field: 'postCode',
      title: '岗位编码',
      width: 180,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'postName',
      title: '岗位名称',
      minWidth: 120,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'sort',
      title: '排序',
      width: 80,
      formatter: ({ cellValue }) => cellValue ?? '--',
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: {
          checkedValue: 0,
          unCheckedValue: 1,
          checkedChildren: '正常',
          unCheckedChildren: '停用',
        },
        options: [
          { color: 'success', label: '正常', value: 0 },
          { color: 'error', label: '停用', value: 1 },
        ],
      },
      field: 'status',
      title: '状态',
      width: 100,
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 160,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'postName',
          nameTitle: '岗位',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
            show: () => hasAccessByCodes(['system:post:update']),
          },
          {
            code: 'delete',
            text: '删除',
            show: () => hasAccessByCodes(['system:post:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 160,
    },
  ];
}
