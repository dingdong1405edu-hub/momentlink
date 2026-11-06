"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton({ className }: { className?: string }) {
  const handleLogout = async () => {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      data-testid="dashboard-logout-btn"
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
      }
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Đăng xuất</span>
    </button>
  );
}

