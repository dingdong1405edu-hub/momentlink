# SPEC.md — MOMENTLINK (tên tạm): NỀN TẢNG TẠO THIỆP / MINI WEBSITE / QR CARD

> **Phiên bản:** 1.0 — 2026-11-04  
> **Trạng thái:** Source of Truth dành cho Codex triển khai  
> **Ngôn ngữ sản phẩm:** tiếng Việt trước; kiến trúc sẵn sàng i18n  
> **Thị trường ban đầu:** Việt Nam; tiền tệ VND; múi giờ mặc định Asia/Ho_Chi_Minh  
> **Loại sản phẩm:** Multi-tenant B2C SaaS + affiliate/CTV + đối tác hoa/quà + QR vật lý  
> **Tên MOMENTLINK chỉ là tên mã, KHÔNG coi là tên miền/nhãn hiệu đã khả dụng.** Toàn bộ brand, logo, domain phải cấu hình được.

---

## 0. HƯỚNG DẪN BẮT BUỘC CHO CODEX

**Mục tiêu:** Tạo website thực sự chạy được end-to-end, không chỉ mockup hay landing page. Ưu tiên trải nghiệm cốt lõi hoạt động trước khi tăng số lượng template/dịp.

1. Đọc toàn bộ file này trước khi sửa code; coi đây là yêu cầu sản phẩm chính. Nếu repo đã có code, rà soát hiện trạng, tái sử dụng thành phần tốt, không phá dữ liệu cũ.
2. Tạo kế hoạch triển khai theo `MVP P0 -> Phase 1 P1 -> Phase 2 P2`; thực hiện P0 trọn vẹn trước, tránh làm giao diện đẹp nhưng nút bấm không hoạt động.
3. Tạo `docs/IMPLEMENTATION_STATUS.md` với checklist từng tính năng, trạng thái `TODO / IN_PROGRESS / DONE / BLOCKED`, lệnh test và bằng chứng; cập nhật sau từng chặng.
4. Tất cả thao tác có UX đầy đủ: loading, disabled, success/error toast, validation, empty state, responsive, retry phù hợp; không được để nút 'giả'. Chức năng chưa có phải bị ẩn/khóa và chú thích rõ, không được giả vờ đã xử lý.
5. Kết nối cơ sở dữ liệu thật, migrations, seed, xác thực, phân quyền ở phía server, không dùng mảng giả lập để thay dữ liệu production.
6. Viết tests và chạy: lint, typecheck, unit/integration, E2E; sửa lỗi trước khi tuyên bố hoàn thành. Không tuyên bố đã deploy/đã kiểm thử khi chưa thực hiện.
7. Không hard-code khóa API, tiền, số tài khoản ngân hàng, địa chỉ cửa hàng, số điện thoại thật, địa chỉ email thật hoặc nội dung nhạy cảm. Cung cấp `.env.example`.
8. Tất cả tính năng thanh toán/số dư/hoa hồng dựa trên giao dịch xác thực từ server hoặc được admin duyệt, không tin vào trạng thái client, ảnh chuyển khoản hay callback thiếu chữ ký.
9. Đánh dấu rõ phần yêu cầu nhà cung cấp ngoài (email, cổng thanh toán, storage, domain); phải có chế độ development/sandbox hoặc admin-review để dự án vẫn có thể demo end-to-end.
10. Nếu một yêu cầu chưa quyết định rõ, áp dụng **mặc định trong tài liệu này** và ghi lựa chọn ở `docs/DECISIONS.md`, không dừng lại để hỏi về tiểu tiết.

### 0.1 Định nghĩa P0/P1/P2

- **P0/MVP phải chạy:** 4 nhóm dịp chính (tình yêu, đám cưới, sinh nhật, tốt nghiệp), tối thiểu 8 template hoạt động, tạo/sửa/xuất bản mini website, link, QR, xuất ảnh/PDF, xác thực, dashboard, basic RSVP/guestbook, flow affiliate 10%, cửa hàng/hoa/quà listing + gửi yêu cầu mua hàng, QR card đăng ký/gắn nội dung, admin và kiểm thử.
- **P1 sau MVP:** mở rộng 20+ mẫu, đầy đủ taxonomy dịp, thêm block tương tác, landing page theo nhóm, bảng hoa hồng/tổng đối soát, phân tích tốt hơn, custom invitation per guest, shop order fulfillment hoàn thiện.
- **P2 nâng cao:** các website mini-game, video rendering, AI hỗ trợ viết nội dung, custom domain, tích hợp vận chuyển, tích hợp đối tác thanh toán và payout tự động, đa ngôn ngữ, nâng cấp editor.
- **Ngoài phạm vi P0:** marketplace thanh toán/escrow hàng vật lý, giao hàng tự động, mạng xã hội, mobile app native, drag-and-drop canvas tự do, AI tạo video, voice cloning, tự động trích tiền ngân hàng.

### 0.2 Một câu định vị

> Người dùng chọn một dịp, điền nội dung, tùy biến giao diện và trong vài phút có một **mini website tương tác** để gửi bằng **link / QR / ảnh / PDF**. Có thể kết hợp với **hoa, hộp quà và thẻ QR vật lý**; cộng tác viên giới thiệu khách mua gói số nhận **10% hoa hồng theo doanh thu hợp lệ**.

### 0.3 Nguyên tắc sản phẩm

- Mobile-first; website người nhận tải nhanh trên điện thoại phổ thông và mạng yếu.
- Cảm xúc + thiết kế chất lượng: thiệp không giống biểu mẫu hành chính.
- Chọn mẫu trước, điền thông tin sau, xem trước liên tục.
- **Nội dung được lưu tách khỏi template**, đổi mẫu không mất dữ liệu.
- Một link duy nhất có thể cập nhật nội dung sau khi phát hành (trừ khi owner chủ động khóa).
- Chia sẻ vẫn hoạt động khi người nhận không có tài khoản.
- Ưu tiên quyền riêng tư: unlisted mặc định, không index Google khi người tạo không cho phép.
- Không đưa dữ liệu nhạy cảm lên social preview, QR hoặc PDF mà chủ thiệp không cho phép.

---

## 1. PERSONAS, VAI TRÒ VÀ PHÂN QUYỀN

| Vai trò | Đăng nhập? | Quyền cơ bản |
|---|---|---|
| Visitor | Không | Xem landing, xem template public, thử preview, mở thiệp được chia sẻ, gửi RSVP/guestbook theo cấu hình. |
| User / Creator | Có | Tạo/sửa/xuất bản thiệp, quản lý tài nguyên, mua gói, xuất file, xem RSVP/analytics của mình. |
| Recipient / Guest | Không bắt buộc | Xem link mời; phản hồi, xác nhận tham dự, gửi lời chúc; không truy cập dashboard của creator. |
| Affiliate / CTV | Có, được duyệt | Link referral riêng, creative kit, dashboard referrals/commission, gửi yêu cầu rút hoa hồng. |
| Shop owner | Có, shop được duyệt | Quản lý shop, sản phẩm, yêu cầu mua hàng, trạng thái xử lý, thông tin thẻ QR gắn sản phẩm. |
| Shop staff | Có | Xem và xử lý order của shop được phân quyền; không sửa dữ liệu thanh toán nền tảng. |
| Support | Có, do admin cấp | Hỗ trợ theo phạm vi; không xem bí mật/thanh toán nhạy cảm không cần thiết. |
| Admin | Có, bảo vệ đặc biệt | Quản lý user, template, moderation, shops, orders, giá, payout, ledger, hệ thống. |

**RBAC server-side:** mọi tài nguyên có `ownerId`/`shopId` và role check; không dựa vào ẩn nút UI. Admin không mặc định được đọc nội dung thiệp riêng tư; quyền hỗ trợ truy cập nội dung cần nguyên tắc least-privilege và audit. Một tài khoản có thể mang nhiều role (Creator+CTV+Shop owner). Với shop, có membership/role riêng theo shop.

---

## 2. INFORMATION ARCHITECTURE VÀ ROUTES

### 2.1 Public / người nhận

| Route | Mục đích |
|---|---|
| `/` | Landing, giới thiệu các dịp, search, CTA tạo thiệp. |
| `/occasions` | Toàn bộ dịp, filter theo nhóm, từ khóa. |
| `/occasions/[slug]` | Trang chiến dịch cho từng dịp, mẫu nổi bật và use cases. |
| `/templates` | Bộ sưu tập mẫu, filter theo occasion, tone, màu, miễn phí/trả phí. |
| `/templates/[slug]` | Live demo template bằng data mẫu, CTA “Dùng mẫu này”. |
| `/pricing` | Bảng gói dịch vụ, FAQ, điều khoản. |
| `/i/[slug]` | Mini website/thiệp thật đã xuất bản, bảo vệ theo privacy setting. |
| `/q/[shortCode]` | Short-link/QR redirect có kiểm soát, ghi nhận scan aggregate. |
| `/gift/[publicCode]` | Trang QR gift/card theo cấu hình, trạng thái chưa kích hoạt/đã kích hoạt. |
| `/activate/[publicCode]` | Flow kích hoạt QR card có xác thực ownership + activation secret. |
| `/r/[affiliateCode]` | Ghi nhận referral hợp lệ rồi chuyển về landing an toàn. |
| `/shops` | Danh sách đối tác hoa/quà theo khu vực, loại sản phẩm. |
| `/shops/[slug]` | Shop detail, catalog, gửi yêu cầu đặt hoa/quà gắn thiệp. |
| `/legal/privacy`, `/legal/terms`, `/legal/affiliate`, `/legal/shops` | Chính sách. |
| `/report/[publicId]` | Báo cáo thiệp/nội dung lạm dụng, không đòi đăng nhập. |

### 2.2 Auth + creator

| Route | Mục đích |
|---|---|
| `/auth/sign-in`, `/auth/sign-up`, `/auth/verify-email`, `/auth/forgot-password` | Auth. |
| `/dashboard` | Thiệp của tôi, trạng thái, lượt xem tổng quan, CTA tạo mới. |
| `/create` | Wizard chọn dịp -> template -> nội dung. |
| `/editor/[invitationId]` | Editor structured form + live preview, auto-save, publish. |
| `/dashboard/invitations/[id]` | Detail, share, export, analytics, guestbook, RSVP. |
| `/dashboard/invitations/[id]/guests` | RSVP và danh sách khách, CSV export P1. |
| `/dashboard/orders` | Lịch sử mua gói, hóa đơn, trạng thái thanh toán. |
| `/dashboard/gifts` | QR card của tôi, kích hoạt, link với thiệp, lịch sử. |
| `/settings/profile`, `/settings/billing`, `/settings/privacy` | Tài khoản. |

### 2.3 CTV, shop và admin

| Route | Mục đích |
|---|---|
| `/affiliate/apply`, `/affiliate/dashboard`, `/affiliate/links`, `/affiliate/commissions`, `/affiliate/payouts` | Đăng ký CTV, tạo link, đối soát hoa hồng. |
| `/shop/apply`, `/shop/dashboard`, `/shop/products`, `/shop/requests`, `/shop/settings` | Quản lý shop đối tác. |
| `/admin` | KPI và bảng điều khiển. |
| `/admin/users`, `/admin/invitations`, `/admin/templates`, `/admin/occasions`, `/admin/plans` | CRUD + moderation + giá. |
| `/admin/affiliates`, `/admin/commissions`, `/admin/payouts` | Đối soát referral/hoa hồng. |
| `/admin/shops`, `/admin/shop-requests`, `/admin/gift-cards`, `/admin/payments` | Vận hành đối tác, QR, tài chính. |
| `/admin/reports`, `/admin/audit`, `/admin/settings` | Xử lý report, nhật ký, config. |

**UX:** Header/footer công khai; shell dashboard có sidebar desktop, bottom tabs/mobile drawer; error pages 403/404/500; breadcrumbs; keyboard accessible; no layout shifts lớn.

---

## 3. LUỒNG NGƯỜI DÙNG PHẢI TRIỂN KHAI

### UJ-01: tạo thiệp miễn phí (P0, happy path quan trọng nhất)
1. Truy cập home -> chọn “Tốt nghiệp” -> xem template -> nhấn “Dùng mẫu”.
2. Editor mở với dữ liệu demo, wizard dynamic form: tên, tiêu đề, ngày, địa điểm, lời mời, ảnh, theme.
3. Thay form thì preview cập nhật ngay, nhập lỗi có validation.
4. Có thể đăng ký/đăng nhập để lưu và xuất bản. Nếu hỗ trợ draft anonymous, lưu local-only và chuyển lên server sau login; **P0 cho phép yêu cầu login trước khi lưu**.
5. Nhấn Publish -> server validate required fields -> tạo public slug/link; status `PUBLISHED`.
6. Dashboard hiện share URL, QR, nút download JPG/PNG/PDF; QR quét mở đúng thiệp.
7. Người nhận mở trên điện thoại, xem ảnh/địa điểm/countdown, RSVP hoặc gửi lời chúc nếu bật.
8. Creator sửa nội dung sau publish -> link/QR cũ vẫn hiển thị bản mới. Có unpublish và delete.

