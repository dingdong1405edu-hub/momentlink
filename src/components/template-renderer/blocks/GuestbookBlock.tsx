"use client";

import { useState } from "react";
import { MessageSquareHeart, Send, Loader2, Sparkles } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface GuestbookMessageItem {
  id: string;
  displayName: string;
  body: string;
  createdAt: string;
}

interface GuestbookBlockProps {
  slug?: string;
  theme: TemplateTheme;
  isPreview?: boolean;
}

export default function GuestbookBlock({ slug, theme, isPreview = false }: GuestbookBlockProps) {
  const [messages, setMessages] = useState<GuestbookMessageItem[]>([
    {
      id: "msg_1",
      displayName: "Thu Hà & Bạn",
      body: "Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và bên nhau bền lâu!",
      createdAt: "Vừa xong",
    },
    {
      id: "msg_2",
      displayName: "Quốc Tuấn",
      body: "Tuyệt vời quá! Chúc mừng cột mốc đáng nhớ này của bạn nhé!",
      createdAt: "10 phút trước",
    },
  ]);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !body.trim()) return;

    setLoading(true);

    if (isPreview || !slug) {
      setTimeout(() => {
        setMessages([
          {
            id: `msg_${Date.now()}`,
            displayName: displayName.trim(),
            body: body.trim(),
            createdAt: "Vừa xong",
          },
          ...messages,
        ]);
        setDisplayName("");
        setBody("");
        setLoading(false);
        setSentNotice(true);
      }, 400);
      return;
    }

    try {
      const res = await fetch(`/api/v1/public/invitations/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), body: body.trim() }),
      });

      if (res.ok) {
        setDisplayName("");
        setBody("");
        setSentNotice(true);
      }
    } catch {
      // Ignored
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
          Sổ Lưu Bút & Lời Chúc
        </span>
        <h3 className="text-lg font-serif font-bold mb-6" style={{ color: theme.foreground }}>
          Gửi lời yêu thương đến chủ tiệc
        </h3>

        {/* Existing Messages */}
        <div className="space-y-3 mb-6 text-left max-h-60 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl border text-xs space-y-1"
              style={{
                backgroundColor: `${theme.accent}08`,
                borderColor: `${theme.accent}20`,
              }}
            >
              <div className="flex items-center justify-between font-bold" style={{ color: theme.accent }}>
                <span>{m.displayName}</span>
                <span className="text-[10px] font-normal opacity-60">{m.createdAt}</span>
              </div>
              <p className="opacity-85 leading-relaxed" style={{ color: theme.foreground }}>
                {m.body}
              </p>
            </div>
          ))}
        </div>

        {sentNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            ✨ Cảm ơn bạn! Lời chúc của bạn đã được gửi thành công.
          </div>
        )}

        {/* Send message form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tên của bạn"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-800 bg-white"
            />
          </div>

          <div>
            <textarea
              required
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Viết lời chúc ý nghĩa của bạn..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-800 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] disabled:opacity-50"
            style={{ backgroundColor: theme.accent }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Gửi lời chúc mừng</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

