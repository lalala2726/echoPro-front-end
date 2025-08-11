<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemPostApi } from '#/api/system/post';
import type { SystemRoleApi } from '#/api/system/role';
import type { SysUserType } from '#/api/system/user';

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Button, Card, Divider, message, Space } from 'ant-design-vue';

import DeptSelect from '#/components/Select/DeptSelect/index.vue';
import PostSelect from '#/components/Select/PostSelect/index.vue';
import RoleSelect from '#/components/Select/RoleSelect/index.vue';
import UserSelect from '#/components/Select/UserSelect/index.vue';

// 单选示例
const singleSelectedUsers = ref<number[]>([]);
const singleSelectedUserData = ref<SysUserType.UserListVo[]>([]);

// 多选示例
const multipleSelectedUsers = ref<number[]>([]);
const multipleSelectedUserData = ref<SysUserType.UserListVo[]>([]);

// 限制数量的多选示例
const limitedSelectedUsers = ref<number[]>([]);
const limitedSelectedUserData = ref<SysUserType.UserListVo[]>([]);

// 大量用户选择示例（测试溢出处理）
const bulkSelectedUsers = ref<number[]>([]);
const bulkSelectedUserData = ref<SysUserType.UserListVo[]>([]);

// 模态框模式示例
const modalSelectedUsers = ref<number[]>([]);
const modalSelectedUserData = ref<SysUserType.UserListVo[]>([]);

// 角色选择示例
// 单选角色示例
const singleSelectedRoles = ref<string[]>([]);
const singleSelectedRoleData = ref<SystemRoleApi.SystemRole[]>([]);

// 多选角色示例
const multipleSelectedRoles = ref<string[]>([]);
const multipleSelectedRoleData = ref<SystemRoleApi.SystemRole[]>([]);

// 限制数量的多选角色示例
const limitedSelectedRoles = ref<string[]>([]);
const limitedSelectedRoleData = ref<SystemRoleApi.SystemRole[]>([]);

// 大量角色选择示例
const bulkSelectedRoles = ref<string[]>([]);
const bulkSelectedRoleData = ref<SystemRoleApi.SystemRole[]>([]);

// 部门选择示例
// 单选部门示例
const singleSelectedDepts = ref<string[]>([]);
const singleSelectedDeptData = ref<SystemDeptApi.SystemDept[]>([]);

// 多选部门示例
const multipleSelectedDepts = ref<string[]>([]);
const multipleSelectedDeptData = ref<SystemDeptApi.SystemDept[]>([]);

// 限制数量的多选部门示例
const limitedSelectedDepts = ref<string[]>([]);
const limitedSelectedDeptData = ref<SystemDeptApi.SystemDept[]>([]);

// 大量部门选择示例
const bulkSelectedDepts = ref<string[]>([]);
const bulkSelectedDeptData = ref<SystemDeptApi.SystemDept[]>([]);

// 岗位选择示例
// 单选岗位示例
const singleSelectedPosts = ref<number[]>([]);
const singleSelectedPostData = ref<SystemPostApi.SysPost[]>([]);

// 多选岗位示例
const multipleSelectedPosts = ref<number[]>([]);
const multipleSelectedPostData = ref<SystemPostApi.SysPost[]>([]);

// 限制数量的多选岗位示例
const limitedSelectedPosts = ref<number[]>([]);
const limitedSelectedPostData = ref<SystemPostApi.SysPost[]>([]);

// 大量岗位选择示例
const bulkSelectedPosts = ref<number[]>([]);
const bulkSelectedPostData = ref<SystemPostApi.SysPost[]>([]);

// 模态框角色示例
const modalSelectedRoles = ref<string[]>([]);
const modalSelectedRoleData = ref<SystemRoleApi.SystemRole[]>([]);

// 抽屉配置（隐藏默认底部按钮，避免与子组件重复；高度占满视口）
const [SingleDrawer, singleDrawerApi] = useVbenDrawer({
  title: '选择用户（单选模式）',
  class: 'w-[60vw] h-[100vh]',
  footer: false,
});

const [MultipleDrawer, multipleDrawerApi] = useVbenDrawer({
  title: '选择用户（多选模式）',
  class: 'w-[60vw] h-[100vh]',
  footer: false,
});

const [LimitedDrawer, limitedDrawerApi] = useVbenDrawer({
  title: '选择用户（限制3个）',
  class: 'w-[60vw] h-[100vh]',
  footer: false,
});

const [BulkDrawer, bulkDrawerApi] = useVbenDrawer({
  title: '选择用户（大量选择测试）',
  class: 'w-[60vw] h-[100vh]',
  footer: false,
});

