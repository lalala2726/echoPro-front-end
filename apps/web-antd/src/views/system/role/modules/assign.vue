<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue';

import type { SystemRole } from '#/api/system/role/types';

import { reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Empty, message, Space, Spin, Tag, Tree } from 'ant-design-vue';

import {
  getPermissionByRoleId,
  updateRolePermission as updateRolePermissionApi,
} from '#/api/system/role/role';

interface MenuTreeNode {
  id: string;
  key: string;
  title: string;
  icon?: string;
  type: 'button' | 'catalog' | 'link' | 'menu';
  children?: MenuTreeNode[];
}

const emit = defineEmits(['success']);
const loading = ref<boolean>(false);
const roleData = ref<SystemRole>();
const treeData = ref<MenuTreeNode[]>([]);
const checkedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const isExpanded = ref(false);

// 角色信息
const roleInfo = reactive({
  roleName: '',
  roleKey: '',
});

const [Drawer, drawerApi] = useVbenDrawer({
  title: '分配权限',
  class: 'w-[30%]',
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRole>();
      roleData.value = data;
      roleInfo.roleName = data.roleName || '';
      roleInfo.roleKey = data.roleKey || '';
      loadPermissionData(data.id);
    }
  },
});

// 加载权限数据
async function loadPermissionData(roleId: string) {
  if (!roleId) {
    message.error('角色ID不能为空');
    return;
  }

  loading.value = true;
  try {
    // 获取角色权限数据
    const rolePermissionRes = await getPermissionByRoleId(roleId);

    // 设置菜单树数据 - 使用API返回的sysMenuTree字段
    if (
      rolePermissionRes?.sysMenuTree &&
      Array.isArray(rolePermissionRes.sysMenuTree)
    ) {
      // 转换数据格式，添加key字段
      const transformTreeData = (nodes: any[]): MenuTreeNode[] => {
        return nodes.map((node) => ({
          ...node,
          key: node.id,
          children: node.children
            ? transformTreeData(node.children)
            : undefined,
        }));
      };

      treeData.value = transformTreeData(rolePermissionRes.sysMenuTree);
      // 默认展开一级菜单
      expandedKeys.value = rolePermissionRes.sysMenuTree.map((item) => item.id);
    }

    // 设置已选中的权限
    if (rolePermissionRes?.selectedMenuId) {
      checkedKeys.value = rolePermissionRes.selectedMenuId;
    }
  } catch {
    message.error('获取权限数据失败');
  } finally {
    loading.value = false;
  }
}

// 获取菜单类型名称
function getMenuTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    catalog: '目录',
    menu: '菜单',
    button: '按钮',
    link: '链接',
    embedded: '内嵌',
  };
  return typeMap[type] || type;
}

// 获取菜单类型颜色
function getMenuTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    catalog: 'blue',
    menu: 'green',
    button: 'orange',
    link: 'purple',
    embedded: 'cyan',
  };
  return colorMap[type] || 'default';
}

// 获取默认图标
function getDefaultIcon(type: string): string {
  const iconMap: Record<string, string> = {
    catalog: 'carbon:folder',
    menu: 'carbon:document',
    button: 'carbon:list',
    link: 'carbon:link',
    embedded: 'carbon:application-web',
  };
  return iconMap[type] || 'carbon:menu';
}

// 获取所有节点的key
function getAllNodeKeys(nodes: MenuTreeNode[]): string[] {
  const keys: string[] = [];

  function traverse(nodeList: MenuTreeNode[]) {
    nodeList.forEach((node) => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(nodes);
  return keys;
}

// 处理展开/收起
function handleExpand() {
  expandedKeys.value = isExpanded.value ? [] : getAllNodeKeys(treeData.value);
  isExpanded.value = !isExpanded.value;
}

// 处理全选/反选
function handleSelectAll() {
  const allKeys = getAllNodeKeys(treeData.value);
  checkedKeys.value =
    checkedKeys.value.length === allKeys.length ? [] : allKeys;
}

// 处理树节点选中
const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
  checkedKeys.value = Array.isArray(checkedKeysValue)
    ? checkedKeysValue.map(String)
    : (checkedKeysValue.checked || []).map(String);
};

// 保存权限分配
async function handleSave() {
  if (!roleData.value?.id) {
    message.error('角色ID不能为空');
    return;
  }

  loading.value = true;
  try {
    await updateRolePermissionApi({
      roleId: roleData.value.id,
      allocatedMenuId: checkedKeys.value,
    });

    message.success(`${roleData.value?.roleName} 角色权限分配成功`);
    emit('success');
    await drawerApi.close();
  } catch (error) {
    console.error('权限设置失败', error);
  } finally {
    loading.value = false;
  }
}

// 关闭抽屉
function handleClose() {
  drawerApi.close();
}
</script>

<template>
  <Drawer>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          分配权限
        </h3>
        <Space>
          <Button type="primary" size="small" @click="handleExpand">
            {{ isExpanded ? '收起' : '展开' }}
          </Button>
          <Button type="default" size="small" @click="handleSelectAll">
            全选/反选
          </Button>
        </Space>
      </div>
    </template>

    <Spin :spinning="loading">
      <div class="flex h-full flex-col">
        <!-- 角色信息 -->
        <div
          class="flex gap-6 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-center">
            <span class="mr-2 text-sm text-gray-600 dark:text-gray-300">
              角色名称：
            </span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ roleInfo.roleName }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="mr-2 text-sm text-gray-600 dark:text-gray-300">
              权限标识：
            </span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ roleInfo.roleKey }}
            </span>
          </div>
        </div>

        <!-- 提示信息 -->
        <div
          class="border-b border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
        >
          <span>
            勾选父节点会自动选择所有子节点，取消父节点也会取消所有子节点
          </span>
        </div>

        <!-- 权限树 -->
        <div class="flex-1 overflow-y-auto p-4">
          <Tree
            v-if="treeData && treeData.length > 0"
            v-model:checked-keys="checkedKeys"
            v-model:expanded-keys="expandedKeys"
            :checkable="true"
            :check-strictly="false"
            :tree-data="treeData"
            :field-names="{ children: 'children', title: 'title', key: 'id' }"
            class="bg-transparent"
            @check="onCheck"
          >
            <template #title="{ title, icon, type }">
              <span class="flex min-w-0 items-center gap-2">
                <IconifyIcon
                  :icon="icon || getDefaultIcon(type)"
                  class="flex-shrink-0 text-base"
                />
                <span
                  class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  >{{ title }}
                </span>
                <Tag :color="getMenuTypeColor(type)" size="small">
                  {{ getMenuTypeName(type) }}
                </Tag>
              </span>
            </template>
          </Tree>

          <Empty v-else description="暂无权限数据" />
        </div>
      </div>
    </Spin>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button @click="handleClose">取消</Button>
        <Button type="primary" :loading="loading" @click="handleSave">
          保存
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
/* 自定义滚动条样式 */
:deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 6px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
  background: #a1a1a1;
}
</style>
