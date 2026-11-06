"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Check,
  DollarSign,
} from "lucide-react";

export default function AdminAffiliatesPage() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAffiliates = async () => {
    try {
      const res = await fetch("/api/v1/admin/affiliates");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/sign-in?callbackUrl=/admin/affiliates");
          return;
        }
        throw new Error("Không thể tải danh sách CTV.");
      }
      const data = await res.json();
      setAffiliates(data.data.affiliates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAffiliates();
  }, []);

  const handleReview = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/admin/affiliates/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Không thể cập nhật trạng thái.");
        return;
      }
      setToastMessage(data.data.message);
      setTimeout(() => setToastMessage(null), 3000);
      loadAffiliates();
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Quản lý Cộng tác viên (Affiliate)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Phê duyệt hồ sơ đối tác CTV, cấp link giới thiệu và theo dõi hoa hồng 10%.
            </p>
          </div>

          {toastMessage && (
            <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md">
              <Check className="w-4 h-4" /> {toastMessage}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : affiliates.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Chưa có đơn đăng ký CTV nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Đối tác CTV</th>
                    <th className="py-3 px-4">Tài khoản ngân hàng</th>
                    <th className="py-3 px-4">Mã giới thiệu</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Ngày đăng ký</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {affiliates.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{a.user.fullName}</div>
                        <div className="text-[11px] text-slate-400">{a.user.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-700">{a.payoutBankCode}</span> - {a.payoutAccount}
                      </td>
                      <td className="py-3.5 px-4">
                        {a.referralCode ? (
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-mono font-bold rounded-lg text-xs">
                            {a.referralCode}
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa có mã</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {a.status === "APPROVED" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ĐÃ DUYỆT
                          </span>
                        ) : a.status === "APPLIED" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            CHỜ DUYỆT
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {a.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {a.status !== "APPROVED" && (
                          <button
                            onClick={() => handleReview(a.id, "APPROVE")}
                            disabled={actionLoading === a.id}
                            data-testid={`approve-affiliate-${a.id}-btn`}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-semibold text-xs shadow-sm transition"
                          >
                            {actionLoading === a.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Duyệt CTV"
                            )}
                          </button>
                        )}
                        {a.status === "APPROVED" && (
                          <button
                            onClick={() => handleReview(a.id, "REJECT")}
                            disabled={actionLoading === a.id}
                            data-testid={`reject-affiliate-${a.id}-btn`}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition"
                          >
                            Tạm ngưng
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

