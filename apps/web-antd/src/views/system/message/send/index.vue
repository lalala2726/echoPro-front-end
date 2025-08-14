<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemRoleApi } from '#/api/system/role';
import type { SysUserType } from '#/api/system/user';

import { computed, ref, watch } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Segmented,
} from 'ant-design-vue';

import {
  sendMessage,
  SystemMessageManageType,
} from '#/api/system/messageManage';
import AiEditor from '#/components/Editor/AiEditor.vue';
import { RoleSelect, UserSelect } from '#/components/Select';
import DeptSelect from '#/components/Select/DeptSelect/index.vue';

type SendMode = SystemMessageManageType.MessageSendMethod;

const sendMode = ref<SendMode>(SystemMessageManageType.MessageSendMethod.ALL);

const formModel = ref<{
  content: string;
  level: SystemMessageManageType.MessageLevel;
  receiveId: string[];
  title: string;
  type: SystemMessageManageType.MessageType;
}>({
  receiveId: [],
  title: '',
  type: SystemMessageManageType.MessageType.SYSTEM,
  level: SystemMessageManageType.MessageLevel.NORMAL,
  content: '',
});

const isSubmitting = ref(false);

// 已选择的显示选项
const selectedDisplayOptions = ref<
  Array<{ label: string; value: number | string }>
>([]);

// 抽屉：用于选择接收对象
const [SelectorDrawer, selectorDrawerApi] = useVbenDrawer({
  title: '选择接收对象',
  class: 'w-[70%]',
  footer: false,
});

// 切换发送方式时清空选择
watch(
  sendMode,
  () => {
    try {
      formModel.value.receiveId = [];
      selectedDisplayOptions.value = [];
      // 关闭抽屉（如果打开的话）
      selectorDrawerApi.close();
    } catch (error) {
      console.error('切换发送方式失败:', error);
    }
  },
  { immediate: false },
);

const receiveIdLabel = computed(() => {
  switch (sendMode.value) {
    case 'all': {
      return '接收对象';
    }
    case 'dept': {
      return '选择部门';
    }
    case 'role': {
      return '选择角色';
    }
    case 'user': {
      return '选择用户';
    }
    default: {
      throw new Error('无效的sendMode');
    }
  }
});

// 计算选中的数量，用于显示
const selectedCount = computed(() => selectedDisplayOptions.value.length);

// 打开选择抽屉
function openSelector() {
  selectorDrawerApi.setData({
    sendMode: sendMode.value,
    currentSelected: formModel.value.receiveId,
  });
  selectorDrawerApi.open();
}

// 用户选择确认
function handleUserConfirm(data: {
  userIds: string[];
  users: SysUserType.UserListVo[];
}) {
  try {
    if (data.users && Array.isArray(data.users)) {
      formModel.value.receiveId = data.userIds || [];
      selectedDisplayOptions.value = data.users.map((u) => ({
        label: u.username || `用户${u.userId}`,
        value: u.userId!,
      }));
    }
    selectorDrawerApi.close();
  } catch (error) {
    console.error('用户选择确认失败:', error);
    message.error('用户选择确认失败');
  }
}

// 角色选择确认
function handleRoleConfirm(data: {
  roleIds: string[];
  roles: SystemRoleApi.SystemRole[];
}) {
  try {
    if (data.roles && Array.isArray(data.roles)) {
      formModel.value.receiveId = data.roleIds || [];
      selectedDisplayOptions.value = data.roles.map((r) => ({
        label: r.roleName || `角色${r.id}`,
        value: r.id,
      }));
    }
    selectorDrawerApi.close();
  } catch (error) {
    console.error('角色选择确认失败:', error);
    message.error('角色选择确认失败');
  }
}

// 部门选择确认
function handleDeptConfirm(data: {
  deptIds: string[];
  depts: SystemDeptApi.SystemDept[];
}) {
  try {
    if (data.depts && Array.isArray(data.depts)) {
      formModel.value.receiveId = data.deptIds || [];
      selectedDisplayOptions.value = data.depts.map((d) => ({
        label: d.deptName || `部门${d.deptId}`,
        value: d.deptId,
      }));
    }
    selectorDrawerApi.close();
  } catch (error) {
    console.error('部门选择确认失败:', error);
    message.error('部门选择确认失败');
  }
}

// 提交发送
function onSubmit() {
  if (!formModel.value.title?.trim()) {
    message.warning('请输入消息标题');
    return;
  }
  if (!formModel.value.content?.trim()) {
    message.warning('请输入消息内容');
    return;
  }
  if (
    sendMode.value !== SystemMessageManageType.MessageSendMethod.ALL &&
    (formModel.value.receiveId?.length ?? 0) === 0
  ) {
    message.warning('请至少选择一个接收对象');
    return;
  }

  // 显示确认弹窗
  Modal.confirm({
    title: '确认发送消息',
    content: `确定要发送消息"${formModel.value.title}"吗？`,
    okText: '确认发送',
    cancelText: '取消',
    onOk: async () => {
      await doSendMessage();
    },
  });
}