**Acceptance:** toàn bộ 8 bước hoạt động thật sau refresh, trên ít nhất 2 viewport, không có phantom buttons.

### UJ-02: tỏ tình / surprise
Creator tạo trang riêng có phong bì mở đầu, ảnh, thư, âm nhạc có nút Play (không auto-play không xin phép), câu hỏi “Bạn có muốn đi cà phê không?”, các câu trả lời đều tôn trọng người nhận, không dùng dark pattern nút “Không” chạy trốn. Người nhận có thể gửi câu trả lời một lần/token/rate-limit. Thông báo creator qua dashboard, email nếu opt-in. Trang có thể khóa bằng passcode; không thu thập dữ liệu người nhận ngoài ý muốn.

### UJ-03: đám cưới
Creator nhập tên hai người, hình ảnh, thời gian, địa điểm map link, các nghi thức, câu chuyện, dress code, RSVP số người, lời chúc, QR quà mừng **tùy chọn và có xác nhận trước khi hiển thị**. Guest nhận link/QR và xem chi tiết; không bắt buộc tạo tài khoản. RSVP và lời chúc xử lý anti-spam. QR quà mừng khác QR vào thiệp.

### UJ-04: CTV giới thiệu, hưởng 10%
CTV apply -> admin duyệt -> hệ thống cấp link `/r/ABCD...` -> khách click -> chọn thiệp, đăng ký/mua plan số -> thanh toán được xác minh -> referral conversion ghi ledger commission PENDING -> hết thời gian hold, không refund/fraud -> AVAILABLE -> CTV yêu cầu payout -> admin xử lý, đánh dấu PAID kèm chứng từ/nguồn tham chiếu -> báo cáo ledger. Các tính năng phải kiểm thử tổng tiền và edge cases.

### UJ-05: kết hợp shop hoa/quà
Shop đăng ký -> admin kiểm tra và duyệt -> shop tạo sản phẩm (hoa bó, hộp quà, thiệp giấy, thú bông) -> visitor từ thiệp hoặc danh mục shop gửi **yêu cầu đặt hàng** với địa chỉ giao hàng, thời gian mong muốn, lời nhắn, invitationId/QR card tùy chọn -> shop xác nhận giá/tồn kho/phí vận chuyển -> khách và shop liên hệ/hoàn tất giao dịch **trực tiếp** trong P0 -> shop/admin cập nhật trạng thái có audit. **P0 không giả vờ nền tảng đang nhận/giam/đảm bảo thanh toán hàng vật lý.** Không hứa giao hàng trước khi shop nhận đơn.

### UJ-06: QR Card vật lý
Admin tạo lô thẻ QR chưa kích hoạt; mỗi thẻ có public ID, link QR ổn định, `activationSecret` ngẫu nhiên riêng (in dưới tem cào hoặc cấp riêng cho khách hợp lệ); shop/admin đánh dấu thẻ đã bán/bàn giao -> creator sở hữu thẻ, đăng nhập, nhập secret để claim và gắn với một invitation đã publish -> quét QR mở màn hình thiệp qua redirect -> creator được cập nhật thiệp mà không đổi QR. Thẻ chưa claim hiện trang “Thẻ chưa kích hoạt” không lộ dữ liệu cá nhân. Claim 1 lần bằng DB transaction; hỗ trợ thu hồi/reset có xác thực admin + audit. Chống brute-force activation secret.

### UJ-07: tạo và xuất file
Creator yêu cầu PNG / JPG / PDF; tạo background job snapshot bản phát hành hoặc draft preview có watermark, xuất file đúng kích cỡ, ảnh/QR không bị cắt, link tải có hạn dùng và thuộc đúng chủ sở hữu. PDF/ảnh là **tĩnh**, không thể tái hiện đầy đủ animation/RSVP; đặt QR và URL để đi đến trải nghiệm web.

---

## 4. CATALOG DỊP — DATA-DRIVEN, KHÔNG CODE RIÊNG MỖI DỊP

Toàn bộ danh mục ở **Phụ lục A**. Mỗi occasion có: `id, slug, categoryId, title, description, icon, isActive, sortOrder, formPresetKey, recommendedBlocks, seoTitle, seoDescription`.

**Bộ 4 vertical làm sâu ở P0:**
- `wedding`: Wedding + Engagement + Save the Date (fields: couple names, ceremonies, locations, start time, RSVP, dress code, map, gallery).
- `graduation`: Graduation + graduation party (fields: graduate, school, class, ceremony date, venue, invitation message, gallery).
- `birthday`: Birthday + surprise party (fields: celebrant, age optional, location, theme, start time, RSVP, gift preference optional).
- `love`: confession + anniversary + invitation to a date (fields: recipient, sender, love letter, pictures, optional reply, privacy).

P0 phải seed toàn bộ occasion taxonomy để hiển thị/filter ở catalog, **nhưng chỉ cho “Tạo ngay” ở loại đã có form preset + template chạy được**; các dịp chưa hỗ trợ hiển thị “Sắp ra mắt” hoặc map rõ sang preset generic có hoạt động. Tuyệt đối không dẫn người dùng vào editor lỗi.

---

## 5. TEMPLATE ENGINE — TRUNG TÂM CỦA SẢN PHẨM

### 5.1 Mô hình kiến trúc
`Invitation Content JSON` + `Template Definition JSON` + `Theme Tokens` + `Block Renderer` -> `Responsive Mini Site` + `Static Export Renderer`.

- **Template immutable version:** template v1 đã dùng không bị vỡ khi admin ra v2.
- **Content separate:** thay template chỉ remap field hợp lệ; không xoá thông tin chưa dùng.
- **Structured editor, không freeform canvas:** side panel quản lý blocks + forms; preview thực bằng cùng renderer của public page.
- **Components registry:** mỗi loại block được validate bằng Zod và có React renderer, export-friendly CSS, accessibility, min/max constraints.
- **No user-supplied JS/HTML/script** trong form editor. Rich text được sanitize allow-list.
- **Animation:** CSS transform/opacity là chính; hỗ trợ `prefers-reduced-motion`; có nút tắt motion.
- **Music:** luôn yêu cầu chủ động bật phát, volume và mute rõ ràng; không giả định autoplay sẽ được trình duyệt cho phép; chỉ nhạc được cấp phép/upload hợp lệ.
- **Media:** image object-fit options, focal point, compression, lazy-load, placeholder; asset ownership/access control.

### 5.2 Block registry

| Block key | P | Chức năng / thuộc tính |
|---|---|---|
| `cover` | 0 | Cover, tiêu đề, tên, hero image, typography. |
| `envelope_reveal` | 0 | Mở phong bì ảo bằng nút bấm, hiệu ứng nhẹ. |
| `intro_message` | 0 | Thư/lời mời, text format an toàn. |
| `event_details` | 0 | Ngày, giờ, địa điểm, link bản đồ. |
| `countdown` | 0 | Đếm ngược theo `eventDateTime` có timezone, hoàn tất không âm. |
| `gallery` | 0 | Grid/slider, ảnh upload. |
| `rsvp` | 0 | Form xác nhận có/không/không chắc, số khách, tên, lời nhắn. |
| `guestbook` | 0 | Guestbook có moderation (P0 mặc định duyệt trước hoặc chỉ owner thấy). |
| `response_question` | 0 | Phản hồi câu hỏi định dạng đơn giản (tỏ tình). |
| `music_control` | 0 | Play/pause/mute nhạc nền có bản quyền hợp lệ. |
| `qr_display` | 0 | Hiển thị QR chia sẻ hoặc thanh toán (nêu loại rõ). |
| `footer_cta` | 0 | Lời cảm ơn, footer, report abuse. |
| `story_timeline` | 1 | Timeline yêu nhau / trưởng thành. |
| `agenda` | 1 | Lịch trình chương trình. |
| `dress_code` | 1 | Dresscode, sắc màu gợi ý. |
| `guest_personalization` | 1 | “Trân trọng kính mời [Tên]”, token riêng cho khách. |
| `gift_reveal` | 1 | Khui hộp quà ảo, reveal thư/ảnh. |
| `poll` | 1 | Bình chọn/vote có rate-limit, không công khai PII. |
| `voice_message` | 1 | Ghi âm/tải âm thanh có consent và permission. |
| `memory_wall` | 1 | Bức tường ảnh/câu chuyện nhiều người. |
| `ticket_checkin` | 1 | QR check-in tách riêng QR xem thiệp. |
| `video_hero` | 2 | Video clips có preload và compression. |
| `mini_game` | 2 | Trò chơi kỷ niệm độc lập, không chặn nội dung chính. |

### 5.3 Template P0 tối thiểu (8 mẫu, **đều hoạt động**)

| ID | Dịp | Tên | Phong cách | Blocks |
|---|---|---|---|---|
| `wedding-classic` | Wedding | Ivory Ceremony | Kem - vàng champagne, tối giản | cover, envelope, event, countdown, gallery, rsvp, guestbook |
| `wedding-floral` | Wedding | Bloom & Vows | Hoa pastel, thanh lịch | cover, intro, gallery, event, rsvp |
| `graduation-classic` | Graduation | The Next Chapter | Xanh navy - vàng | cover, intro, event, countdown, gallery, rsvp |
| `graduation-playful` | Graduation | Grad Party! | Tươi trẻ, confetti | cover, event, gallery, response, guestbook |
| `birthday-fun` | Birthday | Confetti Pop | Đáng yêu, màu tươi | envelope, cover, countdown, event, rsvp |
| `birthday-minimal` | Birthday | Candlelight | Ấm áp, tối giản | cover, intro, event, gallery, guestbook |
| `love-letter` | Love | Secret Letter | Giấy thư, phong bì, mực viết | envelope, intro, gallery, response |
| `love-galaxy` | Love | Written in the Stars | Lãng mạn, đêm sao nhẹ | cover, intro, gallery, music, response |

**Design bar:** tám mẫu phải khác nhau về layout và không chỉ đổi màu. Không dùng ảnh stock có watermark, không sử dụng tài sản có bản quyền khi không có phép; seed với ảnh minh họa hợp lệ từ assets tự tạo hoặc placeholder đẹp có attribution phù hợp. Không sao chép y nguyên template đối thủ.

### 5.4 JSON content và template mẫu (API contract gợi ý)

```json
{
  "schemaVersion": 1,
  "occasionKey": "graduation",
  "locale": "vi-VN",
  "title": "Mời bạn dự lễ tốt nghiệp của Minh",
  "subtitle": "Một cột mốc đáng nhớ",
  "people": [{"role":"graduate","displayName":"Minh"}],
  "event": {
    "startsAt": "2027-06-25T08:00:00+07:00",
    "endsAt": "2027-06-25T11:00:00+07:00",
    "timezone": "Asia/Ho_Chi_Minh",
    "venueName": "Hội trường A",
    "address": "Địa điểm minh họa",
    "mapsUrl": null
  },
  "message": "Rất mong bạn đến chung vui!",
  "galleryAssetIds": [],
  "privacy": {"mode":"UNLISTED","allowIndexing":false},
  "features": {"rsvp":true,"guestbook":false,"backgroundMusicAssetId":null},
  "blocks": [
    {"id":"blk_cover","type":"cover","enabled":true,"config":{}},
    {"id":"blk_details","type":"event_details","enabled":true,"config":{}},
    {"id":"blk_rsvp","type":"rsvp","enabled":true,"config":{}}
  ]
}
```

- IDs tài nguyên phải validate có thuộc quyền creator; `mapsUrl` chỉ URL HTTPS allow-list hosts phù hợp; các datetime lưu UTC trong DB và lưu timezone IANA để hiển thị.
- Các block có schema riêng; thiếu field không khiến app crash, hiện fallback hoặc báo validation trước publish.
- `schemaVersion` có migration helpers khi thay schema; tự động migrate hoặc backward-compatible.
- CSS theme tokens: typography, background, foreground, accent, muted, spacing, radius, motionStyle; clamp font responsive; contrast đạt WCAG AA với text thiết yếu.

---

## 6. EDITOR: FORM ĐỘNG + PREVIEW THỰC

### 6.1 Wizard
1. Chọn occasion (có search và filter).
2. Chọn template (card live preview).
3. Điền thông tin cần thiết theo preset (required hiển thị rõ).
4. Upload ảnh + tùy biến theme + bật/tắt/reorder các block tương thích.
5. Preview mobile/desktop + Save draft + Publish.
6. Share / Export.

