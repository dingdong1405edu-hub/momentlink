import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  try {
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { code },
      include: {
        affiliate: true,
      },
    });

    if (!affiliateLink || affiliateLink.status !== "ACTIVE" || affiliateLink.affiliate.status !== "APPROVED") {
      return NextResponse.redirect(new URL("/", req.url), 302);
    }

    // Record Referral Click
    await prisma.referralClick.create({
      data: {
        affiliateLinkId: affiliateLink.id,
        landingPath: "/",
        isValid: true,
      },
    }).catch(() => {});

    // Set 30-day first-party affiliate cookie
    const response = NextResponse.redirect(new URL("/", req.url), 302);
    response.cookies.set("affiliate_ref", affiliateLink.affiliateId, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Affiliate referral redirect error:", err);
    return NextResponse.redirect(new URL("/", req.url), 302);
  }
}

