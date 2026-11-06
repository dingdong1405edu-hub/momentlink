"use client";

import { InvitationContent } from "@/lib/templates/schema";
import { TemplateTheme } from "@/lib/templates/registry";
import CoverBlock from "./blocks/CoverBlock";
import EnvelopeRevealBlock from "./blocks/EnvelopeRevealBlock";
import IntroMessageBlock from "./blocks/IntroMessageBlock";
import EventDetailsBlock from "./blocks/EventDetailsBlock";
import CountdownBlock from "./blocks/CountdownBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import RsvpBlock from "./blocks/RsvpBlock";
import GuestbookBlock from "./blocks/GuestbookBlock";
import ResponseQuestionBlock from "./blocks/ResponseQuestionBlock";
import MusicControlBlock from "./blocks/MusicControlBlock";
import FooterCtaBlock from "./blocks/FooterCtaBlock";

interface TemplateRendererProps {
  content: InvitationContent;
  theme: TemplateTheme;
  slug?: string;
  isPreview?: boolean;
}

export default function TemplateRenderer({
  content,
  theme,
  slug,
  isPreview = false,
}: TemplateRendererProps) {
  const blocks = content.blocks || [];

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        theme.fontFamily === "serif" ? "font-serif" : "font-sans"
      }`}
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 relative">
        {blocks.map((b) => {
          if (!b.enabled) return null;

          switch (b.type) {
            case "envelope_reveal":
              return (
                <EnvelopeRevealBlock
                  key={b.id}
                  title={content.title}
                  subtitle={content.subtitle}
                  theme={theme}
                  slug={slug}
                />
              );

            case "cover":
              return (
                <CoverBlock
                  key={b.id}
                  title={content.title}
                  subtitle={content.subtitle}
                  people={content.people}
                  coverImageUrl={content.coverImageUrl}
                  theme={theme}
                />
              );

            case "intro_message":
              return (
                <IntroMessageBlock
                  key={b.id}
                  message={content.message}
                  theme={theme}
                />
              );

            case "event_details":
              return (
                <EventDetailsBlock
                  key={b.id}
                  event={content.event}
                  theme={theme}
                />
              );

            case "countdown":
              return (
                <CountdownBlock
                  key={b.id}
                  startsAt={content.event?.startsAt}
                  theme={theme}
                />
              );

            case "gallery":
              return (
                <GalleryBlock
                  key={b.id}
                  galleryUrls={content.galleryUrls}
                  theme={theme}
                />
              );

            case "rsvp":
              if (!content.features?.rsvp) return null;
              return (
                <RsvpBlock
                  key={b.id}
                  slug={slug}
                  theme={theme}
                  isPreview={isPreview}
                />
              );

            case "guestbook":
              if (!content.features?.guestbook) return null;
              return (
                <GuestbookBlock
                  key={b.id}
                  slug={slug}
                  theme={theme}
                  isPreview={isPreview}
                />
              );

            case "response_question":
              return (
                <ResponseQuestionBlock
                  key={b.id}
                  question={content.responseQuestion}
                  slug={slug}
                  theme={theme}
                  isPreview={isPreview}
                />
              );

            case "music_control":
              return (
                <MusicControlBlock
                  key={b.id}
                  musicUrl={content.features?.backgroundMusicUrl}
                  theme={theme}
                />
              );

            case "footer_cta":
              return (
                <FooterCtaBlock
                  key={b.id}
                  giftTransferInfo={content.features?.giftTransferInfo}
                  slug={slug}
                  theme={theme}
                />
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

