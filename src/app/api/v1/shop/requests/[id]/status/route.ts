import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const UpdateStatusSchema = z.object({
  status: z.enum(["SUBMITTED", "QUOTED", "ACCEPTED", "COMPLETED", "DECLINED"]),
  quotedAmountVnd: z.number().int().nonnegative().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Trạng thái cập nhật không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { status, quotedAmountVnd } = parsed.data;

    const request = await prisma.shopRequest.findUnique({
      where: { id: params.id },
    });

    if (!request) {
      return apiError("Không tìm thấy yêu cầu mua hàng.", "NOT_FOUND", 404);
    }

    // Check permission
    const membership = await prisma.shopMembership.findUnique({
      where: {
        shopId_userId: {
          shopId: request.shopId,
          userId: user.id,
        },
      },
    });

    if (!membership && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền quản lý yêu cầu của cửa hàng này.", "FORBIDDEN", 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.shopRequest.update({
        where: { id: request.id },
        data: {
          status,
          finalQuotedVnd: quotedAmountVnd !== undefined ? quotedAmountVnd : request.finalQuotedVnd,
        },
      });

      await tx.shopRequestEvent.create({
        data: {
          shopRequestId: request.id,
          actorId: user.id,
          previousStatus: request.status,
          nextStatus: status,
          note: quotedAmountVnd ? `Báo giá: ${quotedAmountVnd.toLocaleString("vi-VN")} VND` : undefined,
        },
      });

      return up;
    });

    await logAudit({
      actorId: user.id,
      actorRole: membership?.role || "ADMIN",
      action: "SHOP_REQUEST_STATUS_UPDATED",
      resourceType: "ShopRequest",
      resourceId: request.id,
      afterSummary: {
        status: updated.status,
        finalQuotedVnd: updated.finalQuotedVnd,
      },
    });

    return apiSuccess({
      message: `Đã cập nhật trạng thái yêu cầu: ${updated.status}`,
      request: {
        id: updated.id,
        status: updated.status,
        finalQuotedVnd: updated.finalQuotedVnd,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
