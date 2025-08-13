import { requestClient } from '#/api/request';

export namespace CommonCaptchaType {
  export interface CaptchaImageVo {
    /** 验证码唯一标识 */
    uuid?: string;
    /** 验证码图片Base64 */
    imgBase64?: string;
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
 * 获取图片验证码
 */
async function getImageCaptcha() {
  return requestClient.get<CommonCaptchaType.CaptchaImageVo>(
    '/common/captcha/image',
  );
}

export { getImageCaptcha, sendEmailCaptcha, sendPhoneCaptcha };
