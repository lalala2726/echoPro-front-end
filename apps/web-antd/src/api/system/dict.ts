import type { BaseType, PageResult, Recordable } from '@vben/types';

import { exportFile } from '#/api/download';
import { requestClient } from '#/api/request';

export namespace SystemDictApi {
  export interface SystemDictKey extends BaseType {
    /** ID */
    id: number;
    /** 字典类型编码 */
    dictKey: string;
    /** 字典名称 */
    dictName: string;
    /** 状态：0禁用，1启用 */
    status?: 0 | 1;
    /** 排序 */
    sort?: number;
    /** 备注 */
    remark?: string;
  }
}

/**
 * 获取字典列表数据
 */
async function getDictKeyList(params: Recordable<any>) {
  return requestClient.get<PageResult<SystemDictApi.SystemDictKey>>(
    '/system/dict/key/list',
    { params },
  );
}

/**
 * 创建字典
 * @param data 字典数据
 */
async function createDictKey(
  data: Omit<SystemDictApi.SystemDictKey, 'createTime' | 'id'>,
) {
  return requestClient.post('/system/dict/key', data);
}

/**
 * 更新字典
 * @param data 字典数据
 */
async function updateDictKey(data: SystemDictApi.SystemDictKey) {
  return requestClient.put('/system/dict/key', data);
}

/**
 * 删除字典
 * @param dictId 字典ID
 */
async function deleteDictKey(dictId: number) {
  return requestClient.delete(`/system/dict/key/${dictId}`);
}

/**
 * 导出字典列表
 */
async function exportDictKeyList(fileName?: string, params?: Recordable<any>) {
  return exportFile('/system/dict/key/export', {
    fileName: fileName || '字典列表',
    params,
  });
}


export {
  createDictKey,
  deleteDictKey,
  exportDictKeyList,
  getDictKeyList,
  updateDictKey,
};
