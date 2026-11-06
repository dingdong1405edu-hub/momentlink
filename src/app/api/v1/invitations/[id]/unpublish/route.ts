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
    const inv = await prisma.invitation.findUnique({ where: { id: params.id } });

    if (!inv) {
      return apiError("Không tìm thấy thiệp mời.", "NOT_FOUND", 404);
    }

    if (inv.ownerId !== user.id && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền thực hiện thao tác này.", "FORBIDDEN", 403);
    }

    const updated = await prisma.invitation.update({
      where: { id: inv.id },
      data: { status: "DRAFT" },
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "INVITATION_UNPUBLISHED",
      resourceType: "Invitation",
      resourceId: inv.id,
    });

    return apiSuccess({ status: updated.status, message: "Đã hủy xuất bản thiệp mời." });
  } catch (err) {
    return handleApiError(err);
  }
}

