import {defineConfig, devices} from '@playwright/test';

const PORT = 3000;

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    expect: {timeout: 30_000},
    workers: 1,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'on-first-retry',
        ...devices['Pixel 7'],
    },
    projects: [{name: 'mobile-chrome'}],
    webServer: {
        command: `bunx http-server build -p ${PORT} -s`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
