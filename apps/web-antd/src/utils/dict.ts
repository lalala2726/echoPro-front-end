import { ref } from 'vue';

import { requestClient } from '#/api/request';

/**
 * 字典选项接口
 */
export interface DictOption {
  label: string;
  value: string;
}

// 字典数据缓存，存储已加载的字典数据的ref
const dictCache = new Map<string, ReturnType<typeof ref<DictOption[]>>>();

/**
 * 获取字典数据（返回响应式ref，使用缓存机制）
 * @param dictType 字典类型名称
 * @returns Ref<DictOption[]>
 */
export function getDictOptions(dictType: string) {
  // 检查缓存中是否已存在该字典类型的ref
  if (dictCache.has(dictType)) {
    const cachedRef = dictCache.get(dictType);
    if (cachedRef) {
      // 如果缓存的数据为空，重新加载
      if (cachedRef.value && cachedRef.value.length === 0) {
        loadDictData(dictType, cachedRef);
      }
      return cachedRef;
    }
  }

  // 创建新的响应式ref并缓存
  const options = ref<DictOption[]>([]);
  dictCache.set(dictType, options);

  // 异步加载数据
  loadDictData(dictType, options);
  return options;
}

/**
 * 异步加载字典数据
 */
async function loadDictData(dictType: string, options: any) {
  try {
    const response = await requestClient.get<DictOption[]>(
      `/system/dict/data/option/${dictType}`,
    );
    options.value = response || [];
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
    const response = await requestClient.get<DictOption[]>(
      `/system/dict/data/option/${dictType}`,
    );
    return response || [];
  } catch (error) {
    console.error(`获取字典数据异常:`, error);
    return [];
  }
}
