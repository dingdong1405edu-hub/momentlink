import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";

const signUpSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = signUpSchema.parse(json);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return apiError("Email này đã được sử dụng.", "EMAIL_EXISTS", 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        roles: {
          create: {
            role: "CREATOR",
            grantedBy: "SIGNUP",
          },
        },
      },
      include: {
        roles: true,
      },
    });

    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    await createSession(user.id, userAgent, ipAddress);

    await logAudit({
      actorId: user.id,
      actorRole: "CREATOR",
      action: "USER_SIGNUP",
      resourceType: "User",
      resourceId: user.id,
      afterSummary: { email: user.email, name: user.name },
    });

    return apiSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles.map((r) => r.role),
        },
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

