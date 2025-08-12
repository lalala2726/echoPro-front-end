import type { BaseType, PageResult, Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDictType {
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

  /**
   * 字典类型查询请求对象
   *
   * @author Chuang
   */
  export interface SysDictTypeQueryRequest {
    /** 主键ID */
    id?: number;

    /** 字典类型 */
    dictType?: string;

    /** 字典名称 */
    dictName?: string;

    /** 状态：0启用，1禁用 */
    status?: number;

    /** 开始时间 */
    startTime?: string;

    /** 结束时间 */
    endTime?: string;
  }
}

/**
 * 获取字典类型列表数据
 */
async function getDictTypeList(params: Recordable<any>) {
  return requestClient.get<PageResult<SystemDictType.SystemDictType>>(
    '/system/dict/type/list',
    { params },
  );
}

/**
 * 创建字典
 * @param data 字典数据
 */
async function addDictType(
  data: Omit<SystemDictType.SystemDictType, 'createTime' | 'id'>,
) {
  return requestClient.post('/system/dict/type', data);
}

/**
 * 根据字典类型ID获取字典类型
 * @param id 字典类型ID
 */
async function getDictTypeById(id: number) {
  return requestClient.get<SystemDictType.SystemDictType>(
    `/system/dict/type/${id}`,
  );
}

/**
 * 更新字典
 * @param data 字典数据
 */
async function updateDictType(data: SystemDictType.SystemDictType) {
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
