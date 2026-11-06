"use client";

import { useState } from "react";
import { Heart, Sparkles, Check } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface ResponseQuestionBlockProps {
  question?: {
    question: string;
    options: string[];
  };
  slug?: string;
  theme: TemplateTheme;
  isPreview?: boolean;
}

export default function ResponseQuestionBlock({
  question,
  slug,
  theme,
  isPreview = false,
}: ResponseQuestionBlockProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!question || !question.options || question.options.length === 0) return null;

  const handleSelect = async (opt: string) => {
    setSelectedOption(opt);
    setSubmitted(true);

    if (!isPreview && slug) {
      try {
        await fetch(`/api/v1/public/invitations/${slug}/interactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockId: "response_question", optionId: opt }),
        });
      } catch {
        // Ignored
      }
    }
  };

  return (
    <div className="my-10 px-4 max-w-lg mx-auto">
      <div
        className="p-6 sm:p-8 rounded-3xl shadow-sm border text-center"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: `${theme.accent}30`,
        }}
      >
        <div
          className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </div>

        <h3 className="text-lg font-serif font-bold mb-6" style={{ color: theme.foreground }}>
          {question.question}
        </h3>

        {submitted ? (
          <div className="py-4 space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
              <Check className="w-4 h-4" />
              <span>Câu trả lời của bạn: {selectedOption}</span>
            </div>
            <p className="text-xs opacity-75 mt-2" style={{ color: theme.foreground }}>
              Phản hồi đã được ghi lại an toàn và gửi đến người tạo thiệp.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="w-full py-3 px-4 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: `${theme.accent}08`,
                  borderColor: `${theme.accent}30`,
                  color: theme.foreground,
                }}
              >
                <span>{opt}</span>
                <Sparkles className="w-4 h-4 opacity-50" style={{ color: theme.accent }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

