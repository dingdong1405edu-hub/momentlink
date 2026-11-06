# Architecture & Product Decisions (ADR)

> **Tài liệu theo dõi quyết định kiến trúc và lựa chọn kỹ thuật**  
> Dự án: MomentLink (nền tảng tạo thiệp / mini website / QR card)  
> Cập nhật: 2026-11-04  
> Tham chiếu: `spec.md` v1.0  

---

## 1. Cơ sở dữ liệu và ORM (Database & ORM)

- **Quyết định:** Sử dụng **Prisma ORM** với schema quan hệ chuẩn hóa.
- **Môi trường cục bộ / CI / Test:** Sử dụng SQLite (`file:./dev.db`) có kích hoạt Foreign Keys, Transaction, Indexes và ACID đầy đủ. Không dùng mock array in-memory. Mọi thao tác đều ghi đĩa thật.
- **Môi trường Production (Railway):** Chuẩn bị sẵn cấu hình PostgreSQL (`DATABASE_URL=postgresql://...`). Schema thiết kế tương thích kép (portable types: String CUID/UUID, DateTime UTC, Int VND integer minor units, String JSON fields serialize/deserialize), cho phép chuyển đổi provider sang PostgreSQL khi deploy lên Railway.
- **Lý do:** Đảm bảo môi trường phát triển local chạy được 100% độc lập, không phụ thuộc Docker daemon hay UAC Windows, đồng thời bảo đảm tính toàn vẹn dữ liệu (migrations, foreign keys, unique constraints, transactional locks).

---

## 2. Authentication & Quyền hạn (RBAC)

- **Quyết định:** Triển khai cơ chế Authentication & Session quản lý qua Prisma với secure HttpOnly / SameSite / Secure session cookies.
- **Bảo mật:** Mật khẩu được băm an toàn (scrypt/bcryptjs), không lưu plaintext. Session có thời hạn, token ngẫu nhiên độ dài cao (CSPRNG).
- **Phân quyền (RBAC):** Bảng `RoleAssignment` và middleware/service server-side kiểm tra quyền trên từng route/API:
  - `VISITOR` (khách vãng lai)
  - `CREATOR` (chủ sở hữu thiệp)
  - `AFFILIATE` (cộng tác viên được duyệt)
  - `SHOP_OWNER` / `SHOP_STAFF` (chủ shop / nhân viên)
  - `ADMIN` (quản trị viên hệ thống)
- **Admin Bootstrap:** Tài khoản Admin ban đầu được tạo qua kịch bản `seed` hoặc CLI bảo vệ với biến môi trường `ADMIN_BOOTSTRAP_EMAIL` và mật khẩu bảo mật. Tuyệt đối không cho phép người dùng tự đăng ký role Admin từ giao diện public.

---

## 3. Quản lý Tệp tin & Media Storage

- **Quyết định:** Thiết kế mẫu kiến trúc **Storage Adapter** đa kênh:
  - `LocalStorageAdapter`: Lưu trữ file vào thư mục upload cục bộ (`public/uploads/...`) cho môi trường dev/offline, kiểm tra MIME type, kích thước byte, phần mở rộng an toàn, sinh tên file ngẫu nhiên chống path traversal.
  - `S3StorageAdapter`: Tích hợp S3-compatible (Cloudflare R2 / AWS S3 / Railway bucket) với presigned URLs cho môi trường production.
- **Bảo vệ:** Lọc MIME type (chỉ nhận image/jpeg, image/png, image/webp), giới hạn dung lượng (tối đa 5MB cho ảnh thường), không cho phép SVG active script, private theo mặc định.

---

## 4. Email Giao dịch (Transactional Email)

- **Quyết định:** Triển khai **Email Adapter**:
  - `ConsoleEmailAdapter`: Ghi log nội dung email ra console / logger trong môi trường dev/test để kiểm tra luồng xác thực / thông báo mà không cần kết nối mạng hay API key ngoài.
  - `ResendEmailAdapter`: Sẵn sàng kích hoạt khi cung cấp `RESEND_API_KEY`.
- **Lý do:** Đáp ứng chỉ thị số 9 và 24 trong `spec.md`: không dừng lại vì thiếu API key nhà cung cấp ngoài, có fallback dev hoạt động end-to-end.

---

## 5. Thanh toán & Đối soát (Payments & Billing)

- **Quyết định:** Triển khai chế độ **Manual Review / Chuyển khoản ngân hàng** cho P0:
  - Người dùng bấm mua gói -> Hệ thống tạo đơn hàng `Order` với các `OrderLine` snapshot giá, mã đơn unique, trạng thái `PENDING`.
  - Hiển thị thông tin chuyển khoản (tên ngân hàng, số tài khoản, số tiền, cú pháp chuyển khoản là mã đơn).
  - Người dùng bấm "Xác nhận đã chuyển khoản" -> Đơn chuyển sang `TRANSFER_SUBMITTED` (cần đối soát), **tuyệt đối không mở khóa gói tự động**.
  - Admin vào trang quản trị tài chính (`/admin/payments`) kiểm tra sao kê thực tế và bấm duyệt `confirm-paid` -> Chạy DB transaction: đánh dấu `PAID`, cấp `Entitlement` cho thiệp/user, tính hoa hồng CTV `Commission` (nếu có).
  - Hỗ trợ Webhook Adapter sẵn sàng mở rộng cho VNPAY / PayOS ở giai đoạn sau với xác thực chữ ký (signature verification).

