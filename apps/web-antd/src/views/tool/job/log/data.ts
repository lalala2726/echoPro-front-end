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
      title: '日志ID',
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
      field: 'invokeTarget',
      title: '调用目标',
      showOverflow: 'tooltip',
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
  ];
}
