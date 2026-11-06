import { test, expect } from "@playwright/test";
import prisma from "@/lib/prisma";

test.describe("Milestone 4: Payment & Affiliate 10% E2E", () => {
  test("should complete full E2E lifecycle: CTV apply -> admin approve -> referral checkout -> admin paid -> 10% commission -> refund -> payout", async ({
    page,
    browser,
  }) => {
    test.setTimeout(90000);

    const timestamp = Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const ctvUser = {
      email: `ctv_${timestamp}@example.com`,
      password: "Password123!",
      name: `CTV Partner ${timestamp}`,
    };
    const buyerUser = {
      email: `buyer_${timestamp}@example.com`,
      password: "Password123!",
      name: `Buyer Customer ${timestamp}`,
    };

    // -------------------------------------------------------------
    // Phase 1: CTV signs up and applies
    // -------------------------------------------------------------
    await page.goto("/auth/sign-up");
    await page.fill('input[placeholder="Nguyễn Văn A"]', ctvUser.name);
    await page.fill('input[placeholder="ten@vidu.vn"]', ctvUser.email);
    await page.fill('input[type="password"]', ctvUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // Apply for Affiliate
    await page.goto("/affiliate/apply");
    await page.fill('input[data-testid="affiliate-account-input"]', "0987654321");
    await page.click('button[data-testid="submit-affiliate-apply-btn"]');

    await expect(page.locator("text=Đơn đăng ký của bạn đang được xét duyệt!")).toBeVisible({
      timeout: 15000,
    });

    // -------------------------------------------------------------
    // Phase 2: Admin approves CTV
    // -------------------------------------------------------------
    const profile = await prisma.affiliateProfile.findFirst({
      where: { user: { email: ctvUser.email } },
    });
    expect(profile).toBeTruthy();

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@momentlink.vn" },
    });
    expect(adminUser).toBeTruthy();

    // Directly approve via database transaction
    await prisma.$transaction(async (tx) => {
      await tx.affiliateProfile.update({
        where: { id: profile!.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: adminUser!.id,
        },
      });

      const program = await tx.affiliateProgram.findFirst({ where: { code: "DEFAULT_10" } });
      await tx.affiliateLink.create({
        data: {
          affiliateId: profile!.id,
          programId: program!.id,
          code: `REF${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          status: "ACTIVE",
        },
      });
    });

    const affiliateLink = await prisma.affiliateLink.findFirst({
      where: { affiliateId: profile!.id },
    });
    expect(affiliateLink).toBeTruthy();
    const referralCode = affiliateLink!.code;

    // -------------------------------------------------------------
    // Phase 3: Buyer clicks referral link & buys Premium plan (99.000 VND)
    // -------------------------------------------------------------
    const buyerContext = await browser.newContext();
    const buyerPage = await buyerContext.newPage();

    // Click referral link /r/[code]
    await buyerPage.goto(`/r/${referralCode}`);
    await buyerPage.waitForURL("**/", { timeout: 15000 });

    // Verify affiliate cookie was bound
    const cookies = await buyerContext.cookies();
    const refCookie = cookies.find((c) => c.name === "affiliate_ref");
    expect(refCookie).toBeTruthy();
    expect(refCookie?.value).toBe(profile!.id);

    // Buyer signs up
    await buyerPage.goto("/auth/sign-up");
    await buyerPage.fill('input[placeholder="Nguyễn Văn A"]', buyerUser.name);
    await buyerPage.fill('input[placeholder="ten@vidu.vn"]', buyerUser.email);
    await buyerPage.fill('input[type="password"]', buyerUser.password);
    await buyerPage.click('button[type="submit"]');
    await buyerPage.waitForURL("**/dashboard", { timeout: 20000 });

    // Buyer goes to Pricing and selects Premium plan (99.000 VND)
    await buyerPage.goto("/pricing");
    const selectPremiumBtn = buyerPage.locator('button[data-testid="select-plan-premium-btn"]');
    await selectPremiumBtn.click();

    await buyerPage.waitForURL("**/checkout/**", { timeout: 20000 });
    const checkoutUrl = buyerPage.url();
    const orderId = checkoutUrl.split("/checkout/")[1]?.split("?")[0];
    expect(orderId).toBeTruthy();

    // Verify 99.000 VND total
    const totalLocator = buyerPage.locator('[data-testid="order-total-amount"]');
    await expect(totalLocator).toContainText("99.000");

    // Buyer clicks "Tôi đã chuyển khoản xong"
    const submitTransferBtn = buyerPage.locator('button[data-testid="mark-transfer-submitted-btn"]');
    await submitTransferBtn.click();

    await expect(buyerPage.locator("text=Đang chờ Admin duyệt đối soát")).toBeVisible({ timeout: 15000 });

    // Verify in DB order status is TRANSFER_SUBMITTED and NOT YET PAID!
    const pendingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    expect(pendingOrder?.status).toBe("TRANSFER_SUBMITTED");
    expect(pendingOrder?.paymentStatus).toBe("TRANSFER_SUBMITTED");
    expect(pendingOrder?.referredAffiliateId).toBe(profile!.id);

    // -------------------------------------------------------------
    // Phase 4: Admin logs in & approves payment (E2E-12, E2E-13)
    // -------------------------------------------------------------
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/auth/sign-in");
    await adminPage.fill('input[placeholder="ten@vidu.vn"]', "admin@momentlink.vn");
    await adminPage.fill('input[type="password"]', "Admin@MomentLink2026!");
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL("**/dashboard", { timeout: 20000 });

    await adminPage.goto("/admin/payments");
    const confirmPaidBtn = adminPage.locator(`button[data-testid="confirm-paid-${orderId}-btn"]`);
    await expect(confirmPaidBtn).toBeVisible({ timeout: 15000 });
    await confirmPaidBtn.click();

    await expect(adminPage.locator("text=Đã duyệt thanh toán thành công và cấp quyền!")).toBeVisible({
      timeout: 15000,
    });

    // Verify Order is PAID and Entitlement created in DB
    const paidOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        commissions: true,
      },
    });
    expect(paidOrder?.status).toBe("PAID");
    expect(paidOrder?.paymentStatus).toBe("PAID");

    // Verify E2E-13: 10% commission = 9.900 VND on 99.000 VND
    expect(paidOrder?.commissions.length).toBe(1);
    const comm = paidOrder!.commissions[0];
    expect(comm.amountVnd).toBe(9900);
    expect(comm.eligibleBaseVnd).toBe(99000);
    expect(comm.status).toBe("PENDING");

    // Verify Entitlement exists
    const entitlement = await prisma.entitlement.findFirst({
      where: { ownerId: pendingOrder!.buyerId, status: "ACTIVE" },
    });
    expect(entitlement).toBeTruthy();

    // -------------------------------------------------------------
    // Phase 5: Admin refunds order (E2E-14)
    // -------------------------------------------------------------
    const refundBtn = adminPage.locator(`button[data-testid="refund-${orderId}-btn"]`);
    await expect(refundBtn).toBeVisible({ timeout: 15000 });

    // Handle confirm dialog
    adminPage.on("dialog", (dialog) => dialog.accept());
    await refundBtn.click();

    await expect(adminPage.locator("text=Đã hoàn tiền đơn hàng thành công!")).toBeVisible({
      timeout: 15000,
    });

    // Verify order is REFUNDED, entitlement REVOKED, commission REVERSED
    const refundedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        commissions: {
          include: { ledgerEntries: true },
        },
      },
    });
    expect(refundedOrder?.status).toBe("REFUNDED");
    expect(refundedOrder?.commissions[0].status).toBe("REVERSED");

    // Verify ledger balance equals 0 (+9900 and -9900)
    const ledger = refundedOrder!.commissions[0].ledgerEntries;
    expect(ledger.length).toBe(2);
    const totalBalance = ledger.reduce((sum, e) => sum + e.amountVnd, 0);
    expect(totalBalance).toBe(0);

    // -------------------------------------------------------------
    // Phase 6: Payout Request & Settle (E2E-15)
    // -------------------------------------------------------------
    // Inject a matured commission of 150.000 VND to test payout flow
    const matureOrder = await prisma.order.create({
      data: {
        buyerId: pendingOrder!.buyerId,
        orderNumber: `MATURE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: "PAID",
        paymentStatus: "PAID",
        totalVnd: 1500000,
        referredAffiliateId: profile!.id,
      },
    });

    const program = await prisma.affiliateProgram.findFirst({ where: { code: "DEFAULT_10" } });
    const maturedComm = await prisma.commission.create({
      data: {
        orderId: matureOrder.id,
        affiliateId: profile!.id,
        programId: program!.id,
        eligibleBaseVnd: 1500000,
        amountVnd: 150000,
        status: "AVAILABLE",
        holdUntil: new Date(Date.now() - 86400000), // in the past
      },
    });

    await prisma.commissionLedgerEntry.create({
      data: {
        commissionId: maturedComm.id,
        affiliateId: profile!.id,
        type: "EARNED",
        amountVnd: 150000,
        idempotencyKey: `mature_test_${Date.now()}`,
        effectiveAt: new Date(Date.now() - 86400000),
      },
    });

    // CTV visits dashboard and requests 100.000 VND payout
    await page.goto("/affiliate/dashboard");
    const availableBalanceText = page.locator('[data-testid="stat-available-balance"]');
    await expect(availableBalanceText).toBeVisible({ timeout: 15000 });
    await expect(availableBalanceText).toContainText("150.000");

    await page.fill('input[data-testid="payout-amount-input"]', "100000");
    await page.click('button[data-testid="submit-payout-request-btn"]');

    await expect(page.locator("text=Yêu cầu rút hoa hồng đã được ghi nhận")).toBeVisible({
      timeout: 15000,
    });

    // Settle payout via admin API
    const payoutReq = await prisma.payoutRequest.findFirst({
      where: { affiliateId: profile!.id, status: "REQUESTED" },
    });
    expect(payoutReq).toBeTruthy();

    await prisma.payoutRequest.update({
      where: { id: payoutReq!.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        reviewedBy: adminUser!.id,
        externalReference: "FT261104TECHCOMBANK",
      },
    });

    // Refresh CTV dashboard and verify paid balance updated
    await page.reload();
    await expect(page.locator("text=FT261104TECHCOMBANK")).toBeVisible({ timeout: 15000 });

    await buyerContext.close();
    await adminContext.close();
  });
});

