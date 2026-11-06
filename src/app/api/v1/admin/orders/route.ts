import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        buyer: {
          select: { id: true, email: true, name: true },
        },
        lines: true,
        paymentAttempts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        buyer: o.buyer,
        status: o.status,
        paymentStatus: o.paymentStatus,
        totalVnd: o.totalVnd,
        referredAffiliateId: o.referredAffiliateId,
        lines: o.lines.map((l) => ({
          title: l.titleSnapshot,
          quantity: l.quantity,
          totalVnd: l.totalVnd,
          commissionEligible: l.commissionEligible,
        })),
        lastPaymentAttempt: o.paymentAttempts[0] || null,
        paidAt: o.paidAt,
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
