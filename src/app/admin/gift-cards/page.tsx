"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gift,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Calendar,
  Layers,
} from "lucide-react";

interface BatchItem {
  id: string;
  label: string;
  quantity: number;
  status: string;
  createdAt: string;
  _count: { cards: number };
  assignedShop?: { id: string; name: string };
}

interface GeneratedCard {
  publicCode: string;
  activationSecret: string;
  cardType: string;
  scanUrl: string;
  activateUrl: string;
}

export default function AdminGiftCardsPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New batch form
  const [label, setLabel] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [cardType, setCardType] = useState("GIFT_TAG");

  // Output from newly created batch
  const [latestGeneratedCards, setLatestGeneratedCards] = useState<GeneratedCard[] | null>(null);

  const loadBatches = async () => {
    try {
      const res = await fetch("/api/v1/admin/gift-cards/batches");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/sign-in?callbackUrl=/admin/gift-cards");
          return;
        }
        throw new Error("Không thể tải danh sách lô thẻ.");
      }
      const data = await res.json();
      setBatches(data.data.batches);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/gift-cards/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          quantity: Number(quantity),
          cardType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Tạo lô thẻ thất bại.");
      }

      setToastMessage(data.data.message);
      setLatestGeneratedCards(data.data.cards);
      setLabel("");
      await loadBatches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
              <Link href="/admin" className="hover:underline">Quản trị</Link>
              <span>/</span>
              <span>Thẻ QR vật lý</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-rose-600" />
              Quản lý Lô Thẻ QR Vật Lý (Gift Cards)
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

        {/* Create Batch Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-neutral-600" />
            Tạo Lô Thẻ QR Mới
          </h2>
          <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Tên / Nhãn Lô
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="VD: Lô hoa Valentine 2026"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Số Lượng Thẻ
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Loại Thẻ
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="GIFT_TAG">GIFT_TAG (Tag quà)</option>
                <option value="LOVE_CARD">LOVE_CARD (Thẻ tình yêu)</option>
                <option value="GRAD_CARD">GRAD_CARD (Thẻ tốt nghiệp)</option>
                <option value="BIRTHDAY_CARD">BIRTHDAY_CARD (Thẻ sinh nhật)</option>
                <option value="WEDDING_CARD">WEDDING_CARD (Thẻ đám cưới)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Tạo Lô Thẻ Ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Display newly generated card list */}
        {latestGeneratedCards && latestGeneratedCards.length > 0 && (
          <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Danh sách mã thẻ vừa tạo ({latestGeneratedCards.length} thẻ)
                </h3>
                <p className="text-xs text-neutral-600">
                  Hãy sao lưu hoặc in danh sách này. Mã bí mật (Activation Secret) chỉ xuất hiện 1 lần duy nhất tại đây.
                </p>
              </div>
              <button
                onClick={() => setLatestGeneratedCards(null)}
                className="text-xs text-neutral-500 hover:text-neutral-800"
              >
                Ẩn bảng
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-xl bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Mã công khai (QR Code)</th>
                    <th className="p-3">Mã kích hoạt bí mật (Cào)</th>
                    <th className="p-3">Link quét QR</th>
                    <th className="p-3">Link kích hoạt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {latestGeneratedCards.map((c, idx) => (
                    <tr key={c.publicCode} className="hover:bg-neutral-50">
                      <td className="p-3 text-neutral-500 font-sans">{idx + 1}</td>
                      <td className="p-3 font-bold text-neutral-900">{c.publicCode}</td>
                      <td className="p-3 text-rose-600 font-bold">{c.activationSecret}</td>
                      <td className="p-3 text-neutral-600 font-sans">
                        <Link href={c.scanUrl} target="_blank" className="text-blue-600 hover:underline">
                          {c.scanUrl}
                        </Link>
                      </td>
                      <td className="p-3 text-neutral-600 font-sans">
                        <Link href={c.activateUrl} target="_blank" className="text-blue-600 hover:underline">
                          {c.activateUrl}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Existing Batches Table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-neutral-500" />
              Lịch Sử Lô Thẻ Đã Tạo
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách lô...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              Chưa có lô thẻ quà tặng nào được tạo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 text-xs uppercase">
                  <tr>
                    <th className="p-4">Nhãn lô</th>
                    <th className="p-4">Số lượng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Cửa hàng gán</th>
                    <th className="p-4">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50">
                      <td className="p-4 font-semibold text-neutral-900">{b.label}</td>
                      <td className="p-4 font-mono text-neutral-700">{b.quantity} thẻ</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-600 text-xs">
                        {b.assignedShop?.name || "Kho trung tâm"}
                      </td>
                      <td className="p-4 text-neutral-500 text-xs">
                        {new Date(b.createdAt).toLocaleDateString("vi-VN")}
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

