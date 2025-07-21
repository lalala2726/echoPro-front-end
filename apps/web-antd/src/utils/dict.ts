import { ref } from 'vue';

import { requestClient } from '#/api/request';

/**
 * 字典选项接口
 */
export interface DictOption {
  label: string;
  value: string;
}

/**
 * 字典API响应接口
 */
export interface DictApiResponse {
  code: number;
  data: DictOption[];
  message: string;
  timestamp: string;
}

/**
 * 获取字典数据（返回响应式ref，每次都从后端获取）
 * @param dictType 字典类型名称
 * @returns Ref<DictOption[]>
 */
export function getDictOptions(dictType: string) {
  // 创建响应式ref
  const options = ref<DictOption[]>([]);
  // 异步加载数据
  loadDictData(dictType, options);
  return options;
}

/**
 * 异步加载字典数据
 */
async function loadDictData(dictType: string, options: any) {
  try {
    const response = await requestClient.get<DictApiResponse>(
      `/system/dict/data/option/${dictType}`,
    );
    if (response.code === 200) {
      options.value = response.data || [];
    } else {
      console.warn(`获取字典数据失败: ${response.message || '未知错误'}`);
      options.value = [];
    }
  } catch (error) {
    console.error(`获取字典数据异常:`, error);
    options.value = [];
  }
}

/**
 * 同步获取字典数据（用于cellRender等需要普通数组的场景）
 * @param dictType 字典类型名称
 * @returns Promise<DictOption[]>
 */
export async function getDictOptionsSync(
  dictType: string,
): Promise<DictOption[]> {
  try {
    const response = await requestClient.get<DictApiResponse>(
      `/system/dict/data/option/${dictType}`,
    );
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.warn(`获取字典数据失败: ${response.message || '未知错误'}`);
      return [];
    }
  } catch (error) {
    console.error(`获取字典数据异常:`, error);
    return [];
  }
}
