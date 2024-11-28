import type { Config } from '@react-router/dev/config';
export default {
  ssr: true,
  appDirectory: 'src',
  serverModuleFormat: 'esm',
  serverBuildFile: 'index.mjs',
} satisfies Config;
