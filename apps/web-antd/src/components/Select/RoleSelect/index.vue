<script setup lang="ts">
import type { SystemRoleApi } from '#/api/system/role';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Empty, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRoleList } from '#/api/system/role';

import { roleColumns, roleStatusMap, useRoleSelectFormSchema } from './data';

interface Props {
  /** 是否多选 */
  multiple?: boolean;
  /** 最大选择数量 */
  maxCount?: number;
  /** 已选择的角色ID数组 */
  modelValue?: string[];
  /** 占位符文本 */
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
  (e: 'change', roles: SystemRoleApi.SystemRole[]): void;
  (
    e: 'confirm',
    data: { roleIds: string[]; roles: SystemRoleApi.SystemRole[] },
  ): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxCount: 1000,
  modelValue: () => [],
  placeholder: '请选择角色',
});

const emit = defineEmits<Emits>();

// 选中的角色数据
const selectedRoles = ref<SystemRoleApi.SystemRole[]>([]);

// VxeGrid配置
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useRoleSelectFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'roleName',
    },
    columns: roleColumns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 20,
      pageSizes: [10, 20, 50, 100],
      layouts: [
        'PrevPage',
        'JumpNumber',
        'NextPage',
        'Sizes',
        'FullJump',
        'Total',
      ],
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          return await getRoleList();
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: false,
    },
  },
  gridEvents: {
    checkboxChange: () => {
      syncSelectionAfterToggle();
    },
    checkboxAll: ({ checked }: { checked: boolean }) => {
      try {
        const currentPageData = gridApi.grid.getTableData()
          .fullData as SystemRoleApi.SystemRole[];
        if (checked) {
          const pageIds = new Set(currentPageData.map((r) => r.id!));
          const other = selectedRoles.value.filter((r) => !pageIds.has(r.id!));
          const next = [...other, ...currentPageData];
          const max = props.maxCount ?? 1000;
          if (!props.multiple && next.length > 1) {
            message.warning('只能选择一个角色');
            gridApi.grid.clearCheckboxRow();
            const keep = currentPageData.slice(0, 1);
            if (keep.length > 0) gridApi.grid.setCheckboxRow(keep, true);
            selectedRoles.value = keep;
          } else if (next.length > max) {
            message.warning(`全选超出限制，最多 ${max} 个`);
            gridApi.grid.clearCheckboxRow();
            const keep = currentPageData.slice(
              0,
              Math.max(0, max - other.length),
            );
            if (keep.length > 0) gridApi.grid.setCheckboxRow(keep, true);
            selectedRoles.value = [...other, ...keep];
          } else {
            selectedRoles.value = next;
          }
        } else {
          const pageIds = new Set(currentPageData.map((r) => r.id!));
          selectedRoles.value = selectedRoles.value.filter(
            (r) => !pageIds.has(r.id!),
          );
        }
        const ids = selectedRoles.value
          .map((r) => r.id!)
          .filter((id) => id !== undefined);
        emit('update:modelValue', ids);
      } catch (error) {
        console.error('处理角色全选变化失败:', error);
      }
    },
  },
});

function syncSelectionAfterToggle() {
  try {
    const currentPageRecords =
      gridApi.grid.getCheckboxRecords() as SystemRoleApi.SystemRole[];
    const currentPageData = gridApi.grid.getTableData()
      .fullData as SystemRoleApi.SystemRole[];

    const currentIds = new Set(currentPageData.map((r) => r.id!));
    const otherPagesSelected = selectedRoles.value.filter(
      (r) => !currentIds.has(r.id!),
    );

    let next = [...otherPagesSelected, ...currentPageRecords];

    if (!props.multiple && next.length > 1) {
      message.warning('只能选择一个角色');
      next = currentPageRecords.slice(-1);
      gridApi.grid.clearCheckboxRow();
      if (next.length > 0) gridApi.grid.setCheckboxRow(next, true);
    }

    const max = props.maxCount ?? 1000;
    if (next.length > max) {
      message.warning(`最多只能选择 ${max} 个角色`);
      return;
    }

    selectedRoles.value = next;
    const ids = next.map((r) => r.id!).filter((id) => id !== undefined);
    emit('update:modelValue', ids);
  } catch (error) {
    console.error('处理角色勾选变化失败:', error);
  }
}

// 勾选事件：选择即同步（跨页累积）
// - 单选模式：只保留一个
// - 数量限制：超出直接回退
// - 仅更新 v-model，不在勾选时频繁触发 change，避免重复提示
// 注意：事件通过 useVbenVxeGrid 的 gridEvents 选项注册

