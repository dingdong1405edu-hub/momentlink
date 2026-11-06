import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Check membership
    const membership = await prisma.shopMembership.findFirst({
      where: { userId: user.id },
      include: { shop: true },
    });

    if (!membership && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền truy cập yêu cầu của cửa hàng.", "FORBIDDEN", 403);
    }

    const shopId = membership?.shopId;
    const requests = await prisma.shopRequest.findMany({
      where: shopId ? { shopId } : undefined,
      include: {
        product: true,
        invitation: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ requests });
  } catch (err) {
    return handleApiError(err);
  }
}

