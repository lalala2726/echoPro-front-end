import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu';

export function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: '目录',
      value: 'catalog',
    },
    { color: 'default', label: '菜单', value: 'menu' },
    { color: 'error', label: '按钮', value: 'button' },
    {
      color: 'success',
      label: '内嵌',
      value: 'embedded',
    },
    { color: 'warning', label: '外链', value: 'link' },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<SystemMenuApi.SystemMenuList>,
): VxeTableGridOptions<SystemMenuApi.SystemMenuList>['columns'] {
  return [
    {
      align: 'left',
      field: 'title',
      fixed: 'left',
      slots: { default: 'title' },
      title: '标题',
      treeNode: true,
      width: 250,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getMenuTypeOptions() },
      field: 'type',
      title: '类型',
      width: 100,
    },
    {
      field: 'permission',
      title: '权限标识',
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: '路由地址',
      width: 200,
    },

    {
      align: 'left',
      field: 'component',
      formatter: ({ row }) => {
        switch (row.type) {
          case 'catalog':
          case 'menu': {
            return row.component ?? '';
          }
          case 'embedded': {
            return row.meta?.iframeSrc ?? '';
          }
          case 'link': {
            return row.meta?.link ?? '';
          }
        }
        return '';
      },
      minWidth: 200,
      title: '页面组件',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '正常', value: '0', color: 'success' },
          { label: '已禁用', value: '1', color: 'error' },
        ],
      },
      field: 'status',
      title: '状态',
      width: 100,
    },

    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          'delete', // 默认的删除按钮
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
