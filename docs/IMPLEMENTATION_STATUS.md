# IMPLEMENTATION_STATUS.md — MomentLink

> **Trạng thái thực thi dự án theo `spec.md` v1.0**  
> Cập nhật lần cuối: 2026-11-04  
> Quy ước trạng thái: `TODO` | `IN_PROGRESS` | `DONE` | `BLOCKED`  

---

## Tổng quan tiến độ theo Milestone

| Milestone | Tên Milestone | Ưu tiên | Trạng thái | Hoàn thành |
|---|---|:---:|:---:|:---:|
| **M0** | Project Foundation | P0 | DONE | 100% |
| **M1** | Public Catalog & 8 Templates | P0 | DONE | 100% |
| **M2** | Creator Editor -> Publish | P0 | DONE | 100% |
| **M3** | Share, QR, Export | P0 | DONE | 100% |
| **M4** | Payment & Affiliate (10%) | P0 | DONE | 100% |
| **M5** | Shop Partners + QR Cards | P0 | DONE | 100% |
| **M6** | Production Hardening & Deploy | P0 | DONE | 100% |

---

## Chi tiết các hạng mục P0

### Milestone 0 — Project Foundation [P0]
- [x] Khởi tạo dự án Next.js App Router, TypeScript strict, Tailwind CSS, lucide-react. `DONE`
- [x] Cấu hình Prisma ORM, migrations, schema đầy đủ các bảng (§14). `DONE`
- [x] Cấu hình xác thực (Auth: signup, login, session cookie, password hash, role check). `DONE`
- [x] Seed dữ liệu ban đầu: Admin bootstrap, danh mục Occasion categories, Plans. `DONE`
- [x] Thiết lập Storage Adapter (Local dev + S3 ready). `DONE`
- [x] Thiết lập Email Adapter (Console dev + Resend ready). `DONE`
- [x] Setup Test Harness (Vitest cho Unit/Integration, Playwright cho E2E). `DONE`
- [x] Kiểm tra build, typecheck, unit tests, E2E browser tests. `DONE`

### Milestone 1 — Public Catalog & 8 Templates [P0]
- [x] Seed toàn bộ Occasion Taxonomy (§Phụ lục A). `DONE`
- [x] Triển khai 4 nhóm vertical chính: `wedding`, `graduation`, `birthday`, `love`. `DONE`
- [x] Xây dựng Template Engine: Block Registry, JSON content validation (Zod), Theme tokens. `DONE`
- [x] Hoàn thiện 8 template P0 hoạt động độc lập (§5.3):
  - [x] `wedding-classic` (Ivory Ceremony)
  - [x] `wedding-floral` (Bloom & Vows)
  - [x] `graduation-classic` (The Next Chapter)
  - [x] `graduation-playful` (Grad Party!)
  - [x] `birthday-fun` (Confetti Pop)
  - [x] `birthday-minimal` (Candlelight)
  - [x] `love-letter` (Secret Letter)
  - [x] `love-galaxy` (Written in the Stars)
- [x] Landing page (`/`), Trang danh mục (`/occasions`), Bộ sưu tập mẫu (`/templates`), Preview trực tiếp (`/templates/[slug]`). `DONE`
- [x] Trang chính sách pháp lý (`/legal/privacy`, `/legal/terms`, v.v. ghi chú cần review pháp lý). `DONE`

### Milestone 2 — Creator Editor -> Publish [P0]
- [x] Wizard tạo thiệp: Chọn dịp -> Chọn mẫu -> Điền nội dung. `DONE`
- [x] Editor hai bảng: Structured Form bên trái, Live Preview dùng chung Renderer bên phải. `DONE`
- [x] Tải lên hình ảnh an toàn, kiểm tra MIME, gắn asset vào thiệp. `DONE`
- [x] Lưu bản nháp (Draft autosave debounce + Manual save + Concurrency revision). `DONE`
- [x] Xuất bản thiệp (`Publish`): Kiểm tra trường bắt buộc, sinh slug unique, cập nhật trạng thái `PUBLISHED`. `DONE`
- [x] Trang thiệp người nhận (`/i/[slug]`): Responsive mobile-first, animation phong bì 1 lần/session, countdown, bản đồ, gallery. `DONE`
- [x] Quyền riêng tư: `UNLISTED` (noindex), `PASSWORD` (bảo vệ mật mã băm), `PUBLIC`, `ARCHIVED`. `DONE`
- [x] Tính năng tương tác: Form RSVP (chống trùng lặp, giới hạn khách), Guestbook (có chế độ duyệt kiểm duyệt), Trả lời câu hỏi (Tỏ tình). `DONE`
- [x] Dashboard Creator (`/dashboard`): Danh sách thiệp, thống kê lượt xem, quản lý phản hồi RSVP & Guestbook. `DONE`

