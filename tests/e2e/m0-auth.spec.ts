import { test, expect } from "@playwright/test";

test.describe("Milestone 0: End-to-end Authentication", () => {
  const testEmail = `user_${Date.now()}@testmomentlink.vn`;
  const testPassword = "Password123!";
  const testName = "Nguyễn Hoàng Nam";

  test("should sign up new user, access dashboard, sign out, and sign in", async ({ page }) => {
    // 1. Visit signup page
    await page.goto("/auth/sign-up");
    await expect(page.locator("h2")).toContainText("Tạo tài khoản");

    // 2. Fill form
    await page.fill('input[placeholder="Nguyễn Văn A"]', testName);
    await page.fill('input[placeholder="ten@vidu.vn"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Expect redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText(`Chào mừng trở lại, ${testName}`);
    await expect(page.locator("text=Tổng số thiệp")).toBeVisible();

    // 5. Sign out via dashboard button
    await page.click('button[data-testid="dashboard-logout-btn"]');
    await page.waitForURL("**/", { timeout: 10000 });

    // 6. Sign in again
    await page.goto("/auth/sign-in");
    await page.fill('input[placeholder="ten@vidu.vn"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 7. Verify dashboard accessible again
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText(`Chào mừng trở lại, ${testName}`);
  });
});
