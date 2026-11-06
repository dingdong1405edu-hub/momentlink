import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function OccasionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const occasion = await prisma.occasion.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!occasion) {
    notFound();
  }

  // Filter templates matching this vertical
  const matchingTemplates = Object.values(TEMPLATES_REGISTRY).filter(
    (t) => t.occasionKey === occasion.formPresetKey
  );

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Link
            href="/occasions"
            className="text-xs font-semibold text-rose-600 hover:underline inline-block mb-2"
          >
            ← Quay lại tất cả các dịp
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chuyên mục: {occasion.category.title}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            {occasion.title}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Chọn một trong các mẫu thiết kế tinh tế bên dưới để bắt đầu tạo thiệp mời và mini website tương tác.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Mẫu thiệp dành riêng cho {occasion.title} ({matchingTemplates.length} mẫu)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {matchingTemplates.map((tpl) => (
              <div
                key={tpl.slug}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all"
              >
                <div
                  className="p-8 text-center relative"
                  style={{
                    backgroundColor: tpl.theme.background,
                    color: tpl.theme.foreground,
                  }}
                >
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
                    style={{
                      backgroundColor: `${tpl.theme.accent}20`,
                      borderColor: tpl.theme.accent,
                      color: tpl.theme.accent,
                    }}
                  >
                    {tpl.theme.style}
                  </span>
                  <h3 className="text-2xl font-serif font-bold mb-2">{tpl.title}</h3>
                  <p className="text-xs max-w-md mx-auto opacity-75">{tpl.description}</p>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">Các khối tính năng tích hợp:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.blocks.map((b) => (
                        <span key={b} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <Link
                      href={`/templates/${tpl.slug}`}
                      className="flex-1 py-2.5 text-center text-xs font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      Xem bản Demo sống
                    </Link>
                    <Link
                      href={`/create?template=${tpl.slug}`}
                      className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm transition-all hover:scale-105"
                    >
                      Dùng mẫu này
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