### Milestone 3 — Share, QR, Export [P0]
- [x] Đường dẫn rút gọn & QR chuẩn (`/q/[shortCode]`): Redirect 302 an toàn, ghi nhận lượt quét thống kê. `DONE`
- [x] Xuất mã QR: Tải PNG và SVG với độ phân giải tùy chọn, tương phản cao. `DONE`
- [x] Tính năng chia sẻ: Sao chép link, Native Web Share API, thông tin chia sẻ an toàn. `DONE`
- [x] Export Engine (Worker):
  - [x] Snapshot Poster PNG / JPG (1080x1350, 4:5)
  - [x] Xuất PDF (A4/A5 portrait) có mã QR và liên kết dẫn về web
  - [x] Quản lý hàng đợi `ExportJob`, trạng thái `QUEUED -> PROCESSING -> SUCCEEDED/FAILED`, link tải có bảo vệ quyền. `DONE`

### Milestone 4 — Payment & Affiliate (10%) [P0]
- [x] Bảng giá gói (`/pricing`) và cơ chế Entitlement cho tính năng nâng cao. `DONE`
- [x] Luồng thanh toán P0: Đặt hàng (`Order` + `OrderLine` snapshot) -> Chuyển khoản ngân hàng -> Người mua bấm xác nhận chuyển khoản. `DONE`
- [x] Quản trị duyệt thanh toán (`/admin/payments`): Admin xác nhận đối soát -> Ghi nhận `PAID` + Cấp quyền `Entitlement` + Tạo hoa hồng CTV. `DONE`
- [x] Tiếp thị liên kết (Affiliate / CTV):
  - [x] Đăng ký CTV (`/affiliate/apply`) -> Admin duyệt (`/admin/affiliates`). `DONE`
  - [x] Tạo link giới thiệu (`/r/[code]`) -> Ghi nhận cookie first-party 30 ngày. `DONE`
  - [x] Tính hoa hồng 10% trên doanh thu sản phẩm số hợp lệ (`floor(amount * 0.10)`), loại trừ self-referral và hàng vật lý. `DONE`
  - [x] Commission Ledger bất biến (`EARNED`, `REVERSAL`, `PAYOUT_DEBIT`). `DONE`
  - [x] Yêu cầu rút hoa hồng (Payout Request, min 100k) -> Admin đối soát duyệt chuyển khoản. `DONE`

### Milestone 5 — Shop Partners + QR Cards [P0]
- [x] Đối tác hoa & quà (Shop):
  - [x] Đăng ký shop (`/shop/apply`) -> Admin duyệt (`/admin/shops`). `DONE`
  - [x] Shop quản lý thông tin, danh mục sản phẩm (hoa, hộp quà, thiệp) (`/shop/dashboard`). `DONE`
  - [x] Khách gửi yêu cầu mua hàng / báo giá từ thiệp hoặc catalog (`ShopRequest`). `DONE`
  - [x] Vòng đời yêu cầu báo giá: `SUBMITTED -> QUOTED -> ACCEPTED -> COMPLETED / DECLINED`. `DONE`
  - [x] Bảo vệ thông tin liên hệ và địa chỉ giao hàng (chỉ hiển thị cho shop được chỉ định). `DONE`
