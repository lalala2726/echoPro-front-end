import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SysUserType } from '#/api/system/user';

import { useAccess } from '@vben/access';

import { z } from '#/adapter/form';

const { hasAccessByCodes } = useAccess();
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
      rules: 'required',
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
        .min(1, '请输入手机号')
        .regex(/^[0-9\-+()\s]{6,20}$/, '请输入有效的手机号'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '男', value: 1 },
          { label: '女', value: 2 },
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

export function useColumns<T = SysUserType.SysUser>(
  onActionClick: OnActionClickFn<T>,
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
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'blue', label: '男', value: 1 },
          { color: 'pink', label: '女', value: 2 },
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
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: '用户',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '编辑',
            show: () => hasAccessByCodes(['system:user:edit']),
          },
          {
            code: 'delete',
            text: '删除',
            // 添加权限码检查
            show: () => hasAccessByCodes(['system:user:delete']),
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
