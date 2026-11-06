import { InvitationContent } from "./schema";

export interface TemplateTheme {
  name: string;
  style: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  cardBg: string;
  fontFamily: "serif" | "sans";
}

export interface TemplateMeta {
  slug: string;
  title: string;
  occasionKey: "wedding" | "graduation" | "birthday" | "love";
  occasionTitle: string;
  description: string;
  isPremium: boolean;
  theme: TemplateTheme;
  blocks: string[];
}

export const TEMPLATES_REGISTRY: Record<string, TemplateMeta> = {
  "wedding-classic": {
    slug: "wedding-classic",
    title: "Ivory Ceremony",
    occasionKey: "wedding",
    occasionTitle: "Lễ cưới & Hôn nhân",
    description: "Tông kem - vàng champagne trang nhã, phong bì ảo sang trọng, đếm ngược và RSVP tinh tế.",
    isPremium: false,
    theme: {
      name: "Ivory Ceremony",
      style: "Kem - vàng champagne",
      background: "#faf8f5",
      foreground: "#2d241e",
      accent: "#d4af37",
      muted: "#8c7e75",
      cardBg: "#ffffff",
      fontFamily: "serif",
    },
    blocks: ["cover", "envelope_reveal", "intro_message", "event_details", "countdown", "gallery", "rsvp", "guestbook", "footer_cta"],
  },
  "wedding-floral": {
    slug: "wedding-floral",
    title: "Bloom & Vows",
    occasionKey: "wedding",
    occasionTitle: "Lễ cưới & Hôn nhân",
    description: "Hoa pastel thanh lịch, lãng mạn nhẹ nhàng, bố cục tạp chí hiện đại cho ngày chung đôi.",
    isPremium: true,
    theme: {
      name: "Bloom & Vows",
      style: "Hoa pastel thanh lịch",
      background: "#fdf8f7",
      foreground: "#3a2d2e",
      accent: "#e28787",
      muted: "#998082",
      cardBg: "#ffffff",
      fontFamily: "serif",
    },
    blocks: ["cover", "intro_message", "gallery", "event_details", "rsvp", "footer_cta"],
  },
  "graduation-classic": {
    slug: "graduation-classic",
    title: "The Next Chapter",
    occasionKey: "graduation",
    occasionTitle: "Lễ tốt nghiệp",
    description: "Xanh navy & vàng gold trang trọng, học thuật, tôn vinh cột mốc tốt nghiệp đáng nhớ.",
    isPremium: false,
    theme: {
      name: "The Next Chapter",
      style: "Xanh navy & vàng gold",
      background: "#0f172a",
      foreground: "#f8fafc",
      accent: "#f59e0b",
      muted: "#94a3b8",
      cardBg: "#1e293b",
      fontFamily: "serif",
    },
    blocks: ["cover", "intro_message", "event_details", "countdown", "gallery", "rsvp", "footer_cta"],
  },
  "graduation-playful": {
    slug: "graduation-playful",
    title: "Grad Party!",
    occasionKey: "graduation",
    occasionTitle: "Tiệc tốt nghiệp",
    description: "Tươi trẻ năng động, confetti rực rỡ, kỷ niệm thanh xuân cùng bạn bè và thầy cô.",
    isPremium: false,
    theme: {
      name: "Grad Party!",
      style: "Confetti tươi trẻ",
      background: "#f0fdf4",
      foreground: "#14532d",
      accent: "#16a34a",
      muted: "#4ade80",
      cardBg: "#ffffff",
      fontFamily: "sans",
    },
    blocks: ["cover", "event_details", "gallery", "response_question", "guestbook", "footer_cta"],
  },
  "birthday-fun": {
    slug: "birthday-fun",
    title: "Confetti Pop",
    occasionKey: "birthday",
    occasionTitle: "Sinh nhật",
    description: "Đáng yêu, pháo hoa giấy và niềm vui rộn rã đón tuổi mới cùng gia đình và bạn bè.",
    isPremium: false,
    theme: {
      name: "Confetti Pop",
      style: "Hồng đào & Confetti",
      background: "#fff1f2",
      foreground: "#881337",
      accent: "#f43f5e",
      muted: "#fb7185",
      cardBg: "#ffffff",
      fontFamily: "sans",
    },
    blocks: ["envelope_reveal", "cover", "countdown", "event_details", "rsvp", "footer_cta"],
  },
  "birthday-minimal": {
    slug: "birthday-minimal",
    title: "Candlelight",
    occasionKey: "birthday",
    occasionTitle: "Sinh nhật",
    description: "Ánh nến ấm áp, tông trầm tối giản, không gian riêng tư cho buổi tiệc sinh nhật ấm cúng.",
    isPremium: true,
    theme: {
      name: "Candlelight",
      style: "Ánh nến tối giản",
      background: "#18181b",
      foreground: "#fafafa",
      accent: "#fbbf24",
      muted: "#a1a1aa",
      cardBg: "#27272a",
      fontFamily: "serif",
    },
    blocks: ["cover", "intro_message", "event_details", "gallery", "guestbook", "footer_cta"],
  },
  "love-letter": {
    slug: "love-letter",
    title: "Secret Letter",
    occasionKey: "love",
    occasionTitle: "Tình yêu & Tỏ tình",
    description: "Phong thư cổ điển, nét mực viết tay, gửi gắm những lời yêu thương chưa từng thổ lộ.",
    isPremium: false,
    theme: {
      name: "Secret Letter",
      style: "Giấy thư phong bì cổ điển",
      background: "#fefae0",
      foreground: "#283618",
      accent: "#bc6c25",
      muted: "#dda15e",
      cardBg: "#ffffff",
      fontFamily: "serif",
    },
    blocks: ["envelope_reveal", "intro_message", "gallery", "response_question", "footer_cta"],
  },
  "love-galaxy": {
    slug: "love-galaxy",
    title: "Written in the Stars",
    occasionKey: "love",
    occasionTitle: "Kỷ niệm tình yêu",
    description: "Bầu trời đêm ngàn vì sao lấp lánh, bản tình ca du dương và lời hẹn ước mãi mãi.",
    isPremium: true,
    theme: {
      name: "Written in the Stars",
      style: "Đêm sao kỳ ảo & Tím mộng mơ",
      background: "#09090b",
      foreground: "#f4f4f5",
      accent: "#a855f7",
      muted: "#71717a",
      cardBg: "#18181b",
      fontFamily: "serif",
    },
    blocks: ["cover", "intro_message", "gallery", "music_control", "response_question", "footer_cta"],
  },
};

