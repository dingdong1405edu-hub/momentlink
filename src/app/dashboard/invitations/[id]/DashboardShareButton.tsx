"use client";

import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "@/components/share/ShareModal";

interface DashboardShareButtonProps {
  invitationId: string;
  slug: string;
  title: string;
  shortCode?: string;
}

export default function DashboardShareButton({
  invitationId,
  slug,
  title,
  shortCode,
}: DashboardShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-testid="dashboard-share-btn"
        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm transition-all"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Chia sẻ &amp; Xuất QR/PDF</span>
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        invitationId={invitationId}
        slug={slug}
        title={title}
        shortCode={shortCode}
      />
    </>
  );
}

