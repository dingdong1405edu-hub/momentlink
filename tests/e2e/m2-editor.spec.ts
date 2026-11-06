import { test, expect } from "@playwright/test";

test.describe("Milestone 2: Creator Editor -> Publish -> Recipient E2E", () => {
  const userEmail = `creator_${Date.now()}@momentlink.vn`;
  const userPassword = "Password123!";
  const userName = "Trần Minh Quân";
  const customTitle = `Lễ Tốt Nghiệp Của Quân ${Date.now()}`;

  test("should create invitation, edit in editor, save draft, publish, view public, and record RSVP", async ({
    page,
    context,
  }) => {
    // 1. Sign up new creator
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', userName);
    await page.fill('input[placeholder="ten@vidu.vn"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    // 2. Go to /create wizard
    await page.goto("/create");
    await expect(page.locator("h1")).toContainText("Bạn muốn tạo thiệp cho dịp gì?");

    // 3. Choose Graduation
    await page.click("text=Lễ tốt nghiệp");
    await expect(page.locator("h2")).toContainText("Chọn phong cách mẫu bạn yêu thích");

    // 4. Input title & create
    await page.fill('input[placeholder="Ví dụ: Lễ Thành Hôn Hoàng Long & Minh Thư"]', customTitle);
    await page.click("button:has-text('Tạo thiệp & Bắt đầu chỉnh sửa')");

    // 5. Expect redirect to /editor/[id]
    await page.waitForURL("**/editor/**", { timeout: 15000 });
    const titleInput = page.locator('input[data-testid="invitation-title-input"]');
    await expect(titleInput).toBeVisible({ timeout: 15000 });
    await expect(titleInput).toHaveValue(new RegExp("Lễ Tốt Nghiệp"));

    // 6. Edit title
    const modifiedTitle = `${customTitle} — Vinh Danh`;
    await titleInput.fill(modifiedTitle);

    // 7. Click save draft
    await page.click("button:has-text('Lưu nháp')");
    await expect(page.locator("text=Đã lưu")).toBeVisible({ timeout: 10000 });

    // 8. Refresh and check persistence
    await page.reload();
    const reloadedTitleInput = page.locator('input[data-testid="invitation-title-input"]');
    await expect(reloadedTitleInput).toBeVisible({ timeout: 15000 });
    await expect(reloadedTitleInput).toHaveValue(modifiedTitle);

    // 9. Publish invitation
    await page.click("button:has-text('Xuất bản ngay')");
    await expect(page.locator("text=Xuất bản thiệp thành công!")).toBeVisible({ timeout: 15000 });

    // 10. Extract slug from modal
    const viewButton = page.locator("a:has-text('Mở xem ngay')");
    const href = await viewButton.getAttribute("href");
    expect(href).toContain("/i/");

    // 11. Open public invitation page in a new incognito context (as an unauthenticated guest)
    const guestPage = await context.newPage();
    await guestPage.goto(href!);
    await expect(guestPage.locator(`text=${modifiedTitle}`)).toBeVisible();

    // 12. Guest submits RSVP
    await guestPage.fill('input[placeholder="Ví dụ: Hoàng Yến & Bạn"]', "Bác Ba & Gia Đình");
    await guestPage.click("button:has-text('Gửi phản hồi')");
    await expect(guestPage.locator("text=Cảm ơn bạn đã phản hồi!")).toBeVisible();

    // 13. Creator returns to dashboard and inspects invitation detail
    await page.goto("/dashboard");
    await expect(page.locator(`text=${modifiedTitle}`)).toBeVisible();
    await expect(page.locator("text=RSVP: 1")).toBeVisible();
  });
});
