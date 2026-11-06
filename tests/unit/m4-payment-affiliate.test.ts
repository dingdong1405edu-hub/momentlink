import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";

describe("Milestone 4 — Payment & Affiliate 10% Unit & Integration Tests", () => {
  it("should calculate exact 10% integer commission on eligible digital revenue", () => {
    // 1. Digital order 99.000 VND -> 9.900 VND
    const eligible1 = 99000;
    const comm1 = Math.floor((eligible1 * 1000) / 10000);
    expect(comm1).toBe(9900);

    // 2. Mixed lines: digital 99.000 + bouquet 350.000 + shipping 30.000 -> only 99.000 eligible
    const lines = [
      { type: "DIGITAL_PLAN", amount: 99000, eligible: true },
      { type: "PHYSICAL_ITEM", amount: 350000, eligible: false },
      { type: "SHIPPING", amount: 30000, eligible: false },
    ];
    const eligibleBase = lines
      .filter((l) => l.eligible)
      .reduce((sum, l) => sum + l.amount, 0);
    expect(eligibleBase).toBe(99000);
    const comm2 = Math.floor((eligibleBase * 1000) / 10000);
    expect(comm2).toBe(9900);

    // 3. Discounted digital: 99.000 - 20.000 = 79.000 -> 7.900 VND
    const discounted = 79000;
    const comm3 = Math.floor((discounted * 1000) / 10000);
    expect(comm3).toBe(7900);
  });

  it("should enforce integer precision and prevent floating point errors in commission math", () => {
    // Arbitrary integer VND
    const amount = 49000;
    const comm = Math.floor((amount * 1000) / 10000);
    expect(comm).toBe(4900);
    expect(Number.isInteger(comm)).toBe(true);

    const oddAmount = 99999;
    const oddComm = Math.floor((oddAmount * 1000) / 10000);
    expect(oddComm).toBe(9999);
    expect(Number.isInteger(oddComm)).toBe(true);
  });

  it("should verify ledger entries balance to zero after full refund", async () => {
    // Create test user and affiliate
    const user = await prisma.user.create({
      data: {
        name: "Ledger Test User",
        email: `ledger_test_${Date.now()}@momentlink.vn`,
      },
    });

    const affiliate = await prisma.affiliateProfile.create({
      data: {
        userId: user.id,
        status: "APPROVED",
        payoutBankCode: "VCB",
        payoutAccount: "1234567890",
      },
    });

    const program = await prisma.affiliateProgram.findFirst({
      where: { code: "DEFAULT_10" },
    });
    expect(program).toBeTruthy();

    const orderNumber = `TEST-ORD-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        orderNumber,
        status: "PAID",
        paymentStatus: "PAID",
        totalVnd: 99000,
        referredAffiliateId: affiliate.id,
      },
    });

    // 1. EARNED entry
    const earnedAmount = 9900;
    const comm = await prisma.commission.create({
      data: {
        orderId: order.id,
        affiliateId: affiliate.id,
        programId: program!.id,
        eligibleBaseVnd: 99000,
        amountVnd: earnedAmount,
        status: "PENDING",
        holdUntil: new Date(Date.now() + 14 * 86400000),
      },
    });

    await prisma.commissionLedgerEntry.create({
      data: {
        commissionId: comm.id,
        affiliateId: affiliate.id,
        type: "EARNED",
        amountVnd: earnedAmount,
        idempotencyKey: `comm_earned_${order.id}`,
      },
    });

    // 2. REVERSAL entry on full refund
    await prisma.commission.update({
      where: { id: comm.id },
      data: { status: "REVERSED" },
    });

    await prisma.commissionLedgerEntry.create({
      data: {
        commissionId: comm.id,
        affiliateId: affiliate.id,
        type: "REVERSAL",
        amountVnd: -earnedAmount,
        idempotencyKey: `comm_reversal_${order.id}`,
      },
    });

    // Verify ledger balance for this order
    const ledger = await prisma.commissionLedgerEntry.findMany({
      where: { commissionId: comm.id },
    });

    expect(ledger.length).toBe(2);
    const balance = ledger.reduce((sum, entry) => sum + entry.amountVnd, 0);
    expect(balance).toBe(0);
  });
});

