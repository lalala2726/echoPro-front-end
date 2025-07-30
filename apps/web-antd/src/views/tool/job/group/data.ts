import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridPropTypes } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { JobGroupType } from '#/api/tool/job/type/groupType';

import { z } from '@vben/common-ui';

/**
 * 获取表单配置
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '任务组ID',
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
        placeholder: '请输入任务组编码',
      },
      fieldName: 'groupCode',
      label: '任务组编码',
      rules: z
        .string()
        .min(2, '任务组编码至少2个字符')
        .max(50, '任务组编码最多50个字符'),
    },
    {
      component: 'Input',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入任务组名称',
      },
      fieldName: 'groupName',
      label: '任务组名称',
      rules: z
        .string()
        .min(2, '任务组名称至少2个字符')
        .max(50, '任务组名称最多50个字符'),
    },
    {
      component: 'Textarea',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入任务组描述',
        rows: 3,
      },
      fieldName: 'groupDescription',
      label: '任务组描述',
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
    {
      component: 'Textarea',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入备注',
        rows: 3,
      },
      fieldName: 'remark',
      label: '备注',
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
      fieldName: 'groupCode',
      label: '任务组编码',
      componentProps: {
        placeholder: '请输入任务组编码',
      },
    },
    {
      component: 'Input',
      fieldName: 'groupName',
      label: '任务组名称',
      componentProps: {
        placeholder: '请输入任务组名称',
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
    params: OnActionClickParams<JobGroupType.SysJobGroupListVo>,
  ) => void,
  onStatusChange?: (
    checked: boolean,
    row: JobGroupType.SysJobGroupListVo,
  ) => Promise<void>,
): VxeGridPropTypes.Columns<JobGroupType.SysJobGroupListVo> {
  return [
    {
      title: '任务组名称',
      align: 'left',
      type: 'checkbox',
      width: 180,
    },
    {
      field: 'groupCode',
      title: '任务组编码',
      width: 180,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'groupName',
      title: '任务组名称',
      minWidth: 120,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'groupDescription',
      title: '任务组描述',
      minWidth: 150,
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
      field: 'jobCount',
      title: '任务数量',
      width: 100,
      formatter: ({ cellValue }) => cellValue ?? 0,
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
          nameField: 'groupName',
          nameTitle: '任务组',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
          },
          {
            code: 'delete',
            text: '删除',
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