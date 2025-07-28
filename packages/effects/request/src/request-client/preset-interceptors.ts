import type { RequestClient } from './request-client';
import type { MakeErrorMessageFn, ResponseInterceptorConfig } from './types';

import { isFunction } from '@vben/utils';

import axios from 'axios';

export const defaultResponseInterceptor = ({
  codeField = 'code',
  dataField = 'data',
  successCode = 200,
}: {
  /** 响应数据中代表访问结果的字段名 */
  codeField: string;
  /** 响应数据中装载实际数据的字段名，或者提供一个函数从响应数据中解析需要返回的数据 */
  dataField: ((response: any) => any) | string;
  /** 当codeField所指定的字段值与successCode相同时，代表接口访问成功。如果提供一个函数，则返回true代表接口访问成功 */
  successCode: ((code: any) => boolean) | number | string;
}): ResponseInterceptorConfig => {
  return {
    fulfilled: (response) => {
      const { config, data: responseData, status } = response;

      if (config.responseReturn === 'raw') {
        return response;
      }

      if (status >= 200 && status < 400) {
        if (config.responseReturn === 'body') {
          return responseData;
        } else if (
          isFunction(successCode)
            ? successCode(responseData[codeField])
            : responseData[codeField] === successCode
        ) {
          return isFunction(dataField)
            ? dataField(responseData)
            : responseData[dataField];
        }
      }
      throw Object.assign({}, response, { response });
    },
  };
};

export const authenticateResponseInterceptor = ({
  client,
  doReAuthenticate,
  doRefreshToken,
  enableRefreshToken,
  formatToken,
}: {
  client: RequestClient;
  doReAuthenticate: () => Promise<void>;
  doRefreshToken: () => Promise<string>;
  enableRefreshToken: boolean;
  formatToken: (token: string) => null | string;
}): ResponseInterceptorConfig => {
  return {
    rejected: async (error) => {
      const { config, response } = error;
      const responseData = response?.data;

      if (responseData && typeof responseData.code === 'number') {
        // 登录错误
        if (responseData.code === 4013) {
          await doReAuthenticate();
          throw error;
        }
        // 4011: token过期，需要刷新token
        if (responseData.code === 4011) {
          // 检查是否是刷新token的URL
          const isRefreshTokenUrl = config.url?.includes('/auth/refresh');

          // 如果是刷新token的URL出现4011错误，需要重新登录
          if (isRefreshTokenUrl) {
            const errorMessage =
              responseData?.message || '刷新令牌失败，请重新登录';

            // 创建包含具体错误信息的错误对象
            const refreshTokenError = Object.assign({}, error, {
              isRefreshTokenError: true,
              specificMessage: errorMessage,
            });

            // 执行重新认证
            await doReAuthenticate();
            throw refreshTokenError;
          }

          // 判断是否启用了 refreshToken 功能
          if (!enableRefreshToken || config.__isRetryRequest) {
            await doReAuthenticate();
            throw error;
          }

          // 如果正在刷新 token，则将请求加入队列，等待刷新完成
          if (client.isRefreshing) {
            return new Promise((resolve) => {
              client.refreshTokenQueue.push((newToken: string) => {
                config.headers.Authorization = formatToken(newToken);
                resolve(client.request(config.url, { ...config }));
              });
            });
          }

          // 标记开始刷新 token
          client.isRefreshing = true;
          // 标记当前请求为重试请求，避免无限循环
          config.__isRetryRequest = true;

          try {
            const newToken = await doRefreshToken();

            // 处理队列中的请求
            client.refreshTokenQueue.forEach((callback) => callback(newToken));
            // 清空队列
            client.refreshTokenQueue = [];

            return client.request(error.config.url, { ...error.config });
          } catch (refreshError) {
            // 如果刷新 token 失败，处理错误（如强制登出或跳转登录页面）
            client.refreshTokenQueue.forEach((callback) => callback(''));
            client.refreshTokenQueue = [];
            console.error('Refresh token failed, please login again.');
            await doReAuthenticate();

            throw refreshError;
          } finally {
            client.isRefreshing = false;
          }
        }
        // 4012: 需要重新登录
        else if (responseData.code === 4012) {
          const errorMessage = responseData.message || '需要重新登录';

          // 创建包含具体错误信息的错误对象
          const reAuthError = Object.assign({}, error, {
            isReAuthError: true,
            specificMessage: errorMessage,
          });

          // 执行重新认证
          await doReAuthenticate();
          throw reAuthError;
        }
      }
      // 其他所有错误（包括HTTP状态码错误）直接抛出，交给errorMessageResponseInterceptor处理
      throw error;
    },
  };
};

export const errorMessageResponseInterceptor = (
  makeErrorMessage?: MakeErrorMessageFn,
): ResponseInterceptorConfig => {
  return {
    rejected: (error: any) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      const err: string = error?.toString?.() ?? '';
      let errMsg = '';
      if (err?.includes('Network Error')) {
        errMsg = '网络异常，请检查您的网络连接后重试。';
      } else if (error?.message?.includes?.('timeout')) {
        errMsg = '请求超时，请稍后再试。';
      }
      if (errMsg) {
        makeErrorMessage?.(errMsg, error);
        return Promise.reject(error);
      }

      const responseData = error?.response?.data;
      const errorMessage = responseData.message;

      // 检查是否是特殊错误（刷新token失败或需要重新登录）
      if (error.isRefreshTokenError || error.isReAuthError) {
        makeErrorMessage?.(error.specificMessage, error);
        return Promise.reject(error);
      }

      makeErrorMessage?.(errorMessage, error);
      return Promise.reject(error);
    },
  };
};
