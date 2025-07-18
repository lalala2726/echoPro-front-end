<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/_util/type';

import { onMounted, ref, watch } from 'vue';

import { Tree } from 'ant-design-vue';

import { getDeptOptions } from '#/api/system/dept';

// 定义组件Props
interface Props {
  selectedDeptId?: string;
}

// 定义组件事件
interface Emits {
  (e: 'deptSelect', deptId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedDeptId: '',
});

const emit = defineEmits<Emits>();

// 树形组件状态管理
const loading = ref(false);
const expandedKeys = ref<Key[]>([]);
const selectedKeys = ref<Key[]>([]);
const treeData = ref<TreeProps['treeData']>([]);

// 监听选中的部门ID变化
watch(
  () => props.selectedDeptId,
  (newVal: string | undefined) => {
    selectedKeys.value = newVal ? [newVal] : [];
  },
  { immediate: true },
);

/**
 * 转换部门数据格式
 * 将后端数据转换为Ant Design Vue Tree组件标准格式
 * 使用fieldNames配置来处理字段映射
 */
function transformDeptData(data: any[]): TreeProps['treeData'] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    const node = {
      // Tree组件标准字段
      title: item.label || item.deptName || '未知部门',
      key: item.value || item.deptId || '',
      // 可选配置
      disabled: item.disabled || false,
      selectable: item.selectable !== false,
      checkable: item.checkable !== false,
      disableCheckbox: item.disableCheckbox || false,
      // 子节点处理
      children: undefined as any,
      isLeaf: false,
    };

    // 处理子节点
    if (
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      node.children = transformDeptData(item.children);
      node.isLeaf = false;
    } else {
      node.isLeaf = true;
      node.children = undefined;
    }

    return node;
  });
}

/**
 * 加载部门数据 - 严格使用后端数据
 */
async function loadDeptData() {
  try {
    loading.value = true;
    const result = await getDeptOptions();

    if (result && Array.isArray(result) && result.length > 0) {
      const transformedData = transformDeptData(result);
      treeData.value = transformedData;

      // 自动展开第一级节点
      const firstLevelKeys: Key[] = [];
      transformedData?.forEach((node: any) => {
        if (node && node.key) {
          firstLevelKeys.push(node.key);
        }
      });
      expandedKeys.value = firstLevelKeys;
    } else {
      // 后端无数据时，设置为空
      treeData.value = [];
      expandedKeys.value = [];
    }
  } catch (error) {
    console.error('加载部门数据失败:', error);
    // 发生错误时设置为空，严格不使用测试数据
    treeData.value = [];
    expandedKeys.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 处理树节点选择事件
 * @param selectedKeys 选中的节点key数组
 * @param info 选择信息对象
 */
function onSelect(selectedKeys: Key[], info: any) {
  console.log('Tree Select:', { selectedKeys, info });

  if (selectedKeys.length > 0) {
    const deptId = String(selectedKeys[0]) || '';
    emit('deptSelect', deptId);
  } else {
    // 取消选择时，传递空字符串表示查看所有部门
    emit('deptSelect', '');
  }
}

/**
 * 处理树节点展开/收起事件
 * @param expandedKeysValue 展开的节点key数组
 * @param info 展开信息对象
 */
function onExpand(expandedKeysValue: Key[], info: any) {
  console.log('Tree Expand:', { expandedKeys: expandedKeysValue, info });
  expandedKeys.value = expandedKeysValue;
}

/**
 * 清除选择
 */
function clearSelection() {
  selectedKeys.value = [];
  emit('deptSelect', '');
}

/**
 * 刷新部门数据
 */
function refreshData() {
  loadDeptData();
}

// 组件挂载时加载数据
onMounted(() => {
  loadDeptData();
});

// 暴露方法给父组件
defineExpose({
  refreshData,
  clearSelection,
});
</script>

<template>
  <div class="h-full">
    <!-- 头部信息区域 -->
    <div class="mb-4 border-b border-gray-100 pb-3">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="flex items-center text-lg font-semibold text-gray-900">
          <span class="mr-2">🏢</span>
          部门列表
        </h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="selectedKeys.length > 0"
            class="rounded px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
            @click="clearSelection"
          >
            清除选择
          </button>
          <button
            class="rounded px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            @click="refreshData"
            :disabled="loading"
          >
            刷新
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-500">点击部门节点筛选该部门下的用户</p>
    </div>

    <!-- 树形结构主体区域 -->
    <div class="relative">
      <!-- Ant Design Vue Tree组件 -->
      <Tree
        v-if="!loading && treeData && treeData.length > 0"
        v-model:expanded-keys="expandedKeys"
        v-model:selected-keys="selectedKeys"
        :tree-data="treeData"
        :field-names="{
          title: 'title',
          key: 'key',
          children: 'children',
        }"
        :show-line="{ showLeafIcon: false }"
        :show-icon="false"
        :block-node="true"
        :selectable="true"
        :multiple="false"
        :checkable="false"
        :auto-expand-parent="true"
        :default-expand-all="false"
        :draggable="false"
        class="dept-tree"
        @select="onSelect"
        @expand="onExpand"
      />

      <!-- 加载状态 -->
      <div v-if="loading" class="flex h-32 items-center justify-center">
        <div class="flex items-center space-x-2">
          <div
            class="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"
          ></div>
          <span class="text-sm text-gray-500">正在加载部门数据...</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && (!treeData || treeData.length === 0)"
        class="flex h-32 flex-col items-center justify-center text-gray-500"
      >
        <div class="mb-2 text-4xl">📁</div>
        <p class="text-sm font-medium">暂无部门数据</p>
        <p class="mt-1 text-xs text-gray-400">请联系管理员配置部门信息</p>
        <button
          class="mt-3 rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100"
          @click="refreshData"
        >
          重新加载
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 树形组件样式 */
.dept-tree {
  background: transparent;
  font-size: 14px;
}

/* 树节点内容样式优化 */
.dept-tree :deep(.ant-tree-node-content-wrapper) {
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  min-height: 32px;
}

/* 悬停效果 */
.dept-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #f0f9ff;
  color: #1e40af;
}

/* 选中状态样式 */
.dept-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background-color: #dbeafe !important;
  color: #1d4ed8 !important;
  font-weight: 500;
}

/* 树节点标题样式 */
.dept-tree :deep(.ant-tree-title) {
  color: inherit;
  font-size: inherit;
}

/* 展开/收起图标样式 */
.dept-tree :deep(.ant-tree-switcher) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* 连接线样式 */
.dept-tree :deep(.ant-tree-switcher-line-icon) {
  color: #d1d5db;
}

/* 焦点状态 */
.dept-tree :deep(.ant-tree-node-content-wrapper:focus) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 禁用状态 */
.dept-tree :deep(.ant-tree-treenode-disabled .ant-tree-node-content-wrapper) {
  color: #9ca3af;
  cursor: not-allowed;
}

.dept-tree
  :deep(.ant-tree-treenode-disabled .ant-tree-node-content-wrapper:hover) {
  background-color: transparent;
  color: #9ca3af;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .dept-tree {
    font-size: 13px;
  }

  .dept-tree :deep(.ant-tree-node-content-wrapper) {
    padding: 4px 6px;
    min-height: 28px;
  }
}

/* 确保树形结构在容器中正确显示 */
.dept-tree :deep(.ant-tree) {
  background: transparent;
}

/* 叶子节点样式 */
.dept-tree :deep(.ant-tree-switcher-noop) {
  width: 24px;
}
</style>
