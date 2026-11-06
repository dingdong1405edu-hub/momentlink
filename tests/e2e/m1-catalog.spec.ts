import { test, expect } from "@playwright/test";

test.describe("Milestone 1: Public Catalog & Templates E2E", () => {
  test("should browse occasions, view templates, filter, and interact with live demo", async ({ page }) => {
    // 1. Visit occasions
    await page.goto("/occasions");
    await expect(page.locator("h1")).toContainText("Khám phá thiệp mời");
    await expect(page.locator("text=Cưới hỏi & Hôn nhân")).toBeVisible();
    await expect(page.locator("text=Lễ cưới & Tiệc cưới")).toBeVisible();

    // 2. Visit templates catalog
    await page.goto("/templates");
    await expect(page.locator("h1")).toContainText("Khám phá 8 mẫu thiệp");
    await expect(page.locator("text=Ivory Ceremony")).toBeVisible();
    await expect(page.locator("text=The Next Chapter")).toBeVisible();
    await expect(page.locator("text=Confetti Pop")).toBeVisible();
    await expect(page.locator("text=Secret Letter")).toBeVisible();

    // 3. Test filter
    await page.click("button:has-text('Tốt nghiệp')");
    await expect(page.locator("text=The Next Chapter")).toBeVisible();
    await expect(page.locator("text=Grad Party!")).toBeVisible();

    // 4. Open Live Demo for wedding-classic
    await page.goto("/templates/wedding-classic");
    await expect(page.locator("text=Ivory Ceremony")).toBeVisible();
    await expect(page.locator("button:has-text('Mở thư mời')")).toBeVisible();

    // 5. Open envelope
    await page.click("button:has-text('Mở thư mời')");

    // 6. Verify countdown and event details
    await expect(page.locator("text=Đếm ngược ngày trọng đại")).toBeVisible();
    await expect(page.locator("text=The Adora Center")).toBeVisible();

    // 7. Test interactive demo RSVP
    await page.fill('input[placeholder="Ví dụ: Hoàng Yến & Bạn"]', "Khách Mời Danh Dự");
    await page.click("button:has-text('Gửi phản hồi')");
    await expect(page.locator("text=Cảm ơn bạn đã phản hồi!")).toBeVisible();

    // 8. Test device view toggle
    await page.click("button:has-text('Màn hình rộng')");
    await expect(page.locator("text=Dùng mẫu này")).toBeVisible();
  });
});

