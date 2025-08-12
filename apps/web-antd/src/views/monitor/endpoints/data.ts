import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridPropTypes } from '@vben/plugins/vxe-table';

import type { MonitorEndpointType } from '#/api/monitor/types/endpoints';
/**
 * 获取搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'endpoint',
      label: '端点路径',
      componentProps: {
        placeholder: '请输入端点路径',
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
        placeholder: '请选择HTTP方法',
      },
      fieldName: 'method',
      label: 'HTTP方法',
    },
    {
      component: 'Input',
      fieldName: 'uri',
      label: 'URI路径',
      componentProps: {
        placeholder: '请输入URI路径',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'minRequestCount',
      label: '最小请求数',
      componentProps: {
        placeholder: '请输入最小请求数',
        min: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'maxAverageResponseTime',
      label: '最大平均响应',
      componentProps: {
        placeholder: '请输入最大平均响应时间',
        min: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'minSuccessRate',
      label: '最小成功率(%)',
      componentProps: {
        placeholder: '请输入最小成功率',
        min: 0,
        max: 100,
      },
    },
  ];
}



/**
 * 获取表格列配置
 */
export function useColumns(): VxeGridPropTypes.Columns<MonitorEndpointType.EndpointStatsDTO> {
  return [
    {
      field: 'endpoint',
      title: '端点路径',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: 'GET', value: 'GET' },
          { color: 'processing', label: 'POST', value: 'POST' },
          { color: 'warning', label: 'PUT', value: 'PUT' },
          { color: 'error', label: 'DELETE', value: 'DELETE' },
          { color: 'default', label: 'PATCH', value: 'PATCH' },
        ],
      },
      field: 'method',
      title: 'HTTP方法',
    },
    {
      field: 'uri',
      title: 'URI路径',
      formatter: ({ cellValue }) => cellValue || '--',
    },
    {
      field: 'requestCount',
      title: '请求总数',
      formatter: ({ cellValue }) => cellValue?.toLocaleString() || '0',
    },
    {
      field: 'averageResponseTime',
      title: '平均响应时间(ms)',
      formatter: ({ cellValue }) => (cellValue ? `${cellValue}ms` : '--'),
    },
    {
      field: 'maxResponseTime',
      title: '最大响应时间(ms)',
      formatter: ({ cellValue }) => (cellValue ? `${cellValue}ms` : '--'),
    },
    {
      field: 'successRate',
      title: '成功率',
      formatter: ({ cellValue }) => (cellValue ? `${cellValue}%` : '--'),
    },
    {
      field: 'qps',
      title: 'QPS',
      formatter: ({ cellValue }) => cellValue || '0',
    },
  ];
}