// 模态框配置
const [ModalDialog, modalApi] = useVbenModal({
  title: '选择用户（模态框模式）',
  class: 'w-[600px] h-[500px]',
});

// 角色选择抽屉配置
const [SingleRoleDrawer, singleRoleDrawerApi] = useVbenDrawer({
  title: '选择角色（单选模式）',
  class: 'w-[60%]',
  footer: false,
});

const [MultipleRoleDrawer, multipleRoleDrawerApi] = useVbenDrawer({
  class: 'w-[60%]',
  title: '选择角色（多选模式）',
  footer: false,
});

const [LimitedRoleDrawer, limitedRoleDrawerApi] = useVbenDrawer({
  title: '选择角色（限制数量）',
  class: 'w-[60%]',
  footer: false,
});

const [BulkRoleDrawer, bulkRoleDrawerApi] = useVbenDrawer({
  title: '选择角色（大量选择）',
  class: 'w-[60%]',
  footer: false,
});

// 角色模态框配置
const [RoleModalDialog, roleModalApi] = useVbenModal({
  title: '选择角色（模态框模式）',
  class: 'w-[60%]',
});

// 部门选择抽屉配置
const [SingleDeptDrawer, singleDeptDrawerApi] = useVbenDrawer({
  title: '选择部门（单选模式）',
  class: 'w-[60%]',
  footer: false,
});

const [MultipleDeptDrawer, multipleDeptDrawerApi] = useVbenDrawer({
  title: '选择部门（多选模式）',
  class: 'w-[60%]',
  footer: false,
});

const [LimitedDeptDrawer, limitedDeptDrawerApi] = useVbenDrawer({
  title: '选择部门（限制数量）',
  class: 'w-[60%]',
  footer: false,
});

const [BulkDeptDrawer, bulkDeptDrawerApi] = useVbenDrawer({
  title: '选择部门（大量选择）',
  class: 'w-[60%]',
  footer: false,
});

// 岗位选择抽屉配置
const [SinglePostDrawer, singlePostDrawerApi] = useVbenDrawer({
  title: '选择岗位（单选模式）',
  class: 'w-[60%]',
  footer: false,
});

const [MultiplePostDrawer, multiplePostDrawerApi] = useVbenDrawer({
  title: '选择岗位（多选模式）',
  class: 'w-[60%]',
  footer: false,
});

const [LimitedPostDrawer, limitedPostDrawerApi] = useVbenDrawer({
  title: '选择岗位（限制数量）',
  class: 'w-[60%]',
  footer: false,
});

const [BulkPostDrawer, bulkPostDrawerApi] = useVbenDrawer({
  title: '选择岗位（大量选择）',
  class: 'w-[60%]',
  footer: false,
});

// 单选确认处理
function handleSingleConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  singleSelectedUserData.value = data.users;
  if (data.users.length > 0 && data.users[0]?.username) {
    message.success(`已确认选择用户: ${data.users[0].username}`);
  }
  // 自动关闭抽屉
  singleDrawerApi.close();
}

// 多选确认处理
function handleMultipleConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  multipleSelectedUserData.value = data.users;
  message.success(`已确认选择 ${data.users.length} 个用户`);
  // 自动关闭抽屉
  multipleDrawerApi.close();
}

// 限制数量多选确认处理
function handleLimitedConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  limitedSelectedUserData.value = data.users;
  message.success(`已确认选择 ${data.users.length} 个用户（限制3个）`);
  // 自动关闭抽屉
  limitedDrawerApi.close();
}

// 大量用户选择确认处理
function handleBulkConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  bulkSelectedUserData.value = data.users;
  message.success(`已确认选择 ${data.users.length} 个用户（大量选择测试）`);
  // 自动关闭抽屉
  bulkDrawerApi.close();
}

// 模态框模式确认处理
function handleModalConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  modalSelectedUserData.value = data.users;
  message.success(`模态框模式已确认选择 ${data.users.length} 个用户`);
  // 自动关闭模态框
  modalApi.close();
}

// 取消选择回调处理
function handleCancel() {
  message.info('已取消选择');
}

// 角色选择确认处理函数
// 单选角色确认处理
function handleSingleRoleConfirm(data: {
  roleIds: string[];
  roles: SystemRoleApi.SystemRole[];
}) {
  singleSelectedRoleData.value = data.roles;
  message.success(`已确认选择角色: ${data.roles[0]?.roleName || '未知角色'}`);
  singleRoleDrawerApi.close();
}

