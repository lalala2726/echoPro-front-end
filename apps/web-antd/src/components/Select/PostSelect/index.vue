<script setup lang="ts">
import type { PostListVo } from '#/api/system/post/types';

import { computed, onMounted, ref } from 'vue';

import { Button, Empty, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPostList } from '#/api/system/post/post';

import { postColumns, postStatusMap, usePostSelectFormSchema } from './data';

interface Props {
  /** 是否多选 */
  multiple?: boolean;
  /** 最大选择数量 */
  maxCount?: number;
  /** 已选择的岗位ID数组 */
  modelValue?: string[];
  /** 占位符文本 */
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void;
  (e: 'change', posts: PostListVo[]): void;
  (
    e: 'confirm',
    data: { postIds: string[]; posts: PostListVo[] },
  ): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxCount: 1000,
  modelValue: () => [],
  placeholder: '请选择岗位',
});

const emit = defineEmits<Emits>();

// 选中的岗位数据（跨页累积）
const selectedPosts = ref<PostListVo[]>([]);

// VxeGrid配置
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: usePostSelectFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      labelField: 'postName',
    },
    columns: postColumns,
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
          return await getPostList();
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
          .fullData as PostListVo[];
        if (checked) {
          const pageIds = new Set(currentPageData.map((r) => r.id!));
          const other = selectedPosts.value.filter((r) => !pageIds.has(r.id!));
          const next = [...other, ...currentPageData];
          const max = props.maxCount ?? 1000;
          if (!props.multiple && next.length > 1) {
            message.warning('只能选择一个岗位');
            gridApi.grid.clearCheckboxRow();
            const keep = currentPageData.slice(0, 1);
            if (keep.length > 0) gridApi.grid.setCheckboxRow(keep, true);
            selectedPosts.value = keep;
          } else if (next.length > max) {
            message.warning(`全选超出限制，最多 ${max} 个`);
            gridApi.grid.clearCheckboxRow();
            const keep = currentPageData.slice(
              0,
              Math.max(0, max - other.length),
            );
            if (keep.length > 0) gridApi.grid.setCheckboxRow(keep, true);
            selectedPosts.value = [...other, ...keep];
          } else {
            selectedPosts.value = next;
          }
        } else {
          const pageIds = new Set(currentPageData.map((r) => r.id!));
          selectedPosts.value = selectedPosts.value.filter(
            (r) => !pageIds.has(r.id!),
          );
        }
        const ids = selectedPosts.value
          .map((r) => r.id!)
          .filter((id): id is string => id !== undefined);
        emit('update:modelValue', ids);
      } catch (error) {
        console.error('处理岗位全选变化失败:', error);
      }
    },
  },
});

function syncSelectionAfterToggle() {
  try {
    const currentPageRecords =
      gridApi.grid.getCheckboxRecords() as PostListVo[];
    const currentPageData = gridApi.grid.getTableData().fullData as PostListVo[];

    const currentIds = new Set(currentPageData.map((r) => r.id!));
    const otherPagesSelected = selectedPosts.value.filter(
      (r) => !currentIds.has(r.id!),
    );

    let next = [...otherPagesSelected, ...currentPageRecords];

    if (!props.multiple && next.length > 1) {
      message.warning('只能选择一个岗位');
      next = currentPageRecords.slice(-1);
      gridApi.grid.clearCheckboxRow();
      if (next.length > 0) gridApi.grid.setCheckboxRow(next, true);
    }

    const max = props.maxCount ?? 1000;
    if (next.length > max) {
      message.warning(`最多只能选择 ${max} 个岗位`);
      return;
    }

    selectedPosts.value = next;
    const ids = next
      .map((r) => r.id!)
      .filter((id): id is string => id !== undefined);
    emit('update:modelValue', ids);
  } catch (error) {
    console.error('处理岗位勾选变化失败:', error);
  }
}

// 确认选择
async function handleConfirm() {
  const selectedRows = gridApi.grid.getCheckboxRecords() as PostListVo[];

  if (!props.multiple && selectedRows.length > 1) {
    message.warning('只能选择一个岗位');
    return false;
  }

  if (selectedRows.length > props.maxCount) {
    message.warning(`最多只能选择 ${props.maxCount} 个岗位`);
    return false;
  }

  if (selectedRows.length === 0) {
    message.warning('请至少选择一个岗位');
    return false;
  }

  const postIds = selectedRows
    .map((row) => row.id!)
    .filter((id): id is string => id !== undefined);
  selectedPosts.value = selectedRows;

  emit('update:modelValue', postIds);
  emit('change', selectedRows);
  emit('confirm', { postIds, posts: selectedRows });

  message.success(`已成功选择 ${selectedRows.length} 个岗位`);
  return true;
}

