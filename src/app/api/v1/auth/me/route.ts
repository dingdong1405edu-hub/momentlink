import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Chưa đăng nhập", "UNAUTHORIZED", 401);
  }

  return apiSuccess({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
  });
}

