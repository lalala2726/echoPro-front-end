import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DeviceList } from '#/api/system/online/types';

import { useAccess } from '@vben/access';

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择设备类型',
        options: [
          { label: '网页端', value: 'WEB' },
          { label: 'PC端', value: 'PC' },
          { label: '移动端', value: 'MOBILE' },
          { label: '微信小程序', value: 'MINI_PROGRAM' },
          { label: '未知', value: 'UNKNOWN' },
        ],
      },
      fieldName: 'deviceType',
      label: '设备类型',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入设备名称',
      },
      fieldName: 'deviceName',
      label: '设备名称',
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
      fieldName: 'location',
      label: '登录地点',
    },
    {
      component: 'RangePicker',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: ['开始时间', '结束时间'],
        showTime: { format: 'HH:mm:ss' },
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'loginTime',
      label: '登录时间',
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns<T = DeviceList>(
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
      field: 'deviceType',
      title: '设备类型',
      formatter: ({ cellValue }) => {
        const deviceTypeMap: Record<string, string> = {
          WEB: '网页端',
          PC: 'PC端',
          MOBILE: '移动端',
          MINI_PROGRAM: '微信小程序',
          UNKNOWN: '未知',
        };
        return deviceTypeMap[cellValue] || cellValue || '--';
      },
    },
    {
      field: 'deviceName',
      title: '设备名称',
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
      field: 'loginTime',
      title: '登录时间',
    },
    {
      field: 'refreshTokenId',
      title: '会话ID',
      showOverflow: 'tooltip',
    },
    {
      align: 'center',
      fixed: 'right',
      title: '操作',
      width: 120,
      cellRender: {
        name: 'CellOperation',
        options: [
          {
            code: 'delete',
            text: '退出设备',
            danger: true,
            visible: () => hasAccessByCodes(['system:device:delete']),
          },
        ],
        attrs: {
          onClick: _onActionClick,
        },
      },
    },
  ];
}
