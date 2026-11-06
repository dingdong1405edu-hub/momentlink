import { describe, it, expect } from "vitest";
import { TEMPLATES_REGISTRY, getTemplateDemoContent } from "@/lib/templates/registry";
import { InvitationContentSchema } from "@/lib/templates/schema";

describe("Milestone 1: Template Engine & Catalog Unit Tests", () => {
  const expectedTemplates = [
    "wedding-classic",
    "wedding-floral",
    "graduation-classic",
    "graduation-playful",
    "birthday-fun",
    "birthday-minimal",
    "love-letter",
    "love-galaxy",
  ];

  it("should have all 8 P0 templates registered", () => {
    for (const slug of expectedTemplates) {
      expect(TEMPLATES_REGISTRY[slug]).toBeDefined();
      expect(TEMPLATES_REGISTRY[slug].title).toBeTruthy();
      expect(TEMPLATES_REGISTRY[slug].theme.style).toBeTruthy();
      expect(TEMPLATES_REGISTRY[slug].blocks.length).toBeGreaterThan(0);
    }
  });

  it("should have distinct visual themes and palettes across templates", () => {
    const bgColors = expectedTemplates.map((slug) => TEMPLATES_REGISTRY[slug].theme.background);
    const uniqueBgs = new Set(bgColors);
    // 8 distinct templates must not just duplicate background colors
    expect(uniqueBgs.size).toBeGreaterThanOrEqual(6);
  });

  it("should generate valid InvitationContent conforming to Zod schema for all 8 templates", () => {
    for (const slug of expectedTemplates) {
      const demo = getTemplateDemoContent(slug);
      const parsed = InvitationContentSchema.safeParse(demo);
      if (!parsed.success) {
        console.error(`Failed schema for ${slug}:`, parsed.error);
      }
      expect(parsed.success).toBe(true);
      expect(demo.title).toBeTruthy();
      expect(demo.blocks.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("should fail validation if title is empty", () => {
    const invalid = {
      schemaVersion: 1,
      occasionKey: "wedding",
      locale: "vi-VN",
      title: "", // Empty title
      blocks: [],
    };
    const parsed = InvitationContentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

