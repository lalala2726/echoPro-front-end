import { requestClient } from '#/api/request';

export namespace CaptchaType {
  export interface CaptchaRequest {
    /** 手机号码 */
    phone?: string;
    /** 邮箱地址 */
    email?: string;
    /** 验证码 */
    code?: string;
    /** 普通验证码唯一标识 */
    uid?: string;
  }
}

/**
 * 发送手机号验证码
 * @param phone 手机号码
 */
async function sendPhoneCaptcha(phone: string) {
  return requestClient.post('/common/captcha/phone', {
    phone,
  });
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 */
async function sendEmailCaptcha(email: string) {
  return requestClient.post('/common/captcha/email', {
    email,
  });
}

/**
 * 验证邮箱验证码
 * @param data 验证码数据
 */
async function verifyEmailCaptcha(data: CaptchaType.CaptchaRequest) {
  return requestClient.post<boolean>('/common/captcha/email/verify', {
    data,
  });
}

/**
 * 验证手机验证码
 * @param data 验证码数据
 */
async function verifyPhoneCaptcha(data: CaptchaType.CaptchaRequest) {
  return requestClient.post<boolean>('/common/captcha/phone/verify', {
    data,
  });
}

export {
  sendEmailCaptcha,
  sendPhoneCaptcha,
  verifyEmailCaptcha,
  verifyPhoneCaptcha,
};
