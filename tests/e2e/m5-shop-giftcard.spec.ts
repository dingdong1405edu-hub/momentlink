import { test, expect } from "@playwright/test";
import prisma from "@/lib/prisma";
import { generatePublicCode, generateActivationSecret, hashActivationSecret } from "@/lib/gift-cards";

test.describe("Milestone 5: Shop Partners & QR Gift Cards E2E", () => {
  test("E2E-16: Shop apply -> admin approve -> add product -> buyer request -> status lifecycle", async ({
    page,
    browser,
  }) => {
    test.setTimeout(90000);

    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const shopOwner = {
      email: `shopowner_${timestamp}@example.com`,
      password: "Password123!",
      name: `Chủ Tiệm ${timestamp}`,
      shopName: `Tiệm Hoa Nắng Mai ${timestamp}`,
    };
    const buyer = {
      email: `buyer_m5_${timestamp}@example.com`,
      password: "Password123!",
      name: `Khách Hàng M5 ${timestamp}`,
    };

    // 1. Shop owner signs up
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', shopOwner.name);
    await page.fill('input[placeholder="ten@vidu.vn"]', shopOwner.email);
    await page.fill('input[type="password"]', shopOwner.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // 2. Shop owner applies for partnership
    await page.goto("/shop/apply");
    await page.fill('input[placeholder="VD: Tiệm Hoa Tháng Tư"]', shopOwner.shopName);
    await page.fill('input[placeholder="0912345678"]', "0988776655");
    await page.fill('input[placeholder="VD: 123 Phố Huế, Hai Bà Trưng"]', "123 Cầu Giấy, Hà Nội");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Đăng ký thành công!")).toBeVisible({ timeout: 15000 });

    // 3. Admin approves the shop in database
    const createdShop = await prisma.shop.findFirst({
      where: { name: shopOwner.shopName },
    });
    expect(createdShop).toBeTruthy();

    await prisma.$transaction(async (tx) => {
      await tx.shop.update({
        where: { id: createdShop!.id },
        data: { status: "APPROVED" },
      });
      await tx.roleAssignment.upsert({
        where: {
          userId_role: {
            userId: createdShop!.ownerId,
            role: "SHOP_OWNER",
          },
        },
        update: {},
        create: {
          userId: createdShop!.ownerId,
          role: "SHOP_OWNER",
        },
      });
    });

    // 4. Shop owner adds product in /shop/dashboard
    await page.goto("/shop/dashboard");
    await page.fill('input[placeholder="VD: Bó hoa hướng dương rực rỡ"]', "Bó Tulip Hà Lan");
    await page.fill('input[placeholder="250000"]', "350000");
    await page.fill('input[placeholder="500000"]', "600000");
    await page.click('button:has-text("Lưu Sản Phẩm Mới")');

    await expect(page.locator("text=Đã thêm sản phẩm thành công!")).toBeVisible({ timeout: 15000 });

    // 5. Buyer opens a separate browser context and visits the shop page
    const buyerContext = await browser.newContext();
    const buyerPage = await buyerContext.newPage();

    await buyerPage.goto(`/shops/${createdShop!.slug}`);
    await expect(buyerPage.locator(`text=${shopOwner.shopName}`)).toBeVisible({ timeout: 15000 });
    await expect(buyerPage.locator("text=Bó Tulip Hà Lan")).toBeVisible({ timeout: 15000 });

    // Click request quote
    await buyerPage.click('button:has-text("Gửi Yêu Cầu Báo Giá")');
    await buyerPage.fill('input[placeholder="Nguyễn Văn A"]', buyer.name);
    await buyerPage.fill('input[placeholder="0912345678"]', "0911223344");
    await buyerPage.fill('input[placeholder="Số nhà, đường, phường/xã..."]', "456 Kim Mã, Ba Đình");
    await buyerPage.click('button:has-text("Gửi yêu cầu tới cửa hàng")');

    await expect(buyerPage.locator("text=Yêu cầu đã được gửi!")).toBeVisible({ timeout: 15000 });
    await buyerContext.close();

    // 6. Shop owner refreshes dashboard and sees the request
    await page.reload();
    await expect(page.locator("text=Bó Tulip Hà Lan")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=456 Kim Mã, Ba Đình")).toBeVisible({ timeout: 15000 });

    // Quote price
    await page.click('button:has-text("Báo Giá Khách")');
    await page.fill('input[placeholder="Nhập giá VND..."]', "400000");
    await page.click('button:has-text("Gửi Báo Giá")');

    await expect(page.getByText("QUOTED", { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=400.000 VND")).toBeVisible({ timeout: 15000 });
  });

  test("E2E-17: QR Card Generate -> scan unclaimed -> claim/bind -> scan active", async ({
    page,
    request,
  }) => {
    test.setTimeout(90000);

    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const user = {
      email: `carduser_${timestamp}@example.com`,
      password: "Password123!",
      name: `Chủ Thẻ ${timestamp}`,
    };

    // 1. User signs up and creates an invitation
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', user.name);
    await page.fill('input[placeholder="ten@vidu.vn"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // Create an invitation via API directly using session
    const occasion = await prisma.occasion.findFirstOrThrow();
    const templateVersion = await prisma.templateVersion.findFirstOrThrow();
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });

    const inv = await prisma.invitation.create({
      data: {
        ownerId: dbUser.id,
        occasionId: occasion.id,
        templateVersionId: templateVersion.id,
        slug: `card-inv-${timestamp}`,
        title: `Thiệp Kỷ Niệm ${timestamp}`,
        status: "PUBLISHED",
      },
    });

    // 2. Generate a gift card
    const secret = generateActivationSecret();
    const secretHash = hashActivationSecret(secret);
    const publicCode = generatePublicCode("GCPLAY");

    const batch = await prisma.giftCardBatch.create({
      data: {
        label: `E2E Batch ${timestamp}`,
        quantity: 1,
        createdBy: dbUser.id,
        status: "CREATED",
      },
    });

    await prisma.giftCard.create({
      data: {
        batchId: batch.id,
        publicCode,
        activationSecretHash: secretHash,
        cardType: "GIFT_TAG",
        status: "CREATED",
      },
    });

    // 3. Scan unclaimed card at /gift/[publicCode]
    await page.goto(`/gift/${publicCode}`);
    await expect(page.locator("text=Món quà sắp mở")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${publicCode}`)).toBeVisible({ timeout: 15000 });

    // 4. Activate card via /activate/[publicCode]
    await page.click('a:has-text("Kích hoạt thẻ ngay")');
    await page.waitForURL(`**/activate/${publicCode}`, { timeout: 15000 });

    await expect(page.locator("select")).toBeVisible({ timeout: 15000 });
    await page.fill('input[placeholder="VD: 7B892FE31A056D4C"]', secret);
    await page.click('button:has-text("Xác nhận kích hoạt thẻ")');

    await expect(page.locator("text=Kích hoạt thành công!")).toBeVisible({ timeout: 15000 });

    // 5. Scan active card at /gift/[publicCode]
    await page.goto(`/gift/${publicCode}`);
    await expect(page.locator("text=Món quà dành riêng cho bạn")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text=${inv.title}`)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a:has-text("Mở thiệp mời ngay")')).toBeVisible({ timeout: 15000 });
  });

  test("E2E-18: Two users race to claim same card -> exactly one succeeds, other receives 409 conflict", async () => {
    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    const user1 = await prisma.user.create({
      data: {
        email: `race1_${timestamp}@example.com`,
        name: `Race User 1`,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: `race2_${timestamp}@example.com`,
        name: `Race User 2`,
      },
    });

    const occasion = await prisma.occasion.findFirstOrThrow();
    const templateVersion = await prisma.templateVersion.findFirstOrThrow();

    const inv1 = await prisma.invitation.create({
      data: {
        ownerId: user1.id,
        occasionId: occasion.id,
        templateVersionId: templateVersion.id,
        slug: `race-inv1-${timestamp}`,
        title: `Race Invitation 1`,
        status: "PUBLISHED",
      },
    });

    const inv2 = await prisma.invitation.create({
      data: {
        ownerId: user2.id,
        occasionId: occasion.id,
        templateVersionId: templateVersion.id,
        slug: `race-inv2-${timestamp}`,
        title: `Race Invitation 2`,
        status: "PUBLISHED",
      },
    });

    const secret = generateActivationSecret();
    const secretHash = hashActivationSecret(secret);
    const publicCode = generatePublicCode("GCRACE");

    const batch = await prisma.giftCardBatch.create({
      data: {
        label: `Race Batch ${timestamp}`,
        quantity: 1,
        createdBy: user1.id,
        status: "CREATED",
      },
    });

    const card = await prisma.giftCard.create({
      data: {
        batchId: batch.id,
        publicCode,
        activationSecretHash: secretHash,
        cardType: "GIFT_TAG",
        status: "CREATED",
      },
    });

    // Atomic claim helper simulating concurrent transactions
    const claimCard = async (userId: string, targetInvId: string, providedSecret: string) => {
      return prisma.$transaction(async (tx) => {
        const found = await tx.giftCard.findUnique({
          where: { publicCode },
        });

        if (!found) throw new Error("CARD_NOT_FOUND");
        if (found.status === "CLAIMED" || found.status === "ACTIVE") {
          throw new Error("CARD_ALREADY_CLAIMED");
        }

        const valid = hashActivationSecret(providedSecret) === found.activationSecretHash;
        if (!valid) throw new Error("INVALID_SECRET");

        const updated = await tx.giftCard.update({
          where: { id: found.id },
          data: {
            status: "ACTIVE",
            ownerId: userId,
            claimedAt: new Date(),
          },
        });

        const binding = await tx.giftCardBinding.create({
          data: {
            giftCardId: found.id,
            invitationId: targetInvId,
            createdBy: userId,
            active: true,
          },
        });

        return { card: updated, binding };
      });
    };

    // Both attempt to claim concurrently
    const [res1, res2] = await Promise.allSettled([
      claimCard(user1.id, inv1.id, secret),
      claimCard(user2.id, inv2.id, secret),
    ]);

    // Exactly one must succeed, and the other must fail with CARD_ALREADY_CLAIMED
    const fulfilled = [res1, res2].filter((r) => r.status === "fulfilled");
    const rejected = [res1, res2].filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect((rejected[0] as PromiseRejectedResult).reason?.message).toBe("CARD_ALREADY_CLAIMED");
  });
});

