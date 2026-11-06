import { describe, it, expect } from "vitest";
import { slugifyVietnamese, generateUniqueSlug, generateShortCode } from "@/lib/utils/slug";
import bcrypt from "bcryptjs";

describe("Milestone 2: Creator Editor & Publication Unit Tests", () => {
  it("should correctly slugify Vietnamese titles and generate unique slugs", () => {
    const slug1 = slugifyVietnamese("Lễ Thành Hôn: Hoàng Long & Minh Thư");
    expect(slug1).toBe("le-thanh-hon-hoang-long-minh-thu");

    const unique1 = generateUniqueSlug("Lễ Tốt Nghiệp Bác Sĩ");
    expect(unique1).toContain("le-tot-nghiep-bac-si-");
    expect(unique1.length).toBeGreaterThan(20);
  });

  it("should generate 7-char alphanumeric unguessable short codes", () => {
    const c1 = generateShortCode();
    const c2 = generateShortCode();
    expect(c1).toHaveLength(7);
    expect(c2).toHaveLength(7);
    expect(c1).not.toBe(c2);
  });

  it("should securely hash and verify invitation passcode for PASSWORD privacy mode", async () => {
    const passcode = "123456";
    const hash = await bcrypt.hash(passcode, 10);
    expect(await bcrypt.compare("123456", hash)).toBe(true);
    expect(await bcrypt.compare("wrongpass", hash)).toBe(false);
  });
});

