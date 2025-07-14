import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { z } from '#/adapter/form';
import { getDeptOptions } from '#/api/system/dept';

/**
 * 获取搜索表单的字段配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'deptName',
      label: '部门名称',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '已启用', value: '0' },
          { label: '已禁用', value: '1' },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Input',
      fieldName: 'manager',
      label: '负责人',
    },
  ];
}

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'deptId',
      label: '部门ID',
      componentProps: {
        disabled: true,
        class: 'w-full',
      },
      dependencies: {
        triggerFields: ['deptId'],
        show: (values) => !!values.deptId,
      },
    },
    {
      component: 'Input',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入部门名称',
      },
      fieldName: 'deptName',
      label: '部门名称',
      rules: z
        .string()
        .min(2, '部门名称至少2个字符')
        .max(20, '部门名称最多20个字符'),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptOptions,
        class: 'w-full',
        labelField: 'label',
        valueField: 'value',
        childrenField: 'children',
        placeholder: '请选择上级部门',
      },
      fieldName: 'parentId',
      label: '上级部门',
    },
    {
      component: 'Input',
      componentProps: {
        class: 'w-full',
        placeholder: '请输入负责人姓名',
      },
      fieldName: 'manager',
      label: '负责人',
      rules: z.string().max(50, '负责人名称最多50个字符').optional(),
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
        class: 'w-full',
      },
      defaultValue: 0,
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 200,
        rows: 3,
        showCount: true,
        class: 'w-full',
        placeholder: '请输入部门描述',
      },
      fieldName: 'description',
      label: '描述',
      rules: z.string().max(200, '描述最多200个字符').optional(),
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemDeptApi.SystemDept>,
): VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] {
  return [
    {
      align: 'left',
      field: 'deptName',
      fixed: 'left',
      title: '部门名称',
      treeNode: true,
      minWidth: 200,
      slots: { default: 'deptName' }, // 使用自定义插槽
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '已启用', value: 0, color: 'success' },
          { label: '已禁用', value: 1, color: 'error' },
        ],
      },
      field: 'status',
      title: '状态',
      width: 100,
      align: 'center',
    },
    {
      field: 'manager',
      title: '负责人',
      width: 120,
      formatter: ({ row }: { row: SystemDeptApi.SystemDept }) => {
        return row.manager || '--';
      },
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      field: 'description',
      title: '描述',
      minWidth: 150,
      formatter: ({ row }: { row: SystemDeptApi.SystemDept }) => {
        return row.description || '--';
      },
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'deptName',
          nameTitle: '部门',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemDeptApi.SystemDept) => {
              return !!(row.children && row.children.length > 0);
            },
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 200,
    },
  ];
}
