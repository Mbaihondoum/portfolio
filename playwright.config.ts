import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3100)
const baseURL = `http://localhost:${PORT}`

/**
 * E2E runs against a production build (`next build && next start`) wired to
 * the test database. Seed + auth state are prepared in global-setup.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /navigation\.spec\.ts/ },
  ],
  webServer: {
    command: `pnpm start --port ${PORT}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL:
        process.env.E2E_DATABASE_URL ??
        'postgres://portfolio:portfolio@localhost:5432/portfolio_test',
      NEXT_PUBLIC_SITE_URL: baseURL,
      AUTH_SECRET: process.env.E2E_AUTH_SECRET ?? 'e2e-auth-secret-0123456789abcdefghijklmnop',
      AUTH_GITHUB_ID: 'e2e',
      AUTH_GITHUB_SECRET: 'e2e',
      AUTH_URL: baseURL,
      AUTH_TRUST_HOST: 'true',
      ADMIN_EMAILS: 'admin@example.com',
      IP_HASH_SECRET: 'e2e-ip-hash-secret-0123456789',
      CONTACT_TO_EMAIL: 'admin@example.com',
      STORAGE_DRIVER: 'local',
    },
  },
})
