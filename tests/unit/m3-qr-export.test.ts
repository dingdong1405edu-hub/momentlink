import { describe, it, expect, beforeAll } from "vitest";
import { generateQrPng, generateQrSvg } from "@/lib/qr";
import { renderExportBuffer } from "@/lib/exports";
import prisma from "@/lib/prisma";

describe("Milestone 3 — QR & Export Engine Unit Tests", () => {
  it("should generate a valid PNG QR code buffer", async () => {
    const pngBuffer = await generateQrPng("https://momentlink.vn/q/TESTCODE1", {
      width: 256,
      margin: 2,
    });

    expect(pngBuffer).toBeInstanceOf(Buffer);
    expect(pngBuffer.length).toBeGreaterThan(100);

    // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(pngBuffer[0]).toBe(0x89);
    expect(pngBuffer[1]).toBe(0x50);
    expect(pngBuffer[2]).toBe(0x4e);
    expect(pngBuffer[3]).toBe(0x47);
  });

  it("should generate a valid SVG QR code string", async () => {
    const svgStr = await generateQrSvg("https://momentlink.vn/q/TESTCODE2");

    expect(typeof svgStr).toBe("string");
    expect(svgStr).toContain("<svg");
    expect(svgStr).toContain("</svg>");
    expect(svgStr).toContain("viewBox");
  });

  it("should render an export poster in PNG format with nonzero bytes", async () => {
    const { buffer, mimeType, ext } = await renderExportBuffer({
      title: "Lễ Tốt Nghiệp 2026",
      occasionName: "Lễ Tốt Nghiệp",
      content: {
        schemaVersion: 1,
        occasionKey: "graduation",
        locale: "vi-VN",
        title: "Lễ Tốt Nghiệp 2026",
        people: [{ role: "graduate", displayName: "Nguyễn Văn A" }],
        event: {
          startsAt: "2026-11-20 09:00",
          venueName: "Hội trường A - ĐHQG",
          address: "Linh Trung, Thủ Đức, TP.HCM",
        },
        message: "Kính mời quý thầy cô và bạn bè tới chung vui cùng tôi!",
        galleryUrls: [],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: true, guestbook: false },
        blocks: [],
      },
      shortUrl: "https://momentlink.vn/q/GRAD2026",
      format: "PNG",
      sizePreset: "POSTER_4_5",
    });

    expect(mimeType).toBe("image/png");
    expect(ext).toBe("png");
    expect(buffer.length).toBeGreaterThan(1000);
    // PNG magic bytes
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
  });

  it("should render an export poster in JPG format with nonzero bytes", async () => {
    const { buffer, mimeType, ext } = await renderExportBuffer({
      title: "Lễ Thành Hôn",
      occasionName: "Đám Cưới",
      content: {
        schemaVersion: 1,
        occasionKey: "wedding",
        locale: "vi-VN",
        title: "Lễ Thành Hôn",
        people: [
          { role: "groom", displayName: "Minh Tuấn" },
          { role: "bride", displayName: "Hương Giang" },
        ],
        event: {
          startsAt: "2026-12-15 18:00",
          venueName: "Trung tâm Hội nghị White Palace",
          address: "Phú Nhuận, TP.HCM",
        },
        message: "Trân trọng kính mời quý khách tới dự bữa cơm thân mật cùng gia đình chúng tôi.",
        galleryUrls: [],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: true, guestbook: false },
        blocks: [],
      },
      shortUrl: "https://momentlink.vn/q/WEDDING1",
      format: "JPG",
      sizePreset: "POSTER_4_5",
    });

    expect(mimeType).toBe("image/jpeg");
    expect(ext).toBe("jpg");
    expect(buffer.length).toBeGreaterThan(1000);
    // JPEG magic bytes
    expect(buffer[0]).toBe(0xff);
    expect(buffer[1]).toBe(0xd8);
  });

  it("should render an export poster in vector PDF format with nonzero bytes", async () => {
    const { buffer, mimeType, ext } = await renderExportBuffer({
      title: "Tiệc Sinh Nhật",
      occasionName: "Sinh Nhật",
      content: {
        schemaVersion: 1,
        occasionKey: "birthday",
        locale: "vi-VN",
        title: "Tiệc Sinh Nhật",
        people: [{ role: "celebrant", displayName: "Bé An An (1 tuổi)" }],
        event: {
          startsAt: "2026-11-25 18:30",
          venueName: "Nhà hàng En Tea House",
          address: "Quận 3, TP.HCM",
        },
        message: "Mời bạn đến dự tiệc thôi nôi của bé An An!",
        galleryUrls: [],
        privacy: { mode: "UNLISTED", allowIndexing: false },
        features: { rsvp: true, guestbook: false },
        blocks: [],
      },
      shortUrl: "https://momentlink.vn/q/BDAY2026",
      format: "PDF",
      sizePreset: "A4",
    });

    expect(mimeType).toBe("application/pdf");
    expect(ext).toBe("pdf");
    expect(buffer.length).toBeGreaterThan(1000);
    // PDF signature %PDF
    const pdfHeader = buffer.subarray(0, 5).toString("utf-8");
    expect(pdfHeader).toContain("%PDF");
  });
});

