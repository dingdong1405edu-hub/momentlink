import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const rsvpSchema = z.object({
  guestName: z.string().min(1, "Vui lòng nhập họ và tên của bạn"),
  status: z.enum(["ATTENDING", "DECLINED", "MAYBE"]),
  guestCount: z.number().int().min(1).max(20).default(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { slug: params.slug },
    });

    if (!inv || inv.status !== "PUBLISHED") {
      return apiError("Thiệp mời không tồn tại hoặc chưa xuất bản.", "NOT_FOUND", 404);
    }

    const json = await req.json();
    const data = rsvpSchema.parse(json);

    const rsvp = await prisma.rSVPResponse.create({
      data: {
        invitationId: inv.id,
        guestName: data.guestName.trim(),
        status: data.status,
        guestCount: data.guestCount,
        email: data.email || null,
        phone: data.phone || null,
        message: data.message ? data.message.trim() : null,
        moderationStatus: "APPROVED",
      },
    });

    // Update daily stats
    const today = new Date().toISOString().split("T")[0];
    await prisma.invitationEventStatsDaily.upsert({
      where: {
        invitationId_dayUTC: {
          invitationId: inv.id,
          dayUTC: today,
        },
      },
      update: {
        rsvpCount: { increment: 1 },
      },
      create: {
        invitationId: inv.id,
        dayUTC: today,
        rsvpCount: 1,
      },
    }).catch(() => {});

    return apiSuccess({ rsvp: { id: rsvp.id, status: rsvp.status } }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

