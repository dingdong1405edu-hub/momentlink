import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";
import { verifyActivationSecret } from "@/lib/gift-cards";

const ActivateCardSchema = z.object({
  publicCode: z.string().min(4, "Mã thẻ không hợp lệ").toUpperCase(),
  activationSecret: z.string().min(6, "Mã kích hoạt bí mật không hợp lệ").toUpperCase(),
  invitationId: z.string().min(1, "Vui lòng chọn thiệp cần liên kết"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = ActivateCardSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Thông tin kích hoạt thẻ không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { publicCode, activationSecret, invitationId } = parsed.data;

    // Verify invitation ownership
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return apiError("Không tìm thấy thiệp mời để liên kết.", "NOT_FOUND", 404);
    }

    if (invitation.ownerId !== user.id && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền liên kết thẻ với thiệp của người khác.", "FORBIDDEN", 403);
    }

    // Atomic claim with concurrency protection (E2E-18)
    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.findUnique({
        where: { publicCode },
      });

      if (!card) {
        throw new Error("CARD_NOT_FOUND");
      }

      if (card.status === "CLAIMED" || card.status === "ACTIVE") {
        throw new Error("CARD_ALREADY_CLAIMED");
      }

      if (card.status === "REVOKED") {
        throw new Error("CARD_REVOKED");
      }

      const isValidSecret = verifyActivationSecret(activationSecret, card.activationSecretHash);
      if (!isValidSecret) {
        throw new Error("INVALID_ACTIVATION_SECRET");
      }

      // Update card
      const updatedCard = await tx.giftCard.update({
        where: { id: card.id },
        data: {
          status: "ACTIVE",
          ownerId: user.id,
          claimedAt: new Date(),
        },
      });

      // Deactivate any previous active bindings
      await tx.giftCardBinding.updateMany({
        where: {
          giftCardId: card.id,
          active: true,
        },
        data: { active: false },
      });

      // Create new binding
      const binding = await tx.giftCardBinding.create({
        data: {
          giftCardId: card.id,
          invitationId: invitation.id,
          createdBy: user.id,
          active: true,
        },
      });

      return { card: updatedCard, binding };
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "GIFT_CARD_ACTIVATED",
      resourceType: "GiftCard",
      resourceId: result.card.id,
      afterSummary: {
        publicCode,
        invitationId: invitation.id,
        invitationSlug: invitation.slug,
      },
    });

    return apiSuccess({
      message: "Kích hoạt thẻ QR thành công!",
      card: {
        publicCode: result.card.publicCode,
        status: result.card.status,
        invitationSlug: invitation.slug,
        invitationTitle: invitation.title,
      },
    });
  } catch (err: any) {
    if (err?.message === "CARD_NOT_FOUND") {
      return apiError("Không tìm thấy thẻ quà tặng.", "NOT_FOUND", 404);
    }
    if (err?.message === "CARD_ALREADY_CLAIMED") {
      return apiError("Thẻ quà tặng này đã được kích hoạt trước đó.", "CONFLICT", 409);
    }
    if (err?.message === "CARD_REVOKED") {
      return apiError("Thẻ quà tặng này đã bị thu hồi hoặc vô hiệu hóa.", "BAD_REQUEST", 400);
    }
    if (err?.message === "INVALID_ACTIVATION_SECRET") {
      return apiError("Mã kích hoạt bí mật không chính xác.", "BAD_REQUEST", 400);
    }
    return handleApiError(err);
  }
}

