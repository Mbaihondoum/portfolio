import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` throws outside a React Server environment.
      'server-only': fileURLToPath(new URL('./tests/unit/stubs/empty.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['tests/unit/setup.ts'],
    globalSetup: ['tests/unit/global-setup.ts'],
    fileParallelism: false,
    restoreMocks: true,
    coverage: { provider: 'v8', include: ['src/**'], reporter: ['text', 'html'] },
  },
})
