import type { BaseType, PageResult, Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDictApi {
  export interface SystemDictType extends BaseType {
    /** ID */
    id: number;
    /** 字典类型编码 */
    dictType: string;
    /** 字典名称 */
    dictName: string;
    /** 状态：0禁用，1启用 */
    status?: 0 | 1;
    /** 备注 */
    remark?: string;
  }

  export interface SystemDictData extends BaseType {
    /** ID */
    id: number;
    /** 字典类型ID */
    dictKey: number;
    /** 字典值 */
    value: string;
    /** 字典标签 */
    label: string;
    /** 状态：0禁用，1启用 */
    status?: 0 | 1;
    /** 排序 */
    sort?: number;
    /** 描述 */
    remark?: string;
  }
}

/**
 * 获取字典类型列表数据
 */
async function getDictTypeList(params: Recordable<any>) {
  return requestClient.get<PageResult<SystemDictApi.SystemDictType>>(
    '/system/dict/type/list',
    { params },
  );
}

/**
 * 创建字典
 * @param data 字典数据
 */
async function addDictType(
  data: Omit<SystemDictApi.SystemDictType, 'createTime' | 'id'>,
) {
  return requestClient.post('/system/dict/type', data);
}

/**
 * 根据字典类型ID获取字典类型
 * @param id 字典类型ID
 */
async function getDictTypeById(id: number) {
  return requestClient.get<SystemDictApi.SystemDictType>(
    `/system/dict/type/${id}`,
  );
}

/**
 * 更新字典
 * @param data 字典数据
 */
async function updateDictType(data: SystemDictApi.SystemDictType) {
  return requestClient.put('/system/dict/type', data);
}

/**
 * 删除字典
 * @param dictId 字典ID
 */
async function deleteDictType(dictId: number) {
  return requestClient.delete(`/system/dict/type/${dictId}`);
}

export {
  addDictType,
  deleteDictType,
  getDictTypeById,
  getDictTypeList,
  updateDictType,
};
