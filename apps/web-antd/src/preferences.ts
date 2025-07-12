import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    accessMode: 'mixed',
    name: 'EchoPro',
  },
  theme: {
    mode: 'light',
  },
  logo: {
    source: '/logo/logo.png', // 使用本地图片，放在 public/ 目录下
    fit: 'contain', // 图片适应方式
  },
});
