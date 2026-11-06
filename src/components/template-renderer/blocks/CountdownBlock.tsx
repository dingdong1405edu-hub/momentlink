"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";

interface CountdownBlockProps {
  startsAt?: string;
  theme: TemplateTheme;
}

export default function CountdownBlock({ startsAt, theme }: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!startsAt) return;
    const target = new Date(startsAt).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startsAt]);

  if (!startsAt) return null;

  return (
    <div className="my-8 text-center px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 opacity-80"
           style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
        <Clock className="w-3.5 h-3.5" />
        <span>{timeLeft.isPast ? "Sự kiện đã diễn ra" : "Đếm ngược ngày trọng đại"}</span>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-sm mx-auto">
        <div className="flex-1 p-3 rounded-2xl shadow-sm border"
             style={{ backgroundColor: theme.cardBg, borderColor: `${theme.accent}30` }}>
          <span className="block text-2xl sm:text-3xl font-bold font-serif" style={{ color: theme.accent }}>
            {timeLeft.days}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70" style={{ color: theme.foreground }}>
            Ngày
          </span>
        </div>

        <div className="flex-1 p-3 rounded-2xl shadow-sm border"
             style={{ backgroundColor: theme.cardBg, borderColor: `${theme.accent}30` }}>
          <span className="block text-2xl sm:text-3xl font-bold font-serif" style={{ color: theme.accent }}>
            {timeLeft.hours}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70" style={{ color: theme.foreground }}>
            Giờ
          </span>
        </div>

        <div className="flex-1 p-3 rounded-2xl shadow-sm border"
             style={{ backgroundColor: theme.cardBg, borderColor: `${theme.accent}30` }}>
          <span className="block text-2xl sm:text-3xl font-bold font-serif" style={{ color: theme.accent }}>
            {timeLeft.minutes}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70" style={{ color: theme.foreground }}>
            Phút
          </span>
        </div>

        <div className="flex-1 p-3 rounded-2xl shadow-sm border"
             style={{ backgroundColor: theme.cardBg, borderColor: `${theme.accent}30` }}>
          <span className="block text-2xl sm:text-3xl font-bold font-serif" style={{ color: theme.accent }}>
            {timeLeft.seconds}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70" style={{ color: theme.foreground }}>
            Giây
          </span>
        </div>
      </div>
    </div>
  );
}

