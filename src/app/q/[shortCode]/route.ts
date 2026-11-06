import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const shortCode = params.shortCode;

    const shareLink = await prisma.shareLink.findUnique({
      where: { shortCode },
      include: {
        invitation: true,
      },
    });

    if (!shareLink || !shareLink.invitation || shareLink.status !== "ACTIVE") {
      return NextResponse.redirect(new URL("/_not-found", req.url), 302);
    }

    const inv = shareLink.invitation;
    if (inv.status !== "PUBLISHED") {
      return NextResponse.redirect(new URL("/_not-found", req.url), 302);
    }

    // Increment scanCount on share link
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { scanCount: { increment: 1 } },
    }).catch(() => {});

    // Increment daily QR scan stats
    const today = new Date().toISOString().split("T")[0];
    await prisma.invitationEventStatsDaily.upsert({
      where: {
        invitationId_dayUTC: {
          invitationId: inv.id,
          dayUTC: today,
        },
      },
      update: {
        qrScans: { increment: 1 },
      },
      create: {
        invitationId: inv.id,
        dayUTC: today,
        qrScans: 1,
      },
    }).catch(() => {});

    // Redirect to public invitation page
    const redirectUrl = new URL(`/i/${inv.slug}`, req.url);
    return NextResponse.redirect(redirectUrl, 302);
  } catch (err) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}

