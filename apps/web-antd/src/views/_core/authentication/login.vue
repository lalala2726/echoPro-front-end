<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, h, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getImageCaptcha } from '#/api/common/captcha';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const captchaImage = ref('');
const captchaUuid = ref('');
const captchaLoading = ref(false);

const getCaptcha = async () => {
  try {
    captchaLoading.value = true;
    const result = await getImageCaptcha();
    captchaImage.value = result?.imgBase64 || '';
    captchaUuid.value = result?.uuid || '';
  } catch (error) {
    console.error('获取验证码失败:', error);
  } finally {
    captchaLoading.value = false;
  }
};

onMounted(() => {
  getCaptcha();
});

const handleLogin = async (values: any) => {
  const loginData = {
    ...values,
    uuid: captchaUuid.value,
    deviceType: 'web',
  } as any;

  try {
    await authStore.authLogin(loginData);
  } finally {
    // 无论登录成功还是失败，都刷新验证码
    // 成功时为下次登录准备，失败时防止验证码被重复使用
    getCaptcha();
  }
};

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入验证码',
      },
      fieldName: 'code',
      label: '验证码',
      rules: z.string().min(1, { message: '请输入验证码' }),
      suffix: () => {
        return h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              marginLeft: '8px',
              position: 'relative',
            },
          },
          [
            h(
              'div',
              {
                style: {
                  position: 'relative',
                  height: '40px',
                  width: '120px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: captchaLoading.value
                    ? '#f5f5f5'
                    : 'transparent',
                },
                onClick: getCaptcha,
              },
              [
                // 验证码图片
                captchaImage.value && !captchaLoading.value
                  ? h('img', {
                      src: captchaImage.value,
                      style: {
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain',
                      },
                      alt: '验证码',
                    })
                  : null,
                // 加载动画
                captchaLoading.value
                  ? h('div', {
                      style: {
                        width: '20px',
                        height: '20px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #1890ff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      },
                    })
                  : null,
              ],
            ),
          ],
        );
      },
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleLogin"
  />
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
