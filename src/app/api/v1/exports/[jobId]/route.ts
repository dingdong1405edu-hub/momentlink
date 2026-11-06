import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await getCurrentUser();
    const job = await prisma.exportJob.findUnique({
      where: { id: params.jobId },
      include: {
        invitation: true,
      },
    });

    if (!job) {
      return apiError("Không tìm thấy tác vụ xuất file.", "NOT_FOUND", 404);
    }

    const isRequester = user && user.id === job.requesterId;
    const isOwner = user && user.id === job.invitation.ownerId;
    const isAdmin = user && user.roles.includes("ADMIN");

    if (!isRequester && !isOwner && !isAdmin) {
      return apiError("Bạn không có quyền truy cập tác vụ này.", "FORBIDDEN", 403);
    }

    return apiSuccess({
      job: {
        id: job.id,
        status: job.status,
        format: job.format,
        sizePreset: job.sizePreset,
        errorCode: job.errorCode,
        downloadUrl:
          job.status === "SUCCEEDED"
            ? `/api/v1/exports/${job.id}/download`
            : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

