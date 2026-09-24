import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      public: fileURLToPath(new URL('./public', import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.vitest.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    clearMocks: false,
    sequence: { hooks: 'list' },
  },
});