### 6.2 Các trường tối thiểu
- Chung: `title`, `recipientName?`, `senderName?`, `message`, `eventDateTime?`, `venue?`, `gallery?`, `cover?`, `privacyMode`.
- Wedding: `partnerOneName`, `partnerTwoName`, `ceremonies[]` (name/time/location), `rsvpDeadline?`, `giftTransferInfo?` (opt-in).
- Graduation: `graduateName`, `schoolName`, `degree?`, `ceremonyDateTime`, `venue`, `dressCode?`.
- Birthday: `celebrantName`, `age?` (không bắt buộc), `partyDateTime`, `venue`, `themeName?`.
- Love: `recipientName`, `senderName` (có thể anonymous), `letterText`, `questionText?`, `responseOptions?`; không bắt buộc ngày/địa điểm.

### 6.3 Save behavior
- Form draft: debounce 700–1200ms (chỉ gợi ý), đồng thời có nút Save manual.
- Có `revision`/optimistic concurrency: khi 2 tab sửa cùng thiệp, phát hiện xung đột thay vì lặng lẽ ghi đè.
- Upload trực tiếp object storage bằng presigned URL sau khi API xác thực; chỉ gắn asset khi upload thành công và pass kiểm tra.
- Nếu network lỗi, hiển thị “Chưa lưu” và nút retry; không báo “Đã lưu” khi request chưa được xác nhận.
- Publish required validation; draft có thể thiếu thông tin.

---

## 7. PUBLIC INVITATION: TRẢI NGHIỆM NGƯỜI NHẬN

- Tối ưu viewport mobile 360px; layout desktop đẹp nhưng không thay thế mobile.
- First viewport nhìn rõ nội dung và hành động; envelope animation chỉ xuất hiện một lần/session (sessionStorage hoặc persisted local, không buộc mở lại ở mỗi refresh).
- Load ảnh progressive; font fallback; không block render vì nhạc/video.
- RSVP Form: tên + trạng thái + số khách (max được creator cấu hình) + note; email/phone **tùy chọn** và chỉ thu nếu có mục đích cụ thể. Có trạng thái “đã gửi” và chống submit duplicate.
- Guestbook: approve/hide/remove, chống spam; không được tự ý công khai ảnh/số điện thoại/email người gửi.
- Reaction/response: lưu an toàn, giới hạn request, không cho người gửi bị ép trả lời; tránh đăng dữ liệu riêng tư ra URL.
- Event location: link Google Maps (khi có), địa chỉ dạng text fallback; không cần nhúng SDK trả phí P0.
- Link public cần metadata OG tối thiểu nhưng **không render tên, ảnh, nội dung riêng tư** khi owner chọn `PRIVATE`/password; `UNLISTED` mặc định `noindex`.
- Privacy modes:
  - `UNLISTED`: có link ai cũng xem được; không index Google.
  - `PASSWORD`: yêu cầu mật mã, hash trong DB; cookie unlock server-issued ngắn hạn.
  - `PUBLIC`: cho phép index nếu owner opt-in, chỉ dành nội dung an toàn.
  - `ARCHIVED`: ngừng tương tác, chỉ hiển thị trang đóng theo cài đặt.
- Chủ thiệp có thể tắt RSVP, guestbook, nhạc, hiển thị ngày, QR tiền; các chức năng bị tắt không xuất hiện trên public UI.

---

## 8. SHARE, QR, ẢNH, PDF: HỢP ĐỒNG CHỨC NĂNG

### 8.1 Đường dẫn và QR
- Public URL chuẩn: `https://{APP_DOMAIN}/i/{slug}`; slug sinh từ tiêu đề + hậu tố ngẫu nhiên, unique, không để ID tăng dần lộ người dùng.
- Short/QR URL chuẩn: `https://{APP_DOMAIN}/q/{shortCode}`; code random không đoán được, unique, redirect 302/307 về link nội bộ đã được xác nhận.
- QR có tùy chọn PNG (P0), SVG (P0), chủ thiệp chọn cỡ, padding/quiet zone, dark-on-light contrast; logo center là P1 và phải thử độ đọc.
- QR động: redirect target cập nhật được (khi thiệp đổi slug/chủ sở hữu) nhưng không cho redirect arbitrary external để tránh phishing. Preserve scan analytics aggregate; không đếm preview của owner và bot là viewer người thật.
- Cho download QR riêng hoặc đặt QR trên PDF; có copy link + native share (`navigator.share` nếu có) + fallback clipboard.
- QR gift/card `gift/{code}` và QR checkin **khác hẳn** QR share `q/{code}` và QR mừng cưới/tài khoản ngân hàng.
- **Không ghi PII/secret/token kích hoạt vào QR thông thường.** Riêng QR activation chỉ chứa public ID, secret phát hành riêng.

### 8.2 Export: yêu cầu kỹ thuật
- PNG/JPG: default poster 1080×1350 (4:5), thêm story 1080×1920 (9:16), A5 optional; hỗ trợ logo/watermark theo gói.
- PDF: A5/A4 portrait, ảnh sắc nét, margins, QR click-through/link text, page break không cắt hình; hiển thị note “Xem bản tương tác tại link/QR”.
- Nếu template dài, ưu tiên export một **bản in chuyên dụng** thay vì chụp toàn bộ trang dài thu nhỏ; `PrintTemplateRenderer` nhận cùng dữ liệu nhưng presentation khác.
- Dùng Playwright server-side in/screenshot trong worker có Chromium; chỉ cho phép server render URL nội bộ có short-lived signed export token; chặn truy cập external/SSRF và nội dung do user cung cấp ngoài whitelist.
- Worker cần timeout, retry backoff, idempotency, status `QUEUED -> PROCESSING -> SUCCEEDED/FAILED`, cleanup temp files. Không đưa Chromium vào web response path synchronous nếu ảnh hưởng latency.
- Export files lưu object storage private; API cấp signed download URL ngắn hạn sau kiểm tra quyền. Có progress/polling và nút retry.
- Nếu không cấu hình worker/Redis ở local, cung cấp cách chạy worker local; không được chỉ hiện nút download không trả file.

### 8.3 Preview draft vs published
- Export draft có watermark theo gói và **không được lộ draft public** qua link tự do; export route render authenticated/signed.
- Published export dùng revision snapshot nhất quán: job đọc `invitationRevisionId`, không bị ảnh hưởng bởi user sửa giữa lúc render.
- Với asset riêng tư trong export route, signed URLs ngắn hạn hoặc auth route an toàn.

---

## 9. QR GIFT CARD VẬT LÝ — PRODUCT DETAIL

### 9.1 Các loại thẻ QR
| Loại | Người mua | Người quét thấy | P |
|---|---|---|---|
| `LOVE_CARD` | Cá nhân/cặp đôi | Thư tình/ảnh/mini website | 0 |
| `GRAD_CARD` | Người thân/bạn bè | Lời chúc tốt nghiệp/album | 0 |
| `BIRTHDAY_CARD` | Người thân/bạn bè | Thiệp chúc sinh nhật | 0 |
| `WEDDING_CARD` | Đôi cưới/đơn vị in | Thiệp mời/RSVP/maps | 0 |
| `GIFT_TAG` | Shop hoa/quà | Lời nhắn cá nhân hóa đính kèm hoa/quà | 0 |
| `MEMORY_BOX` | Shop quà | Album/voice/video mở khóa | 1 |
| `BUSINESS_CARD` | Doanh nghiệp | Invitation khai trương/sự kiện | 1 |

### 9.2 Vòng đời card
`CREATED -> INVENTORIED -> SOLD/ASSIGNED -> CLAIMED -> ACTIVE -> REVOKED/EXPIRED` (tùy rule). Chỉ `ACTIVE` có invitation target hợp lệ. Thẻ vật lý dùng một QR in cố định: URL `/gift/{publicCode}`. `secretHash` lưu hash, không lưu plaintext lâu dài; một mã kích hoạt bí mật được phát lúc in/bàn giao (cần xuất one-time manifest an toàn cho admin). Token dài, random CSPRNG ≥128 bit; rate limit, record claim attempts; không dùng chỉ 6 chữ số dễ đoán.

### 9.3 Claim và ownership
1. Người mua phải đăng nhập; dùng secret đi cùng card hoặc nhận card gắn với đơn hàng đã xác thực.
2. Server lock card row trong transaction; kiểm tra status, secret hash, assignment/purchase proof.
3. Gán `ownerId`, `claimedAt`, `status=CLAIMED`, đánh dấu secret đã dùng, tạo `GiftCardBinding` tới invitation.
4. Có thể thay invitation target trong phạm vi account của mình, ghi history; không chuyển sang URL ngoài.
5. Chỉ admin có permission đặc biệt mới unbind/revoke, có reason/audit và thông báo owner.
6. Mọi scan `/gift/[code]` nhận một trang đích đẹp: chưa active thì “Món quà sắp mở”; active thì redirect hoặc landing “Mở quà”; revoked thì trạng thái rõ, không leak danh tính.

### 9.4 In ấn hàng loạt
- Admin tạo batch 10/100/1000 QR, export PDF print sheet A4 với bleed/margin, mỗi thẻ ID + QR + mã kích hoạt được bảo vệ riêng (nếu in cùng card, cần scratch-off process ngoài đời; không công khai activation secret trên mặt trước).
- Mỗi QR phải kiểm tra bằng test scanner trước in; đếm batch and printed state; CSV manifest bảo vệ admin, one-time download; không lưu plaintext activation keys trên public storage.
- Hợp tác shop: shop chỉ có quyền card được phân bổ; không đọc secret đã claim, không được claim card của khách sau bán.

---

## 10. AFFILIATE/CTV: 10% COMMISSION — CẦN XỬ LÝ CHẶT

### 10.1 Quy tắc mặc định (có thể sửa bằng admin config)
- **Commission rate:** cố định mặc định `10.00%` cho CTV được duyệt, cấu hình bằng DB theo chương trình; không được hard-code trong UI.
- **Chỉ áp dụng cho sản phẩm số của nền tảng:** gói tạo thiệp, nâng cấp mini website, quyền download premium, kích hoạt trang số có phí (nếu có). **Không tự động trả 10% trên doanh thu cửa hàng bán hoa/quà, hàng in vật lý, phí giao hàng, tiền khách mừng cưới, gift card vật lý**. Nếu hợp tác shop có referral fee, tạo chương trình và ledger riêng, cần thỏa thuận đối soát.
- **Eligible revenue** = số tiền **thực thu** phân bổ cho sản phẩm số sau discount/điều chỉnh và sau hoàn tiền, **không tính VAT/thuế gián thu**, shipping, phí sản phẩm vật lý, tip. Phí payment gateway do nền tảng chịu không tự trừ khỏi eligible revenue, trừ khi cập nhật chính sách công khai.
- **Commission** = `floor(eligibleRevenueVND * 0.10)` VND, dùng integer (không dùng JS float). Khi refund 1 phần, tạo entry reversal tương ứng.
- **Attribution**: last eligible affiliate click trong 30 ngày, gán cho checkout hoặc đăng ký có conversion; không được tự giới thiệu; không ghi đè referral trên order đã tạo/đã thanh toán. V1 hỗ trợ anonymous cookie first-party consented; cross-device attribution không được đảm bảo nếu user không login.
- **Hold period:** 14 ngày kể từ giao dịch confirmed-paid hoặc kể từ lúc dịch vụ được kích hoạt (chọn mốc muộn hơn); đủ điều kiện sau hold nếu không refund/fraud/dispute.
- **Minimum payout:** 100.000 VND số dư AVAILABLE, qua manual review; payout theo lô do admin cấu hình; không payout tự động P0.
- CTV được xem conversion/commission theo mã và ngày, **không nhìn thấy email, phone, tên, nội dung thiệp của khách**. Cung cấp aggregate order/referral IDs đã ẩn định danh.
- Chương trình CTV cần có điều khoản rõ về kênh quảng bá được phép, cấm spam, self-referral, gian lận, cookie stuffing, misleading claims.

### 10.2 Commission ledger — kế toán bất biến
- Một purchase có thể tạo tối đa 1 commission chính cho 1 affiliate program; enforce `(orderId, affiliateProgramId)` unique.
- Ledger append-only (`EARNED`, `REVERSAL`, `ADJUSTMENT`, `PAYOUT_DEBIT`), không sửa/xóa bút toán lịch sử; số dư tính từ ledger theo status/eligibility.
- `EARNED` lúc payment confirmed -> pending. Job maturity chuyển availability bằng transaction idempotent; webhook duplicate không tạo bút toán mới.
- Full refund -> negative `REVERSAL` toàn bộ; partial refund -> prorated reversal tối đa phần đã earn; làm tròn có kiểm soát và không âm sai.
- Payout request khóa số AVAILABLE tương ứng (`RESERVED`) trong transaction. Admin chấp thuận transfer -> `PAID` với reference; từ chối -> giải phóng reserved. Một payout không được trừ 2 lần.
- Chargeback sau payout: balance debt/negative carry-forward; admin audit và thông báo CTV, không tự âm thầm thu tiền ngược.