---

## 6. Tiếp thị liên kết (Affiliate 10%)

- **Quyết định:**
  - Hoa hồng cố định mặc định 10.00% (1000 basis points) chỉ tính trên doanh thu sản phẩm số hợp lệ (`digitalRevenueVND`), làm tròn `floor(amount * 0.10)`.
  - Không tính hoa hồng trên hoa/quà vật lý, phí vận chuyển, hoặc tiền mừng cưới.
  - Attribution: lưu cookie first-party 30 ngày cho mã affiliate hợp lệ. Chống self-referral (người tạo thiệp không được nhận hoa hồng từ chính mình).
  - Commission Ledger: ghi nhận bất biến theo nguyên tắc kế toán kép/append-only (`EARNED`, `REVERSAL`, `PAYOUT_DEBIT`).
  - Thời gian giữ (Hold period): 14 ngày (có thể cấu hình test). Payout tối thiểu: 100.000 VND. Yêu cầu rút tiền khóa số dư `AVAILABLE` sang `RESERVED` trong transaction, Admin duyệt mới chuyển thành `PAID`.

---

## 7. Đối tác Hoa/Quà (Shop Partners) & Yêu cầu Báo giá

- **Quyết định:**
  - P0 là mô hình **Partner Discovery + Request/Quote Fulfillment**, nền tảng **không giữ tiền** (custody of funds) của hàng vật lý.
  - Khách chọn shop và sản phẩm -> Gửi yêu cầu `ShopRequest` kèm địa chỉ, liên hệ, ghi chú và thiệp/QR đính kèm.
  - Shop nhận yêu cầu, cập nhật trạng thái (`SUBMITTED -> QUOTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED` hoặc `DECLINED/CANCELLED`).
  - Khách và shop giao dịch thanh toán trực tiếp ngoài nền tảng hoặc theo thỏa thuận. Nền tảng ghi nhận nhật ký audit `ShopRequestEvent`.

---

## 8. Thẻ QR Vật lý (Physical QR Gift Card)

- **Quyết định:**
  - Admin tạo lô thẻ (`GiftCardBatch`), mỗi thẻ có `publicCode` công khai (dùng cho link `/gift/[publicCode]`) và `activationSecret` bí mật ngẫu nhiên CSPRNG (in kèm cào/bảo mật).
  - Database chỉ lưu mã băm `activationSecretHash` (SHA-256 + pepper), không lưu bí mật plaintext.
  - Khi người dùng sở hữu thẻ cào mã và đăng nhập vào `/activate/[publicCode]`, hệ thống xác thực secret trong DB transaction có khóa bản ghi, chuyển trạng thái sang `CLAIMED` và gán với `Invitation` của người đó.
  - Người nhận quét thẻ sẽ chuyển tiếp (redirect) đến thiệp đã liên kết; nếu thẻ chưa kích hoạt, hiển thị trang chào đón "Món quà sắp mở", không làm lộ thông tin cá nhân.

---

## 9. Render & Xuất bản (Export Worker)

- **Quyết định:**
  - QR Code: Sinh mã QR chuẩn (PNG / SVG) bằng thư viện `qrcode` server-side, tương phản cao dark-on-light, gắn shortCode ổn định (`/q/[shortCode]`).
  - Worker xuất file: Thiết kế kiến trúc hàng đợi công việc (Job Queue) xử lý tác vụ snapshot ảnh (PNG/JPG 1080x1350) và tài liệu PDF (A4/A5).
  - Có thể chạy trực tiếp in-process / queue worker với trạng thái lưu trong bảng `ExportJob` (`QUEUED -> PROCESSING -> SUCCEEDED/FAILED`), hỗ trợ tải file có xác thực quyền sở hữu.

---

## 10. Bảo Mật Production, CSRF, Rate Limiting & Giám Sát (Milestone 6)

- **Quyết định:**
  - **CSRF Protection:** Xác thực `Origin` và `Host` header cho toàn bộ state-changing API mutations (`POST`, `PUT`, `PATCH`, `DELETE`) trên route `/api/v1/` trong Next.js middleware, ngăn chặn tấn công giả mạo yêu cầu từ trang web của bên thứ ba.
  - **Rate Limiting:** Sử dụng cơ chế trượt cửa sổ thời gian (sliding-window rate limiter) trên các tuyến rủi ro cao:
    - `/api/v1/auth/*`: Tối đa 30 requests/phút/IP (ngăn chặn brute-force).
    - `/api/v1/gift-cards/activate`: Tối đa 20 requests/phút/IP (chống quét cào trộm mã).
    - Header phản hồi `Retry-After: 60` và HTTP 429 khi vi phạm.
  - **Security Headers:** Cấu hình trong `next.config.mjs` bao gồm HSTS (Strict-Transport-Security: 2 năm), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
  - **Sanitization & Anti-XSS:** Đầu vào lọc qua Zod, loại bỏ thẻ HTML script trong slug và nội dung người dùng.
  - **Liveness & Readiness Healthchecks:** Cung cấp `/api/health` (kiểm tra process liveness) và `/api/ready` (kiểm tra kết nối DB readiness).
  - **IDOR Protection:** Kiểm tra quyền sở hữu cấp độ máy chủ (`ownerId === user.id` hoặc vai trò `ADMIN`), trả về HTTP 403 Forbidden hoặc 404 Not Found, không chỉ ẩn nút trên giao diện.

