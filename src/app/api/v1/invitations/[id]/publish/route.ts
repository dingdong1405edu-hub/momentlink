import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";
import { generateShortCode } from "@/lib/utils/slug";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const inv = await prisma.invitation.findUnique({
      where: { id: params.id },
      include: {
        revisions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        shareLinks: true,
      },
    });

    if (!inv) {
      return apiError("Không tìm thấy thiệp mời.", "NOT_FOUND", 404);
    }

    if (inv.ownerId !== user.id && !user.roles.includes("ADMIN")) {
      return apiError("Bạn không có quyền xuất bản thiệp mời này.", "FORBIDDEN", 403);
    }

    const latestRev = inv.revisions[0];
    if (!latestRev) {
      return apiError("Thiệp chưa có nội dung để xuất bản.", "EMPTY_CONTENT", 422);
    }

    // Ensure share link exists
    let shortCode = inv.shareLinks[0]?.shortCode;
    if (!shortCode) {
      shortCode = generateShortCode();
      await prisma.shareLink.create({
        data: {
          invitationId: inv.id,
          shortCode,
          label: "DEFAULT_SHARE",
        },
      });
    }

    const updated = await prisma.invitation.update({
      where: { id: inv.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "INVITATION_PUBLISHED",
      resourceType: "Invitation",
      resourceId: inv.id,
      afterSummary: { slug: updated.slug, status: updated.status },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const publicUrl = `${protocol}://${host}/i/${updated.slug}`;
    const shortUrl = `${protocol}://${host}/q/${shortCode}`;

    return apiSuccess({
      status: updated.status,
      slug: updated.slug,
      shortCode,
      publicUrl,
      shortUrl,
      revision: latestRev.versionNumber,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

