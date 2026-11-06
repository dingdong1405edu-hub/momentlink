import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MomentLink — Nền tảng tạo thiệp / Mini Website / QR Card tinh tế",
  description:
    "Tạo mini website thiệp mời đám cưới, sinh nhật, tốt nghiệp, tỏ tình tương tác và kết hợp thẻ QR vật lý, hoa quà tặng trong vài phút.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

