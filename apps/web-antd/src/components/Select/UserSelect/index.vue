<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SysUserType } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Empty, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserList } from '#/api/system/user';

import { useUserSelectColumns, useUserSelectFormSchema } from './data';

interface Props {
  /** 是否多选 */
  multiple?: boolean;
  /** 最大选择数量 */
  maxCount?: number;
  /** 已选择的用户ID数组 */
  modelValue?: number[];
  /** 占位符文本 */
  placeholder?: string;
  /** 是否使用模态框模式（默认为抽屉模式） */
  modalMode?: boolean;
  /** 容器宽度（模态框模式下使用） */
  width?: number | string;
  /** 容器高度 */
  height?: number | string;
}

interface Emits {
  (e: 'update:modelValue', value: number[]): void;
  (e: 'change', users: SysUserType.UserListVo[]): void;
  (
    e: 'confirm',
    data: { userIds: number[]; users: SysUserType.UserListVo[] },
  ): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxCount: 1000,
  modelValue: () => [],
  placeholder: '请选择用户',
  modalMode: false,
  width: '60vw', // 占据屏幕宽度的60%
  height: '90vh', // 占据屏幕高度的90%
});

const emit = defineEmits<Emits>();

// 选中的用户数据
const selectedUsers = ref<SysUserType.UserListVo[]>([]);

// VxeGrid配置
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useUserSelectFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'username',
    },
    columns: useUserSelectColumns(),
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
        query: async ({ page }, formValues) => {
          const result = await getUserList({
            pageNum: page?.currentPage || 1,
            pageSize: page?.pageSize || 20,
            ...formValues,
          });

          // 页面数据加载完成后，恢复当前页面的选择状态
          setTimeout(() => {
            syncCurrentPageCheckboxState();
          }, 100);

          return result;
        },
      },
    },
    rowConfig: {
      keyField: 'userId',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      refreshOptions: { code: 'query' },
      search: true,
      zoom: false,
    },
  } as VxeTableGridOptions<SysUserType.UserListVo>,
  // 勾选事件：选择即同步并回调
  gridEvents: {
    // 全选/取消全选事件 - 处理数量限制
    checkboxAll: ({ checked }: { checked: boolean }) => {
      try {
        const currentPageData = gridApi.grid.getTableData()
          .fullData as SysUserType.UserListVo[];

        if (checked) {
          // 尝试全选当前页
          const currentPageUserIds = new Set(
            currentPageData.map((user) => user.userId!),
          );

          // 移除当前页面的所有用户从已选择列表中
          const otherPagesSelected = selectedUsers.value.filter(
            (user) => !currentPageUserIds.has(user.userId!),
          );

          // 计算全选后的总数量
          const totalAfterSelectAll =
            otherPagesSelected.length + currentPageData.length;
          const max = props.maxCount ?? 1000;

          if (totalAfterSelectAll > max) {
            // 超出限制，阻止全选
            message.warning(
              `全选当前页将超出限制！当前已选择 ${otherPagesSelected.length} 个用户，当前页有 ${currentPageData.length} 个用户，最多只能选择 ${max} 个用户`,
            );
            gridApi.grid.clearCheckboxRow();
            return;
          }

          // 允许全选
          const newSelectedUsers = [...otherPagesSelected, ...currentPageData];
          selectedUsers.value = newSelectedUsers;

          message.success({
            content: `已全选当前页 ${currentPageData.length} 个用户，当前共选择 ${newSelectedUsers.length} 个用户`,
            duration: 2,
          });
        } else {
          // 取消全选当前页
          const currentPageUserIds = new Set(
            currentPageData.map((user) => user.userId!),
          );

          const otherPagesSelected = selectedUsers.value.filter(
            (user) => !currentPageUserIds.has(user.userId!),
          );

          selectedUsers.value = otherPagesSelected;

          message.info({
            content: `已取消选择当前页 ${currentPageData.length} 个用户，当前共选择 ${otherPagesSelected.length} 个用户`,
            duration: 1.5,
          });
        }

        // 触发回调
        const userIds = selectedUsers.value
          .map((u) => u.userId!)
          .filter((id) => id !== undefined);
        emit('update:modelValue', userIds);
        emit('change', selectedUsers.value);
      } catch (error) {
        console.error('全选操作失败:', error);
        message.error('全选操作失败，请重试');
      }
    },

    // 单行勾选变化 - 修复跨页选择问题
    checkboxChange: () => {
      try {
        const currentPageRecords =
          gridApi.grid.getCheckboxRecords() as SysUserType.UserListVo[];
        const currentPageData = gridApi.grid.getTableData()
          .fullData as SysUserType.UserListVo[];

        // 获取当前页面的所有用户ID
        const currentPageUserIds = new Set(
          currentPageData.map((user) => user.userId!),
        );

        // 移除当前页面的所有用户从已选择列表中
        const otherPagesSelected = selectedUsers.value.filter(
          (user) => !currentPageUserIds.has(user.userId!),
        );

        // 合并其他页面的选择和当前页面的选择
        const newSelectedUsers = [...otherPagesSelected, ...currentPageRecords];

        // 单选模式：只保留一个
        if (!props.multiple && newSelectedUsers.length > 1) {
          message.warning('只能选择一个用户');
          // 清空所有选择，只保留最新选择的一个
          selectedUsers.value = currentPageRecords.slice(-1);
          gridApi.grid.clearCheckboxRow();
          if (currentPageRecords.length > 0) {
            gridApi.grid.setCheckboxRow(currentPageRecords.slice(-1), true);
          }
        } else {
          // 数量上限检查
          const max = props.maxCount ?? 1000;
          if (newSelectedUsers.length > max) {
            message.warning(`最多只能选择 ${max} 个用户`);
            return;
          }

          // 更新选择状态
          selectedUsers.value = newSelectedUsers;

          // 更新选择状态（移除重复通知，由confirm事件处理）
        }

        // 触发回调
        const userIds = selectedUsers.value
          .map((row) => row.userId!)
          .filter((id) => id !== undefined);
        emit('update:modelValue', userIds);
        emit('change', selectedUsers.value);
      } catch (error) {
        console.error('处理勾选变化失败:', error);
      }
    },
  },
});

