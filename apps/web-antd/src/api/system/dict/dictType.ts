import type { PageResult } from '@vben/types';

import type {
  DictTypeAddRequest,
  DictTypeQueryRequest,
  DictTypeUpdateRequest,
  DictTypeVo,
} from './types';

import { requestClient } from '#/api/request';

/**
 * 获取字典类型列表数据
 */
async function getDictTypeList(params: DictTypeQueryRequest) {
  return requestClient.get<PageResult<DictTypeVo[]>>('/system/dict/type/list', {
    params,
  });
}

/**
 * 创建字典
 * @param data 字典数据
 */
async function addDictType(data: DictTypeAddRequest) {
  return requestClient.post('/system/dict/type', data);
}

/**
 * 根据字典类型ID获取字典类型
 * @param id 字典类型ID
 */
async function getDictTypeById(id: string) {
  return requestClient.get<DictTypeVo>(`/system/dict/type/${id}`);
}

/**
 * 更新字典
 * @param data 字典数据
 */
async function updateDictType(data: DictTypeUpdateRequest) {
  return requestClient.put('/system/dict/type', data);
}

/**
 * 删除字典
 * @param dictId 字典ID
 */
async function deleteDictType(dictId: string) {
  return requestClient.delete(`/system/dict/type/${dictId}`);
}

export {
  addDictType,
  deleteDictType,
  getDictTypeById,
  getDictTypeList,
  updateDictType,
};
