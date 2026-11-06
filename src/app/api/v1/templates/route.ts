import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const occasionKey = searchParams.get("occasion");
    const isPremium = searchParams.get("premium");

    let templates = Object.values(TEMPLATES_REGISTRY);

    if (occasionKey) {
      templates = templates.filter((t) => t.occasionKey === occasionKey);
    }

    if (isPremium !== null && isPremium !== undefined && isPremium !== "") {
      const premBool = isPremium === "true";
      templates = templates.filter((t) => t.isPremium === premBool);
    }

    return apiSuccess({ templates });
  } catch (err) {
    return handleApiError(err);
  }
}