### 10.3 Màn hình CTV P0
- Apply với tên hiển thị, kênh quảng bá, thông tin liên hệ; trạng thái `APPLIED/APPROVED/REJECTED/SUSPENDED`.
- Dashboard: total clicks hợp lệ, signups/conversions, revenue eligible, commission PENDING/AVAILABLE/PAID, payout requests.
- Link builder: `/r/{code}?campaign=...` chỉ cho phép UTM/value allow-list, không open redirects.
- Materials: asset cover/logo của nền tảng, bộ caption mẫu (admin publish), QR affiliate optional.
- Payout: nhập thông tin ngân hàng với protection/masking; cần consent; admin staff có quyền giới hạn.

### 10.4 Ví dụ test số học
- Khách dùng referral hợp lệ, mua gói digital 99.000đ, không khuyến mại, thuế ngoài scope test = 0 -> `eligibleRevenue = 99000`, commission `9900` VND.
- Nếu thanh toán hỗn hợp: digital 99.000 + bouquet 350.000 + shipping 30.000 -> **chỉ** 99.000 là eligible; hoa hồng CTV 9.900 VND (bỏ qua VAT trong testcase).
- Nếu digital được giảm 20.000đ -> eligible 79.000đ -> commission 7.900đ.
- Nếu refund full -> reversal -9.900đ.
- Nếu cùng webhook gửi 3 lần -> vẫn chỉ 1 EARNED.
- Nếu creator tự click link CTV của chính mình -> conversion không hợp lệ.

---

## 11. FLOWER/GIFT SHOP PARTNERS — HỆ THỐNG ĐỐI TÁC

### 11.1 Bản chất P0: partner discovery + quote/request fulfillment
- **P0 không làm marketplace có custody of funds.** Nền tảng chỉ hiển thị catalog và chuyển yêu cầu mua hàng tới shop đã duyệt. Shop có quyền báo giá/accept/decline, hoàn tất thủ công theo quy trình của họ.
- Người tạo thiệp chọn “Tặng kèm quà” -> lọc shop theo tỉnh/thành (do người dùng nhập/chọn, không tự lấy vị trí chính xác), loại hàng, ngân sách -> chọn product -> gắn lời nhắn/thiệp hoặc QR card -> gửi request.
- Shop xác nhận hàng có sẵn, giá cuối, shipping, lịch giao, điều kiện hoàn/đổi; người mua xác nhận ngoài nền tảng hoặc bằng trạng thái acknowledged tùy P1. Không hiện “Đã thanh toán” nếu chưa có chứng cứ thanh toán shop quản lý.
- Điều khoản trách nhiệm rõ: shop bán/giao hàng, nền tảng cung cấp công cụ số/kết nối trong P0. Không tự động chia hoa hồng cho CTV từ đơn shop.

### 11.2 Shop entity và catalog
- Shop: name, slug, description, logo, cover, city, district, address public, operatingHours, phone/contact (nhập và opt-in), social link, verification status, deliveryAreas, categories, returnPolicy, fulfillmentNotes.
- Products: `name`, `category` (hoa tươi, hoa sáp, quà tốt nghiệp, gấu bông, chocolate, hộp quà, thiệp giấy, gift tag QR, quà tùy chỉnh), image gallery, description, minPrice/maxPrice, currency VND, estimated leadTime, `isActive`, `customizationSupported`, `qrCardCompatible`.
- Nếu shop báo giá dao động, UI hiện “Từ ...đ”, không hiển thị một giá chốt nếu shop chưa xác nhận. Những product cần chọn ngày giao (hoa tươi) có deadline hỗ trợ.
- Storefront có nút request quote, sản phẩm liên quan, gắn link tới invitation; không truy cập data private của thiệp nếu không được creator cấp quyền rõ ràng.

### 11.3 Quote request/order lifecycle
`DRAFT -> SUBMITTED -> VIEWED -> QUOTED -> ACCEPTED -> IN_PROGRESS -> READY/SHIPPED -> COMPLETED` và các nhánh `DECLINED / CANCELLED / EXPIRED / DISPUTED`.
- P0 **shop requests** có thể không cần đủ các bước logistics; cho tối thiểu: submitted, quoted, accepted, completed, cancelled, declined.
- Buyer và shop có timeline, mỗi thay đổi state ghi `ShopRequestEvent`; chỉ transition hợp lệ.
- PII (người nhận, số phone, địa chỉ giao) chỉ tiết lộ shop **sau khi buyer đồng ý gửi request**; admin/support quyền hạn giới hạn; retention policy.
- Chống order spam: auth hoặc email verification, rate limit và CAPTCHA khi rủi ro cao.
- Shop verification manual: giấy phép/định danh thương mại nếu pháp luật và chính sách vận hành yêu cầu; P0 chỉ lưu thông tin tối thiểu, không lạm thu giấy tờ nhạy cảm.

### 11.4 Luồng gắn QR vào hoa/quà
1. Shop chọn `qrCardCompatible` cho product.
2. Buyer chọn invitation đang sở hữu, hoặc yêu cầu tạo invitation mới.
3. Hệ thống gán QR card được cấp/đã claim bởi buyer, chỉ lưu tham chiếu, **không tự cho shop quyền sửa thiệp**.
4. Shop in/gắn vật lý thẻ QR theo batch đã phân bổ hoặc khách tự gửi QR print-ready.
5. Người nhận quét QR -> lời chúc/mini website; màn hình loading/không kích hoạt có fallback thân thiện.
6. Phía shop chỉ thấy rằng QR có hợp lệ/activated hay chưa, không xem nội dung riêng tư trừ khi chủ thiệp opt-in.

### 11.5 Sau P0 (P1/P2)
- Shop subscription/listing fee hoặc fee trên lead đủ điều kiện theo hợp đồng; điều khoản minh bạch và chống fake leads.
- Search geo-district, verified reviews (chỉ user có transaction), lịch giao/slot capacity, quote notifications, partner API, inventory; payout/shop commission riêng nếu platform nhận thanh toán.
- Multi-vendor order, shipment tracking, direct integration carriers, tax/invoices chỉ khi business/legal readiness hoàn tất.

---

## 12. PRICING, BILLING VÀ THANH TOÁN

### 12.1 Kịch bản giá gợi ý (SEED, admin sửa được; không cam kết giá thị trường)

| Plan | Giá VND minh họa | Thời hạn | Tính năng chính |
|---|---:|---|---|
| `FREE` | 0 | 30 ngày public hoặc theo config | 1 thiệp active, mẫu free, watermark nhỏ, link/QR, form RSVP cơ bản, export preview giới hạn. |
| `BASIC` | 49.000 | 90 ngày | Mẫu premium nhóm cơ bản, bỏ watermark, export ảnh/PDF tiêu chuẩn. |
| `PREMIUM` | 99.000 | 180 ngày | Album lớn hơn, music, custom theme, guestbook, analytics. |
| `EVENT_PRO` | 199.000 | 365 ngày | Wedding/event features, RSVP nhiều khách, export chất lượng cao, support ưu tiên. |

**Chiến lược:** Với mô hình thiệp theo dịp, **one-time purchase per invitation** là mặc định ở P0; không tự gia hạn hoặc tự trừ tiền. Trạng thái hết hạn phải được giải thích trước khi mua; không xóa dữ liệu âm thầm. Mọi hạn mức số lượng, dung lượng, số lượt export cấu hình trong `PlanFeature` thay vì `if(plan === ...)` rải rác.

### 12.2 Trạng thái đơn thanh toán
`CREATED -> PENDING -> PAID` hoặc `FAILED/CANCELLED/EXPIRED/REFUNDED/PARTIALLY_REFUNDED`; các payment attempts tách khỏi order, có provider transaction id unique.
- Mọi purchase ghi order line items để tính chính xác tax, discount, digital revenue, physical revenue nếu về sau hợp nhất checkout.
- Receipt/confirmation email tùy tích hợp; trang lịch sử orders luôn có status thật.
- Khi paid: trong một DB transaction **mark payment, order, entitlement, commission**, dùng idempotency keys; nếu cần async job thì dùng transactional outbox + worker retry.
- Chỉ nhận thanh toán từ provider webhook có signature đã verify hoặc admin manual `mark-paid` kèm chứng cứ và audit; frontend redirect success **không tự coi là đã thanh toán**.
- Checkout P0: `MANUAL_REVIEW` bằng chuyển khoản/mã đơn hoặc provider sandbox; admin đối chiếu giao dịch và duyệt trước unlock. Nếu hiển thị QR ngân hàng, xác nhận chuyển khoản từ người dùng chỉ là “Tôi đã chuyển khoản”, không mở khóa tự động.
- Về sau: adapter `PaymentProvider` thay bằng VNPAY, PayOS hoặc nhà cung cấp pháp lý phù hợp. Không giả định API provider, không hard-code ngân hàng/người thụ hưởng.

### 12.3 Trừ phí và hoàn tiền
- Giá admin quản lý; mọi orders giữ snapshot giá tại thời điểm checkout.
- Coupon P1 có hạn ngày/lần dùng/áp dụng đối tượng; validate server-side, lock usage trong transaction.
- Refund partial/full cần entitlement policy rõ: refund full unpublish premium hoặc downgrade theo rule; giữ dữ liệu người dùng trong thời hạn retention, cập nhật commission reversal.
- Dùng `VND` integer minor currency (VND không dùng đơn vị nhỏ); không dùng float để lưu tiền.

---

## 13. KIẾN TRÚC KỸ THUẬT CHỐT CHO CODEX

### 13.1 Tech stack đề xuất

- **Frontend + BFF/API:** Next.js App Router, React, TypeScript `strict`, Tailwind CSS, shadcn/ui (hoặc thư viện accessible tương đương), Zod, React Hook Form.
- **Database:** PostgreSQL trên Railway, Prisma ORM (**chọn bộ version tương thích với auth tại thời điểm khởi tạo, khóa trong lockfile; tránh mix incompatible major versions**).
- **Authentication:** Better Auth email+password/email verification/reset password, Prisma adapter; sessions secure httpOnly cookies, CSRF protections. Có thể dùng Auth.js nếu repo có sẵn và đã hoạt động; không triển khai auth thủ công yếu.
- **File storage:** S3-compatible bucket (Cloudflare R2 hoặc Railway bucket/storage tương thích); ảnh/exports private mặc định; public assets qua CDN khi cần.
- **Exports/background jobs:** Railway Redis + BullMQ + `worker` process (Playwright Chromium/Sharp/QR lib), không chạy tác vụ nặng trong API requests.
- **Email transactional:** adapter Resend hoặc SMTP; local console/mail mock; không yêu cầu kết nối mới để chạy bản demo.
- **Analytics:** database aggregate counters + simple events; không cần Google Analytics/cookie marketing P0.
- **Deploy:** Railway cho Web + Worker + PostgreSQL + Redis; custom domain + SSL; object storage ngoài/dịch vụ bucket phù hợp.
- **Observability:** structured logger, error monitoring optional, health endpoint, audit log; secrets environment only.
- **SEO:** Next.js metadata, OG image generation privacy-aware, sitemap cho trang public được phép index, robots.
- **i18n:** `vi-VN` P0; chuẩn bị dictionary keys, English P1.

**Quan trọng:** Không tự động chọn “mới nhất” nếu phá compatibility. Trước khi code, Codex phải kiểm tra docs phiên bản hiện hành của Next/Prisma/Better Auth/Playwright và lock version đã chạy test. Tài liệu tham khảo trong §24.

### 13.2 Sơ đồ hệ thống

```mermaid
flowchart TD
  U[Creator / Recipient / CTV / Shop] --> WEB[Next.js web + API on Railway]
  WEB --> AUTH[Auth / RBAC]
  WEB --> DB[(PostgreSQL)]
  WEB --> BUCKET[(S3-Compatible Object Storage)]
  WEB --> REDIS[(Redis Queue)]
  REDIS --> WORKER[Export & Jobs Worker]
  WORKER --> BUCKET
  WORKER --> DB
  WEB --> EMAIL[Email Adapter]
  WEB --> PAY[Payment Adapter / Manual Review]
  SHOP[Shop Portal] --> WEB
  ADMIN[Admin Portal] --> WEB
```

### 13.3 Monorepo / project structure (gợi ý)

