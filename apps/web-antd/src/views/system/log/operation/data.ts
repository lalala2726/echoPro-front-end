import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridPropTypes } from '@vben/plugins/vxe-table';

import type { OnActionClickParams } from '#/adapter/vxe-table';
import type { SystemOperationLogApi } from '#/api/system/log/operation';

/**
 * 获取搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'userName',
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
          { label: '未知', value: 2 },
        ],
        placeholder: '请选择操作状态',
      },
      fieldName: 'operationStatus',
      label: '操作状态',
    },
    {
      component: 'Input',
      fieldName: 'module',
      label: '操作模块',
      componentProps: {
        placeholder: '请输入操作模块',
      },
    },
    {
      component: 'Input',
      fieldName: 'operationType',
      label: '操作类型',
      componentProps: {
        placeholder: '请输入操作类型',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '操作时间',
    },
  ];
}

/**
 * 获取表格列配置
 */
export function useColumns(
  onActionClick?: (
    params: OnActionClickParams<SystemOperationLogApi.SysOperationLogListVo>,
  ) => void,
): VxeGridPropTypes.Columns<SystemOperationLogApi.SysOperationLogListVo> {
  return [
    {
      title: '操作ID',
      align: 'left',
      type: 'checkbox',
    },
    {
      field: 'userName',
      title: '用户名',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'module',
      title: '操作模块',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'operationType',
      title: '操作类型',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '成功', value: 0 },
          { color: 'error', label: '失败', value: 1 },
          { color: 'warning', label: '未知', value: 2 },
        ],
      },
      field: 'operationStatus',
      title: '操作状态',
    },
    {
      field: 'requestMethod',
      title: '请求方式',
      width: 100,
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'operationIp',
      title: '操作IP',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'operationRegion',
      title: '操作地区',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'costTime',
      title: '耗时(ms)',
      formatter: ({ cellValue }) =>
        cellValue === undefined ? '--' : `${cellValue}ms`,
    },
    {
      field: 'createTime',
      title: '操作时间',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'userName',
          nameTitle: '操作日志',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'detail',
            text: '详情',
          },
          'delete', // 使用默认删除按钮，自带确认对话框
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 100,
    },
  ];
}