// 同步当前页面的复选框状态
function syncCurrentPageCheckboxState() {
  try {
    const currentPageData = gridApi.grid.getTableData()
      .fullData as SysUserType.UserListVo[];
    const selectedUserIds = new Set(
      selectedUsers.value.map((user) => user.userId!),
    );

    // 找出当前页面中应该被选中的用户
    const currentPageSelectedUsers = currentPageData.filter((user) =>
      selectedUserIds.has(user.userId!),
    );

    // 清空当前页面的选择状态，然后重新设置
    gridApi.grid.clearCheckboxRow();
    if (currentPageSelectedUsers.length > 0) {
      gridApi.grid.setCheckboxRow(currentPageSelectedUsers, true);
    }
  } catch (error) {
    console.error('同步复选框状态失败:', error);
  }
}

// 处理宽高为数字时自动补全 px，生成 Tailwind 任意值类
const drawerClass = computed(() => {
  if (!props.modalMode) return 'w-[1200px]'; // 增加默认宽度以适应两列布局

  const toUnit = (v?: number | string) => {
    if (v === undefined || v === null) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
  };

  const w = toUnit(props.width) ?? '60vw'; // 默认宽度为屏幕宽度的60%
  const h = toUnit(props.height) ?? '90vh'; // 默认高度为屏幕高度的90%
  return `w-[${w}] h-[${h}]`;
});

// 抽屉配置
const [Drawer, drawerApi] = useVbenDrawer({
  title: '选择用户',
  class: drawerClass.value,
  showConfirmButton: true,
  showCancelButton: true,
  confirmText: '确定选择',
  cancelText: '取消',
  onConfirm: handleConfirm,
  onCancel: handleCancel,
  onOpenChange(isOpen) {
    if (isOpen) {
      gridApi.query();
      initSelectedUsers();
    } else {
      // 不在这里清空选择，保持用户的选择状态
    }
  },
});

// 计算属性 - 增强的显示文本处理
const displayText = computed(() => {
  if (selectedUsers.value.length === 0) {
    return props.placeholder;
  }

  // 单选模式直接显示用户名
  if (!props.multiple && selectedUsers.value.length === 1) {
    return selectedUsers.value[0]?.username || '';
  }

  // 多选模式的智能显示
  if (selectedUsers.value.length <= 3) {
    return selectedUsers.value.map((user) => user.username).join(', ');
  }

  // 超过3个用户时的紧凑显示
  const firstThree = selectedUsers.value
    .slice(0, 3)
    .map((user) => user.username)
    .join(', ');
  const remaining = selectedUsers.value.length - 3;
  return `${firstThree} +${remaining}`;
});

