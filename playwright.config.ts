import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3002";
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    // Auth setup — runs first, saves Clerk session to disk
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
    },
    // Public routes — no auth required
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/*.auth.spec.ts"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["**/*.auth.spec.ts"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: ["**/*.auth.spec.ts"],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: ["**/*.auth.spec.ts"],
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
      testIgnore: ["**/*.auth.spec.ts"],
    },
    // Auth-gated routes — depends on setup
    {
      name: "chromium-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: ["**/*.auth.spec.ts"],
    },
  ],
  // Locally reuse a running dev/prod server; in CI point BASE_URL at production
  ...(!IS_CI && {
    webServer: {
      command: "npm run dev -- -p 3002",
      url: "http://localhost:3002",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  }),
});