// 多选角色确认处理
function handleMultipleRoleConfirm(data: {
  roleIds: string[];
  roles: SystemRoleApi.SystemRole[];
}) {
  multipleSelectedRoleData.value = data.roles;
  message.success(`已确认选择 ${data.roles.length} 个角色`);
  multipleRoleDrawerApi.close();
}

// 限制数量多选角色确认处理
function handleLimitedRoleConfirm(data: {
  roleIds: string[];
  roles: SystemRoleApi.SystemRole[];
}) {
  limitedSelectedRoleData.value = data.roles;
  message.success(`已确认选择 ${data.roles.length} 个角色（限制最多3个）`);
  limitedRoleDrawerApi.close();
}

// 大量角色选择确认处理
function handleBulkRoleConfirm(data: {
  roleIds: string[];
  roles: SystemRoleApi.SystemRole[];
}) {
  bulkSelectedRoleData.value = data.roles;
  message.success(`已确认选择 ${data.roles.length} 个角色（支持大量选择）`);
  bulkRoleDrawerApi.close();
}

// 模态框角色确认处理
function handleRoleModalConfirm(data: {
  roleIds: string[];
  roles: SystemRoleApi.SystemRole[];
}) {
  modalSelectedRoleData.value = data.roles;
  message.success(`已确认选择 ${data.roles.length} 个角色（模态框模式）`);
  roleModalApi.close();
}

// 部门选择确认处理函数
// 单选部门确认处理
function handleSingleDeptConfirm(data: {
  deptIds: string[];
  depts: SystemDeptApi.SystemDept[];
}) {
  singleSelectedDeptData.value = data.depts;
  message.success(`已确认选择部门: ${data.depts[0]?.deptName || '未知部门'}`);
  singleDeptDrawerApi.close();
}

// 多选部门确认处理
function handleMultipleDeptConfirm(data: {
  deptIds: string[];
  depts: SystemDeptApi.SystemDept[];
}) {
  multipleSelectedDeptData.value = data.depts;
  message.success(`已确认选择 ${data.depts.length} 个部门`);
  multipleDeptDrawerApi.close();
}

// 限制数量多选部门确认处理
function handleLimitedDeptConfirm(data: {
  deptIds: string[];
  depts: SystemDeptApi.SystemDept[];
}) {
  limitedSelectedDeptData.value = data.depts;
  message.success(`已确认选择 ${data.depts.length} 个部门（限制最多3个）`);
  limitedDeptDrawerApi.close();
}

// 大量部门选择确认处理
function handleBulkDeptConfirm(data: {
  deptIds: string[];
  depts: SystemDeptApi.SystemDept[];
}) {
  bulkSelectedDeptData.value = data.depts;
  message.success(`已确认选择 ${data.depts.length} 个部门（支持大量选择）`);
  bulkDeptDrawerApi.close();
}

// 岗位选择确认处理函数
// 单选岗位确认处理
function handleSinglePostConfirm(data: {
  postIds: number[];
  posts: SystemPostApi.SysPost[];
}) {
  singleSelectedPostData.value = data.posts;
  message.success(`已确认选择岗位: ${data.posts[0]?.postName || '未知岗位'}`);
  singlePostDrawerApi.close();
}

// 多选岗位确认处理
function handleMultiplePostConfirm(data: {
  postIds: number[];
  posts: SystemPostApi.SysPost[];
}) {
  multipleSelectedPostData.value = data.posts;
  message.success(`已确认选择 ${data.posts.length} 个岗位`);
  multiplePostDrawerApi.close();
}

// 限制数量多选岗位确认处理
function handleLimitedPostConfirm(data: {
  postIds: number[];
  posts: SystemPostApi.SysPost[];
}) {
  limitedSelectedPostData.value = data.posts;
  message.success(`已确认选择 ${data.posts.length} 个岗位（限制最多3个）`);
  limitedPostDrawerApi.close();
}

// 大量岗位选择确认处理
function handleBulkPostConfirm(data: {
  postIds: number[];
  posts: SystemPostApi.SysPost[];
}) {
  bulkSelectedPostData.value = data.posts;
  message.success(`已确认选择 ${data.posts.length} 个岗位（支持大量选择）`);
  bulkPostDrawerApi.close();
}

// 清空所有选择
function clearAllSelections() {
  singleSelectedUsers.value = [];
  singleSelectedUserData.value = [];
  multipleSelectedUsers.value = [];
  multipleSelectedUserData.value = [];
  limitedSelectedUsers.value = [];
  limitedSelectedUserData.value = [];
  bulkSelectedUsers.value = [];
  bulkSelectedUserData.value = [];
  modalSelectedUsers.value = [];
  modalSelectedUserData.value = [];
  message.success('已清空所有选择');
}

