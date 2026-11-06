import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "SUSPEND"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await req.json().catch(() => ({}));
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Hành động đánh giá không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { action } = parsed.data;

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
    });

    if (!shop) {
      return apiError("Không tìm thấy cửa hàng.", "NOT_FOUND", 404);
    }

    let newStatus = "APPROVED";
    if (action === "REJECT") newStatus = "REJECTED";
    if (action === "SUSPEND") newStatus = "SUSPENDED";

    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.shop.update({
        where: { id: shop.id },
        data: { status: newStatus },
      });

      if (action === "APPROVE") {
        await tx.roleAssignment.upsert({
          where: {
            userId_role: {
              userId: shop.ownerId,
              role: "SHOP_OWNER",
            },
          },
          update: {},
          create: {
            userId: shop.ownerId,
            role: "SHOP_OWNER",
            grantedBy: admin.id,
          },
        });
      }

      return s;
    });

    await logAudit({
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "SHOP_REVIEWED",
      resourceType: "Shop",
      resourceId: shop.id,
      afterSummary: { action, status: updated.status },
    });

    return apiSuccess({
      message: `Đã cập nhật trạng thái cửa hàng: ${updated.status}`,
      shop: {
        id: updated.id,
        name: updated.name,
        status: updated.status,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

