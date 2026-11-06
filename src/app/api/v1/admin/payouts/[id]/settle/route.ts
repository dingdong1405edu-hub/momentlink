import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const SettleSchema = z.object({
  externalReference: z.string().min(1, "Mã tham chiếu ngân hàng không được để trống"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await req.json().catch(() => ({}));
    const parsed = SettleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Mã tham chiếu ngân hàng không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { externalReference } = parsed.data;

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: params.id },
    });

    if (!payout) {
      return apiError("Không tìm thấy yêu cầu rút tiền.", "NOT_FOUND", 404);
    }

    if (payout.status === "PAID") {
      return apiError("Yêu cầu rút tiền này đã được thanh toán trước đó.", "ALREADY_PAID", 400);
    }

    const updated = await prisma.payoutRequest.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        reviewedBy: admin.id,
        externalReference,
      },
    });

    await logAudit({
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "PAYOUT_SETTLED",
      resourceType: "PayoutRequest",
      resourceId: payout.id,
      afterSummary: {
        amountVnd: updated.amountVnd,
        externalReference,
        status: updated.status,
      },
    });

    return apiSuccess({
      message: "Đã đánh dấu thanh toán hoa hồng thành công.",
      payout: {
        id: updated.id,
        status: updated.status,
        paidAt: updated.paidAt,
        externalReference: updated.externalReference,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
