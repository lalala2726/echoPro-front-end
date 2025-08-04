import type { EChartsOption } from 'echarts';

import type { Ref } from 'vue';

import type { Nullable } from '@vben/types';

import type EchartsUI from './echarts-ui.vue';

import { computed, nextTick, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import {
  tryOnUnmounted,
  useDebounceFn,
  useResizeObserver,
  useTimeoutFn,
  useWindowSize,
} from '@vueuse/core';

import echarts from './echarts';

type EchartsUIType = typeof EchartsUI | undefined;

type EchartsThemeType = 'dark' | 'light' | null;

function useEcharts(chartRef: Ref<EchartsUIType>) {
  let chartInstance: echarts.ECharts | null = null;
  let cacheOptions: EChartsOption = {};
  let originalOptions: EChartsOption = {};

  const { isDark } = usePreferences();
  const { height, width } = useWindowSize();
  const resizeHandler: () => void = useDebounceFn(resize, 200);

  const getOptions = computed((): EChartsOption => {
    const baseOptions: EChartsOption = {
      // 禁用初始加载动画，图表直接显示在最终位置
      animation: false,
      // 启用数据更新动画，用于后续数据变化
      animationDurationUpdate: 600,
      animationEasingUpdate: 'cubicInOut',
      animationDelayUpdate: 0,
      // 强制设置动画阈值
      animationThreshold: 0,
    };

    if (!isDark.value) {
      return baseOptions;
    }

    return {
      ...baseOptions,
      backgroundColor: 'transparent',
    };
  });

  const initCharts = (t?: EchartsThemeType) => {
    const el = chartRef?.value?.$el;
    if (!el) {
      return;
    }
    chartInstance = echarts.init(el, t || isDark.value ? 'dark' : null, {
      renderer: 'canvas',
    });

    return chartInstance;
  };

  const renderEcharts = (
    options: EChartsOption,
    clear = true,
    enableAnimation = false,
  ): Promise<Nullable<echarts.ECharts>> => {
    originalOptions = options;
    const currentOptions = {
      ...options,
      ...getOptions.value,
      // Override animation based on parameter
      animation: enableAnimation,
    };
    cacheOptions = currentOptions;
    return new Promise((resolve) => {
      if (chartRef.value?.offsetHeight === 0) {
        useTimeoutFn(async () => {
          resolve(await renderEcharts(currentOptions));
        }, 30);
        return;
      }
      nextTick(() => {
        useTimeoutFn(() => {
          if (!chartInstance) {
            const instance = initCharts();
            if (!instance) return;
          }
          clear && chartInstance?.clear();

          // Add a small delay to ensure proper animation initialization
          useTimeoutFn(() => {
            chartInstance?.setOption(currentOptions, {
              notMerge: clear,
              lazyUpdate: false,
              silent: false,
            });
            resolve(chartInstance);
          }, 10);
        }, 30);
      });
    });
  };

  function resize() {
    chartInstance?.resize({
      animation: {
        duration: 300,
        easing: 'quadraticIn',
      },
    });
  }

  watch([width, height], () => {
    resizeHandler?.();
  });

  useResizeObserver(chartRef as never, resizeHandler);

  watch(isDark, () => {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
      // 延迟重新初始化，确保主题切换完成
      useTimeoutFn(() => {
        initCharts();
        // Re-render with original options to ensure proper merging with new theme
        renderEcharts(originalOptions);
        resize();
      }, 50);
    }
  });

  tryOnUnmounted(() => {
    // 销毁实例，释放资源
    chartInstance?.dispose();
  });
  const updateData = (newData: any) => {
    if (chartInstance && cacheOptions) {
      // Enable animation for data updates
      const updateOptions = {
        ...cacheOptions,
        animation: true,
        animationDuration: 600,
        animationEasing: 'cubicInOut',
      };

      // Update the series data
      if (updateOptions.series && Array.isArray(updateOptions.series)) {
        updateOptions.series.forEach((series: any, index: number) => {
          if (newData[index]) {
            series.data = newData[index];
          }
        });
      }

      chartInstance.setOption(updateOptions, {
        notMerge: false,
        lazyUpdate: false,
      });
    }
  };

  return {
    renderEcharts,
    resize,
    updateData,
    getChartInstance: () => chartInstance,
  };
}

export { useEcharts };

export type { EchartsUIType };
