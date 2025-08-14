import type { PageResult } from '@vben/types';

import type {
  DictDataAddRequest,
  DictDataQueryRequest,
  DictDataUpdateRequest,
  DictDataVo,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 获取字典值列表
 * @param dictType 字典类型
 * @param params
 */
async function getDictDataList(dictType: string, params: DictDataQueryRequest) {
  return requestClient.get<PageResult<DictDataVo[]>>(
    `/system/dict/data/${dictType}/list`,
    {
      params,
    },
  );
}

/**
 * 根据字典值ID获取字典值
 * @param id 字典值ID
 */
async function getDictDataById(id: string) {
  return requestClient.get<DictDataVo>(`/system/dict/data/${id}`);
}

/**
 * 修改字典值
 * @param data 字典值
 */
async function updateDictData(data: DictDataUpdateRequest) {
  return requestClient.put('/system/dict/data', data);
}

/**
 * 新增字典值
 * @param data 字典值数据
 */
async function addDictData(data: DictDataAddRequest) {
  return requestClient.post('/system/dict/data', data);
}

/**
 * 删除字典值
 * @param ids 字典值ID
 */
async function deleteDictData(ids: string[]) {
  return requestClient.delete(`/system/dict/data/${ids.join(',')}`);
}

/**
 * 刷新缓存
 */
async function refreshCache() {
  return requestClient.post('/system/dict/data/refreshCache');
}

export {
  addDictData,
  deleteDictData,
  getDictDataById,
  getDictDataList,
  refreshCache,
  updateDictData,
};
