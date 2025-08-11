<script setup lang="ts">
import type { MessageNotification } from '@vben/websocket';

import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { createWebSocketService, useWebSocket } from '@vben/websocket';

import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  message,
  Select,
  SelectOption,
  Space,
  Statistic,
  Tag,
} from 'ant-design-vue';

// 使用解构赋值重命名以避免冲突
const { TextArea } = Input;

// 获取环境配置
const appConfig = useAppConfig(import.meta.env, import.meta.env.PROD);
const wsUrl = `${appConfig.backendURL || 'http://localhost:8080'}${appConfig.websocketPath || '/ws'}`;

// 创建独立的测试用 WebSocket 服务实例（不影响全局）
const service = createWebSocketService({
  url: wsUrl,
  debug: true,
  defaultSubscriptions: [],
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    interval: 3000,
  },
});

// WebSocket 相关状态
const {
  isConnected,
  isConnecting,
  error,
  subscribe,
  unsubscribe,
  send,
  connect,
  disconnect,
} = useWebSocket(service);

// 组件状态
const accessStore = useAccessStore();

// 配置
const wsConfig = ref({
  url: wsUrl,
});

// 订阅相关
const subscribeDestination = ref('/topic/message/new');
const subscriptions = ref<string[]>([]);

// 发送消息相关
const sendDestination = ref('/app/message');
const messageContent = ref('Hello, WebSocket!');
const messageType = ref('json');

// 统计数据
const sentCount = ref(0);
const receivedCount = ref(0);
const reconnectCount = ref(0);
const connectionStartTime = ref<Date | null>(null);
const connectionDuration = ref(0);

// 日志
interface LogEntry {
  type: 'error' | 'received' | 'sent' | 'system';
  message: string;
  timestamp: string;
}

const logs = ref<LogEntry[]>([]);
const logContainer = ref<HTMLElement>();

// 计算属性
const connectionStatus = computed(() => {
  if (isConnecting.value) {
    return { status: 'processing' as const, text: '连接中...' };
  }
  if (isConnected.value) {
    return { status: 'success' as const, text: '已连接' };
  }
  return { status: 'error' as const, text: '未连接' };
});

const connectionTime = computed(() => {
  if (!connectionStartTime.value) return '未连接';
  return `连接时间: ${connectionStartTime.value.toLocaleTimeString()}`;
});

const isLoggedIn = computed(() => {
  return !!accessStore.accessToken;
});

// 定时器
let durationTimer: NodeJS.Timeout | null = null;

// 方法
function addLog(type: LogEntry['type'], message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push({ type, message, timestamp });

  // 保持日志数量在合理范围内
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(-500);
  }

  // 自动滚动到底部
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
}

function getLogClass(type: LogEntry['type']) {
  const classes: Record<LogEntry['type'], string> = {
    system: 'text-blue-400',
    sent: 'text-green-400',
    received: 'text-yellow-400',
    error: 'text-red-400',
  };
  return classes[type];
}

function clearLogs() {
  logs.value = [];
  addLog('system', '日志已清空');
}

function startDurationTimer() {
  if (durationTimer) {
    clearInterval(durationTimer);
  }

  connectionStartTime.value = new Date();
  connectionDuration.value = 0;

  durationTimer = setInterval(() => {
    if (connectionStartTime.value) {
      connectionDuration.value = Math.floor(
        (Date.now() - connectionStartTime.value.getTime()) / 1000,
      );
    }
  }, 1000);
}

function stopDurationTimer() {
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  connectionStartTime.value = null;
  connectionDuration.value = 0;
}

async function handleConnect() {
  try {
    const token = accessStore.accessToken;
    if (!token) {
      addLog('error', '请先登录再进行连接测试');
      return;
    }

    addLog('system', `正在连接到: ${wsConfig.value.url}`);
    addLog('system', `使用令牌: ${token.slice(0, 10)}...`);

    // 使用 useWebSocket 的 connect 方法，这样状态会正确更新
    await connect(token);
    addLog('system', 'WebSocket 连接成功！');
    startDurationTimer();
  } catch (error_) {
    addLog('error', `连接失败: ${error_}`);
  }
}

function handleDisconnect() {
  try {
    // 使用 useWebSocket 的 disconnect 方法，这样状态会正确更新
    disconnect();
    subscriptions.value = [];
    addLog('system', '已断开连接');
    stopDurationTimer();
  } catch (error) {
    addLog('error', `断开连接失败: ${error}`);
  }
}

