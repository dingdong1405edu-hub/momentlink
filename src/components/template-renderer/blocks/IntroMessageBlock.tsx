"use client";

import { Quote } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface IntroMessageBlockProps {
  message?: string;
  theme: TemplateTheme;
}

export default function IntroMessageBlock({ message, theme }: IntroMessageBlockProps) {
  if (!message) return null;

  return (
    <div className="my-8 px-4 max-w-lg mx-auto">
      <div
        className="p-6 sm:p-8 rounded-3xl shadow-sm border relative text-center"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: `${theme.accent}30`,
        }}
      >
        <Quote
          className="w-8 h-8 mx-auto mb-3 opacity-30 transform -rotate-12"
          style={{ color: theme.accent }}
        />
        <p
          className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif italic"
          style={{ color: theme.foreground }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

