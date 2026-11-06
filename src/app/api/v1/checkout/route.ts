import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const CheckoutSchema = z.object({
  planCode: z.string().min(1),
  invitationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Dữ liệu thanh toán không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { planCode, invitationId } = parsed.data;

    const plan = await prisma.plan.findUnique({
      where: { code: planCode, active: true },
    });

    if (!plan) {
      return apiError("Gói dịch vụ không tồn tại hoặc đã ngừng cung cấp.", "NOT_FOUND", 404);
    }

    // Verify invitation belongs to user if specified
    if (invitationId) {
      const inv = await prisma.invitation.findUnique({
        where: { id: invitationId },
      });
      if (!inv || (inv.ownerId !== user.id && !user.roles.includes("ADMIN"))) {
        return apiError("Không tìm thấy thiệp mời tương ứng.", "NOT_FOUND", 404);
      }
    }

    // Affiliate attribution with self-referral prevention
    let referredAffiliateId: string | null = null;
    const affiliateCookie = req.cookies.get("affiliate_ref")?.value;

    if (affiliateCookie) {
      const affiliate = await prisma.affiliateProfile.findUnique({
        where: { id: affiliateCookie },
      });

      // Self-referral protection: creator cannot earn commission on their own purchase
      if (affiliate && affiliate.userId !== user.id && affiliate.status === "APPROVED") {
        referredAffiliateId = affiliate.id;
      }
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ML-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    // Create Order with OrderLine snapshot in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: user.id,
          orderNumber,
          status: "PENDING",
          paymentStatus: "UNPAID",
          currency: "VND",
          subtotalVnd: plan.basePriceVnd,
          discountVnd: 0,
          taxVnd: 0,
          totalVnd: plan.basePriceVnd,
          referredAffiliateId,
          purchaseContext: invitationId ? JSON.stringify({ invitationId }) : null,
          lines: {
            create: {
              productType: "DIGITAL_PLAN",
              referenceId: plan.id,
              titleSnapshot: plan.name,
              quantity: 1,
              unitPriceVnd: plan.basePriceVnd,
              discountVnd: 0,
              taxVnd: 0,
              totalVnd: plan.basePriceVnd,
              commissionEligible: true,
            },
          },
        },
        include: {
          lines: true,
        },
      });

      return newOrder;
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "ORDER_CREATED",
      resourceType: "Order",
      resourceId: order.id,
      afterSummary: {
        orderNumber: order.orderNumber,
        totalVnd: order.totalVnd,
        referredAffiliateId,
      },
    });

    return apiSuccess({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalVnd: order.totalVnd,
        status: order.status,
        paymentStatus: order.paymentStatus,
        plan: {
          code: plan.code,
          name: plan.name,
          durationDays: plan.defaultDurationDays,
        },
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

