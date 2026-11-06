"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Đăng nhập không thành công.");
      }

      // Redirect to dashboard on success
      window.dispatchEvent(new Event("auth-change"));
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-rose-100/50 border border-rose-100">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-serif font-bold text-slate-900">Đăng nhập MomentLink</h2>
          <p className="mt-2 text-sm text-slate-500">
            Quản lý thiệp mời, xem phản hồi khách và đơn hoa quà của bạn
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@vidu.vn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đăng nhập"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/auth/sign-up" className="text-rose-600 hover:underline font-medium">
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
}
