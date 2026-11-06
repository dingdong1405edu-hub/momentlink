import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);

    const batch = await prisma.giftCardBatch.findUnique({
      where: { id: params.id },
      include: {
        assignedShop: { select: { id: true, name: true } },
        cards: {
          select: {
            id: true,
            publicCode: true,
            cardType: true,
            status: true,
            ownerId: true,
            claimedAt: true,
            revokedAt: true,
            bindings: {
              where: { active: true },
              select: {
                invitation: {
                  select: { id: true, title: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!batch) {
      return apiError("Không tìm thấy lô thẻ quà tặng.", "NOT_FOUND", 404);
    }

    return apiSuccess({ batch });
  } catch (err) {
    return handleApiError(err);
  }
}