```text
/
  spec.md
  package.json
  pnpm-lock.yaml
  .env.example
  next.config.ts
  Dockerfile.web
  Dockerfile.worker
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    app/
      (public)/...
      (auth)/...
      dashboard/...
      affiliate/...
      shop/...
      admin/...
      i/[slug]/page.tsx
      q/[shortCode]/route.ts
      gift/[publicCode]/page.tsx
      api/v1/...
    components/
      ui/
      editor/
      template-renderer/
      invitation-blocks/
      invitation-preview/
      export/
    config/
      occasion-catalog.ts
      plans.ts
    lib/
      auth/
      prisma/
      rbac/
      payments/
      affiliates/
      qr/
      exports/
      storage/
      validation/
      logging/
    server/
      repositories/
      services/
      jobs/
    worker/
      index.ts
      processors/
    styles/
  public/
    templates/
    brand/
  tests/
    unit/
    integration/
    e2e/
  docs/
    IMPLEMENTATION_STATUS.md
    DECISIONS.md
    SETUP.md
    DEPLOY.md
    API.md
    ADMIN_OPERATIONS.md
    PRIVACY_CHECKLIST.md
```

**Code boundaries:** `UI -> route handlers/server actions -> domain services -> repositories -> DB`. Domain services testable, payment/commission logic không viết trong React components. API error format chuẩn, admin routes auth+RBAC.

---

## 14. DATABASE MODEL — PHẢI CÓ MIGRATIONS, INDEX VÀ CONSTRAINTS

**Chỉ dẫn:** Đây là *logical schema*, Codex thiết kế `prisma/schema.prisma` chuẩn, đặt tên camelCase hoặc snake_case nhất quán. Khóa chính UUID/cuid2/ULID phù hợp; unique/index/foreign keys đầy đủ, `createdAt`/`updatedAt` hầu hết tables. Better Auth có các bảng riêng theo provider — không tự trùng lặp thủ công.

### 14.1 Core auth, content, media

| Entity | Trường thiết yếu | Index/constraint và lưu ý |
|---|---|---|
| `User` | id, name, email, emailVerified, image, status, locale | email unique; auth-managed user model tương thích auth adapter. |
| `Session/Account/Verification` | Theo Better Auth | Dùng schema do thư viện auth generate; không reinvent. |
| `RoleAssignment` | id, userId, role, grantedBy, grantedAt | unique(userId,role); admin grant chỉ qua audit. |
| `OccasionCategory` | id, slug, title, icon, sortOrder, active | slug unique. |
| `Occasion` | id, categoryId, slug, title, formPresetKey, active, metadataJson | slug unique; index categoryId. |
| `Template` | id, slug, title, occasionId?, status, coverAssetId, isPremium, sortOrder | slug unique; public chỉ status=PUBLISHED. |
| `TemplateVersion` | id, templateId, version, definitionJson, rendererVersion, publishedAt | unique(templateId,version), immutable once published. |
| `Invitation` | id, ownerId, occasionId, templateVersionId, slug, title, status, privacyMode, allowIndexing, expiresAt?, publishedAt?, currentRevisionId? | slug unique, index ownerId+status, no public access draft. |
| `InvitationRevision` | id, invitationId, versionNumber, contentJson, themeJson, createdBy, createdAt | unique(invitationId,versionNumber), append-only published history/revision snapshots. |
| `Asset` | id, uploaderId, storageKey, mimeType, byteSize, width?, height?, duration?, visibility, scanStatus | unique(storageKey); private by default; index uploaderId; validate ownership. |
| `InvitationAsset` | invitationId, assetId, usage | unique(invitationId,assetId,usage); deletion reference accounting. |
| `InvitationAccess` | invitationId, passcodeHash?, unlockedAt? | Passcode hash only; unlock sessions separate, never store plaintext. |
| `ShareLink` | id, invitationId, shortCode, status, label, scanCount, targetRevisionPolicy | shortCode unique, bind internal invitation only. |
| `ExportJob` | id, invitationId, revisionId, requesterId, format, sizePreset, status, storageKey?, errorCode?, attemptCount, idempotencyKey | unique(requesterId,idempotencyKey); index(status,createdAt). |
| `UsageCounter` | id, userId, invitationId?, featureKey, periodKey, count | unique(userId,invitationId,featureKey,periodKey) as applicable; transactional quota. |

### 14.2 Guest response và event

| Entity | Trường thiết yếu | Lưu ý |
|---|---|---|
| `RSVPResponse` | id, invitationId, guestName, status, guestCount, emailEncrypted?, phoneEncrypted?, message?, responseTokenHash?, moderationStatus, createdAt | index invitationId; strict max guest count; anti-spam; do not publicly expose PII. |
| `GuestbookMessage` | id, invitationId, displayName, body, status, createdAt, reviewedAt? | status PENDING/APPROVED/HIDDEN/REJECTED; profanity/spam moderation possible. |
| `InteractionResponse` | id, invitationId, blockId, optionId, displayName?, createdAt | optionId checked against invitation revision definition, rate limit. |
| `InvitationEventStatsDaily` | invitationId, dayUTC, views, uniqueApproxViews, qrScans, rsvpCount, shares? | unique(invitationId,dayUTC); non-PII aggregate. |
| `AbuseReport` | id, publicTargetType, publicTargetId, reporterEmail?, reason, status, reviewerId?, createdAt | throttle; target content review flow. |

### 14.3 Billing + finance

| Entity | Trường thiết yếu | Constraint |
|---|---|---|
| `Plan` | id, code, name, active, basePriceVnd, defaultDurationDays, sortOrder | code unique; pricing snapshot at order. |
| `PlanFeature` | id, planId, featureKey, valueJson | unique(planId,featureKey). |
| `Order` | id, buyerId, orderNumber, status, currency, subtotalVnd, discountVnd, taxVnd, totalVnd, paymentStatus, paidAt?, referredAffiliateId?, purchaseContext | orderNumber unique; sum line items server-side. |
| `OrderLine` | id, orderId, productType, referenceId?, titleSnapshot, quantity, unitPriceVnd, discountVnd, taxVnd, totalVnd, commissionEligible | sum matches order; only approved digital product types eligible by policy. |
| `PaymentAttempt` | id, orderId, provider, providerRef?, status, amountVnd, idempotencyKey?, paidAt?, rawSafeMetadata | unique provider+providerRef when present; never store raw card/payment secrets. |
| `PaymentWebhookEvent` | id, provider, providerEventId, signatureVerified, processedAt?, status, payloadHash | unique(provider,providerEventId) -> idempotent. |
| `Entitlement` | id, ownerId, invitationId?, sourceOrderLineId, planId, status, beginsAt, expiresAt | sourceOrderLineId unique; revoke/update in payment transaction. |
| `Refund` | id, orderId, paymentAttemptId, amountVnd, reason, status, providerRefundRef?, createdAt | event idempotence; refund amount ≤ amount paid less prior refunds. |

### 14.4 CTV/affiliate/commission

| Entity | Trường thiết yếu | Constraint |
|---|---|---|
| `AffiliateProfile` | id, userId, status, payoutAccountEncrypted?, payoutBankCode?, termsVersionAcceptedAt?, approvedBy? | userId unique; details masked in UI. |
| `AffiliateProgram` | id, code, name, rateBps, attributionDays, holdDays, minPayoutVnd, active | 10% = 1000 basis points; program config versioned. |
| `AffiliateLink` | id, affiliateId, programId, code, campaign?, status | code unique, program active. |
| `ReferralClick` | id, affiliateLinkId, anonymousVisitorKeyHash?, occurredAt, landingPath, deviceClass?, isValid | no raw IP indefinitely; expire event data by retention. |
| `ReferralAttribution` | id, userId?, anonymousKeyHash?, affiliateId, programId, firstClickAt, lastClickAt, expiresAt, sourceLinkId | one effective attribution per checkout/program; prevent self-referral. |
| `Commission` | id, orderId, affiliateId, programId, programRateBpsSnapshot, eligibleBaseVnd, amountVnd, status, holdUntil, approvedAt? | unique(orderId,programId), transaction with order. |
| `CommissionLedgerEntry` | id, commissionId?, affiliateId, payoutId?, type, amountVnd, effectiveAt, idempotencyKey, metadata | unique(idempotencyKey); append-only; signed integer; no destructive edits. |
| `PayoutRequest` | id, affiliateId, amountVnd, status, requestAt, reviewedBy?, paidAt?, externalReference?, rejectionReason? | lock available balance in transaction; unique external payout reference when appropriate. |

### 14.5 Shop + QR card

| Entity | Trường thiết yếu | Constraint |
|---|---|---|
| `Shop` | id, ownerId, slug, name, description, status, city, district, contact, verificationNotes?, policyUrl? | slug unique, approved visibility. |
| `ShopMembership` | id, shopId, userId, role | unique(shopId,userId), shop-scoped roles. |
| `ShopProduct` | id, shopId, slug, title, category, minPriceVnd?, maxPriceVnd?, leadTimeHours?, qrCompatible, active | unique(shopId,slug), index(shopId,active). |
| `ShopProductAsset` | shopProductId, assetId, orderIndex | only assets owner has rights to use. |
| `ShopRequest` | id, buyerId, shopId, productId?, invitationId?, requestedQty, note, deliveryCity?, deliveryAddressEncrypted?, recipientPhoneEncrypted?, desiredDeliveryAt?, status, finalQuotedVnd?, consentVersion, createdAt | owner check; only shop members see delivery PII after submission. |
| `ShopRequestEvent` | id, shopRequestId, actorId, previousStatus, nextStatus, note, createdAt | immutable state/audit events. |
| `GiftCardBatch` | id, createdBy, label, quantity, status, exportedAt?, assignedShopId? | id unique, batch inventory. |
| `GiftCard` | id, batchId, publicCode, activationSecretHash, cardType, status, ownerId?, assignedShopId?, claimedAt?, revokedAt? | publicCode unique; secretHash unique as applicable; update with row lock. |
| `GiftCardBinding` | id, giftCardId, invitationId, createdBy, active, createdAt | max 1 active per card (partial unique index / enforced transaction), history preserved. |
| `GiftCardScanDaily` | giftCardId, dayUTC, scans | unique(giftCardId,dayUTC). |

### 14.6 Audit/system

| Entity | Trường thiết yếu | Constraint |
|---|---|---|
| `AuditLog` | id, actorId?, actorRole, action, resourceType, resourceId, beforeSummary?, afterSummary?, reason?, ipHash?, createdAt | append-only, no raw secrets, index(resourceType,resourceId). |
| `OutboxEvent` | id, topic, aggregateType, aggregateId, payloadJson, status, attempts, nextAttemptAt | unique dedupeKey; transactionally recorded with domain change. |
| `FeatureFlag` | key, enabled, metadata, updatedBy | key unique, admin audit. |
| `SystemSetting` | key, valueJson, updatedBy | validation, secret values kept in env not DB. |

### 14.7 Data integrity yêu cầu tối thiểu
- FK database, cascade có chọn lọc; **không xóa cascade** finance ledger/audit; xóa user account theo chính sách privacy bằng anonymize/tombstone finance bắt buộc lưu (nếu luật yêu cầu).
- Index: `Invitation(ownerId,status)`, `Invitation(slug)`, `InvitationRevision(invitationId,versionNumber)`, `RSVPResponse(invitationId,createdAt)`, `Order(buyerId,createdAt)`, `AffiliateLink(code)`, `Commission(affiliateId,status,holdUntil)`, `GiftCard(publicCode)`, `ShopRequest(shopId,status)`.
- Timestamps lưu UTC; file export và event date hiển thị theo `timezone` được lưu.
- Dùng transactional lock để claim QR, reserve payout, confirm payment, apply refund, quota increments.
- PostgreSQL checks/nonnegative money/valid transitions ở service + DB constraints phù hợp.
- Sensitive data encryption at rest cho payout bank and shop delivery contact, with restricted access; logging redact.

---

## 15. API SPEC — `/api/v1`, AUTH, VALIDATION, IDEMPOTENCY

**Convention**: JSON (trừ file upload/download), Zod parse request, RFC-like error envelope, HTTP status phù hợp. Authorization mỗi endpoint. Paginated lists `cursor, limit`; limit tối đa 100; stable sorting. CSRF protection for mutations. Rate limit auth, QR activation, guestbook, requests, exports, payment/admin. Khi version public API thay đổi tạo version `/v2`.

