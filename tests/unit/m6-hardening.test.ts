import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { generateUniqueSlug, generateShortCode, slugifyVietnamese } from "@/lib/utils/slug";

describe("Milestone 6: Production Hardening & Security Unit Tests", () => {
  it("should enforce rate limiting and reset after time window", () => {
    const key = `test_ip_${Date.now()}`;
    const limit = 3;
    const windowMs = 500;

    // 1st request -> allowed
    const r1 = checkRateLimit(key, limit, windowMs);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    // 2nd request -> allowed
    const r2 = checkRateLimit(key, limit, windowMs);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    // 3rd request -> allowed
    const r3 = checkRateLimit(key, limit, windowMs);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request -> blocked (429)
    const r4 = checkRateLimit(key, limit, windowMs);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("should sanitize and normalize Vietnamese slugs safely without SQL/XSS characters", () => {
    const dirty = "Lễ cưới <script>alert(1)</script> & Tuấn-Hà 100% #1 !!";
    const cleaned = slugifyVietnamese(dirty);

    expect(cleaned).not.toContain("<");
    expect(cleaned).not.toContain(">");
    expect(cleaned).not.toContain("%");
    expect(cleaned).not.toContain("#");
    expect(cleaned).not.toContain("!");
    expect(cleaned).toBe("le-cuoi-scriptalert1script-tuan-ha-100-1");
  });

  it("should generate cryptographically random unique slugs and short codes", () => {
    const s1 = generateUniqueSlug("Thiệp cưới");
    const s2 = generateUniqueSlug("Thiệp cưới");
    expect(s1).not.toBe(s2);
    expect(s1.startsWith("thiep-cuoi-")).toBe(true);

    const c1 = generateShortCode();
    const c2 = generateShortCode();
    expect(c1).toHaveLength(7);
    expect(c2).toHaveLength(7);
    expect(c1).not.toBe(c2);
  });
});
