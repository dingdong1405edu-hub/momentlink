import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ArrowLeft,
  Users,
  MessageSquareHeart,
  Eye,
  Edit3,
  ExternalLink,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import GuestbookModerationTable from "./GuestbookModerationTable";
import DashboardShareButton from "./DashboardShareButton";

export default async function InvitationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const inv = await prisma.invitation.findUnique({
    where: { id: params.id },
    include: {
      occasion: true,
      templateVersion: {
        include: { template: true },
      },
      shareLinks: true,
      rsvps: {
        orderBy: { createdAt: "desc" },
      },
      guestbook: {
        orderBy: { createdAt: "desc" },
      },
      statsDaily: true,
    },
  });

  if (!inv) {
    notFound();
  }

  if (inv.ownerId !== user.id && !user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const totalViews = inv.statsDaily.reduce((acc, s) => acc + s.views, 0);
  const attendingCount = inv.rsvps
    .filter((r) => r.status === "ATTENDING")
    .reduce((sum, r) => sum + r.guestCount, 0);

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Dashboard</span>
        </Link>

        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">
                {inv.occasion.title}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  inv.status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {inv.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">{inv.title}</h1>
            <p className="text-xs text-slate-500">
              Đường dẫn công khai:{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded">/i/{inv.slug}</code>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <DashboardShareButton
              invitationId={inv.id}
              slug={inv.slug}
              title={inv.title}
              shortCode={inv.shareLinks[0]?.shortCode}
            />

            <Link
              href={`/editor/${inv.id}`}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa nội dung</span>
            </Link>

            {inv.status === "PUBLISHED" && (
              <Link
                href={`/i/${inv.slug}`}
                target="_blank"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all hover:scale-105"
              >
                <span>Mở thiệp online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Lượt xem ước tính</p>
              <p className="text-xl font-bold text-slate-900">{totalViews}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Khách xác nhận tham dự</p>
              <p className="text-xl font-bold text-slate-900">{attendingCount} khách</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Lời chúc trong sổ lưu bút</p>
              <p className="text-xl font-bold text-slate-900">{inv.guestbook.length}</p>
            </div>
          </div>
        </div>

        {/* RSVPs Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              Danh sách phản hồi tham dự (RSVP)
            </h3>
            <span className="text-xs text-slate-500">{inv.rsvps.length} phản hồi</span>
          </div>

          {inv.rsvps.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Chưa có phản hồi nào từ khách mời.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tên khách mời</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Số lượng</th>
                    <th className="py-3 px-4">Lời nhắn</th>
                    <th className="py-3 px-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inv.rsvps.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-800">{r.guestName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            r.status === "ATTENDING"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "DECLINED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.status === "ATTENDING"
                            ? "Sẽ đến"
                            : r.status === "DECLINED"
                            ? "Không đến"
                            : "Chưa chắc"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{r.guestCount} người</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{r.message || "—"}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Guestbook Moderation Table */}
        <GuestbookModerationTable invitationId={inv.id} messages={inv.guestbook} />
      </div>
    </div>
  );
}