function handleSubscribe() {
  const dest = subscribeDestination.value;
  if (!dest) return;

  if (subscriptions.value.includes(dest)) {
    message.warning('已经订阅了该地址');
    return;
  }

  subscribe(dest, (msg: MessageNotification) => {
    receivedCount.value++;
    addLog('received', `[${dest}] ${JSON.stringify(msg, null, 2)}`);
  });

  subscriptions.value.push(dest);
  addLog('system', `已订阅: ${dest}`);
}

function handleUnsubscribe() {
  const dest = subscribeDestination.value;
  if (!dest) return;

  unsubscribe(dest);
  subscriptions.value = subscriptions.value.filter((sub) => sub !== dest);
  addLog('system', `已取消订阅: ${dest}`);
}

function handleUnsubscribeSpecific(destination: string) {
  unsubscribe(destination);
  subscriptions.value = subscriptions.value.filter(
    (sub) => sub !== destination,
  );
  addLog('system', `已取消订阅: ${destination}`);
}

function handleSendMessage() {
  if (!sendDestination.value || !messageContent.value) {
    message.warning('请填写发送地址和消息内容');
    return;
  }

  let messageBody: any;

  // 根据消息类型格式化消息
  switch (messageType.value) {
    case 'custom': {
      messageBody = messageContent.value;
      break;
    }
    case 'json': {
      try {
        messageBody = JSON.parse(messageContent.value);
      } catch {
        // 如果不是有效JSON，包装成对象
        messageBody = {
          content: messageContent.value,
          timestamp: new Date().toISOString(),
          sender: 'WebSocket Test Client',
        };
      }
      break;
    }
    default: {
      // text
      messageBody = {
        content: messageContent.value,
        timestamp: new Date().toISOString(),
        sender: 'WebSocket Test Client',
      };
      break;
    }
  }

  send(sendDestination.value, messageBody);
  sentCount.value++;
  addLog(
    'sent',
    `[${sendDestination.value}] ${JSON.stringify(messageBody, null, 2)}`,
  );
}

function sendQuickMessage(type: 'ping' | 'test') {
  const messages = {
    ping: { content: 'ping', timestamp: new Date().toISOString() },
    test: { content: '这是一条测试消息', timestamp: new Date().toISOString() },
  };

  messageContent.value = JSON.stringify(messages[type]);
  messageType.value = 'json';
  handleSendMessage();
}

async function triggerServerPush() {
  try {
    // 这里可以调用后端 API 触发服务器推送
    const response = await fetch('http://localhost:8080/api/test/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessStore.accessToken || '',
      },
      body: JSON.stringify({
        content: '这是服务器推送的测试消息',
        topic: '/topic/message/new',
      }),
    });

    if (response.ok) {
      addLog('system', '服务器推送触发成功');
    } else {
      addLog('error', '服务器推送触发失败');
    }
  } catch (error) {
    addLog('error', `服务器推送触发失败: ${error}`);
  }
}

// 生命周期
onMounted(() => {
  addLog('system', '页面已加载，准备进行 WebSocket 连接测试');

  // 设置 WebSocket 事件监听
  if (service) {
    service.on('connected', () => {
      addLog('system', 'WebSocket 服务连接成功');
    });

    service.on('disconnected', () => {
      addLog('system', 'WebSocket 服务连接断开');
      stopDurationTimer();
    });

    service.on('error', (error) => {
      addLog('error', `WebSocket 服务错误: ${error}`);
      reconnectCount.value++;
    });

    service.on('message', (message: MessageNotification) => {
      addLog('received', `[通知] ${JSON.stringify(message, null, 2)}`);
    });
  }
});

onUnmounted(() => {
  stopDurationTimer();
});
</script>

