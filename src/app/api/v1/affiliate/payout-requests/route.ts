import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const PayoutRequestSchema = z.object({
  amountVnd: z.number().int().min(100000, "Số tiền rút tối thiểu là 100.000 đ"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = PayoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Dữ liệu yêu cầu rút tiền không hợp lệ. Tối thiểu 100.000 đ.", "VALIDATION_ERROR", 400);
    }

    const { amountVnd } = parsed.data;

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
      include: {
        commissions: true,
        ledgerEntries: true,
      },
    });

    if (!profile || profile.status !== "APPROVED") {
      return apiError("Tài khoản của bạn chưa được duyệt làm Cộng tác viên.", "FORBIDDEN", 403);
    }

    const now = new Date();

    // Calculate available balance
    const maturedCommissions = profile.commissions.filter(
      (c) => c.status !== "REVERSED" && new Date(c.holdUntil) <= now
    );
    const earnedMatured = maturedCommissions.reduce((sum, c) => sum + c.amountVnd, 0);

    const payoutDebits = profile.ledgerEntries
      .filter((e) => e.type === "PAYOUT_DEBIT")
      .reduce((sum, e) => sum + Math.abs(e.amountVnd), 0);

    const availableBalance = Math.max(0, earnedMatured - payoutDebits);

    if (amountVnd > availableBalance) {
      return apiError(
        `Số dư khả dụng (${availableBalance.toLocaleString("vi-VN")} đ) không đủ để rút ${amountVnd.toLocaleString("vi-VN")} đ.`,
        "INSUFFICIENT_BALANCE",
        400
      );
    }

    // Atomic creation of PayoutRequest and Ledger debit entry
    const payout = await prisma.$transaction(async (tx) => {
      const p = await tx.payoutRequest.create({
        data: {
          affiliateId: profile.id,
          amountVnd,
          status: "REQUESTED",
        },
      });

      await tx.commissionLedgerEntry.create({
        data: {
          affiliateId: profile.id,
          payoutId: p.id,
          type: "PAYOUT_DEBIT",
          amountVnd: -amountVnd,
          idempotencyKey: `payout_req_${p.id}`,
          effectiveAt: now,
        },
      });

      return p;
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "PAYOUT_REQUESTED",
      resourceType: "PayoutRequest",
      resourceId: payout.id,
      afterSummary: {
        amountVnd,
        status: payout.status,
      },
    });

    return apiSuccess({
      message: "Yêu cầu rút hoa hồng đã được ghi nhận. Quản trị viên sẽ đối soát và thanh toán.",
      payout: {
        id: payout.id,
        amountVnd: payout.amountVnd,
        status: payout.status,
        requestAt: payout.requestAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

