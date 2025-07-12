import { downloadFileFromBlob } from '@vben/utils';

import { requestClient } from './request';

/**
 * 导出文件参数接口
 */
interface ExportOptions {
  /** 文件名（不需要扩展名，会自动添加.xlsx） */
  fileName?: string;
  /** 查询参数 */
  params?: Record<string, any>;
}

/**
 * 通用导出文件函数
 * @param url 导出地址
 * @param options 导出选项
 */
export async function exportFile(url: string, options: ExportOptions = {}) {
  const { fileName, params } = options;

  try {
    // 发送POST请求获取文件
    const blob = await requestClient.post<Blob>(url, params, {
      responseType: 'blob',
      responseReturn: 'body',
    });

    // 生成文件名
    const finalFileName = fileName
      ? `${fileName}.xlsx`
      : `导出文件_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // 触发下载
    downloadFileFromBlob({
      source: blob,
      fileName: finalFileName,
    });

    return true;
  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
}