### 15.1 Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vui lòng kiểm tra thông tin đã nhập",
    "fields": {"event.startsAt": "Ngày không hợp lệ"},
    "requestId": "req_example"
  }
}
```

- `401` unauthenticated, `403` forbidden, `404` not found (không leak ownership), `409` conflict, `422` validation, `429` too many requests, `500` unexpected. Không đưa stack traces vào production response.

### 15.2 Core/auth/content API

| Method | Endpoint | Role | Logic |
|---|---|---|---|
| GET | `/api/v1/occasions` | Public | Categories, available occasions, flags. |
| GET | `/api/v1/templates` | Public | Filter available templates by occasion, plan, tags. |
| GET | `/api/v1/templates/:slug` | Public | Version active, sanitized demo data. |
| POST | `/api/v1/invitations` | Creator | Create draft with occasion/templateVersion, initial revision. |
| GET | `/api/v1/invitations` | Creator | Own invitations paginated. |
| GET | `/api/v1/invitations/:id` | Owner/admin scoped | Draft+revision data, role check. |
| PATCH | `/api/v1/invitations/:id` | Owner | Update title/theme/content, optimistic revision check. |
| POST | `/api/v1/invitations/:id/publish` | Owner | Validate, publish, create link, enforce entitlement/quota. |
| POST | `/api/v1/invitations/:id/unpublish` | Owner | Disable recipient access according to policy. |
| DELETE | `/api/v1/invitations/:id` | Owner | Soft delete, schedule asset cleanup; preserve required audit. |
| GET | `/api/v1/invitations/:id/stats` | Owner | Aggregate daily events. |
| GET | `/api/v1/invitations/:id/rsvps` | Owner | Protected replies, pagination. |
| POST | `/api/v1/public/invitations/:slug/rsvps` | Public | Rate limit, validate guest count, guest PII consent. |
| POST | `/api/v1/public/invitations/:slug/messages` | Public | Moderate, anti-spam. |
| POST | `/api/v1/public/invitations/:slug/interactions` | Public | Valid option + rate limit. |
| PATCH | `/api/v1/invitations/:id/messages/:messageId` | Owner | Approve/hide guestbook. |

### 15.3 Assets/share/export

| Method | Endpoint | Role | Logic |
|---|---|---|---|
| POST | `/api/v1/assets/presign` | Creator/shop auth | Validate MIME/size/quota, signed PUT. |
| POST | `/api/v1/assets/complete` | Asset owner | Verify storage object size/type, create asset record, safe processing. |
| POST | `/api/v1/invitations/:id/share-links` | Owner | Create labeled shortCode + QR. |
| GET | `/api/v1/invitations/:id/qr` | Owner | PNG/SVG for share short URL, quota. |
| POST | `/api/v1/invitations/:id/exports` | Owner | Enqueue job, return job id. |
| GET | `/api/v1/exports/:jobId` | Owner | Status + signed URL when done. |
| POST | `/api/v1/exports/:jobId/retry` | Owner | Only on eligible failed job. |

### 15.4 Pricing, order, affiliate

| Method | Endpoint | Role | Logic |
|---|---|---|---|
| GET | `/api/v1/plans` | Public | Public offers from DB. |
| POST | `/api/v1/checkout` | Creator | Generate immutable order snapshot, affiliate attribution. |
| GET | `/api/v1/orders` | Creator | Own orders. |
| POST | `/api/v1/orders/:id/mark-transfer-submitted` | Buyer | Mark review-needed; **not paid**. |
| POST | `/api/v1/payments/webhooks/:provider` | Provider | Signature+timestamp/idempotency verification. |
| POST | `/api/v1/affiliate/apply` | Logged-in | Apply program. |
| GET | `/api/v1/affiliate/dashboard` | Approved affiliate | Aggregated stats only. |
| POST | `/api/v1/affiliate/links` | Approved affiliate | Generate/ref existing links. |
| GET | `/api/v1/affiliate/commissions` | Approved affiliate | Own commission ledger. |
| POST | `/api/v1/affiliate/payout-requests` | Approved affiliate | Reserve balance after checks. |

### 15.5 Shop/QR card/admin

| Method | Endpoint | Role | Logic |
|---|---|---|---|
| GET | `/api/v1/shops` | Public | Approved, with filters. |
| GET | `/api/v1/shops/:slug` | Public | Approved shop public info and products. |
| POST | `/api/v1/shops/apply` | User | Create pending shop. |
| POST | `/api/v1/shops/:id/products` | Shop owner/staff allowed | Create product, safe upload refs. |
| PATCH | `/api/v1/shops/:id/products/:productId` | Shop role | Update product own shop. |
| POST | `/api/v1/shop-requests` | Creator/buyer | Submit request, explicit delivery data consent. |
| GET | `/api/v1/shop-requests` | Buyer or shop member scoped | List only authorized requests. |
| PATCH | `/api/v1/shop-requests/:id/status` | Authorized shop/buyer | Server-side state machine. |
| POST | `/api/v1/gift-cards/:publicCode/claim` | Logged-in authorized claimant | Verify secret/assignment, transactional claim. |
| POST | `/api/v1/gift-cards/:id/bind` | Card owner | Link to invitation owned and published. |
| GET | `/api/v1/gift-cards` | Card owner | Own cards, status. |
| POST | `/api/v1/admin/gift-card-batches` | Admin | Generate batch and secure manifest. |
| POST | `/api/v1/admin/orders/:id/confirm-paid` | Admin finance permission | Reconcile confirmed transfer with evidence + audit. |
| POST | `/api/v1/admin/affiliates/:id/approve` | Admin | Approve CTV. |
| POST | `/api/v1/admin/shops/:id/approve` | Admin | Approve shop. |
| POST | `/api/v1/admin/payouts/:id/settle` | Admin finance | Record transfer reference, idempotent. |
| POST | `/api/v1/admin/refunds` | Admin finance | Validate refund and commission reversal. |
| GET | `/api/v1/admin/audit` | Admin authorized | Paginated security logs. |

### 15.6 Example: creation and publish

```http
POST /api/v1/invitations
Content-Type: application/json
Cookie: [session]

{"occasionKey":"love","templateSlug":"love-letter","locale":"vi-VN"}
```

```json
{
  "data": {
    "id": "inv_example",
    "status": "DRAFT",
    "editorUrl": "/editor/inv_example",
    "revision": 1
  }
}
```

```http
PATCH /api/v1/invitations/inv_example
Content-Type: application/json

{"expectedRevision":1,"content":{"schemaVersion":1,"occasionKey":"love","title":"Một điều muốn nói","message":"..."}}
```

```json
{"data":{"id":"inv_example","revision":2,"saveStatus":"SAVED"}}
```

```http
POST /api/v1/invitations/inv_example/publish
Idempotency-Key: unique-client-generated-uuid
```

```json
{
  "data": {
    "status": "PUBLISHED",
    "publicUrl": "https://example.com/i/mot-dieu-muon-noi-x7cd",
    "shortUrl": "https://example.com/q/9K2jvrT",
    "revision": 2
  }
}
```

**Note:** Các route samples chỉ là contract minh họa, domain `example.com` không phải tên miền dự án. Trường PATCH phải dùng typed partial validation chứ không overwrite object đột ngột.

---

## 16. AN TOÀN, PRIVACY, MODERATION, COMPLIANCE

### 16.1 Phạm vi dữ liệu nhạy cảm
Sản phẩm chứa ảnh cá nhân, địa điểm sự kiện, ngày cưới, lời tỏ tình, số điện thoại, địa chỉ giao quà, thông tin tài khoản ngân hàng cho payout/QR mừng cưới và phản hồi khách. Bảo vệ privacy là yêu cầu core, không phải polish.

- **Luật Việt Nam:** Luật Bảo vệ dữ liệu cá nhân số **91/2025/QH15 có hiệu lực 01/01/2026**. Cần triển khai notice/consent, mục đích xử lý, quyền người có dữ liệu, xử lý yêu cầu truy cập/xóa, bảo mật, retention/transfer theo tư vấn pháp lý thực tế. File này là yêu cầu kỹ thuật, **không thay thế rà soát pháp lý**.
- Cần kiểm tra quy định thương mại điện tử, quản lý website cung cấp dịch vụ, quảng cáo tiếp thị liên kết, thuế/khấu trừ chi trả CTV, giao dịch qua shop và nghĩa vụ hóa đơn trước khi vận hành thực tế. Không khẳng định mọi shop/CTV đã hợp lệ chỉ vì admin approve.
- Có `/legal/privacy`, `/legal/terms`, `/legal/affiliate`, `/legal/shops`; ghi version consent và timestamp khi cần.
- Người gửi ảnh tự xác nhận quyền sử dụng/hình ảnh, nội dung phù hợp và consent từ người có mặt trong ảnh khi pháp luật yêu cầu.
- API xử lý data subject requests: export data, request deletion, review retention constraints; admin có tool thực thi và audit.
- Nội dung public có nút report, quy trình review/remove/suspend; không đưa private content vào indexing/OG/public endpoints.

### 16.2 Security acceptance checklist
- Auth: email verification/reset tokens short-lived, hash passwords đúng chuẩn, session cookie HttpOnly/Secure/SameSite; chống enumeration tài khoản ở recovery.
- Authorization: invariant owner-scoping cho mọi GET/mutation/export/assets/RSVP/shop/order/CTV. Test IDOR với 2 users.
- Input: Zod validation, rich-text sanitize, max text lengths, URL allowlist, CSRF, SQL injection avoidance qua ORM.
- Upload: content sniff MIME, size limits, image re-encode/strip EXIF GPS, virus scanning where supported, block SVG active content/user HTML, private bucket defaults, server ownership checks.
- Rate limiting: login, signup, OTP/email, public interactions, short link scanning, QR activation, affiliate click, exports, shop requests, admin review.
- Payments: verify webhook signature + timestamp + amount/currency + order reference; replay-safe event id; nonpublic finance admin pages; no trusting screenshots.
- QR/short links: no arbitrary redirect external; URL origin pinned; QR codes not encode activation secret; scan endpoint cannot execute javascript.
- Privacy: strong cache control for private responses, `noindex` unlisted/private, do not index passcode pages; use short-lived unlock session with server controls.
- Logging: redact auth token, payment webhook payload secrets, gift activation secrets, phones/bank accounts, message bodies (unless specifically needed with restricted audit), suppress detailed traces in prod.
- Security headers: CSP appropriate, HSTS production, `X-Content-Type-Options`, frame-ancestors restrictions, Referrer-Policy.
- Abuse: report form, spam queue, denylist/rate limits, optional CAPTCHA on suspicious traffic, proactive review for malicious invitation URLs.
- Media: avoid licensing violations; admin can disable uploaded music and assets reported for copyright.
- Encryption: TLS in transit; data encrypted at rest; app-level envelope encryption for payout and delivery PII; secret rotation documented.
- Admin: strongly recommend MFA; P0 admin account bootstrap from a protected CLI/env-controlled procedure, **never public signup choosing role=ADMIN**. All financial admin mutations audit.
- Security tests: npm audit or equivalent, secret scanning, no secrets in Git, dependency update policy.

### 16.3 Data retention defaults (cấu hình, không xem là bảo đảm pháp lý)
- Anonymous rate-limit events: lưu tối thiểu, TTL ngắn.
- Raw click logs: tối đa 30–90 ngày; aggregated analytics lâu hơn theo policy.
- Inactive free drafts: cảnh báo trước khi dọn (ví dụ 180 ngày); không xóa silently.
- Deleted content: soft-delete + purge queue + retention exception nếu cần pháp lý; assets cleanup reference-aware.
- Finance transactions/audit: retention theo nghĩa vụ pháp luật và tài chính, thay thông tin nhận dạng bằng pseudonym/anonymization khi thích hợp.
- Guest RSVP: creator có khả năng xóa/export, không hiển thị mặc định với user khác.

---

## 17. UI/UX, BRAND & DESIGN SYSTEM

### 17.1 Chất lượng thị giác
- Định hướng: romantic, premium, playful, celebratory; không dùng cùng một layout cho tất cả.
- Trang chủ có hero mạnh, 4 vertical cards (Tình yêu, Cưới, Sinh nhật, Tốt nghiệp), CTA “Tạo thiệp miễn phí”, gallery mẫu, “3 bước”, tính năng QR/hoa/quà, CTV và đối tác, FAQ.
- Visual inspirations có thể tham khảo pattern của Canva/Partiful/Paperless Post nhưng không sao chép assets/layout độc quyền.
- Editor cần ít bước nhất; vì người dùng không-tech, mọi tính năng phải có label tiếng Việt rõ.

### 17.2 Components thiết yếu
- `TemplateCard`, `OccasionSelector`, `StepWizard`, `DynamicField`, `MediaUploader`, `ThemePicker`, `BlockToggle`, `DevicePreview`, `PublishDialog`, `ShareDialog`, `QRCodePanel`, `ExportPanel`, `RSVPForm`, `Guestbook`, `Countdown`, `EnvelopeAnimation`, `AffiliateSummary`, `ShopProductCard`, `GiftCardActivation`, `StatusBadge`, `DataTable`, `EmptyState`, `ErrorState`, `ConfirmDialog`.
- Semantic HTML, keyboard focus, ARIA labels, sufficient contrast, alt text for meaningful images, aria-live success, reduced-motion mode.
- Mọi file được xử lý hiển thị preview file type, size, upload progress và error.

### 17.3 Responsive matrix
- Mobile: 320px, 360px, 375px, 430px.
- Tablet: 768px.
- Desktop: 1024px, 1440px.
- No horizontal overflow, sticky editor actions không che form/input keyboard mobile, QR vẫn quét được ở 360px.

### 17.4 SEO và tốc độ
- Public landing/category/template pages SEO friendly; invitation default `noindex` nếu unlisted.
- Open Graph dynamic theo privacy: title/cover chỉ khi user cho phép; private dùng generic preview.
- Metadata canonical, sitemap loại trừ private, structured data Event nếu thông tin public và đúng ngữ cảnh.
- Mục tiêu nội bộ (không bảo đảm): LCP ≤2.5s mobile trên mạng mục tiêu, CLS ≤0.1, INP ≤200ms; kiểm chứng bằng Lighthouse/real measurements. Không load media nặng ngay first paint.

---

## 18. KHẢ NĂNG MỞ RỘNG, OBSERVABILITY VÀ VẬN HÀNH

- Healthcheck `/api/health` (liveness), `/api/ready` (readiness DB/critical dependencies). Không tiết lộ secrets/details cho public.
- App metrics: signup, created draft, published invitation, shares, QR scans, RSVP, export success/failure, paid order, affiliate conversions, partner requests, gift activation, refund, commission maturities.
- Daily aggregate jobs idempotent; bot/crawler filter cho click stats, công khai rằng views là ước lượng.
- Job queue DLQ/failed retry visibility for export and email; admin operations dashboard.
- DB backups: bật và kiểm tra restore; tách production/staging, không dùng prod data cho development.
- Structured logs `requestId`, actorId masked, route/action, status, latency; privacy redaction.
- Rate limit theo userId/IP hash và loại endpoint; WAF/bot protection optional P1.
- Dùng cache có invalidation cho public published pages; khi chỉnh sửa, user thấy bản mới sau publish trong thời gian ngắn.
- Feature flag các tính năng chưa hoàn tất; chọn grace degradation khi email/worker/storage down; không tạo trạng thái thành công giả.

---

## 19. TEST PLAN — CHẶN BUG “GAME HIỆN RA NHƯNG KHÔNG BẤM ĐƯỢC”

**Codex phải chạy thử thao tác trên trình duyệt, không chỉ đảm bảo build xanh.** Dùng Playwright E2E với test data seed và dev/staging environment an toàn. Test mock provider chỉ thay phụ thuộc bên ngoài, không thay domain logic.

### 19.1 Unit tests bắt buộc

- Form schema cho 4 vertical: required, dates, phone optional, URL safety, max size, content migration.
- Template resolver: đúng version, blocks, disable state, no unsafe scripts, fallback khi asset thiếu.
- Commission: 10%, discount, VAT handling, partial/full refund, rounding VND, duplicate webhook, pending->available, payout reservations.
- Referral cookie: expiry 30 ngày, last-click eligible, duplicate/cross-user, self-referral, no commission physical goods.
- Gift card: token random, hash verification, unknown/claimed/revoked, parallel claim race; one active binding.
- Shop request transition state machine; fail invalid transitions.
- QR URL generation: shortCode unique, internal redirect only, scan never reveals activation secret.
- Role permission: owner vs stranger, shop role scope, admin/support separation.

### 19.2 E2E flows bắt buộc (P0)

| ID | Scenario | Expected |
|---|---|---|
| E2E-01 | New user signup -> verify/login | Dashboard accessible, session persists securely. |
| E2E-02 | Create Graduation -> fill -> save -> refresh | Draft and images persist. |
| E2E-03 | Change template -> preview | Data preserved and new layout rendered. |
| E2E-04 | Publish invite -> open public in incognito | Shows matching latest revision; no auth required if UNLISTED. |
| E2E-05 | Copy link -> open on mobile viewport | Content visible, no broken components. |
| E2E-06 | Download QR -> decode QR -> open | Resolves correct invitation after edit/slug changes. |
| E2E-07 | Export PNG/JPG/PDF | Each file exists, nonzero bytes, valid format, readable content and QR. |
| E2E-08 | Guest RSVP -> owner dashboard | RSVP recorded once, owner sees data, visitor cannot read list. |
| E2E-09 | Guestbook moderation | Message not public until approved when moderation on. |
| E2E-10 | Invitation password/unpublish | Unauthorized cannot see content, after unpublish public link blocked. |
| E2E-11 | Affiliate apply/admin approve -> referral click -> checkout | Attribution correctly bound. |
| E2E-12 | Manual paid review by finance admin | Entitlement created exactly once; other roles cannot approve. |
| E2E-13 | E2E-12 order pays 99.000 VND | 9.900 VND pending commission with zero tax/discount fixture. |
| E2E-14 | Refund fully after E2E-13 | Commission reversed, available balance accurate. |
| E2E-15 | Commission hold maturity -> payout request -> admin settle | Ledger balanced, no double payout if retried. |
| E2E-16 | Shop apply -> admin approve -> add product -> buyer request | Shop receives request, status can be updated, no other shop can view. |
| E2E-17 | Generate QR card -> claim -> bind -> scan | Unclaimed fallback then correct recipient page after activation. |
| E2E-18 | Two users attempt to claim same card | Exactly one succeeds, other receives conflict with no data leak. |
| E2E-19 | Access another user's invitation/order/export | 403/404 from server, not only disabled UI. |
| E2E-20 | View home/catalog/editor on 360px/1440px | No horizontal overflow, controls usable. |
| E2E-21 | External email/storage unavailable | Clear error/pending/retry, no fake success. |
| E2E-22 | Image EXIF/oversize/invalid MIME upload | Rejected/cleaned according to policy; no leak of GPS metadata. |
| E2E-23 | Page all main nav/CTA buttons | No broken/internal 404 links, no inert action buttons. |
| E2E-24 | Database restart/worker retry | Idempotency and consistency preserved. |

### 19.3 Manual QA acceptance

- Test Chrome/Edge desktop + Android Chrome; Safari/iOS where available.
- Quét QR bằng 2 thiết bị/QR decoder; test card dán trên vật phẩm thật, contrast đủ cao.
- PDF A4/A5 in thử hoặc render visual screenshot và xem QR có quét được.
- Các mẫu P0 khác nhau rõ (layout, typography, motion, card style), animation không giật và không khóa nội dung.
- Kiểm thử mọi trạng thái: new, empty, loading, no permission, failed, success, expired, offline network.
- Check keyboard (tab focus, enter, Escape dialog) + reduced motion.
- Không để nút “Mua”, “Tải xuống”, “Xuất bản”, “Đăng ký”, “Xác nhận” là `onClick={() => {}}` rỗng, todo stub hoặc đường dẫn `#`.

