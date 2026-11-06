"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Check,
} from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  buyer: { id: string; email: string; fullName: string };
  status: string;
  paymentStatus: string;
  totalVnd: number;
  referredAffiliateId: string | null;
  lines: { title: string; quantity: number; totalVnd: number; commissionEligible: boolean }[];
  lastPaymentAttempt: any;
  paidAt: string | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/v1/admin/orders");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/sign-in?callbackUrl=/admin/payments");
          return;
        }
        throw new Error("Không thể tải danh sách đơn hàng.");
      }
      const data = await res.json();
      setOrders(data.data.orders);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirmPaid = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/confirm-paid`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Không thể xác nhận thanh toán.");
        return;
      }
      setToastMessage("Đã duyệt thanh toán thành công và cấp quyền!");
      setTimeout(() => setToastMessage(null), 3000);
      loadOrders();
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hoàn tiền đơn hàng này? Quyền dịch vụ và hoa hồng CTV (nếu có) sẽ bị đảo sổ.")) {
      return;
    }
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Không thể hoàn tiền đơn hàng.");
        return;
      }
      setToastMessage("Đã hoàn tiền đơn hàng thành công!");
      setTimeout(() => setToastMessage(null), 3000);
      loadOrders();
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "TRANSFER_SUBMITTED") return o.status === "TRANSFER_SUBMITTED";
    if (filter === "PAID") return o.status === "PAID";
    if (filter === "PENDING") return o.status === "PENDING";
    if (filter === "REFUNDED") return o.status === "REFUNDED";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Quản lý Thanh toán &amp; Đối soát
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Duyệt chuyển khoản ngân hàng thủ công, cấp quyền gói dịch vụ và kiểm toán hoa hồng CTV.
            </p>
          </div>

          {toastMessage && (
            <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md animate-fade-in">
              <Check className="w-4 h-4" /> {toastMessage}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilter("TRANSFER_SUBMITTED")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === "TRANSFER_SUBMITTED"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt ({orders.filter((o) => o.status === "TRANSFER_SUBMITTED").length})
          </button>
          <button
            onClick={() => setFilter("PAID")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              filter === "PAID"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã thanh toán ({orders.filter((o) => o.status === "PAID").length})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "PENDING"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Chưa chuyển ({orders.filter((o) => o.status === "PENDING").length})
          </button>
          <button
            onClick={() => setFilter("REFUNDED")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "REFUNDED"
                ? "bg-rose-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Đã hoàn tiền ({orders.filter((o) => o.status === "REFUNDED").length})
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Không có đơn hàng nào trong danh mục này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Mã đơn</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Số tiền</th>
                    <th className="py-3 px-4">Giới thiệu (CTV)</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{ord.buyer.fullName}</div>
                        <div className="text-[11px] text-slate-400">{ord.buyer.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.lines.map((l, i) => (
                          <div key={i} className="text-slate-700 font-medium">
                            {l.title}
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.totalVnd.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.referredAffiliateId ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            Có CTV (10%)
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.status === "PAID" ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ĐÃ THANH TOÁN
                          </span>
                        ) : ord.status === "TRANSFER_SUBMITTED" ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            ĐÃ CHUYỂN KHOẢN
                          </span>
                        ) : ord.status === "REFUNDED" ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            ĐÃ HOÀN TIỀN
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                            {ord.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status !== "PAID" && ord.status !== "REFUNDED" && (
                            <button
                              onClick={() => handleConfirmPaid(ord.id)}
                              disabled={actionLoading === ord.id}
                              data-testid={`confirm-paid-${ord.id}-btn`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-semibold text-[11px] transition shadow-sm flex items-center gap-1"
                            >
                              {actionLoading === ord.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Duyệt Paid
                            </button>
                          )}

                          {ord.status === "PAID" && (
                            <button
                              onClick={() => handleRefund(ord.id)}
                              disabled={actionLoading === ord.id}
                              data-testid={`refund-${ord.id}-btn`}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[11px] transition flex items-center gap-1"
                            >
                              {actionLoading === ord.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              Hoàn tiền
                            </button>
                          )}
                        </div>
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

