import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

/**
 * 部门选择组件的搜索表单配置
 */
export function useDeptSelectFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'deptName',
      label: '部门名称',
      componentProps: {
        placeholder: '请输入部门名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'manager',
      label: '负责人',
      componentProps: {
        placeholder: '请输入负责人',
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
          { label: '已启用', value: '0' },
          { label: '已禁用', value: '1' },
        ],
      },
    },
  ];
}

/**
 * 获取部门选择表格列配置
 */
export function useDeptSelectColumns(
  multiple: boolean = true,
): VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] {
  return [
    // 选择列（仅容纳勾选控件，标题显示“选择”）
    multiple
      ? {
          type: 'checkbox',
          width: 42,
          title: '选择',
          align: 'center',
          fixed: 'left',
        }
      : {
          type: 'radio',
          width: 42,
          title: '选择',
          align: 'center',
          fixed: 'left',
        },
    // 部门名称列（树形节点）
    {
      align: 'left',
      field: 'deptName',
      fixed: 'left',
      title: '部门名称',
      treeNode: true,
      slots: { default: 'deptName' },
    },
    // 状态列
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '已启用', value: 0, color: 'success' },
          { label: '已启用', value: '0', color: 'success' },
          { label: '已禁用', value: 1, color: 'error' },
          { label: '已禁用', value: '1', color: 'error' },
        ],
      },
      field: 'status',
      title: '状态',
      align: 'center',
    },
    // 负责人列
    {
      field: 'manager',
      title: '负责人',
      formatter: ({ row }: { row: SystemDeptApi.SystemDept }) => {
        return row.manager || '--';
      },
    },
    // 描述列
    {
      field: 'description',
      title: '描述',
      formatter: ({ row }: { row: SystemDeptApi.SystemDept }) => {
        return row.description || '--';
      },
    },
  ];
}

/**
 * 获取部门图标
 */
export function getDeptIcon(parentId: string) {
  if (parentId === '0') {
    return 'carbon:enterprise'; // 总公司
  }
  return 'carbon:building'; // 分部/分店
}

/**
 * 获取部门图标颜色
 */
export function getDeptIconColor(parentId: string) {
  if (parentId === '0') {
    return 'text-blue-600'; // 总公司用蓝色
  }
  return 'text-green-600'; // 分部/分店用绿色
}

/**
 * 扁平化树形数据，用于搜索和选择处理
 */
export function flattenDeptTree(tree: any): SystemDeptApi.SystemDept[] {
  const result: SystemDeptApi.SystemDept[] = [];

  const traverse = (nodes: SystemDeptApi.SystemDept[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(tree);
  return result;
}
