import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SessionListVo } from '#/api/system/online/types';

import { useAccess } from '@vben/access';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名',
      },
      fieldName: 'username',
      label: '用户名',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入会话ID',
      },
      fieldName: 'accessTokenId',
      label: '会话ID',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入登录IP',
      },
      fieldName: 'ip',
      label: '登录IP',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入登录地点',
      },
      fieldName: 'region',
      label: '登录地点',
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns<T = SessionListVo>(
  _onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      field: 'userId',
      title: '用户ID',
    },
    {
      field: 'username',
      title: '用户名',
    },
    {
      field: 'accessTokenId',
      title: '会话ID',
      showOverflow: 'tooltip',
    },
    {
      field: 'deptId',
      title: '部门ID',
    },
    {
      field: 'ip',
      title: '登录IP',
    },
    {
      field: 'location',
      title: '登录地点',
    },
    {
      field: 'accessTime',
      title: '最近访问时间',
      formatter: ({ cellValue }) => {
        if (cellValue) {
          return new Date(cellValue).toLocaleString();
        }
        return '-';
      },
    },
    {
      fixed: 'right',
      title: '操作',
      width: 120,
      cellRender: {
        name: 'CellOperation',
        options: [
          {
            code: 'detail',
            text: '详情',
            visible: () => hasAccessByCodes(['system:online-session:query']),
          },
          {
            code: 'delete',
            text: '下线',
            danger: true,
            visible: () => hasAccessByCodes(['system:online-session:delete']),
          },
        ],
        attrs: {
          onClick: _onActionClick,
        },
      },
    },
  ];
}
