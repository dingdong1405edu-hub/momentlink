# Hướng Dẫn Triển Khai Production (Deployment Guide) — MomentLink

> **Tài liệu hướng dẫn triển khai nền tảng MomentLink lên môi trường máy chủ sản xuất (Production / Staging) theo `spec.md` v1.0.**

---

## 1. Kiến Trúc Triển Khai (Deployment Architecture)

Nền tảng MomentLink được đóng gói triển khai theo mô hình Containerized hoặc PaaS:
- **Web App & API**: Next.js 14 App Router chạy trên Railway / Docker / AWS ECS / Render.
- **Cơ sở dữ liệu chính**: PostgreSQL 15+ có pooling kết nối (Prisma ORM).
- **Lưu trữ đối tượng (Object Storage)**: Cloudflare R2 / AWS S3 cho hình ảnh người dùng tải lên và file PDF/PNG xuất bản.
- **Dịch vụ Email giao dịch**: Resend API (hoặc SMTP).
- **Mã hóa & SSL**: HTTPS với HSTS, CSP, X-Frame-Options SAMEORIGIN.

---

## 2. Danh Sách Biến Môi Trường Production (.env.production)

```ini
# PostgreSQL Production Connection String
DATABASE_URL="postgresql://user:password@pg-host.railway.app:5432/momentlink?sslmode=require&pgbouncer=true"

# Khóa bí mật bảo mật phiên & cào thẻ
SESSION_SECRET="prod_super_secure_random_key_64_characters_hex_string_momentlink"
GIFT_CARD_PEPPER="prod_gift_pepper_secret_random_hex_string"

# Lưu trữ Cloud S3 / Cloudflare R2
STORAGE_PROVIDER="s3"
S3_BUCKET_NAME="momentlink-prod-media"
S3_REGION="ap-southeast-1"
S3_ACCESS_KEY_ID="AKIAxxxxxxxxxxxxxxxx"
S3_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
S3_PUBLIC_BASE_URL="https://media.momentlink.vn"

# Dịch vụ gửi email thông báo
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="MomentLink <noreply@momentlink.vn>"

# URL công khai chính thức
NEXT_PUBLIC_APP_URL="https://momentlink.vn"
NODE_ENV="production"
PORT=3000
```

---

## 3. Quy Trình Triển Khai Trên Railway / Docker

### 3.1. Dockerfile Chuẩn Production (Multi-stage)

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["pnpm", "start"]
```

### 3.2. Chạy Migration Khi Deploy
Trước khi server mới nhận traffic:
```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

---

## 4. Healthcheck & Giám Sát Hoạt Động

Nền tảng cung cấp hai endpoint giám sát tiêu chuẩn theo RFC:

1. **Liveness Probe**: `GET /api/health`
   - Kiểm tra tiến trình Node.js đang hoạt động.
   - Trả về `200 OK` với `{ "status": "ok", "timestamp": "..." }`.

2. **Readiness Probe**: `GET /api/ready`
   - Thực thi truy vấn kiểm tra kết nối tới cơ sở dữ liệu (`SELECT 1`).
   - Trả về `200 OK` khi DB sẵn sàng hoặc `503 Service Unavailable` nếu mất kết nối DB.

---

## 5. Quy Trình Sao Lưu Dữ Liệu & Khôi Phục (Backups & Disaster Recovery)

### 5.1. Sao lưu Cơ sở dữ liệu tự động
- Thiết lập sao lưu tự động hàng ngày (Daily automated snapshot) và Point-in-time recovery (PITR 7 ngày).
- Lệnh sao lưu thủ công bằng `pg_dump`:
  ```bash
  pg_dump -Fc "$DATABASE_URL" -f backup_$(date +%Y%m%d_%H%M%S).dump
  ```

### 5.2. Khôi phục từ bản sao lưu
```bash
pg_restore -d "$DATABASE_URL" --clean --no-owner backup_file.dump
```

### 5.3. Sao lưu Media
- Bật tính năng Object Versioning trên S3/R2 Bucket.
- Thiết lập Lifecycle Rule lưu trữ định kỳ để tối ưu chi phí và tránh xóa nhầm dữ liệu ảnh sự kiện của khách hàng.

