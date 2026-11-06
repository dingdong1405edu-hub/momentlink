"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Package,
  Layers,
} from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  phone: string | null;
  contactEmail: string | null;
  status: string;
  createdAt: string;
  memberships: { role: string; user: { id: string; email: string; name: string } }[];
  _count: { products: number; requests: number };
}

export default function AdminShopsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadShops = async () => {
    try {
      const res = await fetch("/api/v1/admin/shops");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/sign-in?callbackUrl=/admin/shops");
          return;
        }
        throw new Error("Không thể tải danh sách cửa hàng.");
      }
      const data = await res.json();
      setShops(data.data.shops);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleReview = async (shopId: string, action: "APPROVE" | "REJECT" | "SUSPEND") => {
    setActionLoading(`${shopId}-${action}`);
    try {
      const res = await fetch(`/api/v1/admin/shops/${shopId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Cập nhật trạng thái thất bại.");
      }

      setToastMessage(data.data.message);
      await loadShops();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
              <Link href="/admin" className="hover:underline">Quản trị</Link>
              <span>/</span>
              <span>Đối tác Shop</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-rose-600" />
              Quản lý Cửa Hàng Đối Tác (Flower/Gift Shops)
            </h1>
          </div>
        </div>

        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Đóng
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="text-base font-bold text-neutral-900">
              Danh sách cửa hàng đăng ký ({shops.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : shops.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              Chưa có cửa hàng nào đăng ký.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {shops.map((s) => (
                <div key={s.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/50 transition">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-neutral-900">{s.name}</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{s.city}{s.address ? ` — ${s.address}` : ""}</span>
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{s.contactEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-neutral-500">
                      Chủ shop: {s.memberships[0]?.user?.email || "Chưa gán"} • Sản phẩm: {s._count.products} • Yêu cầu: {s._count.requests}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    {s.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleReview(s.id, "APPROVE")}
                          disabled={actionLoading !== null}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Duyệt mở bán
                        </button>
                        <button
                          onClick={() => handleReview(s.id, "REJECT")}
                          disabled={actionLoading !== null}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Từ chối
                        </button>
                      </>
                    )}
                    {s.status === "APPROVED" && (
                      <button
                        onClick={() => handleReview(s.id, "SUSPEND")}
                        disabled={actionLoading !== null}
                        className="px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-medium rounded-lg transition"
                      >
                        Tạm dừng
                      </button>
                    )}
                    {s.status === "SUSPENDED" && (
                      <button
                        onClick={() => handleReview(s.id, "APPROVE")}
                        disabled={actionLoading !== null}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg transition"
                      >
                        Kích hoạt lại
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

