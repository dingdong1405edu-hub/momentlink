"use client";

import { useState } from "react";
import { Images, X } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface GalleryBlockProps {
  galleryUrls?: string[];
  theme: TemplateTheme;
}

export default function GalleryBlock({ galleryUrls = [], theme }: GalleryBlockProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!galleryUrls || galleryUrls.length === 0) return null;

  return (
    <div className="my-10 px-4 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
          style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
        >
          <Images className="w-3.5 h-3.5" />
          <span>Khoảnh Khắc Kỷ Niệm</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {galleryUrls.map((url, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(url)}
            className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm cursor-pointer border border-transparent hover:border-amber-400 transition-all"
          >
            <img
              src={url}
              alt={`Ảnh kỷ niệm ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Image Modal Preview */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedImage} alt="Xem ảnh phóng to" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