// 确认选择
async function handleConfirm() {
  const selectedRows =
    gridApi.grid.getCheckboxRecords() as SystemRoleApi.SystemRole[];

  if (!props.multiple && selectedRows.length > 1) {
    message.warning('只能选择一个角色');
    return false;
  }

  if (selectedRows.length > props.maxCount) {
    message.warning(`最多只能选择 ${props.maxCount} 个角色`);
    return false;
  }

  if (selectedRows.length === 0) {
    message.warning('请至少选择一个角色');
    return false;
  }

  const roleIds = selectedRows
    .map((row) => row.id!)
    .filter((id) => id !== undefined);
  selectedRoles.value = selectedRows;

  // 触发所有相关事件
  emit('update:modelValue', roleIds);
  emit('change', selectedRows);
  emit('confirm', { roleIds, roles: selectedRows });

  message.success(`已成功选择 ${selectedRows.length} 个角色`);
  return true;
}

// 取消选择
function handleCancel() {
  emit('cancel');
}

// 清空所有选择
function clearSelection() {
  selectedRoles.value = [];

  try {
    gridApi.grid.clearCheckboxRow();
  } catch (error) {
    console.error('清空复选框状态失败:', error);
  }

  emit('update:modelValue', []);
}

// 移除单个角色
function removeRole(role: SystemRoleApi.SystemRole) {
  if (role.id) {
    selectedRoles.value = selectedRoles.value.filter((r) => r.id !== role.id);
    try {
      gridApi.grid.setCheckboxRow(role, false);
    } catch {}
    const roleIds = selectedRoles.value.map((u) => u.id!);
    emit('update:modelValue', roleIds);
  }
}

// 组件挂载时初始化
onMounted(() => {
  gridApi.query();
});

// 选择操作按钮：与勾选行为一致
function selectRow(row: SystemRoleApi.SystemRole) {
  try {
    const isChecked = (
      gridApi.grid.getCheckboxRecords() as SystemRoleApi.SystemRole[]
    ).some((r) => r.id === row.id);
    gridApi.grid.setCheckboxRow(row, !isChecked);
    // 手动同步右侧已选与 v-model
    syncSelectionAfterToggle();
  } catch (error) {
    console.error('操作失败:', error);
  }
}

// 暴露方法
defineExpose({
  clearSelection,
});

// 计算属性
const selectedCount = computed(() => selectedRoles.value.length);
const isMaxReached = computed(() => selectedCount.value >= props.maxCount);
</script>

<template>
  <div class="flex h-full flex-col bg-white">
    <!-- 主要内容区域 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧：角色搜索和列表 -->
      <div class="flex flex-1 flex-col border-r border-gray-200">
        <!-- 搜索和表格区域 -->
        <div class="flex-1 overflow-hidden p-4">
          <Page auto-content-height>
            <Grid>
              <!-- 状态列插槽 -->
              <template #status="{ row }">
                <Tag
                  :color="roleStatusMap[row.status ?? 0]?.color || 'default'"
                >
                  {{ roleStatusMap[row.status ?? 0]?.text || '未知' }}
                </Tag>
              </template>
              <!-- 操作列插槽：选择按钮 -->
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
          </Page>
        </div>
      </div>

      <!-- 右侧：已选择角色展示 -->
      <div class="flex w-96 flex-col bg-gray-50/50">
        <!-- 已选择角色标题 -->
        <div class="border-b border-gray-200 bg-white px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900">
              已选择角色
              <span class="ml-1 text-blue-600">{{ selectedCount }}</span>
              <span class="text-gray-500">/ {{ props.maxCount }}</span>
            </span>
            <Button
              v-if="selectedCount > 0"
              size="small"
              type="text"
              @click="clearSelection"
            >
              清空
            </Button>
          </div>

          <!-- 数量提示 -->
          <div v-if="isMaxReached" class="mt-2">
            <div class="rounded-md bg-amber-50 p-2">
              <div class="text-xs text-amber-700">已达到最大选择数量限制</div>
            </div>
          </div>
        </div>

        <!-- 已选择角色列表 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div
            v-if="selectedCount === 0"
            class="flex h-full items-center justify-center"
          >
            <Empty
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="暂无选择的角色"
            />
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="role in selectedRoles"
              :key="role.id"
              class="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="truncate text-sm font-medium text-gray-900">
                    {{ role.roleName }}
                  </span>
                  <Tag
                    size="small"
                    :color="roleStatusMap[role.status ?? 0]?.color || 'default'"
                  >
                    {{ roleStatusMap[role.status ?? 0]?.text || '未知' }}
                  </Tag>
                </div>
                <div class="mt-1 truncate text-xs text-gray-500">
                  {{ role.roleKey }}
                </div>
                <div
                  v-if="role.remark"
                  class="mt-1 truncate text-xs text-gray-400"
                >
                  {{ role.remark }}
                </div>
              </div>

              <Button
                size="small"
                type="text"
                class="opacity-0 transition-opacity group-hover:opacity-100"
                @click="removeRole(role)"
              >
                移除
              </Button>
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
