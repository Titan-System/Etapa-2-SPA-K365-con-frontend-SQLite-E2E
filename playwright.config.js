// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5000",
    headless: true,
    launchOptions: {
      args: ["--no-sandbox"],
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
        : {}),
    },
  },
  webServer: {
    command: "python run.py",
    url: "http://127.0.0.1:5000/api/health",
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
