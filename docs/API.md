# Tài Liệu Đặc Tả API (API Reference) — `/api/v1`

> **Tài liệu chuẩn các endpoint API `/api/v1` của nền tảng MomentLink theo `spec.md` §15.**

---

## 1. Quy Ước Chung (Conventions)

- **Định dạng dữ liệu**: Toàn bộ yêu cầu và phản hồi sử dụng JSON UTF-8 (ngoại trừ multipart file upload và file download nhị phân).
- **Xác thực dữ liệu**: Toàn bộ dữ liệu đầu vào được xác thực nghiêm ngặt qua Zod Schema.
- **Bảo mật CSRF**: Các mutation (`POST`, `PUT`, `PATCH`, `DELETE`) kiểm tra `Origin` / `Referer` khớp với host ứng dụng.
- **Giới hạn tần suất (Rate Limiting)**:
  - Auth: 30 requests/phút/IP (Mã lỗi HTTP 429).
  - Kích hoạt thẻ QR: 20 requests/phút/IP.
  - Export: Tối đa 5 lượt xuất PDF/ảnh chất lượng cao mỗi giờ cho mỗi tài khoản.

---

## 2. Định Dạng Phản Hồi Chuẩn (Response Envelopes)

### 2.1. Phản hồi thành công (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "meta": { "cursor": "...", "total": 10 }
}
```

### 2.2. Phản hồi lỗi chuẩn (HTTP 4xx / 5xx)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
    "fields": {
      "email": "Email không đúng định dạng",
      "password": "Mật khẩu phải có ít nhất 6 ký tự"
    },
    "requestId": "req_8f1k92ma"
  }
}
```

---

## 3. Danh Sách Endpoints Theo Nhóm Nghiệp Vụ

### 3.1. Xác Thực (Authentication)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/auth/sign-up` | Public | Đăng ký tài khoản mới, cấp session cookie |
| `POST` | `/api/v1/auth/sign-in` | Public | Đăng nhập bằng email và mật khẩu |
| `POST` | `/api/v1/auth/sign-out` | Public | Hủy phiên đăng nhập và xóa cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Lấy thông tin tài khoản và danh sách vai trò |

### 3.2. Quản Lý Thiệp Mời (Invitations & Exports)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/invitations` | Creator | Lấy danh sách thiệp do mình sở hữu |
| `POST` | `/api/v1/invitations` | Creator | Khởi tạo thiệp mời mới theo mẫu |
| `GET` | `/api/v1/invitations/[id]` | Owner / Admin | Xem chi tiết nội dung và phiên bản thiệp |
| `PATCH` | `/api/v1/invitations/[id]` | Owner | Lưu bản nháp (Autosave có revision lock) |
| `POST` | `/api/v1/invitations/[id]/publish` | Owner | Xuất bản thiệp mời ra đường dẫn công khai |
| `POST` | `/api/v1/invitations/[id]/unpublish` | Owner | Thu hồi thiệp về trạng thái nháp |
| `GET` | `/api/v1/invitations/[id]/qr` | Owner / Admin | Tải ảnh mã QR (PNG/SVG) với kích thước tùy biến |
| `POST` | `/api/v1/invitations/[id]/exports` | Owner | Đưa tác vụ xuất ảnh Poster/PDF vào hàng đợi |
| `GET` | `/api/v1/exports/[jobId]` | Owner | Kiểm tra trạng thái tiến trình xuất file |
| `GET` | `/api/v1/exports/[jobId]/download` | Owner | Tải file xuất PNG / PDF có kiểm tra quyền |

### 3.3. Tương Tác Công Khai Của Khách Nhận Thiệp (Public Interactions)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/public/invitations/[slug]/unlock` | Public | Mở khóa thiệp bảo vệ bằng mật mã (PASSWORD mode) |
| `POST` | `/api/v1/public/invitations/[slug]/rsvps` | Public | Khách gửi xác nhận tham dự (chống trùng lặp số điện thoại) |
| `POST` | `/api/v1/public/invitations/[slug]/messages` | Public | Gửi lời chúc mừng sổ lưu bút (Guestbook) |
| `POST` | `/api/v1/public/invitations/[slug]/interactions`| Public | Gửi câu trả lời tương tác (Tỏ tình, khảo sát) |

