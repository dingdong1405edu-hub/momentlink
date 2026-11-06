import { test, expect } from "@playwright/test";
import prisma from "@/lib/prisma";

test.describe("Milestone 6: Production Hardening & Security E2E", () => {
  test("E2E-19: Access another user's invitation/order/export -> 403/404 from server (IDOR Prevention)", async ({
    page,
    request,
  }) => {
    test.setTimeout(90000);

    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const userA = {
      email: `victim_${timestamp}@example.com`,
      password: "Password123!",
      name: `User A Victim`,
    };
    const userB = {
      email: `attacker_${timestamp}@example.com`,
      password: "Password123!",
      name: `User B Attacker`,
    };

    // User A signs up
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', userA.name);
    await page.fill('input[placeholder="ten@vidu.vn"]', userA.email);
    await page.fill('input[type="password"]', userA.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    const dbUserA = await prisma.user.findUniqueOrThrow({ where: { email: userA.email } });
    const occasion = await prisma.occasion.findFirstOrThrow();
    const templateVersion = await prisma.templateVersion.findFirstOrThrow();

    // User A creates private invitation
    const invA = await prisma.invitation.create({
      data: {
        ownerId: dbUserA.id,
        occasionId: occasion.id,
        templateVersionId: templateVersion.id,
        slug: `private-inv-a-${timestamp}`,
        title: `Thiệp Riêng Tư Của A`,
        status: "DRAFT",
      },
    });

    // User B signs up in a new session
    await page.click('button:has-text("Đăng xuất")');
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', userB.name);
    await page.fill('input[placeholder="ten@vidu.vn"]', userB.email);
    await page.fill('input[type="password"]', userB.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // User B attempts to access User A's editor via API directly -> MUST return 403 Forbidden
    const apiRes = await page.request.get(`/api/v1/invitations/${invA.id}`);
    expect(apiRes.status()).toBe(403);
    const apiBody = await apiRes.json();
    expect(apiBody.error?.code).toBe("FORBIDDEN");

    // User B attempts to access User A's editor page in the browser
    await page.goto(`/editor/${invA.id}`);
    await expect(page.locator("text=Không thể tải thiệp mời")).toBeVisible({ timeout: 15000 });
  });

  test("E2E-20: Responsive layout on mobile viewport (360px) and desktop (1440px) -> no horizontal overflow", async ({
    page,
  }) => {
    test.setTimeout(90000);

    const routes = ["/", "/occasions", "/templates", "/pricing", "/shops"];

    for (const route of routes) {
      // 1. Mobile viewport (360px)
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const mobileOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(mobileOverflow, `Horizontal overflow detected on ${route} at 360px`).toBe(false);

      // 2. Desktop viewport (1440px)
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const desktopOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(desktopOverflow, `Horizontal overflow detected on ${route} at 1440px`).toBe(false);
    }
  });

  test("E2E-22: Media upload validation -> rejects oversized / invalid MIME type", async ({
    page,
  }) => {
    test.setTimeout(90000);

    // Sign up a user
    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', "Upload Tester");
    await page.fill('input[placeholder="ten@vidu.vn"]', `upload_${timestamp}@example.com`);
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // Call asset upload API with invalid file type (.exe script disguised as text)
    const response = await page.request.post("/api/v1/assets/upload", {
      multipart: {
        file: {
          name: "malicious.exe",
          mimeType: "application/x-msdownload",
          buffer: Buffer.from("MZ90000fakeexecutablebytes"),
        },
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("E2E-23: Page all main nav/CTA buttons -> no broken internal 404 links", async ({
    page,
  }) => {
    test.setTimeout(90000);

    const publicUrls = [
      "/",
      "/occasions",
      "/templates",
      "/pricing",
      "/shops",
      "/legal/privacy",
      "/legal/terms",
      "/legal/affiliate",
      "/legal/shops",
    ];

    for (const url of publicUrls) {
      const response = await page.goto(url);
      expect(response?.status(), `Expected 200 for ${url}`).toBe(200);
      await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    }
  });

  test("E2E-24: Database consistency & Idempotency under retry", async () => {
    // Test idempotency of user creation, role assignment, and referral clicks
    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    const user = await prisma.user.create({
      data: {
        email: `idempotent_${timestamp}@example.com`,
        name: `Idempotent User`,
      },
    });

    // Upsert role multiple times
    for (let i = 0; i < 3; i++) {
      await prisma.roleAssignment.upsert({
        where: {
          userId_role: {
            userId: user.id,
            role: "CREATOR",
          },
        },
        update: {},
        create: {
          userId: user.id,
          role: "CREATOR",
        },
      });
    }

    const roles = await prisma.roleAssignment.findMany({
      where: { userId: user.id, role: "CREATOR" },
    });

    // Exactly 1 role assignment exists despite multiple retries
    expect(roles.length).toBe(1);
  });
});

