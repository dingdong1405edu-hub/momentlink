import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
      include: {
        links: {
          include: {
            clicks: true,
          },
        },
        commissions: {
          include: {
            order: {
              select: {
                orderNumber: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        ledgerEntries: true,
        payoutRequests: {
          orderBy: { requestAt: "desc" },
        },
      },
    });

    if (!profile) {
      return apiSuccess({
        status: "NOT_APPLIED",
        message: "Bạn chưa đăng ký làm Cộng tác viên (CTV).",
      });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const activeLink = profile.links.find((l) => l.status === "ACTIVE");
    const referralUrl = activeLink ? `${protocol}://${host}/r/${activeLink.code}` : null;

    // Aggregate statistics
    const totalClicks = profile.links.reduce((acc, l) => acc + l.clicks.length, 0);
    const paidCommissions = profile.commissions.filter((c) => c.order.status === "PAID" && c.status !== "REVERSED");
    const totalConversions = paidCommissions.length;
    const totalEligibleRevenue = paidCommissions.reduce((sum, c) => sum + c.eligibleBaseVnd, 0);

    const now = new Date();

    // Balances
    const pendingCommissions = profile.commissions.filter(
      (c) => c.status === "PENDING" && new Date(c.holdUntil) > now
    );
    const pendingBalance = pendingCommissions.reduce((sum, c) => sum + c.amountVnd, 0);

    // Matured commissions past hold date (14 days) and not reversed
    const maturedCommissions = profile.commissions.filter(
      (c) => c.status !== "REVERSED" && new Date(c.holdUntil) <= now
    );
    const earnedMatured = maturedCommissions.reduce((sum, c) => sum + c.amountVnd, 0);

    // Debited / requested payouts
    const payoutDebits = profile.ledgerEntries
      .filter((e) => e.type === "PAYOUT_DEBIT")
      .reduce((sum, e) => sum + Math.abs(e.amountVnd), 0);

    const availableBalance = Math.max(0, earnedMatured - payoutDebits);

    const paidBalance = profile.payoutRequests
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amountVnd, 0);

    // Anonymized commissions list: NO guest name or email, as required by spec §10.1
    const safeCommissions = profile.commissions.map((c) => ({
      id: c.id,
      orderCodeMasked: `***${c.order.orderNumber.slice(-4)}`,
      eligibleBaseVnd: c.eligibleBaseVnd,
      amountVnd: c.amountVnd,
      status: c.status,
      holdUntil: c.holdUntil,
      createdAt: c.createdAt,
    }));

    return apiSuccess({
      dashboard: {
        profileId: profile.id,
        status: profile.status,
        referralCode: activeLink?.code || null,
        referralUrl,
        payoutBankCode: profile.payoutBankCode,
        payoutAccountMasked: profile.payoutAccount
          ? `******${profile.payoutAccount.slice(-4)}`
          : null,
        stats: {
          totalClicks,
          totalConversions,
          totalEligibleRevenue,
          pendingBalance,
          availableBalance,
          paidBalance,
        },
        commissions: safeCommissions,
        payoutRequests: profile.payoutRequests.map((p) => ({
          id: p.id,
          amountVnd: p.amountVnd,
          status: p.status,
          externalReference: p.externalReference,
          requestAt: p.requestAt,
          paidAt: p.paidAt,
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

