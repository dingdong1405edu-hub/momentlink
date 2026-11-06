import crypto from "crypto";
import prisma from "@/lib/prisma";

const PEPPER = process.env.GIFT_CARD_PEPPER || "ml_gift_secret_pepper_2026";

/**
 * Hash activation secret using SHA-256 + pepper.
 */
export function hashActivationSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret.trim() + PEPPER).digest("hex");
}

/**
 * Verify activation secret against stored hash.
 */
export function verifyActivationSecret(secret: string, storedHash: string): boolean {
  const computed = hashActivationSecret(secret);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}

/**
 * Generate a cryptographically random public code (10 chars).
 */
export function generatePublicCode(prefix = "GC"): string {
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `${prefix}${random}`;
}

/**
 * Generate a cryptographically random activation secret (16 chars).
 */
export function generateActivationSecret(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

