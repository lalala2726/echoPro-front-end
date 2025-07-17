import type { BaseType, PageResult, Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDictApi {
  export interface SystemDictData extends BaseType {
    /** ID */
    id: number;
    /** 字典类型 */
    dictType: string;
    /** 字典标签 */
    dictLabel: string;
    /** 是否默认(1是0否) */
    isDefault: number;
    /** 字典值 */
    dictValue: string;
    /** 状态：1禁用，0启用 */
    status?: 0 | 1;
    /** 排序 */
    sort?: number;
    /** 描述 */
    remark?: string;
  }
}

/**
 * 获取字典值列表
 * @param params 查询参数
 * @param dictType 字典类型
 */
async function getDictDataList(dictType: string, params: Recordable<any>) {
  return requestClient.get<PageResult<SystemDictApi.SystemDictData[]>>(
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
async function getDictDataById(id: number) {
  return requestClient.get<SystemDictApi.SystemDictData>(
    `/system/dict/data/${id}`,
  );
}

/**
 * 修改字典值
 * @param data 字典值
 */
async function updateDictData(data: SystemDictApi.SystemDictData) {
  return requestClient.put<SystemDictApi.SystemDictData>(
    '/system/dict/data',
    data,
  );
}

/**
 * 新增字典值
 * @param data 字典值数据
 */
async function addDictData(
  data: Omit<SystemDictApi.SystemDictData, 'createTime' | 'id'>,
) {
  return requestClient.post('/system/dict/data', data);
}

/**
 * 删除字典值
 * @param ids 字典值ID
 */
async function deleteDictData(ids: number[]) {
  return requestClient.delete(`/system/dict/data/${ids.join(',')}`);
}

export {
  addDictData,
  deleteDictData,
  getDictDataById,
  getDictDataList,
  updateDictData,
};
