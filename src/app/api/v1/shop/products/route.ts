import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { generateSlug } from "@/lib/utils/slug";

const ProductSchema = z.object({
  shopId: z.string().optional(),
  title: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục sản phẩm"),
  description: z.string().optional(),
  minPriceVnd: z.number().int().nonnegative().optional(),
  maxPriceVnd: z.number().int().nonnegative().optional(),
  leadTimeHours: z.number().int().default(24),
  qrCompatible: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = ProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Thông tin sản phẩm không hợp lệ.", "VALIDATION_ERROR", 400);
    }

    const {
      shopId: reqShopId,
      title,
      category,
      description,
      minPriceVnd,
      maxPriceVnd,
      leadTimeHours,
      qrCompatible,
      imageUrl,
    } = parsed.data;

    // Check membership
    let targetShopId = reqShopId;
    if (!targetShopId) {
      const membership = await prisma.shopMembership.findFirst({
        where: { userId: user.id },
      });
      if (!membership) {
        return apiError("Bạn chưa sở hữu hoặc là nhân viên của cửa hàng nào.", "FORBIDDEN", 403);
      }
      targetShopId = membership.shopId;
    } else {
      const membership = await prisma.shopMembership.findUnique({
        where: {
          shopId_userId: {
            shopId: targetShopId,
            userId: user.id,
          },
        },
      });
      if (!membership && !user.roles.includes("ADMIN")) {
        return apiError("Bạn không có quyền quản lý cửa hàng này.", "FORBIDDEN", 403);
      }
    }

    const baseSlug = generateSlug(title);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const product = await prisma.shopProduct.create({
      data: {
        shopId: targetShopId,
        slug,
        title,
        category,
        description,
        minPriceVnd,
        maxPriceVnd,
        leadTimeHours,
        qrCompatible,
        imageUrl,
        active: true,
      },
    });

    return apiSuccess({
      message: "Tạo sản phẩm thành công.",
      product: {
        id: product.id,
        shopId: product.shopId,
        slug: product.slug,
        title: product.title,
        category: product.category,
        minPriceVnd: product.minPriceVnd,
        maxPriceVnd: product.maxPriceVnd,
        leadTimeHours: product.leadTimeHours,
        qrCompatible: product.qrCompatible,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(req.url);
    const shopId = url.searchParams.get("shopId");

    let targetShopId = shopId;
    if (!targetShopId) {
      const membership = await prisma.shopMembership.findFirst({
        where: { userId: user.id },
      });
      if (!membership) {
        return apiSuccess({ products: [] });
      }
      targetShopId = membership.shopId;
    }

    const products = await prisma.shopProduct.findMany({
      where: { shopId: targetShopId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ products });
  } catch (err) {
    return handleApiError(err);
  }
}

