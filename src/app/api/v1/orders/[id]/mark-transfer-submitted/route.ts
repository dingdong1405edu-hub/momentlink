import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return apiError("Không tìm thấy đơn hàng.", "NOT_FOUND", 404);
    }

    if (order.buyerId !== user.id && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền thao tác trên đơn hàng này.", "FORBIDDEN", 403);
    }

    if (order.status === "PAID") {
      return apiError("Đơn hàng đã được thanh toán thành công.", "ALREADY_PAID", 400);
    }

    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      return apiError("Đơn hàng đã bị hủy hoặc hoàn tiền.", "INVALID_STATUS", 400);
    }

    // Update order status to TRANSFER_SUBMITTED and record payment attempt
    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "TRANSFER_SUBMITTED",
          paymentStatus: "TRANSFER_SUBMITTED",
        },
      });

      await tx.paymentAttempt.create({
        data: {
          orderId: ord.id,
          provider: "manual_review",
          status: "PENDING",
          amountVnd: ord.totalVnd,
        },
      });

      return ord;
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "ORDER_TRANSFER_SUBMITTED",
      resourceType: "Order",
      resourceId: updated.id,
      afterSummary: {
        orderNumber: updated.orderNumber,
        status: updated.status,
      },
    });

    return apiSuccess({
      order: {
        id: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
      },
      message: "Đã gửi thông báo xác nhận chuyển khoản. Quản trị viên sẽ đối soát và mở khóa gói trong ít phút.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}

