import type { PageResult } from '@vben/types';

import type { MonitorEndpointType } from '#/api/monitor/types/endpoints';

import { requestClient } from '#/api/request';

/**
 * 获取端点统计数据
 * @param params 查询参数
 */
async function getEndpointStats(
  params: MonitorEndpointType.EndpointStatsQueryRequest,
) {
  return requestClient.get<PageResult<MonitorEndpointType.EndpointStatsDTO[]>>(
    '/monitor/endpoints/list',
    { params },
  );
}

/**
 * 获取端点统计数据概览
 */
async function getEndpointStatsOverview() {
  return requestClient.get<MonitorEndpointType.EndpointStatsOverview>(
    '/monitor/endpoints/overview',
  );
}

export { getEndpointStats, getEndpointStatsOverview };
