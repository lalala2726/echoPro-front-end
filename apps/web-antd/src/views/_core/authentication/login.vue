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

const getCaptcha = async () => {
  try {
    const result = await getImageCaptcha();
    captchaImage.value = result?.imgBase64 || '';
    captchaUuid.value = result?.uuid || '';
  } catch (error) {
    console.error('获取验证码失败:', error);
  }
};

onMounted(() => {
  getCaptcha();
});

const handleLogin = (values: any) => {
  const loginData = {
    ...values,
    uuid: captchaUuid.value,
    deviceType: 'web',
  } as any;
  authStore.authLogin(loginData);
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
              gap: '8px',
              marginLeft: '8px',
            },
          },
          [
            h('img', {
              src: captchaImage.value,
              style: {
                height: '40px',
                width: '120px',
                cursor: 'pointer',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                objectFit: 'contain',
              },
              onClick: getCaptcha,
              alt: '验证码',
            }),
            h(
              'a',
              {
                style: {
                  color: '#1890ff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                },
                onClick: getCaptcha,
              },
              '刷新',
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