// 性能优化：对于大量用户的虚拟滚动支持
// 计算是否需要虚拟滚动（超过50个用户时启用）
const shouldUseVirtualScroll = computed(() => selectedUsers.value.length > 50);

// 虚拟滚动的可见用户列表（性能优化）
const visibleUsers = computed(() => {
  if (!shouldUseVirtualScroll.value) {
    return selectedUsers.value;
  }

  // 简单的虚拟滚动实现：只渲染前100个用户，其余显示为占位符
  return selectedUsers.value.slice(0, 100);
});

// 计算未显示的用户数量
const hiddenUsersCount = computed(() => {
  if (!shouldUseVirtualScroll.value) return 0;
  return Math.max(0, selectedUsers.value.length - 100);
});

// 初始化已选择的用户
async function initSelectedUsers() {
  if (props.modelValue && props.modelValue.length > 0) {
    try {
      setTimeout(() => {
        const allRows = gridApi.grid.getTableData().fullData;
        const selectedRows = allRows.filter(
          (row) => row.userId && props.modelValue.includes(row.userId),
        );

        gridApi.grid.setCheckboxRow(selectedRows, true);
        selectedUsers.value = selectedRows;
      }, 100);
    } catch (error) {
      console.error('初始化选中用户失败:', error);
    }
  }
}

// 确认选择 - 只处理选择逻辑，不管理UI状态
async function handleConfirm() {
  const selectedRows = gridApi.grid.getCheckboxRecords();

  if (!props.multiple && selectedRows.length > 1) {
    message.warning('只能选择一个用户');
    return false;
  }

  if (selectedRows.length > props.maxCount) {
    message.warning(`最多只能选择 ${props.maxCount} 个用户`);
    return false;
  }

  if (selectedRows.length === 0) {
    message.warning('请至少选择一个用户');
    return false;
  }

  const userIds = selectedRows
    .map((row) => row.userId!)
    .filter((id) => id !== undefined);
  selectedUsers.value = selectedRows;

  // 触发所有相关事件
  emit('update:modelValue', userIds);
  emit('change', selectedRows);
  emit('confirm', { userIds, users: selectedRows });

  // 提供选择成功反馈
  message.success({
    content: `已成功选择 ${selectedRows.length} 个用户`,
    duration: 2,
  });

  // 返回true表示确认成功，由父组件决定是否关闭抽屉
  return true;
}

// 取消选择
function handleCancel() {
  emit('cancel');
  return true;
}

// 打开选择器
function openSelector() {
  drawerApi.open();
}

// 清空选择 - 增强版，清空所有页面的选择
function clearSelection() {
  selectedUsers.value = [];
  try {
    // 清空当前页面的复选框状态
    gridApi.grid.clearCheckboxRow();
  } catch (error) {
    console.error('清空复选框状态失败:', error);
  }

  // 触发回调
  emit('update:modelValue', []);
  emit('change', []);

  // 清空反馈由父组件处理，避免重复通知
}

// 移除单个用户
function removeUser(user: SysUserType.UserListVo) {
  const index = selectedUsers.value.findIndex((u) => u.userId === user.userId);
  if (index !== -1) {
    selectedUsers.value.splice(index, 1);
    try {
      gridApi.grid.setCheckboxRow(user, false);
    } catch {}
    const userIds = selectedUsers.value.map((u) => u.userId!);
    emit('update:modelValue', userIds);
    emit('change', selectedUsers.value);

    // 移除反馈由父组件处理，避免重复通知
  }
}

// 关闭选择器
function closeSelector() {
  drawerApi.close();
}

// 暴露方法
defineExpose({
  openSelector,
  clearSelection,
  closeSelector,
});
</script>