// 获取选择结果
function getSelectionResults() {
  const results = {
    single: {
      userIds: singleSelectedUsers.value,
      users: singleSelectedUserData.value,
    },
    multiple: {
      userIds: multipleSelectedUsers.value,
      users: multipleSelectedUserData.value,
    },
    limited: {
      userIds: limitedSelectedUsers.value,
      users: limitedSelectedUserData.value,
    },
  };

  console.log('所有选择结果:', results);
  message.info('选择结果已输出到控制台');
}
</script>

<template>
  <Page description="演示用户选择组件的各种使用方式" title="用户选择组件演示">
    <!-- 操作按钮 -->
    <Card class="mb-5" title="操作">
      <Space>
        <Button @click="getSelectionResults">获取选择结果</Button>
        <Button @click="clearAllSelections">清空所有选择</Button>
      </Space>
    </Card>

    <!-- 角色选择器演示 -->
    <Card title="角色选择器组件演示" class="mb-6">
      <div class="space-y-4">
        <!-- 角色选择示例 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- 单选角色 -->
          <div class="space-y-2">
            <h4 class="font-medium">单选角色</h4>
            <Button type="primary" @click="singleRoleDrawerApi.open()">
              打开角色选择器（单选）
            </Button>
            <div
              v-if="singleSelectedRoleData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ singleSelectedRoleData[0]?.roleName }}
            </div>
          </div>

          <!-- 多选角色 -->
          <div class="space-y-2">
            <h4 class="font-medium">多选角色</h4>
            <Button type="primary" @click="multipleRoleDrawerApi.open()">
              打开角色选择器（多选）
            </Button>
            <div
              v-if="multipleSelectedRoleData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ multipleSelectedRoleData.length }} 个角色
            </div>
          </div>

          <!-- 限制数量多选角色 -->
          <div class="space-y-2">
            <h4 class="font-medium">限制数量多选角色</h4>
            <Button type="primary" @click="limitedRoleDrawerApi.open()">
              选择角色（最多3个）
            </Button>
            <div
              v-if="limitedSelectedRoleData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ limitedSelectedRoleData.length }}/3 个角色
            </div>
          </div>

          <!-- 大量角色选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">大量角色选择</h4>
            <Button type="primary" @click="bulkRoleDrawerApi.open()">
              选择角色（最多100个）
            </Button>
            <div
              v-if="bulkSelectedRoleData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ bulkSelectedRoleData.length }}/100 个角色
            </div>
          </div>

          <!-- 模态框模式角色选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">模态框模式角色选择</h4>
            <Button type="primary" @click="roleModalApi.open()">
              打开角色选择器（模态框）
            </Button>
            <div
              v-if="modalSelectedRoleData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ modalSelectedRoleData.length }} 个角色
            </div>
          </div>
        </div>

        <Divider />

        <!-- 角色选择器说明 -->
        <div class="space-y-4 text-sm">
          <div>
            <strong>基本用法:</strong>
            <pre
              class="mt-1 rounded bg-gray-100 p-2 text-xs"
            ><code>&lt;RoleSelect v-model="selectedRoles" @confirm="handleConfirm" /&gt;</code></pre>
          </div>

          <div>
            <strong>属性说明:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li><code>v-model</code>: 绑定选中的角色ID数组（string[]）</li>
              <li><code>multiple</code>: 是否多选，默认为 true</li>
              <li><code>max-count</code>: 最大选择数量，默认为 1000</li>
              <li><code>placeholder</code>: 占位符文本</li>
            </ul>
          </div>

          <div>
            <strong>事件说明:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>
                <code>@confirm</code>: 确认选择时触发，参数为 { roleIds, roles }
              </li>
              <li><code>@cancel</code>: 取消选择时触发</li>
            </ul>
          </div>

          <div>
            <strong>功能特性:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>✅ 角色名称、角色标识、描述、状态等字段展示</li>
              <li>✅ 支持按角色名称、状态筛选</li>
              <li>✅ 跨页选择记忆功能</li>
              <li>✅ 智能全选（尊重数量限制）</li>
              <li>✅ 实时选择反馈和验证</li>
              <li>✅ 响应式设计，支持抽屉和模态框模式</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>

    <!-- 部门选择演示 -->
    <Card class="mb-5" title="部门选择组件演示">
      <div class="space-y-6">
        <!-- 部门选择器演示网格 -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- 单选部门选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">单选部门选择</h4>
            <Button type="primary" @click="singleDeptDrawerApi.open()">
              选择部门（单选）
            </Button>
            <div
              v-if="singleSelectedDeptData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ singleSelectedDeptData[0]?.deptName }}
            </div>
          </div>

          <!-- 多选部门选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">多选部门选择</h4>
            <Button type="primary" @click="multipleDeptDrawerApi.open()">
              选择部门（多选）
            </Button>
            <div
              v-if="multipleSelectedDeptData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ multipleSelectedDeptData.length }} 个部门
            </div>
          </div>

          <!-- 限制数量的多选部门选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">限制数量多选</h4>
            <Button type="primary" @click="limitedDeptDrawerApi.open()">
              选择部门（最多3个）
            </Button>
            <div
              v-if="limitedSelectedDeptData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ limitedSelectedDeptData.length }}/3 个部门
            </div>
          </div>

          <!-- 大量部门选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">大量部门选择</h4>
            <Button type="primary" @click="bulkDeptDrawerApi.open()">
              选择部门（最多50个）
            </Button>
            <div
              v-if="bulkSelectedDeptData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ bulkSelectedDeptData.length }}/50 个部门
            </div>
          </div>
        </div>

        <Divider />

        <!-- 部门选择器说明 -->
        <div class="space-y-4 text-sm">
          <div>
            <strong>基本用法:</strong>
            <pre
              class="mt-1 rounded bg-gray-100 p-2 text-xs"
            ><code>&lt;DeptSelect v-model="selectedDepts" @confirm="handleConfirm" /&gt;</code></pre>
          </div>

          <div>
            <strong>属性说明:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li><code>v-model</code>: 绑定选中的部门ID数组（string[]）</li>
              <li><code>multiple</code>: 是否多选，默认为 true</li>
              <li><code>max-count</code>: 最大选择数量，默认为 1000</li>
              <li><code>placeholder</code>: 占位符文本</li>
              <li><code>show-search</code>: 是否显示搜索框，默认为 true</li>
              <li><code>allow-clear</code>: 是否可清空，默认为 true</li>
            </ul>
          </div>

          <div>
            <strong>事件说明:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>
                <code>@confirm</code>: 确认选择时触发，参数为 { deptIds, depts }
              </li>
              <li><code>@cancel</code>: 取消选择时触发</li>
            </ul>
          </div>

          <div>
            <strong>功能特性:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>✅ 树形结构展示部门层级关系</li>
              <li>✅ 支持按部门名称、负责人搜索</li>
              <li>✅ 展开/折叠节点功能</li>
              <li>✅ 部门路径显示</li>
              <li>✅ 状态标识（启用/禁用）</li>
              <li>✅ 响应式设计，支持抽屉和模态框模式</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>

    <!-- 岗位选择器演示 -->
    <Card title="岗位选择器组件演示" class="mb-6">
      <div class="space-y-4">
        <!-- 岗位选择示例 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- 单选岗位 -->
          <div class="space-y-2">
            <h4 class="font-medium">单选岗位</h4>
            <Button type="primary" @click="singlePostDrawerApi.open()">
              选择岗位（单选）
            </Button>
            <div
              v-if="singleSelectedPostData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ singleSelectedPostData[0]?.postName }}
            </div>
          </div>

          <!-- 多选岗位选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">多选岗位选择</h4>
            <Button type="primary" @click="multiplePostDrawerApi.open()">
              选择岗位（多选）
            </Button>
            <div
              v-if="multipleSelectedPostData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ multipleSelectedPostData.length }} 个岗位
            </div>
          </div>

          <!-- 限制数量的多选岗位选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">限制数量多选</h4>
            <Button type="primary" @click="limitedPostDrawerApi.open()">
              选择岗位（最多3个）
            </Button>
            <div
              v-if="limitedSelectedPostData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ limitedSelectedPostData.length }}/3 个岗位
            </div>
          </div>

          <!-- 大量岗位选择 -->
          <div class="space-y-2">
            <h4 class="font-medium">大量岗位选择</h4>
            <Button type="primary" @click="bulkPostDrawerApi.open()">
              选择岗位（最多50个）
            </Button>
            <div
              v-if="bulkSelectedPostData.length > 0"
              class="text-sm text-gray-600"
            >
              已选择: {{ bulkSelectedPostData.length }}/50 个岗位
            </div>
          </div>
        </div>

        <Divider />

        <!-- 岗位选择器说明 -->
        <div class="space-y-4 text-sm">
          <div>
            <strong>基本用法:</strong>
            <pre
              class="mt-1 rounded bg-gray-100 p-2 text-xs"
            ><code>&lt;PostSelect v-model="selectedPosts" @confirm="handleConfirm" /&gt;</code></pre>
          </div>

          <div>
            <strong>属性说明:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li><code>v-model</code>: 绑定选中的岗位ID数组（number[]）</li>
              <li><code>multiple</code>: 是否多选，默认为 true</li>
              <li><code>max-count</code>: 最大选择数量，默认为 1000</li>
              <li><code>placeholder</code>: 占位符文本</li>
              <li><code>show-search</code>: 是否显示搜索框，默认为 true</li>
              <li><code>allow-clear</code>: 是否可清空，默认为 true</li>
            </ul>
          </div>

          <div>
            <strong>事件说明:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>
                <code>@confirm</code>: 确认选择时触发，参数为 { postIds, posts }
              </li>
              <li><code>@cancel</code>: 取消选择时触发</li>
            </ul>
          </div>

          <div>
            <strong>功能特性:</strong>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>✅ 岗位名称、岗位编码、状态、排序等字段展示</li>
              <li>✅ 支持按岗位名称、岗位编码搜索</li>
              <li>✅ 状态标识（正常/停用）</li>
              <li>✅ 排序显示</li>
              <li>✅ 响应式设计，支持抽屉和模态框模式</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>

    <!-- 单选示例 -->
    <Card class="mb-5" title="单选用户">
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm text-gray-600">选择一个用户（单选模式）</div>
          <Button type="primary" @click="singleDrawerApi.open()">
            打开用户选择器（单选）
          </Button>
        </div>

        <Divider />

        <div v-if="singleSelectedUserData.length > 0">
          <div class="mb-2 text-sm font-medium">已选择用户信息:</div>
          <div class="rounded bg-gray-50 p-3">
            <div
              v-for="user in singleSelectedUserData"
              :key="user.userId"
              class="text-sm"
            >
              <div><strong>用户名:</strong> {{ user.username }}</div>
              <div><strong>昵称:</strong> {{ user.nickname || '--' }}</div>
              <div><strong>部门:</strong> {{ user.deptName || '--' }}</div>
              <div><strong>手机号:</strong> {{ user.phone || '--' }}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 多选示例 -->
    <Card class="mb-5" title="多选用户">
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm text-gray-600">
            选择多个用户（默认最多10个）
          </div>
          <Button type="primary" @click="multipleDrawerApi.open()">
            打开用户选择器（多选）
          </Button>
        </div>

        <Divider />

        <div v-if="multipleSelectedUserData.length > 0">
          <div class="mb-2 text-sm font-medium">
            已选择用户 ({{ multipleSelectedUserData.length }}/10):
          </div>
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="user in multipleSelectedUserData"
              :key="user.userId"
              class="rounded border bg-white p-3 text-sm"
            >
              <div>
                <strong>{{ user.username }}</strong>
              </div>
              <div class="text-gray-600">{{ user.nickname || '--' }}</div>
              <div class="text-gray-500">{{ user.deptName || '--' }}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 限制数量的多选示例 -->
    <Card class="mb-5" title="限制数量多选">
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm text-gray-600">最多选择3个用户</div>
          <Button type="primary" @click="limitedDrawerApi.open()">
            打开用户选择器（限制3个）
          </Button>
        </div>

        <Divider />

        <div v-if="limitedSelectedUserData.length > 0">
          <div class="mb-2 text-sm font-medium">
            已选择用户 ({{ limitedSelectedUserData.length }}/3):
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="user in limitedSelectedUserData"
              :key="user.userId"
              class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
            >
              {{ user.username }}
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 大量用户选择示例（测试两列布局和性能） -->
    <Card class="mb-5" title="大量用户选择（两列布局测试）">
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm text-gray-600">
            选择大量用户测试新的两列布局和性能优化（最多1000个用户）
          </div>
          <Button type="primary" @click="bulkDrawerApi.open()">
            打开用户选择器（大量选择测试）
          </Button>
        </div>

        <Divider />

        <div v-if="bulkSelectedUserData.length > 0">
          <div class="mb-2 text-sm font-medium">
            已选择用户 ({{ bulkSelectedUserData.length }}/1000):
          </div>
          <div class="space-y-1 text-xs text-gray-500">
            <div>✅ 左侧面板：VxeGrid表格显示所有用户，支持搜索和分页</div>
            <div>✅ 右侧面板：卡片式显示已选择用户，支持滚动和性能优化</div>
            <div>✅ 超过100个用户时启用虚拟滚动优化</div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 模态框模式示例 -->
    <Card class="mb-5" title="模态框模式">
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm text-gray-600">
            使用模态框模式的用户选择（响应式设计）
          </div>
          <Button type="primary" @click="modalApi.open()">
            打开用户选择器（模态框模式）
          </Button>
        </div>

        <Divider />

        <div v-if="modalSelectedUserData.length > 0">
          <div class="mb-2 text-sm font-medium">
            已选择用户 ({{ modalSelectedUserData.length }}):
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="user in modalSelectedUserData"
              :key="user.userId"
              class="rounded bg-green-100 px-2 py-1 text-sm text-green-800"
            >
              {{ user.username }}
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 使用说明 -->
    <Card title="使用说明">
      <div class="space-y-3 text-sm">
        <div>
          <strong>基本用法:</strong>
          <pre
            class="mt-1 rounded bg-gray-100 p-2 text-xs"
          ><code>&lt;UserSelect v-model="selectedUsers" @change="handleChange" /&gt;</code></pre>
        </div>

        <div>
          <strong>属性说明:</strong>
          <ul class="mt-1 list-disc space-y-1 pl-5">
            <li><code>v-model</code>: 绑定选中的用户ID数组</li>
            <li><code>multiple</code>: 是否多选，默认为 true</li>
            <li><code>max-count</code>: 最大选择数量，默认为 1000</li>
            <li><code>placeholder</code>: 占位符文本</li>
            <li>
              <code>modal-mode</code>: 是否使用模态框模式，默认为
              false（抽屉模式）
            </li>
            <li><code>width</code>: 容器宽度，默认为 '800px'</li>
            <li><code>height</code>: 容器高度，默认为 '600px'</li>
          </ul>
        </div>

        <div>
          <strong>事件说明:</strong>
          <ul class="mt-1 list-disc space-y-1 pl-5">
            <li>
              <code>@change</code>: 选择变化时触发，参数为选中的用户对象数组
            </li>
            <li>
              <code>@confirm</code>: 确认选择时触发，参数为 { userIds, users }
            </li>
            <li><code>@cancel</code>: 取消选择时触发</li>
          </ul>
        </div>

        <div>
          <strong>🎨 精致左右两列布局设计（优雅分隔）:</strong>
          <ul class="mt-1 list-disc space-y-1 pl-5">
            <li>
              ✅
              左侧面板（58%）：VxeGrid用户表格，圆角边框设计，支持搜索、分页（20条/页）
            </li>
            <li>✅ 右侧面板（38%）：已选择用户展示，简洁卡片布局</li>
            <li>
              ✅ 🎯 优雅分隔：6px间距 + 圆角边框 + 阴影效果，清晰区分功能区域
            </li>
            <li>✅ 🎨 精致设计：移除蓝色背景，统一白色主题，提升视觉和谐度</li>
            <li>✅ 📊 进度指示：渐变进度条和精美计数标签</li>
            <li>✅ 🔧 修复跨页选择：选择累积而非覆盖，支持多页选择</li>
            <li>✅ 🔧 增强Clear All：清空所有页面选择，同步复选框状态</li>
            <li>✅ 🆕 用户状态字段：新增状态筛选和显示，支持启用/禁用状态</li>
            <li>✅ 🔔 选择反馈：Toast通知提供实时选择、移除、清空反馈</li>
            <li>✅ 🔧 修复确认按钮：确保界面正确关闭并返回选择结果</li>
            <li>✅ 现代卡片设计：单列布局，更大间距，悬停效果优化</li>
            <li>✅ 性能优化：支持最多1000个用户，超过100个启用虚拟滚动</li>
            <li>✅ 交互优化：移除折叠按钮，简化操作，悬停效果、平滑滚动</li>
            <li>✅ 增强的回调系统：支持确认和取消回调</li>
            <li>✅ 响应式设计：支持抽屉和模态框两种模式</li>
          </ul>
        </div>

        <div>
          <strong>方法说明:</strong>
          <ul class="mt-1 list-disc space-y-1 pl-5">
            <li><code>openSelector()</code>: 打开用户选择器</li>
            <li><code>clearSelection()</code>: 清空选择</li>
          </ul>
        </div>
      </div>
    </Card>
  </Page>

  <!-- 抽屉组件 -->
  <SingleDrawer>
    <UserSelect
      v-model="singleSelectedUsers"
      :multiple="false"
      placeholder="请选择一个用户"
      @confirm="handleSingleConfirm"
    />
  </SingleDrawer>

  <MultipleDrawer>
    <UserSelect
      v-model="multipleSelectedUsers"
      :multiple="true"
      placeholder="请选择用户"
      @confirm="handleMultipleConfirm"
    />
  </MultipleDrawer>

  <LimitedDrawer>
    <UserSelect
      v-model="limitedSelectedUsers"
      :multiple="true"
      :max-count="3"
      placeholder="请选择用户（最多3个）"
      @confirm="handleLimitedConfirm"
    />
  </LimitedDrawer>

  <BulkDrawer>
    <UserSelect
      v-model="bulkSelectedUsers"
      :multiple="true"
      :max-count="1000"
      placeholder="请选择用户（最多1000个）"
      @confirm="handleBulkConfirm"
      @cancel="handleCancel"
    />
  </BulkDrawer>

  <!-- 模态框组件 -->
  <ModalDialog>
    <UserSelect
      v-model="modalSelectedUsers"
      :multiple="true"
      placeholder="请选择用户（模态框模式）"
      @confirm="handleModalConfirm"
      @cancel="handleCancel"
    />
  </ModalDialog>

  <!-- 角色选择抽屉组件 -->
  <SingleRoleDrawer>
    <RoleSelect
      v-model="singleSelectedRoles"
      :multiple="false"
      placeholder="请选择一个角色"
      @confirm="handleSingleRoleConfirm"
    />
  </SingleRoleDrawer>

  <MultipleRoleDrawer>
    <RoleSelect
      v-model="multipleSelectedRoles"
      :multiple="true"
      placeholder="请选择角色"
      @confirm="handleMultipleRoleConfirm"
    />
  </MultipleRoleDrawer>

  <LimitedRoleDrawer>
    <RoleSelect
      v-model="limitedSelectedRoles"
      :multiple="true"
      :max-count="3"
      placeholder="请选择角色（最多3个）"
      @confirm="handleLimitedRoleConfirm"
    />
  </LimitedRoleDrawer>

  <BulkRoleDrawer>
    <RoleSelect
      v-model="bulkSelectedRoles"
      :multiple="true"
      :max-count="100"
      placeholder="请选择角色（最多100个）"
      @confirm="handleBulkRoleConfirm"
      @cancel="handleCancel"
    />
  </BulkRoleDrawer>

  <!-- 角色模态框组件 -->
  <RoleModalDialog>
    <RoleSelect
      v-model="modalSelectedRoles"
      :multiple="true"
      placeholder="请选择角色（模态框模式）"
      @confirm="handleRoleModalConfirm"
      @cancel="handleCancel"
    />
  </RoleModalDialog>

  <!-- 部门选择抽屉组件 -->
  <SingleDeptDrawer>
    <DeptSelect
      v-model="singleSelectedDepts"
      :multiple="false"
      placeholder="请选择一个部门"
      @confirm="handleSingleDeptConfirm"
    />
  </SingleDeptDrawer>

  <MultipleDeptDrawer>
    <DeptSelect
      v-model="multipleSelectedDepts"
      :multiple="true"
      placeholder="请选择部门"
      @confirm="handleMultipleDeptConfirm"
    />
  </MultipleDeptDrawer>

  <LimitedDeptDrawer>
    <DeptSelect
      v-model="limitedSelectedDepts"
      :multiple="true"
      :max-count="3"
      placeholder="请选择部门（最多3个）"
      @confirm="handleLimitedDeptConfirm"
    />
  </LimitedDeptDrawer>

  <BulkDeptDrawer>
    <DeptSelect
      v-model="bulkSelectedDepts"
      :multiple="true"
      :max-count="50"
      placeholder="请选择部门（最多50个）"
      @confirm="handleBulkDeptConfirm"
      @cancel="handleCancel"
    />
  </BulkDeptDrawer>

  <!-- 岗位选择抽屉组件 -->
  <SinglePostDrawer>
    <PostSelect
      v-model="singleSelectedPosts"
      :multiple="false"
      placeholder="请选择一个岗位"
      @confirm="handleSinglePostConfirm"
    />
  </SinglePostDrawer>

  <MultiplePostDrawer>
    <PostSelect
      v-model="multipleSelectedPosts"
      :multiple="true"
      placeholder="请选择岗位"
      @confirm="handleMultiplePostConfirm"
    />
  </MultiplePostDrawer>

  <LimitedPostDrawer>
    <PostSelect
      v-model="limitedSelectedPosts"
      :multiple="true"
      :max-count="3"
      placeholder="请选择岗位（最多3个）"
      @confirm="handleLimitedPostConfirm"
    />
  </LimitedPostDrawer>

  <BulkPostDrawer>
    <PostSelect
      v-model="bulkSelectedPosts"
      :multiple="true"
      :max-count="50"
      placeholder="请选择岗位（最多50个）"
      @confirm="handleBulkPostConfirm"
      @cancel="handleCancel"
    />
  </BulkPostDrawer>
</template>
