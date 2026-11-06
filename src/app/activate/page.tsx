"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowRight } from "lucide-react";

export default function ActivateIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/activate/${code.trim().toUpperCase()}`);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Kích hoạt thẻ QR vật lý</h1>
        <p className="text-neutral-600 text-sm mb-6">
          Nhập mã thẻ được in trên mặt trước của tấm thẻ quà tặng (VD: GC1A2B3C).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Mã thẻ (VD: GC...)"
            className="w-full px-4 py-3 font-mono text-center text-lg uppercase tracking-wider rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <span>Tiếp tục kích hoạt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}

