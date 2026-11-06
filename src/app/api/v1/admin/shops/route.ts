import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const shops = await prisma.shop.findMany({
      include: {
        memberships: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
        _count: {
          select: {
            products: true,
            requests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ shops });
  } catch (err) {
    return handleApiError(err);
  }
}