<template>
  <div class="user-select-wrapper">
    <!-- 选择器触发区域 -->
    <div
      class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex min-h-8 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      @click="openSelector"
    >
      <span
        class="flex-1 truncate"
        :class="[
          selectedUsers.length === 0
            ? 'text-muted-foreground'
            : 'text-foreground',
        ]"
      >
        {{ displayText }}
      </span>
      <div class="flex items-center gap-2">
        <!-- 已选择用户数量标签 -->
        <Tag v-if="selectedUsers.length > 0" color="blue" class="text-xs">
          {{ selectedUsers.length }}
        </Tag>
        <!-- 清空按钮 -->
        <Button
          v-if="selectedUsers.length > 0"
          type="text"
          size="small"
          class="text-muted-foreground hover:text-foreground h-4 w-4 p-0"
          @click.stop="clearSelection"
        >
          ×
        </Button>
      </div>
    </div>

    <!-- 用户选择抽屉 - 左右两列布局（清晰分隔） -->
    <Drawer>
      <div class="flex h-full gap-6">
        <!-- 左侧面板 - 用户表格（主要操作区域） -->
        <div
          class="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
          style="flex: 0 0 58%"
        >
          <!-- 表格标题栏 -->
          <div
            class="rounded-t-lg border-b border-gray-100 bg-gray-50/50 px-6 py-5"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-xl font-semibold text-gray-900">用户列表</div>
                <div
                  class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600"
                >
                  选择需要的用户
                </div>
              </div>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <svg
                  class="h-4 w-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>在表格中勾选用户，选择结果将显示在右侧</span>
              </div>
            </div>
          </div>

          <!-- 表格内容区域 -->
          <div class="flex-1 overflow-hidden p-1">
            <Grid class="h-full" />
          </div>
        </div>

        <!-- 右侧面板 - 已选择用户展示 -->
        <div
          class="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
          style="flex: 0 0 38%"
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
                    已选择用户
                  </span>
                  <span
                    class="rounded-full border border-gray-200 bg-white px-2 py-1 text-sm text-gray-500"
                  >
                    {{ selectedUsers.length }}/{{ props.maxCount }}
                  </span>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <Button
                  v-if="selectedUsers.length > 0"
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
                    >
                      >
                    </path>
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
                  width: `${Math.min((selectedUsers.length / props.maxCount) * 100, 100)}%`,
                }"
              ></div>
            </div>
          </div>

          <!-- 右侧面板内容 - 已选择用户展示 -->
          <div class="flex-1 overflow-hidden">
            <!-- 空状态 -->
            <div
              v-if="selectedUsers.length === 0"
              class="flex h-full items-center justify-center p-8"
            >
              <div class="text-center">
                <Empty
                  description="暂无选择用户"
                  :image="Empty.PRESENTED_IMAGE_SIMPLE"
                >
                  <template #description>
                    <span class="text-gray-500">请在左侧表格中勾选用户</span>
                  </template>
                </Empty>
              </div>
            </div>

            <!-- 用户卡片网格 -->
            <div
              v-else
              class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-full overflow-y-auto p-6"
              style="scroll-behavior: smooth"
            >
              <div class="grid grid-cols-1 gap-4">
                <!-- 用户卡片 -->
                <div
                  v-for="user in visibleUsers"
                  :key="user.userId"
                  class="group relative rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-md"
                >
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 flex-1">
                      <!-- 用户名 -->
                      <div
                        class="mb-2 truncate text-base font-semibold text-gray-900"
                      >
                        {{ user.username }}
                      </div>

                      <!-- 用户信息 -->
                      <div class="space-y-1">
                        <div
                          v-if="user.nickname"
                          class="truncate text-sm text-gray-600"
                        >
                          <span class="text-gray-400">昵称:</span>
                          {{ user.nickname }}
                        </div>
                        <div class="truncate text-sm text-gray-600">
                          <span class="text-gray-400">部门:</span>
                          {{ user.deptName || '未分配部门' }}
                        </div>
                        <div
                          v-if="user.phone"
                          class="truncate text-sm text-gray-600"
                        >
                          <span class="text-gray-400">手机:</span>
                          {{ user.phone }}
                        </div>
                        <div class="truncate text-sm text-gray-600">
                          <span class="text-gray-400">状态:</span>
                          <span
                            :class="[
                              user.status === 0
                                ? 'text-green-600'
                                : 'text-red-600',
                            ]"
                          >
                            {{ user.status === 0 ? '已启用' : '已禁用' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 移除按钮 -->
                    <Button
                      type="text"
                      size="small"
                      @click="removeUser(user)"
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

                <!-- 更多用户指示器 -->
                <div
                  v-if="hiddenUsersCount > 0"
                  class="flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-4 text-center"
                >
                  <div>
                    <div class="text-sm font-semibold text-blue-700">
                      +{{ hiddenUsersCount }} 更多用户
                    </div>
                    <div class="mt-1 text-xs text-blue-600">
                      为保证性能仅显示前100个
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>
