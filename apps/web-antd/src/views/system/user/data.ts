import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

// todo 角色分配,岗位分配
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
      componentProps: { type: 'password' },
      dependencies: {
        triggerFields: ['userId'],
        show: (values) => !values.userId, // 只在新增时显示密码字段
      },
      rules: 'required',
    },
    {
      component: 'TreeSelect',
      fieldName: 'deptId',
      label: '所属部门',
      rules: 'required',
      componentProps: {
        placeholder: '请选择部门',
        allowClear: true,
        showSearch: true,
        treeNodeFilterProp: 'title',
        class: 'w-full',
        fieldNames: {
          label: 'label',
          value: 'value',
          children: 'children',
        },
      },
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
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
      rules: 'phone',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
      rules: 'email',
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

export function useColumns<T = SystemUserApi.SysUser>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    { title: '序号', type: 'seq', width: 50 },
    {
      align: 'left',
      title: '用户名',
      type: 'checkbox',
      width: 120,
      fixed: 'left',
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
          'edit', // 默认的编辑按钮
          'delete', // 默认的删除按钮
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 160,
    },
  ];
}
