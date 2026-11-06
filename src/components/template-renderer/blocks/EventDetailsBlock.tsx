"use client";

import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import { TemplateTheme } from "@/lib/templates/registry";
import { EventDetailsSchema } from "@/lib/templates/schema";
import { z } from "zod";

type EventDetails = z.infer<typeof EventDetailsSchema>;

interface EventDetailsBlockProps {
  event?: EventDetails;
  theme: TemplateTheme;
}

export default function EventDetailsBlock({ event, theme }: EventDetailsBlockProps) {
  if (!event || (!event.startsAt && !event.venueName)) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="my-8 px-4 max-w-lg mx-auto">
      <div
        className="p-6 sm:p-8 rounded-3xl shadow-sm border space-y-6 text-center"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: `${theme.accent}30`,
        }}
      >
        <span
          className="text-xs uppercase tracking-widest font-semibold block"
          style={{ color: theme.accent }}
        >
          Thời Gian & Địa Điểm
        </span>

        {/* Date & Time */}
        {event.startsAt && (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: theme.accent }}>
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.startsAt)}</span>
            </div>
            <p className="text-sm opacity-80" style={{ color: theme.foreground }}>
              Bắt đầu lúc {formatTime(event.startsAt)}
              {event.endsAt ? ` — Kết thúc ${formatTime(event.endsAt)}` : ""}
            </p>
          </div>
        )}

        {/* Venue & Address */}
        {event.venueName && (
          <div className="space-y-1 pt-2 border-t" style={{ borderColor: `${theme.accent}20` }}>
            <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: theme.accent }}>
              <MapPin className="w-4 h-4" />
              <span>{event.venueName}</span>
            </div>
            {event.address && (
              <p className="text-xs sm:text-sm opacity-75 max-w-xs mx-auto" style={{ color: theme.foreground }}>
                {event.address}
              </p>
            )}
          </div>
        )}

        {/* Maps Link */}
        {event.mapsUrl && (
          <div className="pt-2">
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: theme.accent }}
            >
              <span>Xem vị trí trên Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

