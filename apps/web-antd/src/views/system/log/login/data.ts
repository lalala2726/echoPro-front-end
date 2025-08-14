import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridPropTypes } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SysLoginLogListVo } from '#/api/system/log/types';

import { useAccess } from '@vben/access';

/**
 * 获取搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '用户名',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '成功', value: 0 },
          { label: '失败', value: 1 },
        ],
        placeholder: '请选择登录状态',
      },
      fieldName: 'status',
      label: '登录状态',
    },
    {
      component: 'Input',
      fieldName: 'ip',
      label: 'IP地址',
      componentProps: {
        placeholder: '请输入IP地址',
      },
    },
    {
      component: 'Input',
      fieldName: 'region',
      label: '登录地区',
      componentProps: {
        placeholder: '请输入登录地区',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'loginTime',
      label: '登录时间',
    },
  ];
}

/**
 * 获取表格列配置
 */
export function useColumns(
  onActionClick?: (params: OnActionClickParams<SysLoginLogListVo>) => void,
): VxeGridPropTypes.Columns<SysLoginLogListVo> {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      title: '登录ID',
      align: 'left',
      type: 'checkbox',
    },
    {
      field: 'username',
      title: '用户名',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '成功', value: 0 },
          { color: 'error', label: '失败', value: 1 },
        ],
      },
      field: 'status',
      title: '登录状态',
    },
    {
      field: 'ip',
      title: 'IP地址',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'region',
      title: '登录地区',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'browser',
      title: '浏览器',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'os',
      title: '操作系统',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'loginTime',
      title: '登录时间',
      width: 150,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: '登录日志',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'detail',
            text: '详情',
            visible: () => hasAccessByCodes(['system:log-login:query']),
          },
          {
            code: 'delete',
            text: '删除',
            danger: true,
            visible: () => hasAccessByCodes(['system:log-login:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 100,
    },
  ];
}
