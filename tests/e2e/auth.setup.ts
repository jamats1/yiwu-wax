/**
 * Auth setup — runs before *.auth.spec.ts tests.
 *
 * To enable auth-gated tests (cart page, checkout):
 *   1. Create a dedicated test Clerk account at https://dashboard.clerk.com
 *   2. Set TEST_USER_EMAIL and TEST_USER_PASSWORD as env vars or GitHub secrets
 *   3. Run: npx playwright test --project=setup
 *
 * The saved session in tests/e2e/.auth/user.json is reused by chromium-auth project.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = "tests/e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    // Write empty state so the auth project doesn't error when no creds are set
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    console.warn("⚠  TEST_USER_EMAIL / TEST_USER_PASSWORD not set — auth tests will be skipped.");
    return;
  }

  // Navigate to Clerk sign-in (adjust path if you use a custom sign-in page)
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to home after successful auth
  await page.waitForURL("/", { timeout: 15_000 });
  await expect(page).toHaveURL("/");

  await page.context().storageState({ path: AUTH_FILE });
});
