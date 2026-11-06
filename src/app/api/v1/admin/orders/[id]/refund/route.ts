import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        commissions: true,
        lines: {
          include: {
            entitlements: true,
          },
        },
      },
    });

    if (!order) {
      return apiError("Không tìm thấy đơn hàng.", "NOT_FOUND", 404);
    }

    if (order.status !== "PAID") {
      return apiError(`Chỉ có thể hoàn tiền đơn hàng đã thanh toán. Trạng thái hiện tại: ${order.status}`, "INVALID_STATUS", 400);
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Order status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
        },
      });

      // 2. Revoke entitlements
      for (const line of order.lines) {
        for (const ent of line.entitlements) {
          if (ent.status === "ACTIVE") {
            await tx.entitlement.update({
              where: { id: ent.id },
              data: { status: "REVOKED" },
            });
          }
        }
      }

      // 3. Reverse commission if exists
      let reversalEntry = null;
      for (const comm of order.commissions) {
        if (comm.status !== "REVERSED") {
          await tx.commission.update({
            where: { id: comm.id },
            data: { status: "REVERSED" },
          });

          reversalEntry = await tx.commissionLedgerEntry.create({
            data: {
              commissionId: comm.id,
              affiliateId: comm.affiliateId,
              type: "REVERSAL",
              amountVnd: -comm.amountVnd,
              idempotencyKey: `comm_reversal_${order.id}`,
              effectiveAt: now,
            },
          });
        }
      }

      // 4. Create Refund record
      await tx.refund.create({
        data: {
          orderId: order.id,
          amountVnd: order.totalVnd,
          reason: "Yêu cầu hoàn tiền từ quản trị viên",
          status: "COMPLETED",
        },
      });

      return { updatedOrder, reversalEntry };
    });

    await logAudit({
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "ORDER_REFUNDED",
      resourceType: "Order",
      resourceId: order.id,
      afterSummary: {
        orderNumber: order.orderNumber,
        refundAmountVnd: order.totalVnd,
        commissionReversed: !!result.reversalEntry,
      },
    });

    return apiSuccess({
      message: "Đã hoàn tiền đơn hàng và đảo sổ hoa hồng CTV thành công.",
      order: {
        id: result.updatedOrder.id,
        orderNumber: result.updatedOrder.orderNumber,
        status: result.updatedOrder.status,
      },
      commissionReversal: result.reversalEntry
        ? {
            amountVnd: result.reversalEntry.amountVnd,
            effectiveAt: result.reversalEntry.effectiveAt,
          }
        : null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
