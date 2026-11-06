"use client";

import { useState } from "react";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface RsvpBlockProps {
  slug?: string;
  theme: TemplateTheme;
  isPreview?: boolean;
}

export default function RsvpBlock({ slug, theme, isPreview = false }: RsvpBlockProps) {
  const [guestName, setGuestName] = useState("");
  const [status, setStatus] = useState<"ATTENDING" | "DECLINED" | "MAYBE">("ATTENDING");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Vui lòng nhập tên của bạn");
      return;
    }

    setLoading(true);
    setError(null);

    if (isPreview || !slug) {
      // In template demo preview, simulate real confirmation
      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch(`/api/v1/public/invitations/${slug}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestName.trim(),
          status,
          guestCount,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Không thể gửi phản hồi. Vui lòng thử lại.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-10 px-4 max-w-lg mx-auto">
      <div
        className="p-6 sm:p-8 rounded-3xl shadow-sm border text-center"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: `${theme.accent}30`,
        }}
      >
        <span
          className="text-xs uppercase tracking-widest font-semibold block mb-2"
          style={{ color: theme.accent }}
        >
          Xác Nhận Tham Dự (RSVP)
        </span>
        <h3 className="text-lg font-serif font-bold mb-6" style={{ color: theme.foreground }}>
          Bạn sẽ đến chung vui chứ?
        </h3>

        {submitted ? (
          <div className="py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h4 className="text-base font-bold text-slate-800">Cảm ơn bạn đã phản hồi!</h4>
            <p className="text-xs text-slate-500">
              {status === "ATTENDING"
                ? "Rất mong được đón tiếp bạn trong ngày vui!"
                : "Rất tiếc vì bạn không thể tham dự, nhưng cảm ơn lời chúc của bạn!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.foreground }}>
                Họ và tên của bạn *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ví dụ: Hoàng Yến & Bạn"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.foreground }}>
                Xác nhận sự hiện diện
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("ATTENDING")}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                    status === "ATTENDING"
                      ? "bg-rose-50 border-rose-500 text-rose-700 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Sẽ tham dự ✨
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("DECLINED")}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                    status === "DECLINED"
                      ? "bg-rose-50 border-rose-500 text-rose-700 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Không thể đến
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("MAYBE")}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                    status === "MAYBE"
                      ? "bg-rose-50 border-rose-500 text-rose-700 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Chưa chắc chắn
                </button>
              </div>
            </div>

            {status === "ATTENDING" && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.foreground }}>
                  Số lượng người tham dự
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-800 bg-white"
                >
                  <option value={1}>1 người (Chỉ mình tôi)</option>
                  <option value={2}>2 người (Đi cùng người thương / bạn)</option>
                  <option value={3}>3 người (Gia đình)</option>
                  <option value={4}>4 người (Gia đình)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.foreground }}>
                Lời nhắn gửi (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Chúc mừng hạnh phúc hai bạn nhé!"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-800 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: theme.accent }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi phản hồi</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

