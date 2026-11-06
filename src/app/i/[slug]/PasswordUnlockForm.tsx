"use client";

import { useState } from "react";
import { Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function PasswordUnlockForm({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/public/invitations/${slug}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Mật mã không đúng.");
      }

      // Reload to show unlocked invitation
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 block mb-1">
            Thiệp Mời Được Bảo Mật
          </span>
          <h2 className="text-xl font-serif font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-400 mt-2">
            Vui lòng nhập mật mã được người gửi cung cấp để mở xem thiệp
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Nhập mật mã xem thiệp..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-center text-sm focus:outline-none focus:border-rose-500 font-mono tracking-widest"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:scale-105"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Mở thiệp mời</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

