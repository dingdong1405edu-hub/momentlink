"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function CheckoutOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/sign-in?callbackUrl=/checkout/${orderId}`);
          return;
        }
        throw new Error("Không thể tải thông tin đơn hàng.");
      }
      const data = await res.json();
      setOrder(data.data.order);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMarkSubmitted = async () => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/mark-transfer-submitted`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Không thể gửi xác nhận.");
      }
      setMessage(data.data.message);
      loadOrder();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link
          href="/pricing"
          className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition"
        >
          Quay lại Bảng giá
        </Link>
      </div>
    );
  }

  const isPaid = order.status === "PAID";
  const isSubmitted = order.status === "TRANSFER_SUBMITTED";
  const instructions = order.paymentInstructions;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center">
          <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-600 mb-3">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Thanh toán Đơn hàng #{order.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chuyển khoản ngân hàng chính xác theo thông tin bên dưới để kích hoạt gói dịch vụ.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold">
            {isPaid ? (
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã thanh toán thành công
              </span>
            ) : isSubmitted ? (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Đang chờ Admin duyệt đối soát
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                Chờ chuyển khoản
              </span>
            )}
          </div>
        </div>

        {/* Order Summary & Line Items */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Chi tiết đơn hàng
          </h2>

          <div className="divide-y divide-slate-100">
            {order.lines.map((line: any) => (
              <div key={line.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-semibold text-slate-800">{line.titleSnapshot}</div>
                  <div className="text-xs text-slate-400">Số lượng: {line.quantity}</div>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  {line.totalVnd.toLocaleString("vi-VN")} đ
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-base font-bold text-slate-900">
            <span>Tổng cộng thanh toán:</span>
            <span className="text-xl text-rose-600 font-mono" data-testid="order-total-amount">
              {order.totalVnd.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        {/* Bank Transfer Details */}
        {!isPaid && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Thông tin chuyển khoản ngân hàng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Ngân hàng thụ hưởng</div>
                <div className="font-semibold text-slate-800 mt-1">{instructions.bankName}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                <div className="text-xs text-slate-400 font-medium">Số tài khoản</div>
                <div className="font-mono font-bold text-lg text-slate-900 mt-1">
                  {instructions.accountNumber}
                </div>
                <button
                  onClick={() => handleCopy(instructions.accountNumber, "acc")}
                  className="absolute top-4 right-4 text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1"
                >
                  {copiedField === "acc" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === "acc" ? "Đã chép" : "Chép"}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Chủ tài khoản</div>
                <div className="font-semibold text-slate-800 mt-1">{instructions.accountHolder}</div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 relative">
                <div className="text-xs text-amber-700 font-medium">Nội dung chuyển khoản (bắt buộc)</div>
                <div className="font-mono font-bold text-lg text-amber-900 mt-1">
                  {instructions.transferSyntax}
                </div>
                <button
                  onClick={() => handleCopy(instructions.transferSyntax, "syntax")}
                  className="absolute top-4 right-4 text-amber-800 hover:text-amber-950 text-xs font-semibold flex items-center gap-1"
                >
                  {copiedField === "syntax" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === "syntax" ? "Đã chép" : "Chép"}
                </button>
              </div>
            </div>

            {message && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Action button */}
            {!isSubmitted && (
              <button
                onClick={handleMarkSubmitted}
                disabled={submitting}
                data-testid="mark-transfer-submitted-btn"
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi xác nhận...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Tôi đã chuyển khoản xong
                  </>
                )}
              </button>
            )}

            {isSubmitted && (
              <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-600">
                Bạn đã gửi thông báo chuyển khoản. Quản trị viên sẽ đối soát giao dịch và kích hoạt gói cho bạn trong vài phút.
              </div>
            )}
          </div>
        )}

        {isPaid && (
          <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-950">
              Cảm ơn bạn! Đơn hàng đã được thanh toán thành công.
            </h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Quyền lợi gói đã được kích hoạt trên tài khoản của bạn. Bạn có thể sử dụng tất cả tính năng cao cấp ngay bây giờ.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full shadow-md transition"
              >
                <span>Về Bảng điều khiển (Dashboard)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

