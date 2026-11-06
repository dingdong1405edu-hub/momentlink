import crypto from "crypto";

export function slugifyVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

export const generateSlug = slugifyVietnamese;

export function generateUniqueSlug(title: string): string {
  const base = slugifyVietnamese(title) || "thiep-moi";
  const suffix = crypto.randomBytes(3).toString("hex"); // 6 chars random
  return `${base}-${suffix}`;
}

export function generateShortCode(): string {
  // 7 alphanumeric characters
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  const bytes = crypto.randomBytes(7);
  for (let i = 0; i < 7; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

