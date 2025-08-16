import type { MonitorTypes } from './types/metrics';

import { requestClient } from '#/api/request';

/**
 * 获取系统监控指标
 */
async function getSystemMetrics() {
  return requestClient.get<MonitorTypes.SystemMetricsDTO>(
    '/monitor/metrics/system',
  );
}

/**
 * 获取JVM监控指标
 */
async function getJvmMetrics() {
  return requestClient.get<MonitorTypes.JvmMetricsDTO>('/monitor/metrics/jvm');
}

/**
 * 获取Redis监控指标
 */
async function getRedisMetrics() {
  return requestClient.get<MonitorTypes.RedisMetricsDTO>(
    '/monitor/metrics/redis',
  );
}

/**
 * 获取监控概览数据
 */
async function getMonitorOverview() {
  return requestClient.get<MonitorTypes.MonitorOverviewDTO>(
    '/monitor/metrics/overview',
  );
}

export { getJvmMetrics, getMonitorOverview, getRedisMetrics, getSystemMetrics };
