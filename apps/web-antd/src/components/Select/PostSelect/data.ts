import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridPropTypes } from '#/adapter/vxe-table';
import type { SystemPostType } from '#/api/system/post';

// 岗位表格列配置
export const postColumns: VxeGridPropTypes.Columns<SystemPostType.PostListVo> = [
  {
    align: 'left',
    title: '岗位名称',
    type: 'checkbox',
  },
  {
    title: '岗位编码',
    field: 'postCode',
    showOverflow: 'tooltip',
  },
  {
    title: '状态',
    field: 'status',
    align: 'center',
    slots: { default: 'status' },
  },
  {
    title: '操作',
    field: 'operation',
    align: 'center',
    slots: { default: 'action' },
  },
];

/**
 * 岗位选择组件的搜索表单配置
 */
export function usePostSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postName',
      label: '岗位名称',
      componentProps: {
        placeholder: '请输入岗位名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        placeholder: '请选择状态',
        options: [
          { label: '正常', value: 0 },
          { label: '停用', value: 1 },
        ],
      },
    },
  ];
}

// 岗位状态映射（0-正常, 1-停用）
export const postStatusMap: Record<number, { color: string; text: string }> = {
  0: { text: '正常', color: 'green' },
  1: { text: '停用', color: 'red' },
};
