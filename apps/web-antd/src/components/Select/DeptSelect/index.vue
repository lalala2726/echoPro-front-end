<script setup lang="ts">
import type { SystemDept } from '#/api/system/dept/types';

import { computed, onMounted, ref } from 'vue';

import { Button, Empty, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptList } from '#/api/system/dept/dept';

import { deptColumns, deptStatusMap, useDeptSelectFormSchema } from './data';

interface Props {
  /** 是否多选 */
  multiple?: boolean;
  /** 最大选择数量 */
  maxCount?: number;
  /** 已选择的部门ID数组（字符串 ID，与后端保持一致） */
  modelValue?: string[];
  /** 占位符文本 */
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
  (e: 'change', depts: SystemDept[]): void;
  (e: 'confirm', data: { deptIds: string[]; depts: SystemDept[] }): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxCount: 1000,
  modelValue: () => [],
  placeholder: '请选择部门',
});

const emit = defineEmits<Emits>();

// 选中的部门数据（跨展开层级累积）
const selectedDepts = ref<SystemDept[]>([]);

// VxeGrid配置（树形结构，不分页）
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDeptSelectFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      labelField: 'deptName',
      highlight: true,
    },
    columns: deptColumns,
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params: any, formValues: any) => {
          return await getDeptList(formValues);
        },
      },
    },
    rowConfig: { keyField: 'deptId' },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: false,
    },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'deptId',
      transform: true,
    },
  },
  gridEvents: {
    checkboxChange: () => {
      syncSelectionAfterToggle();
    },
    checkboxAll: ({ checked }: { checked: boolean }) => {
      try {
        const allData = gridApi.grid.getTableData().fullData as SystemDept[];
        if (checked) {
          const next = allData;
          const max = props.maxCount ?? 1000;
          if (!props.multiple && next.length > 1) {
            message.warning('只能选择一个部门');
            gridApi.grid.clearCheckboxRow();
            const keep = allData.slice(0, 1);
            if (keep.length > 0) gridApi.grid.setCheckboxRow(keep, true);
            selectedDepts.value = keep;
          } else if (next.length > max) {
            message.warning(`全选超出限制，最多 ${max} 个`);
            gridApi.grid.clearCheckboxRow();
            const keep = allData.slice(0, max);
            if (keep.length > 0) gridApi.grid.setCheckboxRow(keep, true);
            selectedDepts.value = keep;
          } else {
            selectedDepts.value = next;
          }
        } else {
          selectedDepts.value = [];
        }
        const ids = selectedDepts.value
          .map((r) => r.deptId)
          .filter(
            (id): id is string => id !== undefined && id !== null,
          ) as string[];
        emit('update:modelValue', ids);
      } catch (error) {
        console.error('处理部门全选变化失败:', error);
      }
    },
  },
});

function syncSelectionAfterToggle() {
  try {
    const currentSelected = gridApi.grid.getCheckboxRecords() as SystemDept[];
    // 树形不分页：直接限制与单选处理
    let next = currentSelected;
    if (!props.multiple && next.length > 1) {
      message.warning('只能选择一个部门');
      next = currentSelected.slice(-1);
      gridApi.grid.clearCheckboxRow();
      if (next.length > 0) gridApi.grid.setCheckboxRow(next, true);
    }

    const max = props.maxCount ?? 1000;
    if (next.length > max) {
      message.warning(`最多只能选择 ${max} 个部门`);
      return;
    }

    selectedDepts.value = next;
    const ids = next
      .map((r) => r.deptId)
      .filter(
        (id): id is string => id !== undefined && id !== null,
      ) as string[];
    emit('update:modelValue', ids);
  } catch (error) {
    console.error('处理部门勾选变化失败:', error);
  }
}

// 确认选择
async function handleConfirm() {
  const selectedRows = gridApi.grid.getCheckboxRecords() as SystemDept[];

  if (!props.multiple && selectedRows.length > 1) {
    message.warning('只能选择一个部门');
    return false;
  }

  if (selectedRows.length > props.maxCount) {
    message.warning(`最多只能选择 ${props.maxCount} 个部门`);
    return false;
  }

  if (selectedRows.length === 0) {
    message.warning('请至少选择一个部门');
    return false;
  }

  const deptIds = selectedRows
    .map((row) => row.deptId)
    .filter((id): id is string => id !== undefined && id !== null) as string[];
  selectedDepts.value = selectedRows;

  emit('update:modelValue', deptIds);
  emit('change', selectedRows);
  emit('confirm', { deptIds, depts: selectedRows });

  message.success(`已成功选择 ${selectedRows.length} 个部门`);
  return true;
}

