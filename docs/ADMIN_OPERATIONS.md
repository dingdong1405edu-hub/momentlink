# Sổ Tay Vận Hành Quản Trị (Admin Operations Runbook) — MomentLink

> **Tài liệu hướng dẫn quy trình vận hành, đối soát thanh toán và quản trị hệ sinh thái MomentLink dành cho Ban Quản Trị (Super Admin & Operations).**

---

## 1. Truy Cập Cổng Quản Trị

- **Đường dẫn**: `/admin`
- **Tài khoản quản trị khởi tạo mặc định**: `admin@momentlink.vn`
- **Quyền hạn yêu cầu**: Tài khoản phải có vai trò `ADMIN` trong bảng `RoleAssignment`.

---

## 2. Quy Trình Đối Soát & Duyệt Thanh Toán Thủ Công (Payment Review)

### 2.1. Kiểm tra đơn hàng mới
1. Truy cập `/admin/payments`.
2. Lọc đơn theo trạng thái:
   - `TRANSFER_SUBMITTED`: Khách hàng đã chuyển khoản và bấm xác nhận trên giao diện.
   - `CREATED`: Đơn hàng vừa khởi tạo, đang chờ thanh toán.

### 2.2. Đối chiếu sao kê ngân hàng
- Kiểm tra mã giao dịch trong nội dung chuyển khoản ngân hàng: `ML <MÃ ĐƠN HÀNG>`.
- Khớp số tiền thực nhận với `totalVnd` của đơn hàng.

### 2.3. Bấm xác nhận thanh toán ("Xác nhận đã nhận tiền")
Hệ thống tự động thực thi trong một Database Transaction duy nhất:
- Chuyển trạng thái đơn sang `PAID`, gán `paidAt = now()`.
- Cấp quyền tương ứng (`Entitlement`) cho người mua hoặc thiệp đã chỉ định.
- Nếu đơn hàng có gắn mã giới thiệu của CTV:
  - Tính hoa hồng 10% doanh thu sản phẩm số: `floor(eligibleRevenue * 0.10)`.
  - Thiết lập thời gian giữ đối soát 14 ngày (`holdUntil = now() + 14 days`).
  - Ghi nhận bút toán `EARNED` vào sổ cái bất biến `CommissionLedgerEntry`.
- Ghi nhật ký kiểm toán hệ thống (`AuditLog`).

### 2.4. Xử lý yêu cầu hoàn tiền (Refund)
- Khi phát sinh tranh chấp hoặc hoàn đơn: Admin bấm "Hoàn tiền".
- Hệ thống thu hồi `Entitlement`.
- Tự động tạo bút toán đảo ngược `REVERSAL` trong `CommissionLedgerEntry` với giá trị âm tương ứng, đảm bảo số dư sổ cái cân bằng về 0 mà không làm mất lịch sử đối soát.

---

## 3. Quản Trị Đối Tác Cộng Tác Viên (Affiliate Management)

### 3.1. Xét duyệt đơn đăng ký CTV
1. Truy cập `/admin/affiliates`.
2. Kiểm tra thông tin tài khoản ngân hàng và số điện thoại của người đăng ký.
3. Bấm "Phê duyệt":
   - Cấp vai trò `AFFILIATE` cho người dùng.
   - Tự động sinh mã giới thiệu độc quyền (`AffiliateLink`).
   - CTV có thể truy cập `/affiliate/dashboard` để lấy link chia sẻ `/r/[code]`.

### 3.2. Quyết toán chi trả hoa hồng (Payout Settlement)
1. Khi CTV tích lũy đủ hạn mức tối thiểu (100.000 VND) và gửi yêu cầu rút tiền: yêu cầu hiển thị ở bảng "Yêu Cầu Rút Hoa Hồng".
2. Kế toán thực hiện chuyển khoản tới số tài khoản ngân hàng của CTV.
3. Nhập mã tham chiếu ngân hàng (External Reference) và bấm "Xác nhận đã chuyển khoản":
   - Trạng thái yêu cầu chuyển sang `PAID`.
   - Ghi nhận nhật ký kiểm toán.

---

## 4. Quản Trị Đối Tác Cửa Hàng (Shop Partners)

1. Truy cập `/admin/shops`.
2. Xem danh sách đơn đăng ký đối tác hoa và quà tặng từ `/shop/apply`.
3. Bấm "Duyệt mở bán":
   - Cập nhật trạng thái shop sang `APPROVED`.
   - Cấp vai trò `SHOP_OWNER` cho chủ shop.
   - Cửa hàng và sản phẩm sẽ xuất hiện công khai trên danh bạ `/shops`.
4. Nếu cửa hàng vi phạm điều khoản chất lượng, Admin có thể bấm "Tạm dừng" (SUSPEND) bất cứ lúc nào.

---

## 5. Quản Lý Lô Thẻ QR Vật Lý (Gift Card Batches)

1. Truy cập `/admin/gift-cards`.
2. Điền form tạo lô thẻ:
   - **Tên lô**: VD: `Lô thẻ hoa Valentine 2026`.
   - **Số lượng**: Tối đa 500 thẻ/lô.
   - **Loại thẻ**: `GIFT_TAG`, `LOVE_CARD`, `GRAD_CARD`, `BIRTHDAY_CARD`, `WEDDING_CARD`.
3. Bấm "Tạo Lô Thẻ Ngay":
   - Hệ thống sinh mã `publicCode` công khai (cho mã QR) và mã bí mật `activationSecret` (16 ký tự in dưới lớp cào).
   - Mã bí mật được băm bảo mật SHA-256 kèm pepper trước khi lưu vào DB.
   - Bảng kết quả hiển thị manifest mã đầy đủ cho nhà in ấn.
4. Trạng thái thẻ:
   - Khi chưa cào/kích hoạt: Quét QR tại `/gift/[code]` hiển thị trang thân thiện "Món quà sắp mở", bảo vệ danh tính tuyệt đối.
   - Khách cào mã nhập tại `/activate/[code]`: Thẻ chuyển trạng thái `ACTIVE` và liên kết với thiệp mời.

---

## 6. Tuân Thủ Nghị Định 91/2025/QH15 Về Bảo Vệ Dữ Liệu Cá Nhân

- Khách hàng có quyền yêu cầu trích xuất dữ liệu hoặc xóa tài khoản vĩnh viễn theo Luật Dữ Liệu Cá Nhân Việt Nam.
- Khi nhận yêu cầu qua `/report` hoặc email hỗ trợ:
  1. Xác minh danh tính chủ tài khoản.
  2. Xuất dữ liệu cá nhân hoặc ẩn danh hóa thông tin giao hàng/số điện thoại trong các bảng liên quan.
  3. Ghi nhận hành vi xóa vào `AuditLog` để phục vụ thanh tra.