---

## 20. ROADMAP THỰC THI THEO THỨ TỰ, KHÔNG LÀM DÀN TRẢI

### Milestone 0 — Project foundation [P0]
- Scaffold Next.js TS strict, UI, routes/shell, env validation, DB, Prisma migration, auth sessions, seed, test harness.
- Setup storage upload local/mock + S3 provider; setup worker/queue; Railway config & README.
- Admin bootstrap protected, role guards, API error handling, audit service.
- **Exit gate:** signup/login/dashboard/DB persisted, CI passes, developer can run app from README.

### Milestone 1 — Public catalog & 8 templates [P0]
- Occasion catalog + category filters + previews; 4 main verticals and eight visually distinct functioning template definitions.
- Template JSON schema, block registry, theme tokens, demo content, public preview pages.
- Landing responsive + templates + privacy/terms placeholder pages **marked needing legal review**.
- **Exit gate:** eight templates render correctly on mobile and desktop, no broken click paths.

### Milestone 2 — Creator editor -> publish [P0]
- Dynamic forms, image upload, revision autosave, optimistic locking, preview with shared renderer, publish/unpublish.
- Public invitation pages, privacy UNLISTED/PASSWORD/PUBLIC/ARCHIVED, RSVP, moderated guestbook, response question, countdown, basic analytics.
- **Exit gate:** creator complete end-to-end without DevTools, refresh and edit work, role tests pass.

### Milestone 3 — Share, QR, export [P0]
- Short links, QR PNG/SVG, download, copy share, public scan.
- Export jobs in worker with PNG/JPG/PDF, signed URL, retry status and QR print layout.
- **Exit gate:** output formats validated by automated tests, recipient QR opens content.

### Milestone 4 — Payment & affiliate [P0]
- Plan/feature entitlement, order/order lines, manual review flow (no fake paid).
- CTV approval, links/cookie attribution, commission ledger 10%, hold job, payout request/admin paid; refund/reversal and strong audit.
- **Exit gate:** E2E 11–15 green, amounts match ledger, idempotency tests pass.

### Milestone 5 — Shop partners + QR cards [P0]
- Shop application/approval, catalog/product edit, quote request states, permissions, basic shop dashboard.
- Admin QR card batch, secure activation, bind invitation, card share and scan status, printable batch QR.
- **Exit gate:** E2E 16–18 green, unauthorized users cannot claim/access others' resources.

### Milestone 6 — Production hardening & deploy [P0]
- Verify backups, monitoring, CSRF/rate limiting, uploaded media protections, privacy controls, legal review TODOs.
- CI pipeline, separate staging and production env, web/worker deployment, domain SSL, smoke tests.
- Run all E2E, resolve broken buttons, performance check, import/rebuild from clean DB on staging.
- **Exit gate:** §21 release checklist completed, evidence and command outputs recorded.

### Phase 1 [P1]
- Expand catalog templates by category (target 20–30 polished designs) and support generalized occasions.
- Guest personalization/invitation per guest; ticket check-in; timeline/poll/gift reveal; voice notes.
- Gift QR physical ordering/inventory more complete; shop quote/transaction reconciliation and terms.
- Better analytics, full creator history, support tooling, more polished SEO and marketing pages.

### Phase 2 [P2]
- AI writing assistance and image suggestions gated/charged appropriately; mini games; video exports; custom domains; multilanguage; carrier/shop provider integrations; optional native apps only after demand validated.

---

## 21. DEFINITION OF DONE — TRƯỚC KHI TUYÊN BỐ “ĐÃ CODE XONG”

### 21.1 Functional DoD
- [ ] Mọi trang P0 có thật, nav/CTA không chứa link placeholder.
- [ ] User đăng ký/đăng nhập/đổi mật khẩu, session/role chính xác.
- [ ] Chọn occasion/template, nhập dữ liệu, upload, preview, lưu, publish, edit sau publish hoạt động.
- [ ] Tối thiểu 8 template nhìn khác nhau và dùng chung data/render engine.
- [ ] Link mở bình thường với người nhận; QR tạo/download/scan đúng.
- [ ] Export PNG, JPG, PDF tải về được, ảnh/QR hiển thị tốt, bảo vệ quyền.
- [ ] RSVP, guestbook moderation, response question thực sự ghi DB.
- [ ] Dashboard invitation/stats/orders/gifts hiển thị data thật.
- [ ] Affiliate flow apply/approve/link/attribution/commission 10%/maturity/payout/refund chạy thật.
- [ ] Shop flow apply/approve/products/requests/status chạy thật.
- [ ] Gift card inventory/claim/bind/scan/revoke/audit hoạt động; không thể chiếm card người khác.
- [ ] P0 có admin đủ chức năng đối soát order, shop, affiliate, payouts.
- [ ] Không thể coi redirect hoặc ảnh chuyển khoản là “paid” nếu chưa verify/approve.

### 21.2 Engineering DoD
- [ ] `pnpm install`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, `pnpm worker:dev` (hoặc command tương đương được document) chạy trên máy mới.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build` pass.
- [ ] Prisma migrations tracked, seed idempotent, no hard-coded secrets/real personal data.
- [ ] Permission tests cover IDOR/cross-shop and private assets.
- [ ] Export/job errors visible and retryable; worker not block server.
- [ ] Money ledger accurate + refunds/webhooks idempotent, UTC/timezone tested.
- [ ] `.env.example`, `README.md`, `docs/SETUP.md`, `docs/DEPLOY.md`, `docs/API.md`, `docs/ADMIN_OPERATIONS.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/DECISIONS.md` up to date.
- [ ] Production/staging configs and health endpoints; legal compliance issues clearly flagged, not asserted resolved without review.

### 21.3 Deployment smoke test
1. Deploy staging on Railway with PostgreSQL/Redis, configured storage and worker.
2. Migrate DB, seed 8 templates, bootstrap admin.
3. Signup with real/sandbox email, publish invitation from mobile viewport.
4. Open link public via new browser/device; create RSVP.
5. Export image/PDF; scan QR from phone.
6. Simulate manual paid review; check premium entitlement and CTV commission 10%.
7. Make shop request, claim QR card, scan card.
8. Inspect Railway logs for runtime errors, worker failures; restore backup dry-run.
9. Only then mark release candidate ready; final payment provider and legal assessment may still be blocking for commercial launch.

---

## 22. CONFIG, SETUP & DEPLOYMENT CONTRACT

### 22.1 `.env.example` fields (fake placeholders only)

```dotenv
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=MomentLink
APP_TIMEZONE=Asia/Ho_Chi_Minh