export function getTemplateDemoContent(slug: string): InvitationContent {
  const meta = TEMPLATES_REGISTRY[slug] || TEMPLATES_REGISTRY["wedding-classic"];

  switch (slug) {
    case "wedding-classic":
      return {
        schemaVersion: 1,
        occasionKey: "wedding",
        locale: "vi-VN",
        title: "Lễ Thành Hôn: Hoàng Long & Minh Thư",
        subtitle: "Hành trình yêu thương bước sang trang mới",
        people: [
          { role: "groom", displayName: "Hoàng Long" },
          { role: "bride", displayName: "Minh Thư" },
        ],
        event: {
          startsAt: "2027-10-18T10:30:00+07:00",
          endsAt: "2027-10-18T14:00:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          venueName: "Trung tâm Hội nghị The Adora Center",
          address: "431 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM",
          mapsUrl: "https://maps.google.com",
        },
        message: "Hạnh phúc lớn nhất là khi tình yêu tìm được bến đỗ bình yên. Trân trọng kính mời bạn và người thương đến chung vui cùng gia đình chúng mình!",
        coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        ],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: {
          rsvp: true,
          guestbook: true,
          backgroundMusicUrl: null,
          giftTransferInfo: {
            enabled: true,
            bankName: "Techcombank",
            accountNumber: "1903686868888",
            accountHolder: "HOANG LONG & MINH THU",
          },
        },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "wedding-floral":
      return {
        schemaVersion: 1,
        occasionKey: "wedding",
        locale: "vi-VN",
        title: "Save our Date: Quốc Bảo & Thanh Hương",
        subtitle: "Gặp gỡ là duyên, ở bên nhau là định mệnh",
        people: [
          { role: "groom", displayName: "Quốc Bảo" },
          { role: "bride", displayName: "Thanh Hương" },
        ],
        event: {
          startsAt: "2027-11-20T17:30:00+07:00",
          endsAt: "2027-11-20T21:30:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          venueName: "Gem Center — Grand Ballroom",
          address: "8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP.HCM",
          mapsUrl: "https://maps.google.com",
        },
        message: "Chúng mình sắp về chung một nhà. Hãy cùng lưu giữ khoảnh khắc ngọt ngào này bên hoa tươi và những lời chúc tốt lành nhất.",
        coverImageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
        ],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: true, guestbook: false },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "graduation-classic":
      return {
        schemaVersion: 1,
        occasionKey: "graduation",
        locale: "vi-VN",
        title: "Lễ Tốt Nghiệp Bác Sĩ: Minh Khang",
        subtitle: "Khép lại 6 năm giảng đường — Khởi đầu hành trình cứu người",
        people: [{ role: "graduate", displayName: "Lê Minh Khang" }],
        event: {
          startsAt: "2027-06-28T08:00:00+07:00",
          endsAt: "2027-06-28T11:30:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          venueName: "Hội trường Lớn — ĐH Y Dược TP.HCM",
          address: "217 Hồng Bàng, Phường 11, Quận 5, TP.HCM",
          mapsUrl: "https://maps.google.com",
        },
        message: "Chặng đường đại học đầy thử thách đã đi đến ngày hái quả ngọt. Sự hiện diện và lời chúc của bạn sẽ là món quà vô giá tiếp sức cho Khang!",
        coverImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
        ],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: true, guestbook: false },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "graduation-playful":
      return {
        schemaVersion: 1,
        occasionKey: "graduation",
        locale: "vi-VN",
        title: "Graduation Party: Chúng Ta Tốt Nghiệp Rồi!",
        subtitle: "Tạm biệt áo trắng, tạm biệt những buổi trốn học cùng nhau",
        people: [{ role: "graduate", displayName: "Tập thể 12A1 K65" }],
        event: {
          startsAt: "2027-07-05T18:00:00+07:00",
          endsAt: "2027-07-05T22:00:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          venueName: "Vườn Bia Kỷ Niệm Rooftop",
          address: "99 Điện Biên Phủ, Bình Thạnh, TP.HCM",
          mapsUrl: "https://maps.google.com",
        },
        message: "Tiệc quẩy chia tay thanh xuân, có đồ ăn ngon, bia lạnh và một bầu trời kỷ niệm không bao giờ phai. Đừng vắng mặt nhé!",
        coverImageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: false, guestbook: true },
        responseQuestion: {
          question: "Bạn sẽ đến đúng giờ chứ?",
          options: ["Chắc chắn có mặt!", "Đang bận nhưng sẽ cố gắng", "Bận việc gia đình mất rồi"],
        },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "birthday-fun":
      return {
        schemaVersion: 1,
        occasionKey: "birthday",
        locale: "vi-VN",
        title: "Tiệc Sinh Nhật Tuổi 20 Của Bảo Ngọc",
        subtitle: "Chào tuổi 20 rực rỡ và tràn đầy ước mơ",
        people: [{ role: "celebrant", displayName: "Bảo Ngọc" }],
        event: {
          startsAt: "2027-09-15T18:30:00+07:00",
          endsAt: "2027-09-15T22:00:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          venueName: "The Pink Cafe & Bistro",
          address: "52 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM",
          mapsUrl: "https://maps.google.com",
        },
        message: "Cùng Ngọc thổi nến, cắt bánh sinh nhật và chụp những bức hình thật dễ thương nhé! Dress code: Hồng hoặc Trắng nha.",
        coverImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: true, guestbook: false },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "birthday-minimal":
      return {
        schemaVersion: 1,
        occasionKey: "birthday",
        locale: "vi-VN",
        title: "Dinner & Wine: Mừng Sinh Nhật Tuấn Anh",
        subtitle: "Một buổi tối nhẹ nhàng bên những người bạn tri kỷ",
        people: [{ role: "celebrant", displayName: "Tuấn Anh" }],
        event: {
          startsAt: "2027-08-10T19:00:00+07:00",
          endsAt: "2027-08-10T22:30:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          venueName: "Le Corto Restaurant",
          address: "5D Nguyễn Siêu, Bến Nghé, Quận 1, TP.HCM",
          mapsUrl: "https://maps.google.com",
        },
        message: "Thêm một tuổi mới bình an và trưởng thành. Mời bạn ghé dùng bữa tối ấm cúng và thưởng thức ly vang ngon cùng Tuấn Anh.",
        coverImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: false, guestbook: true },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "love-letter":
      return {
        schemaVersion: 1,
        occasionKey: "love",
        locale: "vi-VN",
        title: "Gửi Đến Em — Điều Anh Chưa Từng Nói",
        subtitle: "Mở phong thư bí mật dành riêng cho người đặc biệt",
        people: [
          { role: "sender", displayName: "Một người thương thầm" },
          { role: "recipient", displayName: "Thuỳ Dương" },
        ],
        message: "Có những cảm xúc giấu kín bấy lâu nay. Cảm ơn em đã xuất hiện và làm thế giới của anh trở nên rạng ngời. Liệu cuối tuần này, anh có thể mời em một tách trà chiều không?",
        coverImageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
        ],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: false, guestbook: false },
        responseQuestion: {
          question: "Em có muốn đi cà phê cùng anh không?",
          options: ["Anh qua đón em nhé! ✨", "Để em suy nghĩ thêm một chút nha", "Chúng mình làm bạn thôi nhé"],
        },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    case "love-galaxy":
      return {
        schemaVersion: 1,
        occasionKey: "love",
        locale: "vi-VN",
        title: "Kỷ Niệm 365 Ngày Bên Nhau: Nam & Hà",
        subtitle: "Giữa hàng tỷ vì sao, anh may mắn nhất vì đã tìm thấy em",
        people: [
          { role: "partner1", displayName: "Hải Nam" },
          { role: "partner2", displayName: "Ngọc Hà" },
        ],
        message: "Một năm trôi qua với biết bao tiếng cười và cả những lúc giận hờn. Cảm ơn vì em luôn ở đó, cùng anh viết nên câu chuyện đẹp nhất đời mình.",
        coverImageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
        galleryUrls: [
          "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
        ],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: false, guestbook: false, backgroundMusicUrl: "/audio/sample-love.mp3" },
        responseQuestion: {
          question: "Năm sau vẫn nắm tay anh đi khắp thế gian chứ?",
          options: ["Mãi mãi bên anh! 💖", "Tất nhiên rồi chàng trai ngốc!"],
        },
        blocks: meta.blocks.map((type, i) => ({ id: `blk_${i}`, type: type as any, enabled: true })),
      };

    default:
      return getTemplateDemoContent("wedding-classic");
  }
}

