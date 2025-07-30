import type { VxeGridPropTypes } from '#/adapter/vxe-table';
import type { JobLogType } from '#/api/tool/job/type/logType';

/**
 * 表格列配置
 */
export function useColumns(
  _onActionClick: (params: {
    code: string;
    row: JobLogType.SysJobLogListVo;
  }) => void,
): VxeGridPropTypes.Columns<JobLogType.SysJobLogListVo> {
  return [
    {
      title: '任务ID',
      type: 'checkbox',
      align: 'left',
    },
    {
      field: 'jobId',
      title: '任务ID',
    },
    {
      field: 'jobName',
      title: '任务名称',
    },
    {
      field: 'jobGroup',
      title: '任务组名',
    },
    {
      field: 'invokeTarget',
      title: '调用目标',
      showOverflow: 'tooltip',
    },
    {
      field: 'scheduleType',
      title: '调度策略',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'blue', label: 'Cron', value: 0 },
          { color: 'green', label: '固定频率', value: 1 },
          { color: 'orange', label: '固定延迟', value: 2 },
          { color: 'purple', label: '一次性', value: 3 },
        ],
      },
    },
    {
      field: 'status',
      title: '执行状态',
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: '成功', value: 0 },
          { color: 'error', label: '失败', value: 1 },
        ],
      },
    },
    {
      field: 'description',
      title: '任务描述',
      showOverflow: 'tooltip',
    },
    {
      field: 'previousFireTime',
      title: '上次执行时间',
      formatter: ({ cellValue }) => {
        return cellValue ? new Date(cellValue).toLocaleString() : '-';
      },
    },
    {
      field: 'nextFireTime',
      title: '下次执行时间',
      formatter: ({ cellValue }) => {
        return cellValue ? new Date(cellValue).toLocaleString() : '-';
      },
    },
    {
      title: '操作',
      fixed: 'right',
      slots: { default: 'action' },
    },
  ];
}

/**
 * 搜索表单配置
 */
export function useGridFormSchema() {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入任务名称',
      },
      fieldName: 'jobName',
      label: '任务名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入任务组名',
      },
      fieldName: 'jobGroup',
      label: '任务组名',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '成功', value: 0 },
          { label: '失败', value: 1 },
        ],
        placeholder: '请选择执行状态',
      },
      fieldName: 'status',
      label: '执行状态',
    },
    {
      component: 'RangePicker',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        showTime: true,
      },
      fieldName: 'startTime',
      label: '执行时间',
    },
  ];
}
