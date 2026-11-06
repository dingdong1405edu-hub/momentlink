import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { getStorage } from "@/lib/storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "audio/mpeg",
  "audio/mp3",
]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const invitationId = formData.get("invitationId") as string | null;

    if (!file) {
      return apiError("Vui lòng chọn tệp tin tải lên.", "NO_FILE", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("Kích thước tệp tin vượt quá 5MB cho phép.", "FILE_TOO_LARGE", 413);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return apiError(`Định dạng tệp không được hỗ trợ: ${file.type}`, "INVALID_MIME_TYPE", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    const result = await storage.save(buffer, file.name, file.type);

    const asset = await prisma.asset.create({
      data: {
        uploaderId: user.id,
        storageKey: result.storageKey,
        mimeType: result.mimeType,
        byteSize: result.byteSize,
        visibility: "PUBLIC",
      },
    });

    if (invitationId) {
      await prisma.invitationAsset.create({
        data: {
          invitationId,
          assetId: asset.id,
          usage: "GALLERY",
        },
      }).catch(() => {});
    }

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "ASSET_UPLOADED",
      resourceType: "Asset",
      resourceId: asset.id,
      afterSummary: { mimeType: asset.mimeType, byteSize: asset.byteSize },
    });

    return apiSuccess({
      assetId: asset.id,
      url: result.publicUrl,
      storageKey: result.storageKey,
      byteSize: result.byteSize,
      mimeType: result.mimeType,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

