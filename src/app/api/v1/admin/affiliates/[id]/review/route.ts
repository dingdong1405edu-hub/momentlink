import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "SUSPEND"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await req.json().catch(() => ({}));
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Hành động đánh giá không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { action } = parsed.data;

    const profile = await prisma.affiliateProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        links: true,
      },
    });

    if (!profile) {
      return apiError("Không tìm thấy hồ sơ cộng tác viên.", "NOT_FOUND", 404);
    }

    const now = new Date();
    let newStatus = "APPROVED";
    if (action === "REJECT") newStatus = "REJECTED";
    if (action === "SUSPEND") newStatus = "SUSPENDED";

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.affiliateProfile.update({
        where: { id: profile.id },
        data: {
          status: newStatus,
          approvedAt: action === "APPROVE" ? now : null,
          approvedBy: action === "APPROVE" ? admin.id : null,
        },
      });

      if (action === "APPROVE") {
        // Add AFFILIATE role to user
        await tx.roleAssignment.upsert({
          where: {
            userId_role: {
              userId: profile.userId,
              role: "AFFILIATE",
            },
          },
          update: {},
          create: {
            userId: profile.userId,
            role: "AFFILIATE",
            grantedBy: admin.id,
          },
        });

        // Ensure default program exists
        let defaultProgram = await tx.affiliateProgram.findFirst({
          where: { code: "DEFAULT_10" },
        });

        if (!defaultProgram) {
          defaultProgram = await tx.affiliateProgram.create({
            data: {
              code: "DEFAULT_10",
              name: "Chương trình CTV mặc định 10%",
              rateBps: 1000,
              attributionDays: 30,
              holdDays: 14,
              minPayoutVnd: 100000,
              active: true,
            },
          });
        }

        // Create active affiliate referral link if not exists
        let activeLink = profile.links.find((l) => l.status === "ACTIVE");
        if (!activeLink) {
          const randomCode = `AFF${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          activeLink = await tx.affiliateLink.create({
            data: {
              affiliateId: profile.id,
              programId: defaultProgram.id,
              code: randomCode,
              status: "ACTIVE",
            },
          });
        }
      }

      return p;
    });

    await logAudit({
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "AFFILIATE_REVIEWED",
      resourceType: "AffiliateProfile",
      resourceId: profile.id,
      afterSummary: {
        action,
        status: updated.status,
      },
    });

    return apiSuccess({
      message: `Đã cập nhật trạng thái CTV: ${updated.status}`,
      affiliate: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
