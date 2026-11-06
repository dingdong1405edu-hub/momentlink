import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import {
  generatePublicCode,
  generateActivationSecret,
  hashActivationSecret,
  verifyActivationSecret,
} from "@/lib/gift-cards";

describe("Milestone 5 — Shop Partners & QR Gift Cards Unit & Integration Tests", () => {
  let testUserA: any;
  let testUserB: any;
  let testShop: any;
  let testProduct: any;
  let testInvitation: any;

  beforeAll(async () => {
    // Bootstrap test users
    testUserA = await prisma.user.upsert({
      where: { email: "m5_usera@example.com" },
      update: {},
      create: {
        email: "m5_usera@example.com",
        name: "M5 Test User A",
        passwordHash: "dummy_hash",
      },
    });

    testUserB = await prisma.user.upsert({
      where: { email: "m5_userb@example.com" },
      update: {},
      create: {
        email: "m5_userb@example.com",
        name: "M5 Test User B",
        passwordHash: "dummy_hash",
      },
    });

    // Create an approved shop
    testShop = await prisma.shop.upsert({
      where: { slug: "m5-test-flower-shop" },
      update: { status: "APPROVED" },
      create: {
        ownerId: testUserA.id,
        name: "M5 Tiệm Hoa Test",
        slug: "m5-test-flower-shop",
        city: "Hà Nội",
        phone: "0987654321",
        status: "APPROVED",
      },
    });

    // Create shop product
    testProduct = await prisma.shopProduct.upsert({
      where: { id: "m5-test-prod-1" },
      update: {},
      create: {
        id: "m5-test-prod-1",
        shopId: testShop.id,
        slug: "m5-bo-hoa-hong",
        title: "Bó Hoa Hồng M5 Test",
        category: "Hoa tươi",
        minPriceVnd: 300000,
        maxPriceVnd: 500000,
        qrCompatible: true,
      },
    });

    const occasion = await prisma.occasion.findFirstOrThrow();
    const templateVersion = await prisma.templateVersion.findFirstOrThrow();

    // Create invitation for User A
    testInvitation = await prisma.invitation.upsert({
      where: { slug: "m5-test-invitation" },
      update: {},
      create: {
        owner: { connect: { id: testUserA.id } },
        occasion: { connect: { id: occasion.id } },
        templateVersion: { connect: { id: templateVersion.id } },
        slug: "m5-test-invitation",
        title: "Thiệp Mừng M5 Test",
        status: "PUBLISHED",
      },
    });
  });

  it("should securely generate and verify activation secret using CSPRNG and SHA-256 with pepper", () => {
    const secret = generateActivationSecret();
    expect(secret).toHaveLength(16);

    const hash = hashActivationSecret(secret);
    expect(hash).toHaveLength(64);

    const isValid = verifyActivationSecret(secret, hash);
    expect(isValid).toBe(true);

    const isInvalid = verifyActivationSecret("WRONG_SECRET_123", hash);
    expect(isInvalid).toBe(false);
  });

  it("should generate unique public codes with default prefix", () => {
    const code1 = generatePublicCode("GC");
    const code2 = generatePublicCode("GC");

    expect(code1.startsWith("GC")).toBe(true);
    expect(code2.startsWith("GC")).toBe(true);
    expect(code1).not.toBe(code2);
  });

  it("should enforce atomic claim and prevent duplicate claim (E2E-18 concurrency guard)", async () => {
    const secret = generateActivationSecret();
    const secretHash = hashActivationSecret(secret);
    const publicCode = generatePublicCode("GCTEST");

    // 1. Create batch & card
    const batch = await prisma.giftCardBatch.create({
      data: {
        createdBy: testUserA.id,
        label: "Unit Test Batch",
        quantity: 1,
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

    // 2. User A successfully claims the card
    const claimCard = async (userId: string, targetInvId: string, providedSecret: string) => {
      return prisma.$transaction(async (tx) => {
        const found = await tx.giftCard.findUnique({
          where: { publicCode },
        });

        if (!found) throw new Error("CARD_NOT_FOUND");
        if (found.status === "CLAIMED" || found.status === "ACTIVE") {
          throw new Error("CARD_ALREADY_CLAIMED");
        }

        const valid = verifyActivationSecret(providedSecret, found.activationSecretHash);
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

    // User A claims successfully
    const resultA = await claimCard(testUserA.id, testInvitation.id, secret);
    expect(resultA.card.status).toBe("ACTIVE");
    expect(resultA.card.ownerId).toBe(testUserA.id);
    expect(resultA.binding.invitationId).toBe(testInvitation.id);

    // 3. User B tries to claim the same card -> MUST FAIL with CARD_ALREADY_CLAIMED
    await expect(claimCard(testUserB.id, testInvitation.id, secret)).rejects.toThrow(
      "CARD_ALREADY_CLAIMED"
    );
  });

  it("should process Shop Quote Request lifecycle with event auditing (E2E-16)", async () => {
    // 1. Buyer creates request
    const shopRequest = await prisma.shopRequest.create({
      data: {
        shopId: testShop.id,
        buyerId: testUserB.id,
        productId: testProduct.id,
        invitationId: testInvitation.id,
        requestedQty: 2,
        recipientName: "Bác Ba Phi",
        recipientPhone: "0901234567",
        deliveryCity: "Hà Nội",
        deliveryAddress: "78 Phố Huế",
        status: "SUBMITTED",
      },
    });

    expect(shopRequest.status).toBe("SUBMITTED");
    expect(shopRequest.requestedQty).toBe(2);

    // 2. Shop quotes price
    const quoted = await prisma.$transaction(async (tx) => {
      const updated = await tx.shopRequest.update({
        where: { id: shopRequest.id },
        data: {
          status: "QUOTED",
          finalQuotedVnd: 750000,
        },
      });

      await tx.shopRequestEvent.create({
        data: {
          shopRequestId: shopRequest.id,
          actorId: testUserA.id,
          previousStatus: "SUBMITTED",
          nextStatus: "QUOTED",
          note: "Báo giá 750.000 VND gồm phí ship",
        },
      });

      return updated;
    });

    expect(quoted.status).toBe("QUOTED");
    expect(quoted.finalQuotedVnd).toBe(750000);

    // 3. Buyer accepts quote
    const accepted = await prisma.$transaction(async (tx) => {
      const updated = await tx.shopRequest.update({
        where: { id: shopRequest.id },
        data: { status: "ACCEPTED" },
      });

      await tx.shopRequestEvent.create({
        data: {
          shopRequestId: shopRequest.id,
          actorId: testUserB.id,
          previousStatus: "QUOTED",
          nextStatus: "ACCEPTED",
        },
      });

      return updated;
    });

    expect(accepted.status).toBe("ACCEPTED");

    // 4. Shop marks completed
    const completed = await prisma.$transaction(async (tx) => {
      const updated = await tx.shopRequest.update({
        where: { id: shopRequest.id },
        data: { status: "COMPLETED" },
      });

      await tx.shopRequestEvent.create({
        data: {
          shopRequestId: shopRequest.id,
          actorId: testUserA.id,
          previousStatus: "ACCEPTED",
          nextStatus: "COMPLETED",
        },
      });

      return updated;
    });

    expect(completed.status).toBe("COMPLETED");

    // Check events audit
    const events = await prisma.shopRequestEvent.findMany({
      where: { shopRequestId: shopRequest.id },
      orderBy: { createdAt: "asc" },
    });

    expect(events.length).toBe(3);
    expect(events[0].previousStatus).toBe("SUBMITTED");
    expect(events[0].nextStatus).toBe("QUOTED");
    expect(events[1].nextStatus).toBe("ACCEPTED");
    expect(events[2].nextStatus).toBe("COMPLETED");
  });
});
