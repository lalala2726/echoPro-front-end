<script lang="ts" setup>
import type { SysUserType } from '#/api/system/user';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Card, Divider, message, Space } from 'ant-design-vue';

import UserSelect from '#/components/Select/UserSelect/index.vue';

// UserSelect组件引用
const singleSelectRef = ref<InstanceType<typeof UserSelect>>();
const multipleSelectRef = ref<InstanceType<typeof UserSelect>>();
const limitedSelectRef = ref<InstanceType<typeof UserSelect>>();
const bulkSelectRef = ref<InstanceType<typeof UserSelect>>();
const modalSelectRef = ref<InstanceType<typeof UserSelect>>();

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

// 单选处理
function handleSingleChange(users: SysUserType.UserListVo[]) {
  singleSelectedUserData.value = users;
}

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
  singleSelectRef.value?.closeSelector();
}

// 多选处理
function handleMultipleChange(users: SysUserType.UserListVo[]) {
  multipleSelectedUserData.value = users;
}

// 多选确认处理
function handleMultipleConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  multipleSelectedUserData.value = data.users;
  message.success(`已确认选择 ${data.users.length} 个用户`);
  // 自动关闭抽屉
  multipleSelectRef.value?.closeSelector();
}

// 限制数量多选处理
function handleLimitedChange(users: SysUserType.UserListVo[]) {
  limitedSelectedUserData.value = users;
}

// 限制数量多选确认处理
function handleLimitedConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  limitedSelectedUserData.value = data.users;
  message.success(`已确认选择 ${data.users.length} 个用户（限制3个）`);
  // 自动关闭抽屉
  limitedSelectRef.value?.closeSelector();
}

// 大量用户选择处理
function handleBulkChange(users: SysUserType.UserListVo[]) {
  bulkSelectedUserData.value = users;
}

// 大量用户选择确认处理
function handleBulkConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  bulkSelectedUserData.value = data.users;
  message.success(`已确认选择 ${data.users.length} 个用户（大量选择测试）`);
  // 自动关闭抽屉
  bulkSelectRef.value?.closeSelector();
}

// 模态框模式处理
function handleModalChange(users: SysUserType.UserListVo[]) {
  modalSelectedUserData.value = users;
}

// 模态框模式确认处理
function handleModalConfirm(data: {
  userIds: number[];
  users: SysUserType.UserListVo[];
}) {
  modalSelectedUserData.value = data.users;
  message.success(`模态框模式已确认选择 ${data.users.length} 个用户`);
  // 自动关闭抽屉
  modalSelectRef.value?.closeSelector();
}

// 取消选择回调处理
function handleCancel() {
  message.info('已取消选择');
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

    <!-- 单选示例 -->
    <Card class="mb-5" title="单选用户">
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm text-gray-600">选择一个用户（单选模式）</div>
          <UserSelect
            ref="singleSelectRef"
            v-model="singleSelectedUsers"
            :multiple="false"
            placeholder="请选择一个用户"
            @change="handleSingleChange"
            @confirm="handleSingleConfirm"
          />
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
          <UserSelect
            ref="multipleSelectRef"
            v-model="multipleSelectedUsers"
            :multiple="true"
            placeholder="请选择用户"
            @change="handleMultipleChange"
            @confirm="handleMultipleConfirm"
          />
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
          <UserSelect
            ref="limitedSelectRef"
            v-model="limitedSelectedUsers"
            :multiple="true"
            :max-count="3"
            placeholder="请选择用户（最多3个）"
            @change="handleLimitedChange"
            @confirm="handleLimitedConfirm"
          />
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
          <UserSelect
            ref="bulkSelectRef"
            v-model="bulkSelectedUsers"
            :multiple="true"
            :max-count="1000"
            placeholder="请选择用户（最多1000个）"
            @change="handleBulkChange"
            @confirm="handleBulkConfirm"
            @cancel="handleCancel"
          />
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
          <UserSelect
            ref="modalSelectRef"
            v-model="modalSelectedUsers"
            :multiple="true"
            :modal-mode="true"
            :width="600"
            :height="500"
            placeholder="请选择用户（模态框模式）"
            @change="handleModalChange"
            @confirm="handleModalConfirm"
            @cancel="handleCancel"
          />
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
</template>
