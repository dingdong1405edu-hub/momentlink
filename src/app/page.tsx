import Link from "next/link";
import {
  Sparkles,
  Heart,
  GraduationCap,
  Cake,
  Gift,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Store,
} from "lucide-react";

export default function HomePage() {
  const verticals = [
    {
      title: "Tình yêu & Lời tỏ tình",
      desc: "Trang tỏ tình bất ngờ, thư tay phong bì ảo, kỷ niệm 100 ngày yêu.",
      icon: Heart,
      href: "/occasions/love-confession",
      gradient: "from-rose-500 to-pink-500",
      bgLight: "bg-rose-50",
    },
    {
      title: "Lễ cưới & Đính hôn",
      desc: "Save the date, địa điểm nghi lễ, xác nhận RSVP và câu chuyện tình yêu.",
      icon: Sparkles,
      href: "/occasions/wedding-ceremony",
      gradient: "from-amber-500 to-rose-400",
      bgLight: "bg-amber-50",
    },
    {
      title: "Sinh nhật & Thôi nôi",
      desc: "Thiệp mời sinh nhật pháo hoa giấy, đếm ngược ngày tiệc và lời chúc.",
      icon: Cake,
      href: "/occasions/personal-birthday",
      gradient: "from-purple-500 to-indigo-500",
      bgLight: "bg-purple-50",
    },
    {
      title: "Lễ tốt nghiệp",
      desc: "Cột mốc trưởng thành, lễ nhận bằng đại học, thiệp tri ân trang trọng.",
      icon: GraduationCap,
      href: "/occasions/university-graduation",
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Chọn dịp & Mẫu thiệp",
      desc: "Duyệt bộ sưu tập mẫu thiết kế tinh tế theo chủ đề cưới, sinh nhật, tốt nghiệp hoặc tỏ tình.",
    },
    {
      step: "02",
      title: "Điền nội dung & Xem trước",
      desc: "Nhập thông tin sự kiện, đăng tải hình ảnh kỷ niệm, nghe thử nhạc nền và xem trước giao diện thực tế.",
    },
    {
      step: "03",
      title: "Xuất bản & Chia sẻ",
      desc: "Nhận đường dẫn riêng tư hoặc mã QR có thể in ấn, xuất file ảnh / PDF và theo dõi phản hồi khách.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-rose-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-800 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Nền tảng thiệp mời tương tác & Mini Website số 1</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Tạo thiệp mời & mini website{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              cho mọi khoảnh khắc đáng nhớ
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Chọn mẫu, nhập lời nhắn, tùy chỉnh giao diện và trong vài phút bạn đã có một mini website
            tương tác gửi bằng <strong>link, mã QR, ảnh hoặc PDF</strong>. Kết hợp tặng hoa, quà và thẻ QR vật lý.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create"
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-base rounded-full shadow-lg shadow-rose-200 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Tạo thiệp miễn phí ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/templates"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-medium text-base rounded-full border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Khám phá 8 mẫu thiệp</span>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Không cần cài đặt ứng dụng
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Tương thích hoàn hảo trên điện thoại
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Bảo mật & Không lộ thông tin cá nhân
            </span>
          </div>
        </div>
      </section>

      {/* 4 Verticals Section */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Chủ đề dành riêng cho từng dịp trọng đại
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Thiết kế chuyên sâu với bố cục và trường thông tin chuẩn xác, không dùng chung một biểu mẫu hành chính khô cứng.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verticals.map((v) => {
              const Icon = v.icon;
              return (
                <Link
                  key={v.title}
                  href={v.href}
                  className="group p-6 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${v.gradient} text-white flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-rose-600 group-hover:gap-2 transition-all">
                    <span>Xem các mẫu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Đơn giản & Dễ dùng</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
              Sở hữu mini website thiệp mời trong 3 bước
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
                <span className="text-4xl font-serif font-bold text-rose-100 absolute top-6 right-6 select-none">
                  {s.step}
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Physical QR + Shop + Affiliate Ecosystem */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50/70 to-rose-50/50 border border-amber-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Thẻ QR Vật Lý</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Cào mã bí mật, kích hoạt thẻ và liên kết với thiệp mời. Đính kèm hộp quà, thiệp cứng hoặc hoa tươi để người nhận quét mở thiệp online.
                </p>
              </div>
              <Link
                href="/activate"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                <span>Kích hoạt thẻ QR ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-50/70 to-pink-50/50 border border-rose-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-4">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Đối Tác Hoa & Quà Tặng</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Gửi yêu cầu đặt hoa tươi, thú bông, socola gắn kèm mã QR trực tiếp tới các cửa hàng đối tác uy tín tại khu vực của bạn.
                </p>
              </div>
              <Link
                href="/shops"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-rose-700 hover:text-rose-800"
              >
                <span>Duyệt danh mục hoa quà</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Cộng Tác Viên 10%</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Đăng ký làm CTV, nhận link referral riêng và nhận ngay 10% hoa hồng trên mọi gói dịch vụ thiệp số khách mua thành công.
                </p>
              </div>
              <Link
                href="/affiliate/dashboard"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>Khám phá chương trình CTV</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">
            Sẵn sàng lưu giữ khoảnh khắc ý nghĩa của bạn?
          </h2>
          <p className="text-rose-100 text-base sm:text-lg max-w-xl mx-auto">
            Không cần kỹ năng thiết kế hay lập trình. Bắt đầu miễn phí ngay hôm nay.
          </p>
          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-rose-700 font-semibold text-base rounded-full shadow-lg hover:bg-rose-50 transition-all hover:scale-105"
            >
              <span>Bắt đầu tạo thiệp ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

