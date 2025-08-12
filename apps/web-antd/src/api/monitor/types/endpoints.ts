export namespace MonitorEndpointType {
  export interface EndpointStatsQueryRequest {
    /** HTTP方法 */
    method?: string;
    /** URI路径（支持模糊查询） */
    uri?: string;
    /** 端点路径（支持模糊查询） */
    endpoint?: string;
    /** 最小请求数过滤 */
    minRequestCount?: number;
    /** 最大平均响应时间过滤（毫秒） */
    maxAverageResponseTime?: number;
    /** 最小成功率过滤（百分比） */
    minSuccessRate?: number;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortDirection?: string;
  }

  export interface EndpointStatsDTO {
    /** 端点路径（方法 + URI） */
    endpoint?: string;
    /** HTTP方法 */
    method?: string;
    /** URI路径 */
    uri?: string;
    /** 请求总数 */
    requestCount?: number;
    /** 平均响应时间（毫秒） */
    averageResponseTime?: number;
    /** 最大响应时间（毫秒） */
    maxResponseTime?: number;
    /** 成功请求数（2xx状态码） */
    successCount?: number;
    /** 客户端错误请求数（4xx状态码） */
    clientErrorCount?: number;
    /** 服务器错误请求数（5xx状态码） */
    serverErrorCount?: number;
    /** 成功率（百分比） */
    successRate?: number;
    /** 每秒请求数（QPS） */
    qps?: number;
    /** 统计时间 */
    timestamp?: string;
  }

  export interface EndpointStatsOverview {
    /** 总端点数 */
    totalEndpoints?: number;
    /** 总请求数 */
    totalRequests?: number;
    /** 平均响应时间 */
    averageResponseTime?: number;
    /** 最慢的端点 */
    slowestEndpoint?: string;
    /** 最热门的端点 */
    hottestEndpoint?: string;
    /** 整体成功率 */
    overallSuccessRate?: number;
    /** 时间戳 */
    timestamp?: string;
  }
}
