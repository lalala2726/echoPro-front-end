import { cwd } from 'node:process';

import { defineConfig } from '@vben/vite-config';

import { loadEnv } from 'vite';

export default defineConfig(async (config) => {
  const { mode = 'development' } = config || {};
  const root = cwd();
  const env = loadEnv(mode, root, '');

  const apiPrefix = env.VITE_GLOB_API_PATH;
  const apiBase = env.VITE_GLOB_API_URL;

  return {
    application: {},
    vite: {
      define: {
        global: 'globalThis',
        'process.env': {},
      },
      server: {
        proxy:
          apiPrefix && apiPrefix.trim().length > 0
            ? {
                [apiPrefix as string]: {
                  changeOrigin: true,
                  rewrite: (path: string) =>
                    path.replace(new RegExp(`^${apiPrefix}`), ''),
                  target: apiBase,
                  ws: true,
                },
              }
            : {},
      },
    },
  };
});
