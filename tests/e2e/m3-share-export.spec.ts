import { test, expect } from "@playwright/test";

test.describe("Milestone 3: Share, QR & Export Engine E2E", () => {
  test("should publish invite, resolve short-link /q/[code], generate QR and export PDF & PNG", async ({
    page,
  }) => {
    test.setTimeout(90000);

    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const testUser = {
      email: `creator-m3-${timestamp}@example.com`,
      password: "Password123!",
      fullName: `M3 Creator ${timestamp}`,
    };
    const customTitle = `Lễ Tốt Nghiệp M3 ${timestamp}`;

    // 1. Sign up & Sign in
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', testUser.fullName);
    await page.fill('input[placeholder="ten@vidu.vn"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await expect(page.locator("h1")).toContainText(`Chào mừng trở lại, ${testUser.fullName}`);

    // 2. Go to /create wizard
    await page.goto("/create");
    await expect(page.locator("h1")).toContainText("Bạn muốn tạo thiệp cho dịp gì?");

    // Step 1: Click Graduation
    await page.click("text=Lễ tốt nghiệp");
    await expect(page.locator("h2")).toContainText("Chọn phong cách mẫu bạn yêu thích");

    // Step 2: Input title & submit
    await page.fill('input[placeholder="Ví dụ: Lễ Thành Hôn Hoàng Long & Minh Thư"]', customTitle);
    await page.click("button:has-text('Tạo thiệp & Bắt đầu chỉnh sửa')");

    // 3. Expect redirect to /editor/[id]
    await page.waitForURL("**/editor/**", { timeout: 20000 });
    const editorUrl = page.url();
    const invitationId = editorUrl.split("/editor/")[1]?.split("?")[0];
    expect(invitationId).toBeTruthy();

    const titleInput = page.locator('input[data-testid="invitation-title-input"]');
    await expect(titleInput).toBeVisible({ timeout: 20000 });

    // 4. Publish invitation
    const publishBtn = page.locator('button:has-text("Xuất bản ngay")');
    await publishBtn.click();

    // Publish modal should appear
    await expect(page.locator("text=Xuất bản thiệp thành công!")).toBeVisible({ timeout: 20000 });

    // Open share modal from publish success
    const openShareBtn = page.locator('button[data-testid="publish-success-open-share-btn"]');
    await openShareBtn.click();

    // Share modal is open
    await expect(page.locator("text=Chia sẻ & Xuất thiệp")).toBeVisible();

    // Read short link input value
    const shortLinkInput = page.locator('input[data-testid="share-short-link-input"]');
    await expect(shortLinkInput).toBeVisible();
    const shortLinkUrl = await shortLinkInput.inputValue();
    expect(shortLinkUrl).toContain("/q/");
    const shortCode = shortLinkUrl.split("/q/")[1];
    expect(shortCode).toBeTruthy();

    // 5. Test Short Link redirect: GET /q/[shortCode] -> 302 to /i/[slug]
    const shortRes = await page.request.get(`/q/${shortCode}`, { maxRedirects: 0 });
    expect(shortRes.status()).toBe(302);
    const location = shortRes.headers()["location"];
    expect(location).toContain("/i/");

    // 6. Test QR Code Endpoints directly
    const qrPngRes = await page.request.get(`/api/v1/invitations/${invitationId}/qr?format=png&size=256`);
    expect(qrPngRes.status()).toBe(200);
    expect(qrPngRes.headers()["content-type"]).toBe("image/png");
    const qrPngBody = await qrPngRes.body();
    expect(qrPngBody.length).toBeGreaterThan(100);

    const qrSvgRes = await page.request.get(`/api/v1/invitations/${invitationId}/qr?format=svg`);
    expect(qrSvgRes.status()).toBe(200);
    expect(qrSvgRes.headers()["content-type"]).toContain("image/svg+xml");
    const qrSvgText = await qrSvgRes.text();
    expect(qrSvgText).toContain("<svg");

    // 7. Test Export PDF & PNG via API
    // PDF Export
    const pdfExportRes = await page.request.post(`/api/v1/invitations/${invitationId}/exports`, {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ format: "PDF", sizePreset: "A4" }),
    });
    expect(pdfExportRes.status()).toBe(200);
    const pdfExportJson = await pdfExportRes.json();
    expect(pdfExportJson.data.job.status).toBe("SUCCEEDED");
    expect(pdfExportJson.data.job.format).toBe("PDF");
    const pdfDownloadUrl = pdfExportJson.data.job.downloadUrl;

    const pdfFileRes = await page.request.get(pdfDownloadUrl);
    expect(pdfFileRes.status()).toBe(200);
    expect(pdfFileRes.headers()["content-type"]).toBe("application/pdf");
    const pdfBuffer = await pdfFileRes.body();
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.subarray(0, 5).toString("utf-8")).toContain("%PDF");

    // PNG Poster Export
    const pngExportRes = await page.request.post(`/api/v1/invitations/${invitationId}/exports`, {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ format: "PNG", sizePreset: "POSTER_4_5" }),
    });
    expect(pngExportRes.status()).toBe(200);
    const pngExportJson = await pngExportRes.json();
    expect(pngExportJson.data.job.status).toBe("SUCCEEDED");
    expect(pngExportJson.data.job.format).toBe("PNG");
    const pngDownloadUrl = pngExportJson.data.job.downloadUrl;

    const pngFileRes = await page.request.get(pngDownloadUrl);
    expect(pngFileRes.status()).toBe(200);
    expect(pngFileRes.headers()["content-type"]).toBe("image/png");
    const pngBuffer = await pngFileRes.body();
    expect(pngBuffer.length).toBeGreaterThan(1000);

    // 8. Test Export UI flow within the Modal
    const exportTabBtn = page.locator('button[data-testid="tab-export-file"]');
    await exportTabBtn.click();

    const startExportBtn = page.locator('button[data-testid="start-export-btn"]');
    await startExportBtn.click();

    // Verify successful creation state and download button
    const downloadResultBtn = page.locator('a[data-testid="download-export-result-btn"]');
    await expect(downloadResultBtn).toBeVisible({ timeout: 20000 });
    await expect(page.locator("text=Đã tạo thành công!")).toBeVisible();

    // Close modal
    await page.locator('button[data-testid="close-share-modal-btn"]').click();
    await expect(page.locator("text=Chia sẻ & Xuất thiệp")).not.toBeVisible();
  });
});
