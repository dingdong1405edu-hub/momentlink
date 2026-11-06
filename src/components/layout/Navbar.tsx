"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sparkles, Heart, Menu, X, User as UserIcon, LogOut, PlusCircle, Shield } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUser();
    const handleAuthChange = () => fetchUser();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [pathname, fetchUser]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              MomentLink
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/occasions" className="hover:text-rose-600 transition-colors">
              Chủ đề & Dịp
            </Link>
            <Link href="/templates" className="hover:text-rose-600 transition-colors">
              Mẫu thiệp
            </Link>
            <Link href="/pricing" className="hover:text-rose-600 transition-colors">
              Bảng giá
            </Link>
            <Link href="/shops" className="hover:text-rose-600 transition-colors">
              Hoa & Quà
            </Link>
            <Link href="/affiliate/dashboard" className="hover:text-rose-600 transition-colors">
              Cộng tác viên (10%)
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <>
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-full shadow-sm shadow-rose-200 transition-all hover:shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo thiệp mới</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>

                {user.roles.includes("ADMIN") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  data-testid="logout-btn"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/auth/sign-in"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/create"
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-medium rounded-full shadow-sm shadow-rose-200 transition-all hover:shadow-md"
                >
                  Tạo thiệp miễn phí
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-rose-600 rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-rose-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/occasions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Chủ đề & Dịp
          </Link>
          <Link
            href="/templates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Mẫu thiệp
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Bảng giá
          </Link>
          <Link
            href="/shops"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Hoa & Quà
          </Link>
          <Link
            href="/affiliate/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Cộng tác viên (10%)
          </Link>

          <div className="pt-3 border-t border-rose-100 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-rose-50 rounded-lg"
                >
                  Dashboard: {user.name}
                </Link>
                {user.roles.includes("ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-amber-700 hover:bg-amber-50 rounded-lg"
                  >
                    Trang Quản Trị (Admin)
                  </Link>
                )}
                <Link
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 bg-rose-600 text-white font-medium rounded-full"
                >
                  Tạo thiệp mới
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-3 py-2 text-sm text-slate-500 hover:text-rose-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-3 py-2 text-base font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 bg-rose-600 text-white font-medium rounded-full shadow"
                >
                  Tạo thiệp miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
