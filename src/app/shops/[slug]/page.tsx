import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import ShopClientView from "./ShopClientView";

interface ShopDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const shop = await prisma.shop.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!shop || shop.status !== "APPROVED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/shops"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh bạ cửa hàng</span>
        </Link>

        <ShopClientView shop={shop} />
      </div>
    </main>
  );
}

