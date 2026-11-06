import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AffiliatePolicyPage() {
  return (
    <div className="flex-1 bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Chính Sách Tiếp Thị Liên Kết (CTV 10%)
          </h1>
          <p className="text-xs text-slate-500">Phiên bản 1.0 — Cập nhật ngày 04/11/2026 (Chờ rà soát pháp lý)</p>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 text-slate-700">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900">1. Tỷ lệ hoa hồng</h2>
            <p>
              Cộng tác viên (CTV) được duyệt nhận mức hoa hồng cố định <strong>10.00%</strong> trên doanh thu thực tế thu được từ các sản phẩm số của nền tảng (gói dịch vụ tạo thiệp, nâng cấp tính năng, xuất file có phí).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900">2. Phạm vi loại trừ</h2>
            <p>
              Hoa hồng <strong>không áp dụng</strong> cho: hoa tươi, quà tặng vật lý của cửa hàng đối tác, thẻ QR cứng, phí giao hàng, tiền mừng cưới của khách hoặc các khoản hoàn tiền/tranh chấp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900">3. Thời gian giữ đối soát (Hold period)</h2>
            <p>
              Hoa hồng sau khi phát sinh sẽ ở trạng thái PENDING trong vòng 14 ngày. Sau thời gian giữ nếu không có khiếu nại hoặc hoàn tiền, số dư sẽ chuyển sang AVAILABLE để yêu cầu rút tiền (tối thiểu 100.000 VNĐ).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-slate-900">4. Chống gian lận</h2>
            <p>
              Nghiêm cấm hành vi tự giới thiệu (self-referral), cookie stuffing, spam đường dẫn hoặc quảng cáo sai lệch. Mọi tài khoản vi phạm sẽ bị đình chỉ và hủy số dư chưa đối soát.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

