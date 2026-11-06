import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const unlockSchema = z.object({
  passcode: z.string().min(1, "Vui lòng nhập mật mã"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { slug: params.slug },
    });

    if (!inv || !inv.passcodeHash) {
      return apiError("Thiệp mời không có mật mã bảo vệ.", "NO_PASSCODE", 400);
    }

    const json = await req.json();
    const data = unlockSchema.parse(json);

    const match = await bcrypt.compare(data.passcode, inv.passcodeHash);
    if (!match) {
      return apiError("Mật mã không chính xác. Vui lòng thử lại.", "INVALID_PASSCODE", 401);
    }

    const res = NextResponse.json({
      data: { success: true, message: "Mở khóa thành công" },
    });

    // Set 24h unlock cookie
    res.cookies.set(`unlocked_${params.slug}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    return handleApiError(err);
  }
}

