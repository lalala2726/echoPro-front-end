import type { VxeGridPropTypes } from '#/adapter/vxe-table';
import type { JobManageType } from '#/api/tool/job/type/manageType';

/**
 * 表格列配置
 */
export function useColumns(
  _onActionClick: (params: {
    code: string;
    row: JobManageType.SysJobListVo;
  }) => void,
  _onStatusChange?: (
    newStatus: number,
    row: JobManageType.SysJobListVo,
  ) => Promise<boolean>,
): VxeGridPropTypes.Columns<JobManageType.SysJobListVo> {
  return [
    {
      title: '任务ID',
      type: 'checkbox',
      align: 'left',
    },
    {
      field: 'jobName',
      title: '任务名称',
    },
    {
      field: 'invokeTarget',
      title: '调用目标',
      showOverflow: 'tooltip',
    },
    {
      field: 'scheduleType',
      title: '调度策略',
      slots: { default: 'scheduleType' },
    },
    {
      field: 'status',
      title: '任务状态',
      slots: { default: 'status' },
    },
    {
      field: 'description',
      title: '任务描述',
      showOverflow: 'tooltip',
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
      field: 'previousFireTime',
      title: '上次执行时间',
      formatter: ({ cellValue }) => {
        return cellValue ? new Date(cellValue).toLocaleString() : '-';
      },
    },
    {
      title: '操作',
      fixed: 'right',
      slots: { default: 'action' },
      width: 200,
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
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '正常', value: 0 },
          { label: '暂停', value: 1 },
        ],
        placeholder: '请选择任务状态',
      },
      fieldName: 'status',
      label: '任务状态',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'Cron表达式', value: 0 },
          { label: '固定频率', value: 1 },
          { label: '固定延迟', value: 2 },
          { label: '一次性执行', value: 3 },
        ],
        placeholder: '请选择调度策略',
      },
      fieldName: 'scheduleType',
      label: '调度策略',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入调用目标',
      },
      fieldName: 'invokeTarget',
      label: '调用目标',
    },
  ];
}

/**
 * 获取状态标签配置
 */
export function getStatusTag(status: number) {
  const statusMap: Record<number, { color: string; text: string }> = {
    0: { color: 'success', text: '正常' },
    1: { color: 'warning', text: '暂停' },
  };
  return statusMap[status] || { color: 'default', text: '未知' };
}

/**
 * 获取调度策略标签配置
 */
export function getScheduleTypeTag(scheduleType: number) {
  const typeMap: Record<number, { color: string; text: string }> = {
    0: { color: 'blue', text: 'Cron' },
    1: { color: 'green', text: '固定频率' },
    2: { color: 'orange', text: '固定延迟' },
    3: { color: 'purple', text: '一次性' },
  };
  return typeMap[scheduleType] || { color: 'default', text: '未知' };
}
