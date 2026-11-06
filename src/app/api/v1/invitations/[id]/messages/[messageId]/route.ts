import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const updateMessageSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN", "REJECTED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const user = await requireAuth();
    const inv = await prisma.invitation.findUnique({ where: { id: params.id } });

    if (!inv) {
      return apiError("Không tìm thấy thiệp mời.", "NOT_FOUND", 404);
    }

    if (inv.ownerId !== user.id && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền duyệt lời chúc này.", "FORBIDDEN", 403);
    }

    const json = await req.json();
    const data = updateMessageSchema.parse(json);

    const updated = await prisma.guestbookMessage.update({
      where: { id: params.messageId },
      data: {
        status: data.status,
        reviewedAt: new Date(),
      },
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "GUESTBOOK_MESSAGE_MODERATED",
      resourceType: "GuestbookMessage",
      resourceId: updated.id,
      afterSummary: { status: updated.status },
    });

    return apiSuccess({ message: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

