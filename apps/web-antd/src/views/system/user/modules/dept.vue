<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import { onMounted, ref, watch } from 'vue';

import { Tree } from 'ant-design-vue';

import { getDeptOptions } from '#/api/system/dept';

interface Props {
  selectedDeptId?: string;
}

interface Emits {
  (e: 'deptSelect', deptId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedDeptId: '',
});

const emit = defineEmits<Emits>();

const loading = ref(false);
const expandedKeys = ref<(number | string)[]>([]);
const selectedKeys = ref<(number | string)[]>([]);
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
 * 转换数据格式，将API返回的数据转换为Tree组件需要的格式
 */
function transformDeptData(data: any[]): TreeProps['treeData'] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    const hasChildren =
      item.children && Array.isArray(item.children) && item.children.length > 0;

    return {
      title: item.label || item.deptName || '未知部门',
      key: item.value || item.deptId || '',
      children: hasChildren ? transformDeptData(item.children) : undefined,
      isLeaf: !hasChildren,
      // 添加图标，根据是否有子节点显示不同图标
      icon: hasChildren ? '🏢' : '🏪',
      // 可以添加其他属性
      selectable: true,
      disabled: false,
      // 控制是否显示展开/折叠图标，没有子节点就不显示
      switcherIcon: hasChildren ? undefined : () => null,
    };
  });
}

/**
 * 加载部门数据
 */
async function loadDeptData() {
  try {
    loading.value = true;
    const result = await getDeptOptions();
    if (result && Array.isArray(result) && result.length > 0) {
      const transformedData = transformDeptData(result);
      treeData.value = transformedData;
      // 默认展开第一级节点
      const firstLevelKeys: (number | string)[] = [];
      if (transformedData) {
        transformedData.forEach((node: any) => {
          if (node && node.key) {
            firstLevelKeys.push(node.key);
          }
        });
      }
      expandedKeys.value = firstLevelKeys;
    } else {
      const testData = [
        {
          value: '1',
          label: '西安总公司',
          children: [
            {
              value: '2',
              label: '雁塔区分部',
              children: [
                { value: '3', label: '咸宁路分店' },
                { value: '4', label: '兴庆宫分店' },
              ],
            },
          ],
        },
        {
          value: '5',
          label: '高新区分部',
          children: [
            { value: '7', label: '锦业一路分店' },
            { value: '8', label: '西部大道分店' },
          ],
        },
      ];

      const transformedData = transformDeptData(testData);
      treeData.value = transformedData;

      // 默认展开第一级节点
      const firstLevelKeys: (number | string)[] = [];
      if (transformedData) {
        transformedData.forEach((node: any) => {
          if (node && node.key) {
            firstLevelKeys.push(node.key);
          }
        });
      }
      expandedKeys.value = firstLevelKeys;
    }
  } catch (error) {
    console.error('加载部门数据失败:', error);

    // 发生错误时也使用测试数据
    const testData = [
      {
        value: '1',
        label: '西安总公司',
        children: [
          {
            value: '2',
            label: '雁塔区分部',
            children: [
              { value: '3', label: '咸宁路分店' },
              { value: '4', label: '兴庆宫分店' },
            ],
          },
        ],
      },
      {
        value: '5',
        label: '高新区分部',
        children: [
          { value: '7', label: '锦业一路分店' },
          { value: '8', label: '西部大道分店' },
        ],
      },
    ];

    const transformedData = transformDeptData(testData);
    treeData.value = transformedData;

    // 默认展开第一级节点
    const firstLevelKeys: (number | string)[] = [];
    if (transformedData) {
      transformedData.forEach((node: any) => {
        if (node && node.key) {
          firstLevelKeys.push(node.key);
        }
      });
    }
    expandedKeys.value = firstLevelKeys;
  } finally {
    loading.value = false;
  }
}

/**
 * 处理树节点选择
 */
function onSelect(selectedKeys: (number | string)[]) {
  if (selectedKeys.length > 0) {
    const deptId = String(selectedKeys[0]) || '';
    emit('deptSelect', deptId);
  } else {
    // 如果取消选择，传递空字符串表示查看所有
    emit('deptSelect', '');
  }
}

/**
 * 清除选择
 */
function clearSelection() {
  selectedKeys.value = [];
  emit('deptSelect', '');
}

/**
 * 树节点懒加载（目前一次性加载所有数据，所以直接resolve）
 */
const onLoadData: TreeProps['loadData'] = () => {
  return new Promise<void>((resolve) => {
    // 因为我们是一次性加载所有数据，所以这里直接resolve
    resolve();
  });
};

onMounted(() => {
  loadDeptData();
});
</script>

<template>
  <div class="h-full">
    <div class="mb-4 border-b border-gray-100 pb-3">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="flex items-center text-lg font-semibold text-gray-900">
          <span class="mr-2">🏢</span>
          部门列表
        </h3>
        <button
          v-if="selectedKeys.length > 0"
          class="rounded px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
          @click="clearSelection"
        >
          清除选择
        </button>
      </div>
      <p class="text-sm text-gray-500">点击部门节点筛选该部门下的用户</p>
    </div>

    <div class="relative">
      <Tree
        v-if="!loading && treeData && treeData.length > 0"
        v-model:expanded-keys="expandedKeys"
        v-model:selected-keys="selectedKeys"
        :tree-data="treeData"
        :load-data="onLoadData"
        show-line
        block-node
        show-icon
        :selectable="true"
        :multiple="false"
        :checkable="false"
        :auto-expand-parent="true"
        :default-expand-all="false"
        class="dept-tree"
        @select="onSelect"
      />

      <!-- 加载状态 -->
      <div v-if="loading" class="flex h-32 items-center justify-center">
        <div class="flex items-center space-x-2">
          <div
            class="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"
          ></div>
          <span class="text-sm text-gray-500">加载中...</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && (!treeData || treeData.length === 0)"
        class="flex h-32 flex-col items-center justify-center text-gray-500"
      >
        <div class="mb-2 text-4xl">📁</div>
        <p class="text-sm">暂无部门数据</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dept-tree {
  background: transparent;
  font-size: 14px;
}


/* 响应式优化 */
@media (max-width: 768px) {
  .dept-tree {
    font-size: 13px;
  }
}
</style>
