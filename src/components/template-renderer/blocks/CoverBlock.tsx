"use client";

import { Sparkles, Heart } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";
import { PersonSchema } from "@/lib/templates/schema";
import { z } from "zod";

type Person = z.infer<typeof PersonSchema>;

interface CoverBlockProps {
  title: string;
  subtitle?: string;
  people?: Person[];
  coverImageUrl?: string;
  theme: TemplateTheme;
}

export default function CoverBlock({
  title,
  subtitle,
  people = [],
  coverImageUrl,
  theme,
}: CoverBlockProps) {
  return (
    <div className="relative overflow-hidden text-center py-12 px-4 sm:px-6">
      {/* Decorative Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-6 shadow-sm border"
        style={{
          backgroundColor: `${theme.accent}15`,
          color: theme.accent,
          borderColor: `${theme.accent}30`,
        }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Trân Trọng Kính Mời</span>
      </div>

      {/* People Display */}
      {people.length > 0 && (
        <div className="mb-4">
          <p
            className="text-2xl sm:text-4xl font-serif font-bold tracking-tight"
            style={{ color: theme.accent }}
          >
            {people.map((p) => p.displayName).join(" & ")}
          </p>
        </div>
      )}

      {/* Title */}
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight max-w-xl mx-auto leading-tight"
        style={{ color: theme.foreground }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base max-w-md mx-auto opacity-80" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      )}

      {/* Cover Image */}
      {coverImageUrl && (
        <div className="mt-8 max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border-4"
             style={{ borderColor: `${theme.accent}40` }}>
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

