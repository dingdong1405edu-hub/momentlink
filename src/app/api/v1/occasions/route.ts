import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const categories = await prisma.occasionCategory.findMany({
      where: { active: true },
      include: {
        occasions: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}

