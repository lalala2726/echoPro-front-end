import type { BaseRequest, PageResult } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDictDataType {
  export interface DictDataQueryRequest extends BaseRequest {
    /** 主键ID */
    id?: number;
    /** 字典标签 */
    dictLabel?: string;
    /** 字典值 */
    dictValue?: string;
    /** 颜色 */
    color?: string;
    /** 状态：1启用，0禁用 */
    status?: number;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
  }

  export interface DictDataVo {
    /** 主键ID */
    id?: number;
    /** 字典类型 */
    dictType?: string;
    /** 字典标签 */
    dictLabel?: string;
    /** 字典值 */
    dictValue?: string;
    /** 颜色 */
    color?: string;
    /** 排序 */
    sort?: number;
    /** 状态：1启用，0禁用 */
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

  export interface DictDataAddRequest {
    /** 字典类型 */
    dictType: string;
    /** 字典标签 */
    dictLabel: string;
    /** 字典值 */
    dictValue: string;
    /** 颜色 */
    color?: string;
    /** 排序 */
    sort?: number;
    /** 状态：1启用，0禁用 */
    status: number;
    /** 备注 */
    remark?: string;
  }

  export interface DictDataUpdateRequest {
    /** 主键ID */
    id: number;
    /** 字典类型 */
    dictType?: string;
    /** 字典标签 */
    dictLabel?: string;
    /** 字典值 */
    dictValue?: string;
    /** 颜色 */
    color?: string;
    /** 排序 */
    sort?: number;
    /** 状态：1启用，0禁用 */
    status?: number;
    /** 备注 */
    remark?: string;
  }
}

/**
 * 获取字典值列表
 * @param dictType 字典类型
 * @param params
 */
async function getDictDataList(
  dictType: string,
  params: SystemDictDataType.DictDataQueryRequest,
) {
  return requestClient.get<PageResult<SystemDictDataType.DictDataVo[]>>(
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
  return requestClient.get<SystemDictDataType.DictDataVo>(
    `/system/dict/data/${id}`,
  );
}

/**
 * 修改字典值
 * @param data 字典值
 */
async function updateDictData(data: SystemDictDataType.DictDataUpdateRequest) {
  return requestClient.put('/system/dict/data', data);
}

/**
 * 新增字典值
 * @param data 字典值数据
 */
async function addDictData(data: SystemDictDataType.DictDataAddRequest) {
  return requestClient.post('/system/dict/data', data);
}

/**
 * 删除字典值
 * @param ids 字典值ID
 */
async function deleteDictData(ids: number[]) {
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
