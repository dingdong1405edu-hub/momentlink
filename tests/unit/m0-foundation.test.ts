import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateSecureToken } from "@/lib/auth/session";
import { LocalStorageAdapter } from "@/lib/storage";

describe("Milestone 0: Security & Foundation Unit Tests", () => {
  it("should hash passwords securely and verify accurately", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);

    const match = await verifyPassword(raw, hash);
    expect(match).toBe(true);

    const mismatch = await verifyPassword("WrongPassword", hash);
    expect(mismatch).toBe(false);
  });

  it("should generate cryptographically random 64-char hex tokens", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("should reject unsafe MIME types in LocalStorageAdapter", async () => {
    const adapter = new LocalStorageAdapter("./public/test-uploads");
    const testBuf = Buffer.from("fake script content");

    await expect(
      adapter.save(testBuf, "malicious.exe", "application/x-msdownload")
    ).rejects.toThrow("Định dạng tệp không được hỗ trợ");

    await expect(
      adapter.save(testBuf, "script.svg", "image/svg+xml")
    ).rejects.toThrow("Định dạng tệp không được hỗ trợ");
  });

  it("should allow valid image upload and generate random safe filename", async () => {
    const adapter = new LocalStorageAdapter("./public/test-uploads");
    const testBuf = Buffer.from("fake png header and content");
    const res = await adapter.save(testBuf, "my-avatar.png", "image/png");

    expect(res.storageKey).toMatch(/\.png$/);
    expect(res.publicUrl).toContain("/uploads/");
    expect(res.byteSize).toBe(testBuf.length);

    // Clean up
    await adapter.delete(res.storageKey);
  });
});

