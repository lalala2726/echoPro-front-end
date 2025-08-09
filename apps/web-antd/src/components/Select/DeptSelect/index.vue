<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, nextTick, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Empty, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptList } from '#/api/system/dept';

import {
  flattenDeptTree,
  getDeptIcon,
  getDeptIconColor,
  useDeptSelectColumns,
  useDeptSelectFormSchema,
} from './data';

interface Props {
  /** 是否多选 */
  multiple?: boolean;
  /** 最大选择数量 */
  maxCount?: number;
  /** 已选择的部门ID数组 */
  modelValue?: string[];
  /** 占位符文本 */
  placeholder?: string;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 是否可清空 */
  allowClear?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
  (e: 'change', depts: SystemDeptApi.SystemDept[]): void;
  (
    e: 'confirm',
    data: { deptIds: string[]; depts: SystemDeptApi.SystemDept[] },
  ): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxCount: 1000,
  modelValue: () => [],
  placeholder: '请选择部门',
  showSearch: true,
  allowClear: true,
});

const emit = defineEmits<Emits>();

// 选中的部门数据
const selectedDepts = ref<SystemDeptApi.SystemDept[]>([]);
const allDeptData = ref<SystemDeptApi.SystemDept[]>([]);

// 事件监听器管理（改用 gridEvents，不再手动 on/off）

// VxeGrid 配置
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: props.showSearch
    ? {
        schema: useDeptSelectFormSchema(),
        submitOnChange: true,
      }
    : undefined,
  gridOptions: {
    columns: useDeptSelectColumns(props.multiple),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params: any, formValues: any) => {
          const result = await getDeptList(formValues);
          // 保存所有部门数据用于选择处理
          if (result) {
            allDeptData.value = flattenDeptTree(result);
          }
          return result;
        },
      },
    },
    rowConfig: {
      keyField: 'deptId',
    },
    // 仅显示选择控件，不在选择控件旁显示文字
    checkboxConfig: props.multiple
      ? {
          highlight: true,
          checkStrictly: true, // 严格模式，父子节点不关联
        }
      : undefined,
    radioConfig: props.multiple
      ? undefined
      : {
          highlight: true,
        },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: false,
      zoom: false,
    },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'deptId',
      transform: true,
    },
  } as VxeTableGridOptions,
  gridEvents: {
    checkboxChange: handleSelectionChange,
    checkboxAll: handleSelectionChange,
    radioChange: handleSelectionChange,
  },
});

// 处理选择变化
function handleSelectionChange() {
  try {
    if (!gridApi.grid) {
      console.warn('Grid not initialized yet');
      return;
    }

    let selectedRows: SystemDeptApi.SystemDept[] = [];
    if (props.multiple) {
      selectedRows = gridApi.grid.getCheckboxRecords() || [];
    } else {
      const radioRecord = gridApi.grid.getRadioRecord();
      selectedRows = radioRecord ? [radioRecord] : [];
    }

    const deptIds = selectedRows.map((row) => row.deptId);

    // 检查数量限制
    if (props.multiple && deptIds.length > props.maxCount) {
      message.warning(`最多只能选择 ${props.maxCount} 个部门`);
      return;
    }

    selectedDepts.value = selectedRows;
    emit('update:modelValue', deptIds);
    emit('change', selectedRows);
  } catch (error) {
    console.error('处理选择变化失败:', error);
  }
}

// 移除单个部门
function removeDept(dept: SystemDeptApi.SystemDept) {
  try {
    if (!gridApi.grid) {
      console.warn('Grid not initialized');
      return;
    }

    if (props.multiple) {
      gridApi.grid.setCheckboxRow(dept, false);
    } else {
      gridApi.grid.clearRadioRow();
    }
    handleSelectionChange();
  } catch (error) {
    console.error('移除部门失败:', error);
  }
}

// 清空所有选择
function clearSelection() {
  try {
    if (gridApi.grid) {
      if (props.multiple) {
        gridApi.grid.clearCheckboxRow();
      } else {
        gridApi.grid.clearRadioRow();
      }
    }
    selectedDepts.value = [];
    emit('update:modelValue', []);
    emit('change', []);
  } catch (error) {
    console.error('清空选择失败:', error);
  }
}

// 确认选择
function confirmSelection() {
  const deptIds = selectedDepts.value.map((dept) => dept.deptId);
  emit('confirm', { deptIds, depts: selectedDepts.value });
}

// 取消选择
function cancelSelection() {
  emit('cancel');
}

// 展开全部
function expandAll() {
  try {
    if (gridApi.grid) {
      gridApi.grid.setAllTreeExpand(true);
    }
  } catch (error) {
    console.error('展开全部失败:', error);
  }
}

// 折叠全部
function collapseAll() {
  try {
    if (gridApi.grid) {
      gridApi.grid.setAllTreeExpand(false);
    }
  } catch (error) {
    console.error('折叠全部失败:', error);
  }
}

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  async (newValue) => {
    try {
      if (newValue && newValue.length > 0 && allDeptData.value.length > 0) {
        const selectedRows = allDeptData.value.filter((dept) =>
          newValue.includes(dept.deptId),
        );
        selectedDepts.value = selectedRows;

        // 等待grid初始化完成
        if (gridApi.grid) {
          await nextTick();

          // 设置表格选中状态
          if (props.multiple) {
            gridApi.grid.setCheckboxRow(selectedRows, true);
          } else if (selectedRows.length > 0) {
            gridApi.grid.setRadioRow(selectedRows[0]);
          }
        }
      } else {
        selectedDepts.value = [];
        if (gridApi.grid) {
          // 清空选择状态
          if (props.multiple) {
            gridApi.grid.clearCheckboxRow();
          } else {
            gridApi.grid.clearRadioRow();
          }
        }
      }
    } catch (error) {
      console.error('更新选中状态失败:', error);
    }
  },
  { immediate: true },
);