// 取消选择
function handleCancel() {
  emit('cancel');
}

// 清空所有选择
function clearSelection() {
  selectedPosts.value = [];
  try {
    gridApi.grid.clearCheckboxRow();
  } catch (error) {
    console.error('清空复选框状态失败:', error);
  }
  emit('update:modelValue', []);
}

// 移除单个岗位
function removePost(post: PostListVo) {
  if (post.id !== undefined) {
    selectedPosts.value = selectedPosts.value.filter((r) => r.id !== post.id);
    try {
      gridApi.grid.setCheckboxRow(post, false);
    } catch { }
    const postIds = selectedPosts.value
      .map((u) => u.id!)
      .filter((id): id is string => id !== undefined);
    emit('update:modelValue', postIds);
  }
}

onMounted(() => {
  gridApi.query();
});

defineExpose({
  clearSelection,
});

const selectedCount = computed(() => selectedPosts.value.length);
const isMaxReached = computed(() => selectedCount.value >= props.maxCount);

// 选择操作按钮：与勾选行为一致
function selectRow(row: PostListVo) {
  try {
    const isChecked = (gridApi.grid.getCheckboxRecords() as PostListVo[]).some(
      (r) => r.id === row.id,
    );
    gridApi.grid.setCheckboxRow(row, !isChecked);
    // 手动同步右侧已选与 v-model
    syncSelectionAfterToggle();
  } catch (error) {
    console.error('操作失败:', error);
  }
}
</script>

<template>
  <div class="flex h-full flex-col bg-white">
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧：岗位搜索和列表 -->
      <div class="flex flex-1 flex-col border-r border-gray-200">
        <div class="flex-1 overflow-hidden p-4">
          <Grid>
            <!-- 状态列插槽 -->
            <template #status="{ row }">
              <Tag :color="postStatusMap[row.status ?? 0]?.color || 'default'">
                {{ postStatusMap[row.status ?? 0]?.text || '未知' }}
              </Tag>
            </template>
            <!-- 操作列插槽：选择按钮 -->
            <template #action="{ row }">
              <Button type="link" size="small" @click="() => selectRow(row)">
                选择
              </Button>
            </template>
          </Grid>
        </div>
      </div>

      <!-- 右侧：已选择岗位展示 -->
      <div class="flex w-96 flex-col bg-gray-50/50">
        <div class="border-b border-gray-200 bg-white px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900">
              已选择岗位
              <span class="ml-1 text-blue-600">{{ selectedCount }}</span>
              <span class="text-gray-500">/ {{ props.maxCount }}</span>
            </span>
            <Button v-if="selectedCount > 0" size="small" type="text" @click="clearSelection">
              清空
            </Button>
          </div>

          <div v-if="isMaxReached" class="mt-2">
            <div class="rounded-md bg-amber-50 p-2">
              <div class="text-xs text-amber-700">已达到最大选择数量限制</div>
            </div>
          </div>
        </div>

        <!-- 已选择岗位列表 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="selectedCount === 0" class="flex h-full items-center justify-center">
            <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无选择的岗位" />
          </div>

          <div v-else class="space-y-2">
            <div v-for="post in selectedPosts" :key="post.id"
              class="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-sm">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="truncate text-sm font-medium text-gray-900">
                    {{ post.postName }}
                  </span>
                  <Tag size="small" :color="postStatusMap[post.status ?? 0]?.color || 'default'">
                    {{ postStatusMap[post.status ?? 0]?.text || '未知' }}
                  </Tag>
                </div>
                <div class="mt-1 truncate text-xs text-gray-500">
                  {{ post.postCode }}
                </div>
              </div>

              <Button size="small" type="text" class="opacity-0 transition-opacity group-hover:opacity-100"
                @click="removePost(post)">
                移除
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50/50 px-6 py-4">
      <Button @click="handleCancel"> 取消 </Button>
      <Button type="primary" @click="handleConfirm"> 确定选择 </Button>
    </div>
  </div>
</template>
