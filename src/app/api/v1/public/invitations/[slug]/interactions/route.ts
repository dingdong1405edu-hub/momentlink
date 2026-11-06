import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const interactionSchema = z.object({
  blockId: z.string().default("response_question"),
  optionId: z.string().min(1),
  displayName: z.string().optional(),
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
    const data = interactionSchema.parse(json);

    const interaction = await prisma.interactionResponse.create({
      data: {
        invitationId: inv.id,
        blockId: data.blockId,
        optionId: data.optionId,
        displayName: data.displayName || null,
      },
    });

    return apiSuccess({ interaction: { id: interaction.id, optionId: interaction.optionId } }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

