"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  category: string;
  minPriceVnd: number | null;
  maxPriceVnd: number | null;
}

interface ShopRequestModalProps {
  shopId: string;
  shopName: string;
  shopCity: string;
  products: ProductItem[];
  preselectedProductId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopRequestModal({
  shopId,
  shopName,
  shopCity,
  products,
  preselectedProductId,
  isOpen,
  onClose,
}: ShopRequestModalProps) {
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [deliveryCity, setDeliveryCity] = useState(shopCity);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedProductId) {
      setSelectedProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  useEffect(() => {
    if (isOpen) {
      // Try to load user's invitations if logged in
      fetch("/api/v1/invitations")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.invitations) {
            setInvitations(data.data.invitations);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/public/shops/${shopId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId || undefined,
          requestedQty: Number(quantity),
          note,
          deliveryCity,
          deliveryAddress,
          contactName,
          contactPhone,
          invitationId: selectedInvitationId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Gửi yêu cầu thất bại.");
      }

      setSubmittedRequestId(data.data.request.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedRequestId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Yêu cầu đã được gửi!</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Cửa hàng <strong>{shopName}</strong> đã nhận được yêu cầu của bạn (Mã đơn: <span className="font-mono font-semibold">{submittedRequestId}</span>). Cửa hàng sẽ liên hệ xác nhận giá và thời gian giao hàng sớm nhất.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-neutral-900 text-white font-medium rounded-xl text-sm"
            >
              Đóng cửa sổ
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Gửi yêu cầu báo giá
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{shopName}</h2>
              <p className="text-xs text-neutral-500">Cửa hàng sẽ liên hệ báo giá và chuẩn bị quà tặng theo yêu cầu</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  Chọn sản phẩm *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.minPriceVnd ? `từ ${p.minPriceVnd.toLocaleString("vi-VN")}đ` : "báo giá"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    Thành phố giao
                  </label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  Địa chỉ giao hàng chi tiết
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    Tên người nhận / liên hệ *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {invitations.length > 0 && (
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase mb-1">
                    Gắn kèm thiệp mời của bạn (tùy chọn)
                  </label>
                  <select
                    value={selectedInvitationId}
                    onChange={(e) => setSelectedInvitationId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="">Không gắn thiệp</option>
                    {invitations.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 uppercase mb-1">
                  Ghi chú hoặc lời nhắn đính kèm quà
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lời chúc mừng sinh nhật, yêu cầu đóng gói hoặc ngày giờ giao mong muốn..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi yêu cầu tới cửa hàng</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