<template>
  <Page
    description="WebSocket 实时通信测试工具，集成 STOMP 协议，支持消息订阅和推送"
  >
    <div class="space-y-6">
      <!-- 连接状态和配置 -->
      <Card title="连接配置和状态">
        <div class="space-y-4">
          <!-- 连接配置 -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <div class="mb-2 text-sm font-medium">WebSocket 地址</div>
              <Input
                v-model:value="wsConfig.url"
                placeholder="WebSocket 服务地址"
                disabled
              />
            </div>
          </div>

          <!-- 连接状态 -->
          <div
            class="flex items-center justify-between rounded-lg bg-gray-50 p-4"
          >
            <div class="flex items-center space-x-4">
              <Badge
                :status="connectionStatus.status"
                :text="connectionStatus.text"
              />
              <span class="text-sm text-gray-600">{{ connectionTime }}</span>
            </div>
            <Space>
              <Button
                type="primary"
                :loading="isConnecting"
                :disabled="!isLoggedIn || isConnected"
                @click="handleConnect"
              >
                {{ isLoggedIn ? '连接' : '请先登录' }}
              </Button>
              <Button :disabled="!isConnected" @click="handleDisconnect">
                断开连接
              </Button>
            </Space>
          </div>

          <!-- 错误信息 -->
          <Alert
            v-if="error"
            :message="error"
            type="error"
            closable
            @close="error = null"
          />
        </div>
      </Card>

      <!-- 消息订阅和发送 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- 订阅配置 -->
        <Card title="消息订阅">
          <div class="space-y-4">
            <div>
              <div class="mb-2 text-sm font-medium">订阅地址</div>
              <Input
                v-model:value="subscribeDestination"
                placeholder="例如: /topic/message/new"
                :disabled="!isConnected"
              />
            </div>
            <Space>
              <Button
                type="primary"
                :disabled="!isLoggedIn || !isConnected || !subscribeDestination"
                @click="handleSubscribe"
              >
                订阅
              </Button>
              <Button
                :disabled="!isLoggedIn || !isConnected"
                @click="handleUnsubscribe"
              >
                取消订阅
              </Button>
            </Space>

            <!-- 订阅状态 -->
            <div v-if="subscriptions.length > 0" class="mt-4">
              <div class="mb-2 text-sm font-medium">当前订阅:</div>
              <div class="space-y-1">
                <Tag
                  v-for="sub in subscriptions"
                  :key="sub"
                  color="green"
                  closable
                  @close="handleUnsubscribeSpecific(sub)"
                >
                  {{ sub }}
                </Tag>
              </div>
            </div>
          </div>
        </Card>

        <!-- 发送消息 -->
        <Card title="发送消息">
          <div class="space-y-4">
            <div>
              <div class="mb-2 text-sm font-medium">发送地址</div>
              <Input
                v-model:value="sendDestination"
                placeholder="例如: /app/message"
                :disabled="!isConnected"
              />
            </div>
            <div>
              <div class="mb-2 text-sm font-medium">消息内容</div>
              <TextArea
                v-model:value="messageContent"
                :rows="3"
                placeholder="输入消息内容"
                :disabled="!isConnected"
              />
            </div>
            <div>
              <div class="mb-2 text-sm font-medium">消息类型</div>
              <Select v-model:value="messageType" class="w-full">
                <SelectOption value="text">文本消息</SelectOption>
                <SelectOption value="json">JSON 消息</SelectOption>
                <SelectOption value="custom">自定义格式</SelectOption>
              </Select>
            </div>
            <Button
              type="primary"
              block
              :disabled="
                !isLoggedIn ||
                !isConnected ||
                !sendDestination ||
                !messageContent
              "
              @click="handleSendMessage"
            >
              发送消息
            </Button>

            <!-- 快捷操作 -->
            <div class="mt-4">
              <div class="mb-2 text-sm font-medium">快捷操作:</div>
              <Space wrap>
                <Button size="small" @click="sendQuickMessage('ping')">
                  发送 Ping
                </Button>
                <Button size="small" @click="sendQuickMessage('test')">
                  测试消息
                </Button>
                <Button size="small" @click="triggerServerPush">
                  触发推送
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </div>

      <!-- 统计信息 -->
      <Card title="连接统计">
        <div class="grid grid-cols-4 gap-4 text-center">
          <Statistic title="连接时长" :value="connectionDuration" suffix="秒" />
          <Statistic title="发送消息" :value="sentCount" suffix="条" />
          <Statistic title="接收消息" :value="receivedCount" suffix="条" />
          <Statistic title="重连次数" :value="reconnectCount" suffix="次" />
        </div>
      </Card>

      <!-- 消息日志 -->
      <Card title="消息日志">
        <template #extra>
          <Button size="small" @click="clearLogs">清空日志</Button>
        </template>
        <div
          ref="logContainer"
          class="h-80 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-white"
        >
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="getLogClass(log.type)"
            class="mb-1"
          >
            <span class="text-gray-400">[{{ log.timestamp }}]</span>
            <span class="ml-2">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="text-center text-gray-500">
            暂无日志信息
          </div>
        </div>
      </Card>
    </div>
  </Page>
</template>