### 3.4. Đặt Hàng & Thanh Toán (Checkout & Orders)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/checkout` | Authenticated | Tạo đơn hàng mua gói dịch vụ, gắn link CTV nếu có |
| `GET` | `/api/v1/orders/[id]` | Owner / Admin | Xem chi tiết đơn hàng và hướng dẫn chuyển khoản |
| `POST` | `/api/v1/orders/[id]/mark-transfer-submitted` | Owner | Người mua bấm "Tôi đã chuyển khoản" |

### 3.5. Tiếp Thị Liên Kết (Affiliate / CTV)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/affiliate/apply` | Authenticated | Nộp đơn đăng ký làm CTV, nhập số tài khoản ngân hàng |
| `GET` | `/api/v1/affiliate/dashboard` | Affiliate | Xem thống kê lượt click, hoa hồng tích lũy và số dư |
| `POST` | `/api/v1/affiliate/payout-requests` | Affiliate | Gửi yêu cầu rút hoa hồng (tối thiểu 100.000 VND) |
| `GET` | `/r/[code]` | Public | Xử lý link giới thiệu, ghi nhận cookie first-party 30 ngày |

### 3.6. Đối Tác Cửa Hàng (Flower & Gift Shops)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/shop/apply` | Authenticated | Đăng ký mở shop đối tác hoa và quà tặng |
| `GET` | `/api/v1/shop/products` | Shop Owner | Danh sách sản phẩm của cửa hàng |
| `POST` | `/api/v1/shop/products` | Shop Owner | Tạo mới sản phẩm hoa / quà |
| `GET` | `/api/v1/shop/requests` | Shop Owner | Xem danh sách yêu cầu báo giá của khách |
| `POST` | `/api/v1/shop/requests/[id]/status` | Shop Owner | Cập nhật tiến độ (`QUOTED`, `ACCEPTED`, `COMPLETED`) |
| `POST` | `/api/v1/public/shops/[shopId]/requests` | Public | Khách gửi yêu cầu báo giá sản phẩm |

### 3.7. Thẻ QR Vật Lý (Gift Cards)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/gift-cards/activate` | Creator | Kích hoạt thẻ cào bí mật và gắn với thiệp mời |
| `GET` | `/gift/[publicCode]` | Public | Trang quét thẻ: chưa active thì "Món quà sắp mở", active thì dẫn vào thiệp |

### 3.8. Quản Trị Hệ Thống (Admin Control Panel)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/admin/orders` | Admin | Danh sách đơn hàng toàn hệ thống |
| `POST` | `/api/v1/admin/orders/[id]/confirm-paid` | Admin | Duyệt đơn `PAID`, cấp Entitlement và hoa hồng CTV 10% |
| `POST` | `/api/v1/admin/orders/[id]/refund` | Admin | Hoàn tiền, thu hồi quyền và tạo bút toán hoàn hoa hồng |
| `GET` | `/api/v1/admin/affiliates` | Admin | Danh sách đơn đăng ký CTV chờ duyệt |
| `POST` | `/api/v1/admin/affiliates/[id]/review` | Admin | Phê duyệt CTV và cấp mã link độc quyền |
| `POST` | `/api/v1/admin/payouts/[id]/settle` | Admin | Duyệt chuyển khoản yêu cầu rút hoa hồng |
| `GET` | `/api/v1/admin/shops` | Admin | Danh sách cửa hàng đối tác đăng ký |
| `POST` | `/api/v1/admin/shops/[id]/review` | Admin | Phê duyệt hoặc tạm dừng cửa hàng đối tác |
| `POST` | `/api/v1/admin/gift-cards/batches` | Admin | Tạo lô thẻ QR vật lý in ấn, xuất manifest mã bí mật |

