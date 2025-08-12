import type { PageResult } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDictType {
  export interface DictTypeQueryRequest {
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

  export interface DictTypeVo {
    /** 主键ID */
    id?: number;
    /** 字典类型 */
    dictType?: string;
    /** 字典名称 */
    dictName?: string;
    /** 状态：0启用，1禁用 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 创建人 */
    createBy?: string;
    /** 更新人 */
    updateBy?: string;
  }

  export interface DictTypeVo {
    /** 主键ID */
    id?: number;
    /** 字典类型 */
    dictType?: string;
    /** 字典名称 */
    dictName?: string;
    /** 状态：0启用，1禁用 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 创建人 */
    createBy?: string;
    /** 更新人 */
    updateBy?: string;
  }

  export interface DictTypeAddRequest {
    /** 字典类型 */
    dictType: string;
    /** 字典名称 */
    dictName: string;
    /** 状态：0启用，1禁用 */
    status: number;
    /** 备注 */
    remark?: string;
  }

  export interface DictTypeUpdateRequest {
    /** 主键ID */
    id: number;
    /** 字典类型 */
    dictType: string;
    /** 字典名称 */
    dictName: string;
    /** 状态：0启用，1禁用 */
    status: number;
    /** 备注 */
    remark?: string;
  }
}

/**
 * 获取字典类型列表数据
 */
async function getDictTypeList(params: SystemDictType.DictTypeQueryRequest) {
  return requestClient.get<PageResult<SystemDictType.DictTypeVo[]>>(
    '/system/dict/type/list',
    { params },
  );
}

/**
 * 创建字典
 * @param data 字典数据
 */
async function addDictType(data: SystemDictType.DictTypeAddRequest) {
  return requestClient.post('/system/dict/type', data);
}

/**
 * 根据字典类型ID获取字典类型
 * @param id 字典类型ID
 */
async function getDictTypeById(id: number) {
  return requestClient.get<SystemDictType.DictTypeVo>(
    `/system/dict/type/${id}`,
  );
}

/**
 * 更新字典
 * @param data 字典数据
 */
async function updateDictType(data: SystemDictType.DictTypeUpdateRequest) {
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
