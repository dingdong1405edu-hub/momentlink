"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Mail } from "lucide-react";

interface ActivateCardPageProps {
  params: {
    publicCode: string;
  };
}

export default function ActivateCardPage({ params }: ActivateCardPageProps) {
  const router = useRouter();
  const publicCode = params.publicCode.toUpperCase();

  const [secret, setSecret] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInvs, setIsFetchingInvs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    invitationSlug: string;
    invitationTitle: string;
  } | null>(null);

  useEffect(() => {
    async function loadInvitations() {
      try {
        const res = await fetch("/api/v1/invitations");
        if (res.status === 401) {
          router.push(`/auth/sign-in?redirect=/activate/${publicCode}`);
          return;
        }
        const data = await res.json();
        if (res.ok && data.data?.invitations) {
          setInvitations(data.data.invitations);
          if (data.data.invitations.length > 0) {
            setSelectedInvitationId(data.data.invitations[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load invitations", err);
      } finally {
        setIsFetchingInvs(false);
      }
    }
    loadInvitations();
  }, [publicCode, router]);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) {
      setError("Vui lòng nhập mã kích hoạt bí mật ở mặt sau thẻ.");
      return;
    }
    if (!selectedInvitationId) {
      setError("Vui lòng chọn một thiệp mời để liên kết với thẻ.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/gift-cards/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicCode,
          activationSecret: secret.trim(),
          invitationId: selectedInvitationId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.data) {
        setError(data.error?.message || "Kích hoạt thẻ thất bại.");
        return;
      }

      setSuccessData({
        invitationSlug: data.data.card.invitationSlug,
        invitationTitle: data.data.card.invitationTitle,
      });
    } catch (err: any) {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  if (successData) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Kích hoạt thành công!</h1>
          <p className="text-neutral-600 text-sm mb-6">
            Thẻ QR vật lý <span className="font-mono font-semibold">{publicCode}</span> đã được liên kết thành công với thiệp <strong>{successData.invitationTitle}</strong>.
          </p>

          <div className="space-y-3">
            <Link
              href={`/gift/${publicCode}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition shadow"
            >
              <span>Xem trang quét thẻ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition"
            >
              Về trang quản lý
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-neutral-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Kích hoạt Thẻ QR vật lý</h1>
            <p className="text-xs text-neutral-500">Mã thẻ: <span className="font-mono font-semibold">{publicCode}</span></p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              Mã bí mật (Activation Secret)
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="VD: 7B892FE31A056D4C"
              className="w-full px-4 py-3 font-mono text-base tracking-wider rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
              required
            />
            <p className="text-xs text-neutral-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              Mã bí mật gồm 16 ký tự in ở lớp cào mặt sau thẻ quà tặng.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              Chọn thiệp mời để liên kết
            </label>
            {isFetchingInvs ? (
              <div className="py-4 text-center text-xs text-neutral-400">Đang tải danh sách thiệp...</div>
            ) : invitations.length === 0 ? (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <p className="text-xs text-neutral-600 mb-3">Bạn chưa có thiệp mời nào để liên kết.</p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Tạo thiệp mới ngay
                </Link>
              </div>
            ) : (
              <select
                value={selectedInvitationId}
                onChange={(e) => setSelectedInvitationId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium bg-white"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title} ({inv.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isFetchingInvs || invitations.length === 0}
            className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Xác nhận kích hoạt thẻ</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

