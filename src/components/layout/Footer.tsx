import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-white">MomentLink</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nền tảng tạo thiệp mời, mini website tương tác và thẻ QR vật lý tinh tế cho những khoảnh khắc đáng nhớ nhất.
            </p>
          </div>

          {/* Dịp phổ biến */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Dịp phổ biến</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/occasions/wedding-ceremony" className="hover:text-rose-400 transition-colors">
                  Thiệp cưới & Đính hôn
                </Link>
              </li>
              <li>
                <Link href="/occasions/university-graduation" className="hover:text-rose-400 transition-colors">
                  Lễ tốt nghiệp
                </Link>
              </li>
              <li>
                <Link href="/occasions/personal-birthday" className="hover:text-rose-400 transition-colors">
                  Sinh nhật & Thôi nôi
                </Link>
              </li>
              <li>
                <Link href="/occasions/love-confession" className="hover:text-rose-400 transition-colors">
                  Tỏ tình & Kỷ niệm ngày yêu
                </Link>
              </li>
            </ul>
          </div>

          {/* Sản phẩm & Đối tác */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Hệ sinh thái</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/templates" className="hover:text-rose-400 transition-colors">
                  Bộ sưu tập mẫu thiệp
                </Link>
              </li>
              <li>
                <Link href="/shops" className="hover:text-rose-400 transition-colors">
                  Đối tác hoa & quà tặng
                </Link>
              </li>
              <li>
                <Link href="/activate" className="hover:text-rose-400 transition-colors">
                  Kích hoạt thẻ QR vật lý
                </Link>
              </li>
              <li>
                <Link href="/affiliate/dashboard" className="hover:text-rose-400 transition-colors">
                  Cộng tác viên (10% hoa hồng)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-rose-400 transition-colors">
                  Gói dịch vụ & Bảng giá
                </Link>
              </li>
            </ul>
          </div>

          {/* Pháp lý & Hỗ trợ */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Chính sách & Pháp lý</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/legal/privacy" className="hover:text-rose-400 transition-colors">
                  Bảo vệ dữ liệu cá nhân (Nghị định 91/2025)
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-rose-400 transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/legal/affiliate" className="hover:text-rose-400 transition-colors">
                  Chính sách Cộng tác viên
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-rose-400 transition-colors">
                  Báo cáo nội dung vi phạm
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 MomentLink. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Thiết kế vì những khoảnh khắc chân thành <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

