import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      define: {
        global: 'globalThis',
        'process.env': {},
      },
    },
  };
});