- [x] Thẻ QR vật lý (Gift Card):
  - [x] Admin tạo lô thẻ (`GiftCardBatch`), cấp mã `publicCode` và `activationSecret` CSPRNG & SHA-256 peppered hash (`/admin/gift-cards`). `DONE`
  - [x] Trang đích chưa kích hoạt `/gift/[publicCode]`: Thân thiện ("Món quà sắp mở"), không lộ PII. `DONE`
  - [x] Luồng kích hoạt `/activate/[publicCode]`: Nhập secret, xác thực DB transaction khóa bản ghi, gắn với thiệp của mình, chống race condition 409 Conflict. `DONE`
  - [x] Quét thẻ QR đã kích hoạt tự động mở mini website tương ứng. `DONE`

### Milestone 6 — Production Hardening & Deploy [P0]
- [x] Bảo mật: CSRF protection, Rate limiting, Input sanitize (Zod), Security headers (CSP, HSTS). `DONE`
- [x] Healthcheck endpoints: `/api/health` (liveness), `/api/ready` (readiness). `DONE`
- [x] Nhật ký hệ thống & Kiểm toán: `AuditLog` ghi nhận các hành vi nhạy cảm của Admin/Shop. `DONE`
- [x] Kiểm thử toàn diện: Unit tests + Integration tests + Playwright E2E cho 24 scenarios (§19.2). `DONE`
- [x] Cập nhật tài liệu: `docs/SETUP.md`, `docs/DEPLOY.md`, `docs/API.md`, `docs/ADMIN_OPERATIONS.md`. `DONE`

---

## Nhật ký kiểm thử & Thực thi (Execution Log)

| Ngày | Milestone | Thao tác / Lệnh chạy | Kết quả | Ghi chú |
|---|---|---|---|---|
| 2026-11-04 | Setup | Khảo sát repo, đọc `spec.md`, tạo `docs/DECISIONS.md` & `docs/IMPLEMENTATION_STATUS.md` | Hoàn thành | Bắt đầu Milestone 0 |
| 2026-11-04 | M0 | `pnpm db:push`, `pnpm db:seed`, `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e tests/e2e/m0-auth.spec.ts` | 100% Pass | Hoàn thành Milestone 0: Next.js + Prisma DB + Auth + E2E Browser Test |
| 2026-11-04 | M1 | `pnpm test`, `pnpm typecheck`, `pnpm test:e2e tests/e2e/m1-catalog.spec.ts`, `pnpm build` | 100% Pass | Hoàn thành Milestone 1: Catalog, 8 templates, Block Registry, Theme tokens, Legal pages |
| 2026-11-04 | M2 | `pnpm test`, `pnpm typecheck`, `pnpm test:e2e tests/e2e/m2-editor.spec.ts` | 100% Pass | Hoàn thành Milestone 2: Wizard, Editor, Autosave, Publish, Public Page, Password unlock, RSVP |
| 2026-11-04 | M3 | `pnpm test`, `pnpm typecheck`, `pnpm test:e2e tests/e2e/m3-share-export.spec.ts` | 100% Pass | Hoàn thành Milestone 3: QR PNG/SVG, Short URL /q/[shortCode], Sharp Poster, PDF Vector |
| 2026-11-04 | M4 | `pnpm test`, `pnpm typecheck`, `pnpm test:e2e tests/e2e/m4-payment-affiliate.spec.ts` | 100% Pass | Hoàn thành Milestone 4: Checkout, Bank Transfer Manual Review, 10% Commission Ledger, Payouts |
| 2026-11-04 | M5 | `pnpm test`, `pnpm typecheck`, `pnpm test:e2e tests/e2e/m5-shop-giftcard.spec.ts` | 100% Pass | Hoàn thành Milestone 5: Shop Directory, Quote Requests Lifecycle, Gift Card Batches, Physical QR Scan & Claim Concurrency Guard |
| 2026-11-04 | M6 | `pnpm test`, `pnpm typecheck`, `pnpm test:e2e tests/e2e/m6-hardening.spec.ts`, `pnpm build` | 100% Pass | Hoàn thành Milestone 6: CSRF, Rate Limiting, Security Headers, IDOR Guard, Healthchecks, 4 docs |
| 2026-11-04 | Final | `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` (toàn bộ 7 suites, 26 tests) | 100% Pass | Toàn bộ 7 Milestone P0 (M0 -> M6) hoàn thành và kiểm thử end-to-end trên trình duyệt |
