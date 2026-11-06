import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { logAudit } from "@/lib/audit";
import { generateSlug } from "@/lib/utils/slug";

const ShopApplySchema = z.object({
  name: z.string().min(2, "Tên cửa hàng phải có ít nhất 2 ký tự"),
  city: z.string().min(2, "Vui lòng chọn tỉnh/thành phố"),
  address: z.string().optional(),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  contactEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = ShopApplySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Thông tin đăng ký cửa hàng không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const { name, city, address, phone, contactEmail, description } = parsed.data;

    const baseSlug = generateSlug(name);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const shop = await prisma.$transaction(async (tx) => {
      const s = await tx.shop.create({
        data: {
          ownerId: user.id,
          name,
          slug,
          city,
          address,
          phone,
          contactEmail: contactEmail && contactEmail.trim() ? contactEmail.trim() : user.email,
          description,
          status: "PENDING",
        },
      });

      await tx.shopMembership.create({
        data: {
          shopId: s.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return s;
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "SHOP_APPLIED",
      resourceType: "Shop",
      resourceId: shop.id,
      afterSummary: { name: shop.name, city: shop.city, status: shop.status },
    });

    return apiSuccess({
      message: "Đơn đăng ký đối tác Shop đã được gửi thành công và đang chờ xét duyệt.",
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        status: shop.status,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

