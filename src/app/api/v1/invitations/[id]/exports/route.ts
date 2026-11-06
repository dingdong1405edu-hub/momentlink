import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { executeExportJob } from "@/lib/exports";
import { logAudit } from "@/lib/audit";

const CreateExportJobSchema = z.object({
  format: z.enum(["PNG", "JPG", "PDF"]),
  sizePreset: z.enum(["POSTER_4_5", "STORY_9_16", "A4", "A5"]).optional(),
  idempotencyKey: z.string().max(100).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const invId = params.id;

    const inv = await prisma.invitation.findUnique({
      where: { id: invId },
      include: {
        revisions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!inv) {
      return apiError("Không tìm thấy thiệp mời.", "NOT_FOUND", 404);
    }

    if (inv.ownerId !== user.id && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền xuất thiệp mời này.", "FORBIDDEN", 403);
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateExportJobSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Dữ liệu xuất không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { format, idempotencyKey } = parsed.data;
    const sizePreset =
      parsed.data.sizePreset || (format === "PDF" ? "A4" : "POSTER_4_5");

    // Idempotency check
    if (idempotencyKey) {
      const existing = await prisma.exportJob.findFirst({
        where: {
          requesterId: user.id,
          idempotencyKey,
        },
      });
      if (existing) {
        return apiSuccess({
          job: {
            id: existing.id,
            status: existing.status,
            format: existing.format,
            sizePreset: existing.sizePreset,
            storageKey: existing.storageKey,
            createdAt: existing.createdAt,
          },
        });
      }
    }

    const latestRevision = inv.revisions[0];

    const job = await prisma.exportJob.create({
      data: {
        invitationId: inv.id,
        revisionId: latestRevision?.id,
        requesterId: user.id,
        format,
        sizePreset,
        status: "QUEUED",
        idempotencyKey,
      },
    });

    // Execute job
    await executeExportJob(job.id);

    const updatedJob = await prisma.exportJob.findUnique({
      where: { id: job.id },
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "INVITATION_EXPORTED",
      resourceType: "ExportJob",
      resourceId: job.id,
      afterSummary: {
        format,
        sizePreset,
        status: updatedJob?.status,
      },
    });

    return apiSuccess({
      job: {
        id: updatedJob?.id,
        status: updatedJob?.status,
        format: updatedJob?.format,
        sizePreset: updatedJob?.sizePreset,
        downloadUrl: `/api/v1/exports/${updatedJob?.id}/download`,
        createdAt: updatedJob?.createdAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
