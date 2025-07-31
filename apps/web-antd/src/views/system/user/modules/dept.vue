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
 */
function onSelect(selectedKeys: Key[]) {
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
 */
function onExpand(expandedKeysValue: Key[]) {
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
    <div class="mb-4 border-b border-gray-100 pb-3 dark:border-gray-900">
      <div class="mb-2 flex items-center justify-between">
        <h3
          class="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          部门列表
        </h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="selectedKeys.length > 0"
            class="rounded px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
            @click="clearSelection"
          >
            清除选择
          </button>
          <button
            class="rounded px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            @click="refreshData"
            :disabled="loading"
          >
            刷新
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        点击部门节点筛选该部门下的用户
      </p>
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
            class="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"
          ></div>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            正在加载部门数据...
          </span>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && (!treeData || treeData.length === 0)"
        class="flex h-32 flex-col items-center justify-center text-gray-500 dark:text-gray-400"
      >
        <div class="mb-2 text-4xl">📁</div>
        <p class="text-sm font-medium">暂无部门数据</p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
          请联系管理员配置部门信息
        </p>
        <button
          class="mt-3 rounded bg-blue-50 px-3 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
          @click="refreshData"
        >
          重新加载
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 响应式优化 */
@media (max-width: 768px) {
  .dept-tree {
    font-size: 13px;
  }
}

.dept-tree {
  font-size: 14px;
  background: transparent;
}

/* 树形组件样式 */
</style>
