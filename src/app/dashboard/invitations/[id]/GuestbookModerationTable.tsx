"use client";

import { useState } from "react";
import { Check, EyeOff, Trash2 } from "lucide-react";

interface GuestbookMessageItem {
  id: string;
  displayName: string;
  body: string;
  status: string;
  createdAt: Date | string;
}

export default function GuestbookModerationTable({
  invitationId,
  messages: initialMessages,
}: {
  invitationId: string;
  messages: GuestbookMessageItem[];
}) {
  const [messages, setMessages] = useState<GuestbookMessageItem[]>(initialMessages);

  const updateStatus = async (messageId: string, status: "APPROVED" | "HIDDEN") => {
    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status } : m))
        );
      }
    } catch {
      alert("Lỗi khi cập nhật trạng thái kiểm duyệt.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-slate-900 text-lg">
          Kiểm duyệt lời chúc (Sổ lưu bút)
        </h3>
        <span className="text-xs text-slate-500">{messages.length} lời chúc</span>
      </div>

      {messages.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">
          Chưa có lời chúc nào trong sổ lưu bút.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Người gửi</th>
                <th className="py-3 px-4">Nội dung lời chúc</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-800">{m.displayName}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">{m.body}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        m.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : m.status === "HIDDEN"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {m.status === "APPROVED"
                        ? "Đã duyệt"
                        : m.status === "HIDDEN"
                        ? "Đã ẩn"
                        : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {m.status !== "APPROVED" && (
                      <button
                        onClick={() => updateStatus(m.id, "APPROVED")}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Duyệt hiển thị"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {m.status !== "HIDDEN" && (
                      <button
                        onClick={() => updateStatus(m.id, "HIDDEN")}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Ẩn lời chúc"
                      >
                        <EyeOff className="w-4 h-4" />
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
  );
}

