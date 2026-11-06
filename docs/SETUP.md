# Hướng Dẫn Cài Đặt & Phát Triển (Setup Guide) — MomentLink

> **Tài liệu hướng dẫn khởi tạo môi trường phát triển cục bộ và kiểm thử MomentLink theo `spec.md` v1.0.**

---

## 1. Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản 18.18+ hoặc 20.x LTS
- **Package Manager**: `pnpm` v9+ (khuyến nghị) hoặc `npm` v10+
- **Cơ sở dữ liệu**:
  - *Môi trường phát triển cục bộ (Local Dev)*: SQLite (`file:./dev.db`) — không cần cài thêm DB server.
  - *Môi trường Production/Staging*: PostgreSQL 15+ (tương thích Railway, Supabase, AWS RDS).

---

## 2. Cấu Hình Biến Môi Trường (.env)

Sao chép tệp mẫu `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Cấu hình các biến môi trường thiết yếu:

```ini
# Database (SQLite cho local dev)
DATABASE_URL="file:./dev.db"

# Bảo mật Session & Auth
SESSION_SECRET="ml_session_dev_secret_key_minimum_32_chars_2026"
GIFT_CARD_PEPPER="ml_gift_secret_pepper_2026"

# Lưu trữ & Email Adapters
STORAGE_PROVIDER="local"
STORAGE_LOCAL_DIR="./public/uploads"
EMAIL_PROVIDER="console"

# Ứng dụng & Domain
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 3. Cài Đặt Dependencies

Cài đặt toàn bộ gói phụ thuộc bằng pnpm:

```bash
pnpm install
```

---

## 4. Khởi Tạo Cơ Sở Dữ Liệu & Seed Dữ Liệu Ban Đầu

Chạy Prisma DB push để tạo đầy đủ 28 bảng và quan hệ:

```bash
pnpm db:push
```

Chạy seed để nạp dữ liệu chuẩn:
- Bootstrap tài khoản quản trị hệ thống: `admin@momentlink.vn` (Mật khẩu: `Admin@MomentLink2026!`)
- 4 nhóm danh mục Occasion Taxonomy (Wedding, Graduation, Birthday, Love)
- 8 mẫu thiệp P0 chính thức với Theme tokens & Block definitions
- Bảng giá các gói dịch vụ (FREE, BASIC, PREMIUM, EVENT_PRO)

```bash
pnpm db:seed
```

---

## 5. Chạy Ứng Dụng Phát Triển (Local Dev)

Khởi động Next.js App Router server:

```bash
pnpm dev
```

Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000)

Các cổng truy cập chính:
- **Trang chủ**: `/`
- **Bộ sưu tập dịp & mẫu**: `/occasions`, `/templates`
- **Tạo thiệp mới**: `/create`
- **Bảng giá**: `/pricing`
- **Danh bạ đối tác hoa & quà**: `/shops`
- **Cổng CTV**: `/affiliate/apply`, `/affiliate/dashboard`
- **Kích hoạt thẻ QR vật lý**: `/activate`
- **Cổng Quản Trị Hệ Thống**: `/admin` (Đăng nhập bằng tài khoản admin)

---

## 6. Kiểm Thử (Testing Harness)

### Chạy Kiểm Tra Kiểu (Typecheck)
```bash
pnpm typecheck
```

### Chạy Unit & Integration Tests (Vitest)
```bash
pnpm test
```

### Chạy Toàn Bộ Kiểm Thử Trình Duyệt E2E (Playwright)
```bash
pnpm test:e2e
```
Hoặc chạy từng milestone:
```bash
pnpm exec playwright test tests/e2e/m0-auth.spec.ts
pnpm exec playwright test tests/e2e/m1-catalog.spec.ts
pnpm exec playwright test tests/e2e/m2-editor.spec.ts
pnpm exec playwright test tests/e2e/m3-share-export.spec.ts
pnpm exec playwright test tests/e2e/m4-payment-affiliate.spec.ts
pnpm exec playwright test tests/e2e/m5-shop-giftcard.spec.ts
pnpm exec playwright test tests/e2e/m6-hardening.spec.ts
```

---

## 7. Build Bản Production

```bash
pnpm build
pnpm start
```

