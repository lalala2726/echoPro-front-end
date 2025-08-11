import { getWebSocketService } from '../connection';
import { registerMessageSubscription } from './message';

// 存储所有订阅的清理函数
let subscriptionCleanupFunctions: Array<() => void> = [];

/**
 * 注册应用层所有实时消息订阅
 * 在 WebSocket 连接成功后调用
 */
export function registerAppSubscriptions() {
  const service = getWebSocketService();

  if (!service.isConnected) {
    console.warn('[RealTime] WebSocket 未连接，跳过订阅注册');
    return;
  }

  // 清理之前的订阅（如果有）
  cleanupAppSubscriptions();

  console.log('[RealTime] 开始注册应用订阅...');

  // 注册新消息订阅
  const messageCleanup = registerMessageSubscription(service);
  subscriptionCleanupFunctions.push(messageCleanup);

  // 这里可以继续添加其他业务订阅
  // const otherCleanup = registerOtherSubscription(service);
  // subscriptionCleanupFunctions.push(otherCleanup);

  console.log(
    `[RealTime] 已注册 ${subscriptionCleanupFunctions.length} 个订阅`,
  );
}

/**
 * 清理所有应用订阅
 * 在 WebSocket 断开连接或重连前调用
 */
export function cleanupAppSubscriptions() {
  if (subscriptionCleanupFunctions.length > 0) {
    console.log(
      `[RealTime] 清理 ${subscriptionCleanupFunctions.length} 个订阅`,
    );
    subscriptionCleanupFunctions.forEach((cleanup) => cleanup());
    subscriptionCleanupFunctions = [];
  }
}

/**
 * 获取当前订阅状态
 */
export function getSubscriptionStatus() {
  return {
    subscriptionCount: subscriptionCleanupFunctions.length,
    isActive: subscriptionCleanupFunctions.length > 0,
  };
}
