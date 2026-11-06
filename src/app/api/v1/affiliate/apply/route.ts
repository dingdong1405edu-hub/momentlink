import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const ApplySchema = z.object({
  payoutAccount: z.string().min(5, "Số tài khoản ngân hàng không hợp lệ"),
  payoutBankCode: z.string().min(2, "Mã ngân hàng không hợp lệ"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = ApplySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Thông tin đăng ký không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { payoutAccount, payoutBankCode } = parsed.data;

    const existing = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
    });

    if (existing && existing.status === "APPROVED") {
      return apiSuccess({
        message: "Tài khoản của bạn đã là Cộng tác viên được phê duyệt.",
        affiliate: existing,
      });
    }

    const profile = await prisma.affiliateProfile.upsert({
      where: { userId: user.id },
      update: {
        payoutAccount,
        payoutBankCode,
        status: "APPLIED",
        termsVersionAcceptedAt: new Date(),
      },
      create: {
        userId: user.id,
        payoutAccount,
        payoutBankCode,
        status: "APPLIED",
        termsVersionAcceptedAt: new Date(),
      },
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "AFFILIATE_APPLIED",
      resourceType: "AffiliateProfile",
      resourceId: profile.id,
    });

    return apiSuccess({
      message: "Đơn đăng ký CTV của bạn đã được gửi thành công và đang chờ xét duyệt.",
      affiliate: {
        id: profile.id,
        status: profile.status,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

