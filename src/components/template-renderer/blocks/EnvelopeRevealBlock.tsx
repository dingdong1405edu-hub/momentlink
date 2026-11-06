"use client";

import { useEffect, useState } from "react";
import { Mail, Sparkles, Heart } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface EnvelopeRevealBlockProps {
  title: string;
  subtitle?: string;
  theme: TemplateTheme;
  slug?: string;
}

export default function EnvelopeRevealBlock({
  title,
  subtitle,
  theme,
  slug = "default",
}: EnvelopeRevealBlockProps) {
  const [opened, setOpened] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check if envelope was already opened in this session
    const storageKey = `env_opened_${slug}`;
    const wasOpened = sessionStorage.getItem(storageKey);
    if (!wasOpened) {
      setOpened(false);
    }
  }, [slug]);

  const handleOpen = () => {
    setAnimating(true);
    setTimeout(() => {
      setOpened(true);
      setAnimating(false);
      sessionStorage.setItem(`env_opened_${slug}`, "true");
    }, 600);
  };

  if (opened) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className={`w-full max-w-sm p-8 rounded-3xl text-center shadow-2xl transition-all duration-500 transform ${
          animating ? "scale-90 opacity-0 -translate-y-6" : "scale-100 opacity-100"
        }`}
        style={{
          backgroundColor: theme.cardBg,
          color: theme.foreground,
          borderColor: theme.accent,
          borderWidth: 2,
        }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-md"
          style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
        >
          <Mail className="w-8 h-8" />
        </div>

        <span
          className="text-xs uppercase tracking-widest font-semibold block mb-2"
          style={{ color: theme.accent }}
        >
          Thư mời dành riêng cho bạn
        </span>

        <h3 className="text-xl font-bold font-serif mb-2">{title}</h3>
        {subtitle && <p className="text-xs opacity-75 mb-6">{subtitle}</p>}

        <button
          onClick={handleOpen}
          className="w-full py-3.5 px-6 rounded-full font-semibold text-sm text-white shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.accent }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mở thư mời</span>
        </button>
      </div>
    </div>
  );
}