// 实际发送消息
async function doSendMessage() {
  isSubmitting.value = true;
  const hide = message.loading({ content: '正在发送...', duration: 0 });
  try {
    const payload: SystemMessageManageType.SysSendMessageRequest = {
      receiveType: sendMode.value,
      receiveId:
        sendMode.value === SystemMessageManageType.MessageSendMethod.ALL
          ? []
          : (formModel.value.receiveId as any[]),
      message: {
        title: formModel.value.title,
        content: formModel.value.content,
        type: formModel.value.type,
        level: formModel.value.level,
      },
    };

    await sendMessage(payload);
    message.success('发送成功');

    // 重置表单
    formModel.value = {
      receiveId: [],
      title: '',
      type: SystemMessageManageType.MessageType.SYSTEM,
      level: SystemMessageManageType.MessageLevel.NORMAL,
      content: '',
    };
    sendMode.value = SystemMessageManageType.MessageSendMethod.ALL;
    selectedDisplayOptions.value = [];
  } catch (error) {
    console.error(error);
    message.error('发送失败');
  } finally {
    hide();
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <div class="mx-auto">
      <Card title="发送消息" bordered>
        <Form layout="vertical">
          <!-- 发送方式 -->
          <Form.Item label="发送方式">
            <Segmented
              v-model:value="sendMode"
              :options="[
                {
                  label: '全部用户',
                  value: SystemMessageManageType.MessageSendMethod.ALL,
                },
                {
                  label: '按用户',
                  value: SystemMessageManageType.MessageSendMethod.USER,
                },
                {
                  label: '按角色',
                  value: SystemMessageManageType.MessageSendMethod.ROLE,
                },
                {
                  label: '按部门',
                  value: SystemMessageManageType.MessageSendMethod.DEPT,
                },
              ]"
            />
          </Form.Item>

          <!-- 接收对象选择 -->
          <Form.Item
            v-if="sendMode !== SystemMessageManageType.MessageSendMethod.ALL"
            :key="`${sendMode}-receiver`"
          >
            <template #label>
              <span>{{ receiveIdLabel }}</span>
              <span v-if="selectedCount > 0" class="ml-2 text-sm text-gray-500">
                (已选择 {{ selectedCount }} 个)
              </span>
            </template>
            <div class="flex w-full gap-2">
              <!-- 自定义显示区域 -->
              <div class="selected-display flex-1">
                <template v-if="selectedDisplayOptions.length === 0">
                  <span class="text-gray-400">请选择接收对象</span>
                </template>
                <template v-else>
                  <!-- 显示前6个标签 -->
                  <span
                    v-for="option in selectedDisplayOptions.slice(0, 6)"
                    :key="option.value"
                    class="selected-tag"
                    :title="option.label"
                  >
                    {{ option.label }}
                  </span>
                  <!-- 显示剩余数量 -->
                  <span
                    v-if="selectedDisplayOptions.length > 6"
                    class="selected-count"
                  >
                    +{{ selectedDisplayOptions.length - 6 }}
                  </span>
                </template>
              </div>
              <Button type="primary" @click="openSelector">选择</Button>
            </div>
          </Form.Item>

          <!-- 消息标题 -->
          <Form.Item label="消息标题" required>
            <Input
              v-model:value="formModel.title"
              placeholder="请输入消息标题"
            />
          </Form.Item>

          <!-- 消息类型 -->
          <Form.Item label="消息类型" required>
            <Radio.Group v-model:value="formModel.type">
              <Radio :value="SystemMessageManageType.MessageType.SYSTEM">
                系统消息
              </Radio>
              <Radio :value="SystemMessageManageType.MessageType.NOTICE">
                通知消息
              </Radio>
              <Radio :value="SystemMessageManageType.MessageType.ANNOUNCEMENT">
                公告消息
              </Radio>
            </Radio.Group>
          </Form.Item>

          <!-- 消息级别 -->
          <Form.Item label="消息级别" required>
            <Radio.Group v-model:value="formModel.level">
              <Radio :value="SystemMessageManageType.MessageLevel.NORMAL">
                普通
              </Radio>
              <Radio :value="SystemMessageManageType.MessageLevel.IMPORTANT">
                重要
              </Radio>
              <Radio :value="SystemMessageManageType.MessageLevel.URGENT">
                紧急
              </Radio>
            </Radio.Group>
          </Form.Item>

          <!-- 消息内容 -->
          <Form.Item label="消息内容" required>
            <AiEditor
              v-model="formModel.content"
              :height="400"
              width="100%"
              placeholder="请输入消息内容..."
              content-format="html"
            />
          </Form.Item>

          <!-- 操作按钮 -->
          <div class="mt-4 flex justify-end gap-3">
            <Button type="primary" :loading="isSubmitting" @click="onSubmit">
              发送消息
            </Button>
          </div>
        </Form>
      </Card>
    </div>

    <!-- 选择抽屉 -->
    <SelectorDrawer :key="`drawer-${sendMode}`">
      <template v-if="sendMode === 'user'">
        <UserSelect
          v-model="formModel.receiveId as string[]"
          :multiple="true"
          placeholder="请选择用户"
          @confirm="handleUserConfirm"
          @cancel="() => selectorDrawerApi.close()"
        />
      </template>
      <template v-else-if="sendMode === 'role'">
        <RoleSelect
          v-model="formModel.receiveId as string[]"
          :multiple="true"
          placeholder="请选择角色"
          @confirm="handleRoleConfirm"
          @cancel="() => selectorDrawerApi.close()"
        />
      </template>
      <template v-else-if="sendMode === 'dept'">
        <DeptSelect
          v-model="formModel.receiveId as string[]"
          :multiple="true"
          placeholder="请选择部门"
          @confirm="handleDeptConfirm"
          @cancel="() => selectorDrawerApi.close()"
        />
      </template>
    </SelectorDrawer>
  </Page>
</template>

<style scoped>
/* 自定义显示区域样式 */
.selected-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px;
  font-size: 14px;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  max-width: 120px;
  padding: 2px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 20px;
  color: #595959;
  white-space: nowrap;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.selected-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: #595959;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>
