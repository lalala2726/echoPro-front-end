/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate(isLoginRequest = false) {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);

    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      // 如果是登录请求失败，不调用注销API，直接跳转到登录页
      if (isLoginRequest) {
        console.warn('Login failed, clearing tokens without logout API call.');
        accessStore.setRefreshToken(null);
        await authStore.logout(false, false);
      } else {
        await authStore.logout();
      }
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const response = await refreshTokenApi(accessStore.refreshToken);
    const { accessToken, refreshToken } = response.data.data;
    accessStore.setAccessToken(accessToken);
    accessStore.setRefreshToken(refreshToken);
    return accessToken;
  }

  function formatToken(token: null | string) {
    return token ?? null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 200,
    }),
  );

  // token过期的处理 - 自定义拦截器以支持登录失败处理
  client.addResponseInterceptor({
    rejected: async (error) => {
      const { config, response } = error;
      const responseData = response?.data;

      if (responseData && typeof responseData.code === 'number') {
        // 检查是否是登录请求
        const isLoginRequest = config.url?.includes('/auth/login');

        // 登录错误
        if (responseData.code === 4013) {
          await doReAuthenticate(isLoginRequest);
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
          if (!preferences.app.enableRefreshToken || config.__isRetryRequest) {
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
  });

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';

      // 如果没有错误信息，则会根据状态码进行提示
      // msg 参数已经在 errorMessageResponseInterceptor 中根据状态码处理过了
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
