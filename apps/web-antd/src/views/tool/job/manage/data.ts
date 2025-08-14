import type { VxeGridPropTypes } from '#/adapter/vxe-table';
import type { SysJobListVo } from '#/api/tool/job/manage/types';

import { useAccess } from '@vben/access';

/**
 * 表格列配置
 */
export function useColumns(
  _onActionClick: (params: { code: string; row: SysJobListVo }) => void,
  _onStatusChange?: (newStatus: number, row: SysJobListVo) => Promise<boolean>,
): VxeGridPropTypes.Columns<SysJobListVo> {
  const { hasAccessByCodes } = useAccess();
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
      cellRender: {
        name: 'CellOperation',
        options: [
          {
            code: 'pause',
            text: '暂停',
            visible: (row: SysJobListVo) =>
              row.status === 0 && hasAccessByCodes(['tool:job:pause']),
          },
          {
            code: 'resume',
            text: '恢复任务',
            visible: (row: SysJobListVo) =>
              row.status === 1 && hasAccessByCodes(['tool:job:resume']),
          },
          {
            code: 'run',
            text: '执行',
            visible: () => hasAccessByCodes(['tool:job:run']),
          },
          {
            code: 'edit',
            text: '编辑',
            visible: () => hasAccessByCodes(['tool:job:update']),
          },
          {
            code: 'log',
            text: '日志',
            visible: () => hasAccessByCodes(['tool:job:query']),
          },
          {
            code: 'refresh',
            text: '刷新',
            visible: () => hasAccessByCodes(['tool:job:refresh']),
          },
          {
            code: 'delete',
            text: '删除',
            danger: true,
            visible: () => hasAccessByCodes(['tool:job:delete']),
          },
        ],
      },
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
