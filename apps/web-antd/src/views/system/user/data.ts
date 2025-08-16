import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserListVo } from '#/api/system/user/types';

import { z } from '#/adapter/form';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'userId',
      label: '用户ID',
      componentProps: { disabled: true },
      dependencies: {
        triggerFields: ['userId'],
        show: (values) => !!values.userId,
      },
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      rules: 'required',
      componentProps: (values) => ({
        disabled: !!values?.userId,
      }),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: '昵称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: '密码',
      componentProps: { type: 'password', autocomplete: 'current-password' },
      dependencies: {
        triggerFields: ['userId'],
        show: (values) => !values.userId, // 只在新增时显示密码字段
      },
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'deptId',
      label: '所属部门',
      componentProps: {
        placeholder: '请选择部门',
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        options: [],
      },
    },
    {
      component: 'Select',
      fieldName: 'roleIds',
      label: '角色',
      rules: 'required',
      componentProps: {
        placeholder: '请选择角色',
        mode: 'multiple',
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        options: [],
      },
    },
    {
      component: 'Select',
      fieldName: 'postId',
      label: '岗位',
      componentProps: {
        placeholder: '请选择岗位',
        allowClear: true,
        showSearch: true,
        class: 'w-full',
        options: [],
      },
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
      rules: z
        .string()
        .regex(/^[0-9\-+()\s]{6,20}$/, '请输入有效的手机号')
        .optional()
        .or(z.string().min(1, '请输入手机号')),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: z
        .string()
        .email('请输入有效的邮箱')
        .optional()
        .or(z.string().min(1, '请输入邮箱')),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '男', value: 0 },
          { label: '女', value: 1 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'gender',
      label: '性别',
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
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: '昵称',
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
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
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
    },
  ];
}

export function useColumns<T = UserListVo>(
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'left',
      title: '用户名',
      type: 'checkbox',
      width: 120,
      fixed: 'left',
    },
    {
      field: 'avatar',
      cellRender: {
        name: 'CellImage',
        props: {
          circle: true,
          width: 36,
          height: 36,
        },
      },
      title: '头像',
      width: 100,
    },
    {
      field: 'nickname',
      title: '昵称',
      width: 120,
    },
    {
      field: 'deptName',
      title: '所属部门',
      width: 150,
      formatter: ({ row }) => {
        // 尝试多种可能的部门名称字段
        return (
          row.sysDept?.deptName || row.deptName || row.dept?.deptName || '--'
        );
      },
    },
    {
      field: 'postName',
      title: '岗位',
      width: 120,
      formatter: ({ row }) => {
        // 显示岗位名称，如果没有则显示 '--'
        return row.postName || '--';
      },
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'blue', label: '男', value: 0 },
          { color: 'pink', label: '女', value: 1 },
        ],
      },
      field: 'gender',
      title: '性别',
      width: 120,
    },
    {
      field: 'phone',
      title: '手机号',
      width: 130,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'email',
      title: '邮箱',
      minWidth: 120,
      formatter: ({ cellValue }) => cellValue || '--',
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
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 200,
      slots: { default: 'action' },
    },
  ];
}
