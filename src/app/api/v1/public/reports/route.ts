import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const reportSchema = z.object({
  targetType: z.string().default("INVITATION"),
  targetId: z.string(),
  reporterEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  reason: z.string().min(5, "Lý do báo cáo phải có ít nhất 5 ký tự"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = reportSchema.parse(json);

    const report = await prisma.abuseReport.create({
      data: {
        publicTargetType: data.targetType,
        publicTargetId: data.targetId,
        reporterEmail: data.reporterEmail || null,
        reason: data.reason,
        status: "OPEN",
      },
    });

    return apiSuccess({ report: { id: report.id, status: report.status } }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

