import { downloadFileFromBlob } from '@vben/utils';

import { requestClient } from './request';

/**
 * 导出文件参数接口
 */
interface ExportOptions {
  /** 文件名（可选，用于向后兼容，实际文件名由后端Content-Disposition决定） */
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
    // 发送POST请求，使用 raw 返回完整响应以便检查状态码和响应头
    const response = await requestClient.post(url, params, {
      responseType: 'blob',
      responseReturn: 'raw',
    });

    // 检查HTTP状态码和Content-Type来判断是否成功
    const contentType =
      response.headers['content-type'] ||
      response.headers['Content-Type'] ||
      '';

    if (
      response.status === 200 &&
      contentType.includes(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
    ) {
      // 成功响应，是Excel文件，直接下载
      const blob = response.data;

      // 确定最终文件名：优先级为 传入参数 > 响应头 > 默认生成
      let finalFileName =
        fileName || `导出文件_${new Date().toISOString().slice(0, 10)}`;

      // 如果没有传入文件名，尝试从响应头获取
      if (!fileName) {
        const contentDisposition =
          response.headers['content-disposition'] ||
          response.headers['Content-Disposition'];
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
          );
          if (fileNameMatch && fileNameMatch[1]) {
            finalFileName = decodeURIComponent(
              fileNameMatch[1].replaceAll(/['"]/g, ''),
            );
          }
        }
      }

      // 确保文件名有正确的扩展名
      if (!finalFileName.endsWith('.xlsx')) {
        finalFileName += '.xlsx';
      }

      // 触发下载
      downloadFileFromBlob({
        source: blob,
        fileName: finalFileName,
      });

      return true;
    } else {
      // 非成功响应，记录详细信息用于调试
      console.warn('导出失败 - 响应详情:', {
        status: response.status,
        contentType,
        headers: response.headers,
        dataType: typeof response.data,
        dataSize: response.data instanceof Blob ? response.data.size : 'N/A',
      });

      // 尝试解析错误信息并抛出错误
      const errorMessage = await handleExportError(response.data);

      // 创建一个包含详细信息的错误对象并抛出
      const exportError = new Error(errorMessage);
      (exportError as any).response = response;
      (exportError as any).isExportError = true;
      throw exportError;
    }
  } catch (error: any) {
    console.error('导出失败:', error);

    // 处理请求错误
    if (error?.response?.data) {
      const errorMessage = await handleExportError(error.response.data);
      // 更新错误消息
      error.message = errorMessage;
    }

    throw error;
  }
}

/**
 * 处理导出错误
 * @param errorData 错误数据（可能是Blob或JSON）
 * @returns 解析出的错误消息
 */
async function handleExportError(errorData: any): Promise<string> {
  try {
    // 如果错误数据是Blob，尝试转换为JSON
    if (errorData instanceof Blob) {
      const text = await errorData.text();
      try {
        const jsonData = JSON.parse(text);
        return jsonData.message || '内部服务器错误';
      } catch {
        // 如果不是有效的JSON，使用默认错误信息
        return '内部服务器错误';
      }
    } else if (typeof errorData === 'object' && errorData.message) {
      // 如果已经是JSON对象，直接提取message
      return errorData.message;
    } else {
      // 其他情况使用默认错误信息
      return '内部服务器错误';
    }
  } catch {
    return '内部服务器错误';
  }
}
