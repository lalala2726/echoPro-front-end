import { cwd } from 'node:process';

import { defineConfig } from '@vben/vite-config';

import { loadEnv } from 'vite';

export default defineConfig(async (config) => {
  const { mode = 'development' } = config || {};
  const root = cwd();
  const env = loadEnv(mode, root, '');

  const apiPrefix = env.VITE_GLOB_API_URL;
  const backendUrl = env.VITE_BACKEND_URL;

  return {
    application: {},
    vite: {
      server: {
        proxy: {
          [apiPrefix as string]: {
            changeOrigin: true,
            rewrite: (path: string) =>
              path.replace(new RegExp(`^${apiPrefix}`), ''),
            target: backendUrl,
            ws: true,
          },
        },
      },
    },
  };
});