DATABASE_URL=postgresql://user:password@localhost:5432/momentlink
REDIS_URL=redis://localhost:6379
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace_with_secure_random_value

STORAGE_PROVIDER=s3
S3_ENDPOINT=https://example-storage-endpoint.invalid
S3_REGION=auto
S3_BUCKET=momentlink-dev
S3_ACCESS_KEY_ID=replace_me
S3_SECRET_ACCESS_KEY=replace_me
S3_PUBLIC_BASE_URL=

EMAIL_PROVIDER=console
EMAIL_FROM=no-reply@example.com
RESEND_API_KEY=

PAYMENT_MODE=manual_review
PAYMENT_PROVIDER=
PAYMENT_WEBHOOK_SECRET=
BANK_TRANSFER_DISPLAY_NAME=
BANK_TRANSFER_ACCOUNT_NUMBER=
BANK_TRANSFER_BANK_CODE=

GIFT_CARD_ACTIVATION_PEPPER=replace_with_long_secret
DATA_ENCRYPTION_KEY=replace_with_valid_generated_key
ADMIN_BOOTSTRAP_EMAIL=admin@example.com

EXPORT_WORKER_CONCURRENCY=2
EXPORT_JOB_TIMEOUT_MS=60000
RATE_LIMIT_ENABLED=true
```

- Không echo secrets vào logs; `NEXT_PUBLIC_` chỉ cho fields thật sự public. 
- Bootstrap admin qua CLI một lần và yêu cầu đổi credential + MFA trước production.
- Nếu chưa có S3/Redis ở local, hỗ trợ Docker Compose local services (Postgres/Redis/MinIO/Mailpit) hoặc một documented test/dev mode tương đương. Không dùng local disk production để lưu uploads/exports.
- Migrations chạy trước service deploy (Railway pre-deploy command); tránh `prisma db push` production.

### 22.2 Package scripts đề nghị

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "worker:dev": "tsx watch src/worker/index.ts",
    "worker:start": "node dist-worker/index.js",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

**Ghi chú:** commands minh họa, phải điều chỉnh build worker đúng thực tế; `worker:start` chỉ hợp lệ khi có script build sinh ra `dist-worker/index.js`. Không được để script không chạy.

### 22.3 CI/CD
- GitHub Actions hoặc CI tương đương: install locked dependencies -> generate Prisma -> lint -> typecheck -> unit/integration -> build -> E2E against test DB -> report artifacts.
- Staging deploy từ branch develop, production từ main/tag với migration kế hoạch.
- Backup pre-migration + rollback plan; nếu migration breaking, triển khai expand/contract.
- Railway setup web/worker env reference variables private networks; use readiness probes, reserve resources for Playwright browsers and memory.

---

## 23. PRODUCT ANALYTICS & COMMERCIAL KPIs

### 23.1 KPI giai đoạn đầu
- Visit -> click template -> start editor -> save draft -> publish -> share -> recipient opens -> RSVP.
- Conversion từ Free -> Paid; average order value; cost per export, storage per active invite.
- Affiliate: clicks validated -> registered users -> paid conversions, refund rate, pending vs paid commissions, fraud cases.
- Shop: visits -> product clicks -> quote requests -> accepted/completed; tỷ lệ shop phản hồi.
- Gift QR: cards activated / cards issued, scans/card, gift pages opened, repeat purchases.

### 23.2 Privacy guardrails
- Dùng aggregate metrics và opt-in marketing analytics nếu cần; không tự động lấy danh bạ/social graph.
- Affiliate/Shop không được truy cập chi tiết guest RSVP, địa chỉ/email của khách ngoài scope và consent.
- Đo lường conversion cẩn trọng, không quảng cáo “100% mở xem” chỉ dựa trên QR scan (bot/previews gây nhiễu).

---

## 24. TÀI LIỆU THAM KHẢO KỸ THUẬT & PHÁP LÝ

*Các nguồn này được kiểm tra ngày 04/11/2026. Khi triển khai, Codex phải xác thực lại docs theo version trong lockfile.*

- Railway — Next.js with PostgreSQL, deployments/migrations: https://railway.com/guides/nextjs
- Railway — Full-stack Next.js with workers/Redis/storage: https://railway.com/guides/fullstack-nextjs
- Better Auth Prisma adapter documentation: https://better-auth.com/docs/adapters/prisma
- Prisma guide for Next.js + Better Auth: https://www.prisma.io/docs/guides/authentication/better-auth/nextjs
- Railway PostgreSQL and backup guidance: https://docs.railway.com/databases/postgresql
- Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (hiệu lực 01/01/2026): https://vanban.chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroup=
- Playwright docs: https://playwright.dev/docs/api/class-page (screenshot/pdf). Kiểm tra PDF CSS/Chromium-specific behaviors theo version.

**Không suy diễn rằng thư viện/cổng thanh toán/tên miền/đối tác luôn sẵn có:** kiểm tra API, chi phí, SLA và điều kiện thương mại khi tích hợp thực tế.

---

## PHỤ LỤC A — CATALOG DỊP ĐẦY ĐỦ ĐỂ SEED DATABASE

> Trạng thái code: dùng `enabledForCreation` theo preset/template đã hoàn tất, `isDiscoverable` để người dùng xem catalog, `comingSoon` cho các use cases chưa có mẫu. Tên/slug trong DB nên xử lý Unicode tiếng Việt nhất quán và độc nhất, không để trùng do cùng một dịp xuất hiện ở nhiều chủ đề.

### A1. Tình yêu & lãng mạn

1. Tỏ tình
2. Hẹn hò lần đầu
3. Mời đi date
4. Kỷ niệm 1 tháng yêu
5. Kỷ niệm 100 ngày yêu
6. Kỷ niệm 1 năm yêu
7. Kỷ niệm ngày gặp nhau
8. Valentine
9. White Valentine
10. Cầu hôn
11. Xin lỗi người yêu
12. Làm hòa
13. Yêu xa
14. Tặng lời yêu bí mật
15. Hẹn hò bất ngờ
16. Lời chúc ngày 20/10

### A2. Cưới hỏi & hôn nhân

1. Thiệp báo hỷ
2. Lễ dạm ngõ
3. Lễ ăn hỏi
4. Lễ đính hôn
5. Lễ cưới
6. Tiệc cưới
7. Tiệc độc thân
8. Save the Date
9. Tiệc kỷ niệm ngày cưới
10. Kỷ niệm cưới bạc/vàng
11. Tiệc hậu hôn lễ
12. Thiệp cảm ơn khách cưới

### A3. Sinh nhật & trưởng thành

1. Sinh nhật cá nhân
2. Sinh nhật bất ngờ
3. Sinh nhật trẻ em
4. Sinh nhật 1 tuổi
5. Sinh nhật tuổi 18
6. Sinh nhật tuổi 20
7. Sinh nhật tuổi 30
8. Sinh nhật tuổi 50
9. Mừng thọ
10. Half Birthday
11. Tiệc thôi nôi
12. Tiệc đầy tháng
13. Tiệc trưởng thành

### A4. Học tập & tốt nghiệp

1. Lễ tốt nghiệp THCS
2. Lễ tốt nghiệp THPT
3. Lễ tốt nghiệp đại học
4. Lễ tốt nghiệp thạc sĩ
5. Lễ nhận bằng tiến sĩ
6. Lễ bảo vệ luận văn
7. Lễ nhận học bổng
8. Tiệc chia tay lớp
9. Họp lớp
10. Lễ tri ân thầy cô
11. Lễ trưởng thành
12. Ngày Nhà giáo 20/11

### A5. Gia đình & nhà cửa

1. Tân gia
2. Khánh thành nhà mới
3. Ngày của Mẹ
4. Ngày của Cha
5. Ngày Gia đình
6. Đoàn tụ gia đình
7. Mời ăn cơm gia đình
8. Lễ đầy tháng
9. Lễ thôi nôi
10. Baby Shower
11. Gender Reveal
12. Chào đón em bé
13. Kỷ niệm gia đình

### A6. Bạn bè & cộng đồng

1. Mời cà phê
2. Mời đi chơi
3. Tiệc ngủ
4. Tiệc BBQ
5. Dã ngoại
6. Picnic
7. Tiệc chia tay
8. Farewell Party
9. Welcome Party
10. Tiệc tái ngộ
11. Friendship Day
12. Tặng lời cảm ơn

### A7. Công việc & doanh nghiệp

1. Khai trương cửa hàng
2. Grand Opening
3. Soft Opening
4. Ra mắt sản phẩm
5. Ra mắt thương hiệu
6. Hội thảo
7. Workshop
8. Networking
9. Company Anniversary
10. Year-End Party
11. Tiệc tất niên
12. Tiệc tân niên
13. Lễ thăng chức
14. Tiệc nghỉ hưu
15. Company Retreat
16. Gala Dinner

### A8. Lễ hội & ngày đặc biệt

1. Tết Nguyên đán
2. Trung thu
3. Giáng sinh
4. Năm mới
5. Halloween
6. Lễ Phục sinh
7. Ngày Quốc tế Phụ nữ 8/3
8. Ngày Phụ nữ Việt Nam 20/10
9. Ngày Quốc tế Thiếu nhi
10. Ngày Quốc tế Hạnh phúc
11. Ngày Nhà giáo Việt Nam
12. Lễ hội văn hóa

### A9. Cảm xúc & thông điệp cá nhân

1. Thư cảm ơn
2. Thư xin lỗi
3. Thư động viên
4. Thư chúc may mắn
5. Thư gửi tương lai
6. Time Capsule
7. Thiệp chúc thi tốt
8. Thiệp chúc nhận việc
9. Thiệp chúc đi du học
10. Thiệp nhớ bạn
11. Thiệp chào tạm biệt
12. Thiệp cổ vũ tinh thần

### A10. Quà tặng & trải nghiệm

1. Tặng hoa kèm QR
2. Tặng hộp quà bất ngờ
3. Tặng chocolate
4. Tặng gấu bông
5. Tặng voucher
6. Tặng vé xem phim
7. Tặng vé concert
8. Tặng chuyến du lịch
9. Tặng album ảnh kỷ niệm
10. Tặng lời nhắn giọng nói
11. Tặng video bí mật
12. Thiệp mở hộp quà ảo

**Quy tắc dedupe:** `Lễ thôi nôi` và `Tiệc thôi nôi` có thể là hai cách hiển thị theo context nhưng nên quy về canonical occasion + aliases khi phù hợp; tương tự `Ngày Nhà giáo 20/11` và `Ngày Nhà giáo Việt Nam`, `Tiệc tất niên` và `Year-End Party`. Bộ taxonomy là **danh sách chủ đề/nhu cầu**, không đảm bảo 130 unique occasion types sau deduplication; seed canonical slugs là nguồn sự thật cuối.

---

## PHỤ LỤC B — CODEX IMPLEMENTATION CONTRACT (COPY-READY)

**Khi mở repo trong Codex, hãy gửi prompt sau (tên file đặt đúng `spec.md` ở root):**

> Hãy đọc toàn bộ `spec.md` ở thư mục gốc trước khi thay đổi code. Đây là source of truth cho sản phẩm. Hãy khảo sát repo, tạo `docs/IMPLEMENTATION_STATUS.md` và `docs/DECISIONS.md`, chia việc theo milestone §20. Triển khai **P0 end-to-end** trước: auth -> catalog/template -> editor -> publish -> recipient -> QR/link -> PNG/JPG/PDF -> RSVP/guestbook -> payments/manual review -> affiliate 10% -> shop partner -> QR gift card -> admin. Dùng database thật, role checks, migrations, seed, tests, responsive UI. Không để bất kỳ nút P0 nào chỉ để trang trí hoặc dữ liệu mock production. Mỗi milestone phải tự chạy build, typecheck, test và browser E2E; sửa lỗi phát hiện được trước khi chuyển bước. Sau khi hoàn thành, cập nhật IMPLEMENTATION_STATUS, báo cáo chính xác mục nào DONE/BLOCKED, file nào thay đổi, command test và cách chạy/deploy. Không đánh dấu DONE với chức năng chưa test. Nếu thiếu API key ngoài thì triển khai adapter sandbox/manual-review có hoạt động thực tế và ghi rõ giới hạn, không giả mạo thanh toán thành công.

**Quy định bổ sung nếu Codex bị giới hạn context/session:** Phải checkpoint status/file ngay sau mỗi milestone, không khởi động lại từ đầu; lần sau đọc `spec.md` và `docs/IMPLEMENTATION_STATUS.md` để tiếp tục. Hoàn thành P0 ở mức chất lượng trước, không dàn trải P1/P2.

---

**END OF SPEC v1.0**
