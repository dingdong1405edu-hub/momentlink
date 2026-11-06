import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const signInSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = signInSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      include: {
        roles: true,
      },
    });

    if (!user || !user.passwordHash) {
      return apiError("Email hoặc mật khẩu không chính xác.", "INVALID_CREDENTIALS", 401);
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return apiError("Email hoặc mật khẩu không chính xác.", "INVALID_CREDENTIALS", 401);
    }

    if (user.status !== "ACTIVE") {
      return apiError("Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.", "ACCOUNT_SUSPENDED", 403);
    }

    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    await createSession(user.id, userAgent, ipAddress);

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0]?.role || "USER",
      action: "USER_LOGIN",
      resourceType: "User",
      resourceId: user.id,
    });

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((r) => r.role),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

