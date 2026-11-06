import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const affiliates = await prisma.affiliateProfile.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        links: true,
        commissions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({
      affiliates: affiliates.map((a) => ({
        id: a.id,
        user: a.user,
        status: a.status,
        payoutBankCode: a.payoutBankCode,
        payoutAccount: a.payoutAccount,
        linksCount: a.links.length,
        referralCode: a.links[0]?.code || null,
        totalCommissionsCount: a.commissions.length,
        approvedAt: a.approvedAt,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
