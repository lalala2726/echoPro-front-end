export namespace MonitorTypes {
  /**
   * 系统监控指标DTO
   */
  export interface SystemMetricsDTO {
    /** 采集时间 */
    timestamp?: string;
    /** CPU信息 */
    cpu?: SystemMetricsDTO.CpuMetrics;
    /** 内存信息 */
    memory?: SystemMetricsDTO.MemoryMetrics;
    /** 磁盘信息 */
    disks?: SystemMetricsDTO.DiskMetrics[];
    /** 系统信息 */
    systemInfo?: SystemMetricsDTO.SystemInfo;
  }

  export namespace SystemMetricsDTO {
    export interface CpuMetrics {
      /** CPU名称 */
      name?: string;
      /** CPU使用率（百分比） */
      usage?: number;
      /** 逻辑处理器数量 */
      logicalProcessorCount?: number;
      /** 物理处理器数量 */
      physicalProcessorCount?: number;
      /** 物理包数量 */
      physicalPackageCount?: number;
      /** CPU频率（Hz） */
      frequency?: number;
      /** 最大频率（Hz） */
      maxFrequency?: number;
      /** 各核心使用率 */
      coreUsages?: number[];
      /** 系统负载平均值（1分钟） */
      loadAverage1m?: number;
      /** 系统负载平均值（5分钟） */
      loadAverage5m?: number;
      /** 系统负载平均值（15分钟） */
      loadAverage15m?: number;
    }

    export interface MemoryMetrics {
      /** 总内存（字节） */
      total?: number;
      /** 已用内存（字节） */
      used?: number;
      /** 可用内存（字节） */
      available?: number;
      /** 内存使用率（百分比） */
      usage?: number;
      /** 交换内存总量（字节） */
      swapTotal?: number;
      /** 已用交换内存（字节） */
      swapUsed?: number;
      /** 交换内存使用率（百分比） */
      swapUsage?: number;
    }

    export interface DiskMetrics {
      /** 磁盘名称 */
      name?: string;
      /** 挂载点 */
      mountPoint?: string;
      /** 文件系统类型 */
      fileSystem?: string;
      /** 总空间（字节） */
      total?: number;
      /** 已用空间（字节） */
      used?: number;
      /** 可用空间（字节） */
      available?: number;
      /** 使用率（百分比） */
      usage?: number;
      /** 读取速度（字节/秒） */
      readRate?: number;
      /** 写入速度（字节/秒） */
      writeRate?: number;
    }

    export interface SystemInfo {
      /** 操作系统名称 */
      osName?: string;
      /** 操作系统版本 */
      osVersion?: string;
      /** 操作系统架构 */
      osArch?: string;
      /** 系统启动时间 */
      bootTime?: string;
      /** 系统运行时间（秒） */
      uptime?: number;
      /** 进程数量 */
      processCount?: number;
      /** 线程数量 */
      threadCount?: number;
    }
  }

  export interface JvmMetricsDTO {
    /** 采集时间 */
    timestamp?: string;
    /** JVM基本信息 */
    jvmInfo?: JvmMetricsDTO.JvmInfo;
    /** 内存指标 */
    memory?: JvmMetricsDTO.MemoryMetrics;
    /** 垃圾回收指标 */
    gc?: JvmMetricsDTO.GcMetrics[];
    /** 线程指标 */
    threads?: JvmMetricsDTO.ThreadMetrics;
    /** 类加载指标 */
    classLoading?: JvmMetricsDTO.ClassLoadingMetrics;
  }

  export namespace JvmMetricsDTO {
    export interface JvmInfo {
      /** JVM名称 */
      name?: string;
      /** JVM版本 */
      version?: string;
      /** JVM供应商 */
      vendor?: string;
      /** Java版本 */
      javaVersion?: string;
      /** Java主目录 */
      javaHome?: string;
      /** JVM启动时间 */
      startTime?: string;
      /** JVM运行时间（毫秒） */
      uptime?: number;
      /** JVM参数 */
      inputArguments?: string[];
    }
    export interface MemoryMetrics {
      /** 堆内存 */
      heap?: MemoryMetrics.MemoryPool;
      /** 非堆内存 */
      nonHeap?: MemoryMetrics.MemoryPool;
      /** 内存池详情 */
      memoryPools?: {
        [key: string]: MemoryMetrics.MemoryPool;
      };
      /** 直接内存 */
      directMemory?: MemoryMetrics.DirectMemory;
    }

    export namespace MemoryMetrics {
      export interface MemoryPool {
        /** 已使用内存（字节） */
        used?: number;
        /** 已提交内存（字节） */
        committed?: number;
        /** 最大内存（字节） */
        max?: number;
        /** 初始内存（字节） */
        init?: number;
        /** 使用率（百分比） */
        usage?: number;
      }

      export interface DirectMemory {
        /** 已使用直接内存（字节） */
        used?: number;
        /** 最大直接内存（字节） */
        max?: number;
        /** 使用率（百分比） */
        usage?: number;
      }
    }

    export interface GcMetrics {
      /** GC名称 */
      name?: string;
      /** GC次数 */
      collectionCount?: number;
      /** GC总时间（毫秒） */
      collectionTime?: number;
      /** 平均GC时间（毫秒） */
      averageCollectionTime?: number;
      /** 内存池名称 */
      memoryPoolNames?: string[];
    }

    export interface ThreadMetrics {
      /** 当前线程数 */
      threadCount?: number;
      /** 守护线程数 */
      daemonThreadCount?: number;
      /** 峰值线程数 */
      peakThreadCount?: number;
      /** 总启动线程数 */
      totalStartedThreadCount?: number;
      /** 死锁线程数 */
      deadlockedThreadCount?: number;
      /** 线程状态统计 */
      threadStates?: {
        [key: string]: number;
      };
    }

    export interface ClassLoadingMetrics {
      /** 当前加载的类数量 */
      loadedClassCount?: number;
      /** 总加载的类数量 */
      totalLoadedClassCount?: number;
      /** 卸载的类数量 */
      unloadedClassCount?: number;
    }
  }

  export interface RedisMetricsDTO {
    /** 采集时间 */
    timestamp?: string;
    /** Redis基本信息 */
    info?: RedisMetricsDTO.RedisInfo;
    /** 内存指标 */
    memory?: RedisMetricsDTO.MemoryMetrics;
    /** 连接指标 */
    connections?: RedisMetricsDTO.ConnectionMetrics;
    /** 命令统计 */
    commandStats?: RedisMetricsDTO.CommandStats;
    /** 键空间统计 */
    keyspace?: {
      [key: string]: RedisMetricsDTO.KeyspaceStats;
    };
    /** 性能指标 */
    performance?: RedisMetricsDTO.PerformanceMetrics;
  }

  export namespace RedisMetricsDTO {
    export interface RedisInfo {
      /** Redis版本 */
      version?: string;
      /** Redis模式 */
      mode?: string;
      /** 运行时间（秒） */
      uptimeInSeconds?: number;
      /** 运行时间（天） */
      uptimeInDays?: number;
      /** 服务器时间 */
      serverTime?: string;
      /** 进程ID */
      processId?: number;
      /** TCP端口 */
      tcpPort?: number;
      /** 配置文件路径 */
      configFile?: string;
    }

    export interface MemoryMetrics {
      /** 已使用内存（字节） */
      usedMemory?: number;
      /** 已使用内存（人类可读） */
      usedMemoryHuman?: string;
      /** RSS内存（字节） */
      usedMemoryRss?: number;
      /** 峰值内存（字节） */
      usedMemoryPeak?: number;
      /** 峰值内存（人类可读） */
      usedMemoryPeakHuman?: string;
      /** Lua脚本内存（字节） */
      usedMemoryLua?: number;
      /** 内存碎片率 */
      memFragmentationRatio?: number;
      /** 最大内存（字节） */
      maxMemory?: number;
      /** 最大内存策略 */
      maxMemoryPolicy?: string;
    }

    export interface ConnectionMetrics {
      /** 当前连接数 */
      connectedClients?: number;
      /** 最大连接数 */
      maxClients?: number;
      /** 阻塞的客户端数 */
      blockedClients?: number;
      /** 总连接数 */
      totalConnectionsReceived?: number;
      /** 拒绝的连接数 */
      rejectedConnections?: number;
    }

    export interface CommandStats {
      /** 总命令数 */
      totalCommandsProcessed?: number;
      /** 每秒命令数 */
      instantaneousOpsPerSec?: number;
      /** 命令详细统计 */
      commands?: {
        [key: string]: CommandStats.CommandStat;
      };
    }

    export namespace CommandStats {
      export interface CommandStat {
        /** 调用次数 */
        calls?: number;
        /** 总耗时（微秒） */
        usec?: number;
        /** 平均耗时（微秒） */
        usecPerCall?: number;
      }
    }

    export interface KeyspaceStats {
      /** 键数量 */
      keys?: number;
      /** 过期键数量 */
      expires?: number;
      /** 平均TTL */
      avgTtl?: number;
    }

    export interface PerformanceMetrics {
      /** 键命中次数 */
      keyspaceHits?: number;
      /** 键未命中次数 */
      keyspaceMisses?: number;
      /** 命中率（百分比） */
      hitRate?: number;
      /** 过期键数量 */
      expiredKeys?: number;
      /** 淘汰键数量 */
      evictedKeys?: number;
      /** 网络输入字节数 */
      totalNetInputBytes?: number;
      /** 网络输出字节数 */
      totalNetOutputBytes?: number;
      /** 每秒网络输入字节数 */
      instantaneousInputKbps?: number;
      /** 每秒网络输出字节数 */
      instantaneousOutputKbps?: number;
    }
  }

  export interface MonitorOverviewDTO {
    /** JVM概览 */
    jvm?: MonitorOverviewDTO.JvmOverview;
    /** Spring概览 */
    springOverview?: SpringOverview;
    /** 系统概览 */
    system?: MonitorOverviewDTO.SystemOverview;
    /** Redis概览 */
    redis?: MonitorOverviewDTO.RedisOverview;
  }

  export namespace MonitorOverviewDTO {
    /**
     * JVM概览
     */
    export interface JvmOverview {
      /** GC次数 */
      gcCount?: string;
      /** 堆内存使用率（百分比） */
      heapUsage?: number;
      /** 非堆内存使用率（百分比） */
      nonHeapUsage?: number;
      /** 线程数 */
      threadCount?: number;
      /** 采集时间 */
      timestamp?: string;
    }

    export interface SystemOverview {
      /** CPU使用率（百分比） */
      cpuUsage?: number;
      /** 内存使用率（百分比） */
      memoryUsage?: number;
      /** 磁盘数量 */
      diskCount?: number;
      /** 采集时间 */
      timestamp?: string;
    }
    export interface RedisOverview {
      /** 连接的客户端数 */
      connectedClients?: number;
      /** 已使用内存（人类可读） */
      usedMemory?: string;
      /** 每秒操作数 */
      opsPerSec?: number;
      /** 命中率（百分比） */
      hitRate?: number;
      /** 采集时间 */
      timestamp?: string;
    }
  }
}

export interface SpringOverview {
  /** 应用名称 */
  name?: string;
  /** 启动时间 */
  startTime?: string;
  /** 运行时间(毫秒) */
  uptime?: number;
  /** 活跃配置文件 */
  activeProfiles?: string[];
}
