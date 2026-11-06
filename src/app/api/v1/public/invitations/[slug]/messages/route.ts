import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const messageSchema = z.object({
  displayName: z.string().min(1, "Vui lòng nhập tên của bạn"),
  body: z.string().min(1, "Vui lòng nhập nội dung lời chúc"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { slug: params.slug },
    });

    if (!inv || inv.status !== "PUBLISHED") {
      return apiError("Thiệp mời không tồn tại hoặc chưa xuất bản.", "NOT_FOUND", 404);
    }

    const json = await req.json();
    const data = messageSchema.parse(json);

    const message = await prisma.guestbookMessage.create({
      data: {
        invitationId: inv.id,
        displayName: data.displayName.trim(),
        body: data.body.trim(),
        status: "APPROVED", // Auto-approved or pending per moderation
      },
    });

    return apiSuccess({ message: { id: message.id, status: message.status } }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