// 取消选择
function handleCancel() {
  emit('cancel');
}

// 清空选择
function clearSelection() {
  selectedDepts.value = [];
  try {
    gridApi.grid.clearCheckboxRow();
  } catch (error) {
    console.error('清空复选框状态失败:', error);
  }
  emit('update:modelValue', []);
}

// 移除单个部门
function removeDept(dept: SystemDept) {
  if (dept.deptId !== undefined && dept.deptId !== null) {
    selectedDepts.value = selectedDepts.value.filter(
      (r) => r.deptId !== dept.deptId,
    );
    try {
      gridApi.grid.setCheckboxRow(dept, false);
    } catch {}
    const deptIds = selectedDepts.value
      .map((u) => u.deptId)
      .filter(
        (id): id is string => id !== undefined && id !== null,
      ) as string[];
    emit('update:modelValue', deptIds);
  }
}

onMounted(() => {
  gridApi.query();
});

// 选择操作按钮：与勾选行为一致
function selectRow(row: SystemDept) {
  try {
    const isChecked = (gridApi.grid.getCheckboxRecords() as SystemDept[]).some(
      (r) => r.deptId === row.deptId,
    );
    gridApi.grid.setCheckboxRow(row, !isChecked);
    // 手动同步右侧已选与 v-model
    syncSelectionAfterToggle();
  } catch (error) {
    console.error('操作失败:', error);
  }
}

defineExpose({
  clearSelection,
});

const selectedCount = computed(() => selectedDepts.value.length);
</script>

<template>
  <div class="dept-select-interface h-full">
    <div class="flex h-full min-h-0 gap-6">
      <!-- 左侧面板 - 部门树表格 -->
      <div
        class="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="rounded-t-lg border-b border-gray-100 bg-gray-50/50 px-6 py-5"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-xl font-semibold text-gray-900">部门树</div>
              <div
                class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600"
              >
                选择需要的部门
              </div>
            </div>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <span>勾选左侧树形部门进行选择</span>
            </div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-hidden p-1">
          <Grid class="h-full">
            <template #status="{ row }">
              <Tag
                :color="
                  deptStatusMap[Number(row.status) ?? 0]?.color || 'default'
                "
              >
                {{ deptStatusMap[Number(row.status) ?? 0]?.text || '未知' }}
              </Tag>
            </template>
            <template #action="slotProps">
              <Button
                type="link"
                size="small"
                @click="() => selectRow((slotProps as any).row)"
              >
                选择
              </Button>
            </template>
          </Grid>
        </div>
      </div>

      <!-- 右侧面板 - 已选择部门展示 -->
      <div
        class="flex min-h-0 w-96 flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="rounded-t-lg border-b border-gray-100 bg-gray-50/50 px-6 py-5"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-3">
                <div class="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                <span class="text-lg font-semibold text-gray-900">
                  已选择部门
                </span>
                <span
                  class="rounded-full border border-gray-200 bg-white px-2 py-1 text-sm text-gray-500"
                >
                  {{ selectedCount }}/{{ props.maxCount }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button
                v-if="selectedCount > 0"
                type="link"
                size="small"
                @click="clearSelection"
                class="text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
              >
                清空全部
              </Button>
            </div>
          </div>

          <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
              :style="{
                width: `${Math.min((selectedCount / props.maxCount) * 100, 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-hidden">
          <div
            v-if="selectedCount === 0"
            class="flex h-full items-center justify-center p-8"
          >
            <Empty
              description="暂无选择部门"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
          </div>

          <div v-else class="scrollbar-thin h-full overflow-y-auto p-6">
            <div class="space-y-2">
              <div
                v-for="dept in selectedDepts"
                :key="dept.deptId"
                class="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-3 transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow"
              >
                <div class="flex items-center justify-between">
                  <div class="min-w-0 flex-1">
                    <div
                      class="mb-1 truncate text-sm font-medium text-gray-900"
                    >
                      {{ dept.deptName }}
                    </div>
                    <div class="truncate text-xs text-gray-500">
                      ID: {{ dept.deptId }}
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    class="opacity-0 transition-opacity group-hover:opacity-100"
                    @click="removeDept(dept)"
                  >
                    移除
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div
      class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50/50 px-6 py-4"
    >
      <Button @click="handleCancel"> 取消 </Button>
      <Button type="primary" @click="handleConfirm"> 确定选择 </Button>
    </div>
  </div>
</template>