// grid 事件已通过 gridEvents 挂载，无需 on/off

// 暴露方法
defineExpose({
  clearSelection,
  confirmSelection,
  expandAll,
  collapseAll,
});

// 计算属性
const selectedCount = computed(() => selectedDepts.value.length);
computed(() => selectedCount.value >= props.maxCount);
</script>

<template>
  <!-- 部门选择界面 - 左右两列布局 -->
  <div class="dept-select-interface h-full">
    <div class="flex h-full min-h-0 gap-6">
      <!-- 左侧面板 - 部门树形表格 -->
      <div
        class="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <!-- 表格标题栏 -->
        <div
          class="rounded-t-lg border-b border-gray-100 bg-gray-50/50 px-6 py-5"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-xl font-semibold text-gray-900">选择</div>
              <div
                class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600"
              >
                {{ props.multiple ? '多选模式' : '单选模式' }}
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button type="default" size="small" @click="expandAll">
                展开全部
              </Button>
              <Button type="default" size="small" @click="collapseAll">
                折叠全部
              </Button>
            </div>
          </div>
        </div>

        <!-- VxeGrid 表格 -->
        <div class="min-h-0 flex-1 overflow-hidden">
          <Grid>
            <!-- 部门名称自定义插槽 -->
            <template #deptName="{ row }">
              <div class="flex w-full items-center gap-2 py-1">
                <div class="size-4 flex-shrink-0">
                  <IconifyIcon
                    :icon="getDeptIcon(row.parentId)"
                    class="size-full"
                    :class="getDeptIconColor(row.parentId)"
                  />
                </div>
                <div class="flex-auto">
                  <div class="font-medium text-gray-900">
                    {{ row.deptName }}
                  </div>
                </div>
              </div>
            </template>
          </Grid>
        </div>
      </div>

      <!-- 右侧面板 - 已选择部门展示 -->
      <div
        class="flex min-h-0 w-96 flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <!-- 右侧面板头部 - 状态指示器 -->
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
                  {{ selectedDepts.length }}/{{ props.maxCount }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Button
                v-if="selectedDepts.length > 0"
                type="link"
                size="small"
                @click="clearSelection"
                class="text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
              >
                <svg
                  class="mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                清空全部
              </Button>
            </div>
          </div>

          <!-- 选择进度条 -->
          <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
              :style="{
                width: `${Math.min((selectedDepts.length / props.maxCount) * 100, 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <!-- 右侧面板内容 - 已选择部门展示 -->
        <div class="min-h-0 flex-1 overflow-hidden">
          <!-- 空状态 -->
          <div
            v-if="selectedDepts.length === 0"
            class="flex h-full items-center justify-center p-8"
          >
            <div class="text-center">
              <Empty
                description="暂无选择部门"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
              >
                <template #description>
                  <span class="text-gray-500">请在左侧表格中选择部门</span>
                </template>
              </Empty>
            </div>
          </div>

          <!-- 部门卡片网格 -->
          <div
            v-else
            class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-full overflow-y-auto p-6"
            style="scroll-behavior: smooth"
          >
            <div class="grid grid-cols-1 gap-4">
              <!-- 部门卡片 -->
              <div
                v-for="dept in selectedDepts"
                :key="dept.deptId"
                class="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-md"
              >
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <!-- 部门名称 -->
                    <div class="mb-2 flex items-center space-x-2">
                      <div class="size-4 flex-shrink-0">
                        <IconifyIcon
                          :icon="getDeptIcon(dept.parentId)"
                          class="size-full"
                          :class="getDeptIconColor(dept.parentId)"
                        />
                      </div>
                      <div
                        class="truncate text-base font-semibold text-gray-900"
                      >
                        {{ dept.deptName }}
                      </div>
                    </div>

                    <!-- 部门信息 -->
                    <div class="space-y-1">
                      <div
                        v-if="dept.manager"
                        class="truncate text-sm text-gray-600"
                      >
                        <span class="text-gray-400">负责人:</span>
                        {{ dept.manager }}
                      </div>
                      <div
                        v-if="dept.description"
                        class="truncate text-sm text-gray-600"
                      >
                        <span class="text-gray-400">描述:</span>
                        {{ dept.description }}
                      </div>
                      <div class="truncate text-sm text-gray-600">
                        <span class="text-gray-400">状态:</span>
                        <span
                          :class="[
                            dept.status === '0'
                              ? 'text-green-600'
                              : 'text-red-600',
                          ]"
                        >
                          {{ dept.status === '0' ? '已启用' : '已禁用' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 移除按钮 -->
                  <Button
                    type="text"
                    size="small"
                    @click="removeDept(dept)"
                    class="absolute right-3 top-3 ml-3 flex-shrink-0 text-gray-400 opacity-0 transition-opacity duration-200 hover:text-red-500 group-hover:opacity-100"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="border-t border-gray-100 p-4">
          <div class="flex justify-end space-x-3">
            <Button @click="cancelSelection"> 取消 </Button>
            <Button
              type="primary"
              @click="confirmSelection"
              :disabled="selectedDepts.length === 0"
            >
              确认选择 ({{ selectedDepts.length }})
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
