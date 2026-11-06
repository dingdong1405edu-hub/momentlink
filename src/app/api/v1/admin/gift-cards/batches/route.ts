import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";
import {
  generatePublicCode,
  generateActivationSecret,
  hashActivationSecret,
} from "@/lib/gift-cards";

const CreateBatchSchema = z.object({
  label: z.string().min(2, "Nhãn lô thẻ phải có ít nhất 2 ký tự"),
  quantity: z.number().int().min(1).max(500, "Tối đa 500 thẻ mỗi lô"),
  cardType: z
    .enum(["GIFT_TAG", "LOVE_CARD", "GRAD_CARD", "BIRTHDAY_CARD", "WEDDING_CARD"])
    .default("GIFT_TAG"),
  assignedShopId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await req.json().catch(() => ({}));
    const parsed = CreateBatchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Thông tin tạo lô thẻ không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { label, quantity, cardType, assignedShopId } = parsed.data;

    // Generate cards in memory
    const generatedCards: Array<{
      publicCode: string;
      activationSecret: string;
      activationSecretHash: string;
      cardType: string;
    }> = [];

    const existingCodes = new Set<string>();

    for (let i = 0; i < quantity; i++) {
      let code = generatePublicCode();
      while (existingCodes.has(code)) {
        code = generatePublicCode();
      }
      existingCodes.add(code);

      const secret = generateActivationSecret();
      const secretHash = hashActivationSecret(secret);

      generatedCards.push({
        publicCode: code,
        activationSecret: secret,
        activationSecretHash: secretHash,
        cardType,
      });
    }

    // Persist batch and cards in transaction
    const batch = await prisma.$transaction(async (tx) => {
      const b = await tx.giftCardBatch.create({
        data: {
          label,
          quantity,
          status: assignedShopId ? "ASSIGNED" : "CREATED",
          assignedShopId: assignedShopId || null,
          createdBy: admin.id,
          exportedAt: new Date(),
        },
      });

      for (const card of generatedCards) {
        await tx.giftCard.create({
          data: {
            batchId: b.id,
            publicCode: card.publicCode,
            activationSecretHash: card.activationSecretHash,
            cardType: card.cardType,
            status: assignedShopId ? "ASSIGNED" : "CREATED",
            assignedShopId: assignedShopId || null,
          },
        });
      }

      return b;
    });

    await logAudit({
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "GIFT_CARD_BATCH_CREATED",
      resourceType: "GiftCardBatch",
      resourceId: batch.id,
      afterSummary: { label, quantity, cardType, assignedShopId },
    });

    return apiSuccess({
      message: `Tạo lô ${quantity} thẻ QR vật lý thành công.`,
      batch: {
        id: batch.id,
        label: batch.label,
        quantity: batch.quantity,
        status: batch.status,
        createdAt: batch.createdAt,
      },
      // Manifest returned only during creation so admin can print/distribute
      cards: generatedCards.map((c) => ({
        publicCode: c.publicCode,
        activationSecret: c.activationSecret,
        cardType: c.cardType,
        scanUrl: `/gift/${c.publicCode}`,
        activateUrl: `/activate/${c.publicCode}`,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const batches = await prisma.giftCardBatch.findMany({
      include: {
        assignedShop: { select: { id: true, name: true } },
        _count: {
          select: {
            cards: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ batches });
  } catch (err) {
    return handleApiError(err);
  }
}
