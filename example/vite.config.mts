import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import tsconfigPaths from 'vite-tsconfig-paths';

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    commonjs(),
    remix({
      appDirectory: 'src',
      serverModuleFormat: 'cjs',
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: ['nestjs-remix'],
    },
  },
});
