import type { Recordable } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getPermissionCode, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   * @param onSuccess
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: any = null;
    try {
      loginLoading.value = true;
      const { accessToken, refreshToken } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);
        accessStore.setRefreshToken(refreshToken);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getPermissionCode(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(preferences.app.defaultHomePath);
        }

        if (userInfo?.nickname) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.nickname}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }

        // 登录成功后初始化 WebSocket 连接和实时消息订阅
        try {
          const { initWebSocket } = await import('#/realtime/connection');
          const { registerAppSubscriptions } = await import('#/realtime/subscriptions');

          await initWebSocket();
          registerAppSubscriptions();
          console.log('[Auth] WebSocket 连接和订阅成功');
        } catch (error) {
          console.warn('[Auth] WebSocket 连接失败:', error);
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  /**
   * 登出
   * @param redirect 是否跳转回登录页
   * @param callLogoutApi 是否调用注销API
   */
  async function logout(
    redirect: boolean = true,
    callLogoutApi: boolean = true,
  ) {
    // 尝试调用注销API，但不阻塞后续的清理操作
    if (callLogoutApi) {
      try {
        await logoutApi();
      } catch (error) {
        // 注销API失败时只记录错误，不阻塞清理操作
        console.warn(
          'Logout API failed, but continuing with local cleanup:',
          error,
        );
      }
    }

    // 清理 WebSocket 连接和订阅
    try {
      const { cleanupAppSubscriptions } = await import('#/realtime/subscriptions');
      const { destroyWebSocket } = await import('#/realtime/connection');

      cleanupAppSubscriptions();
      destroyWebSocket();
      console.log('[Auth] WebSocket 连接和订阅已清理');
    } catch (error) {
      console.warn('[Auth] WebSocket 清理失败:', error);
    }

    // 无论API是否成功，都执行清理操作
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
          redirect: encodeURIComponent(router.currentRoute.value.fullPath),
        }
        : {},
    });
  }

  async function fetchUserInfo() {
    const apiResponse = await getUserInfoApi();

    // Transform the nested API response to the flat structure expected by the user store
    let transformedUserInfo = null;
    if (apiResponse) {
      transformedUserInfo = {
        userId: apiResponse.user.userId,
        username: apiResponse.user.username,
        nickname: apiResponse.user.nickname,
        avatar: apiResponse.user.avatar,
        email: apiResponse.user.email,
        roles: apiResponse.roles,
      };
    }

    userStore.setUserInfo(transformedUserInfo);
    return transformedUserInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
