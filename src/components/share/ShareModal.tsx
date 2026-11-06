"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, Download, FileText, Image as ImageIcon, X, Loader2, QrCode } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  slug: string;
  title: string;
  shortCode?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  invitationId,
  slug,
  title,
  shortCode,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"share" | "export">("share");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);

  // Export states
  const [exportFormat, setExportFormat] = useState<"PDF" | "PNG" | "JPG">("PDF");
  const [exportPreset, setExportPreset] = useState<"POSTER_4_5" | "A4">("A4");
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    downloadUrl: string;
    format: string;
  } | null>(null);
  const [exportError, setExportError] = useState("");

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/i/${slug}`;
  const shortUrl = shortCode ? `${origin}/q/${shortCode}` : `${origin}/i/${slug}`;

  const handleCopy = (text: string, isShort = false) => {
    navigator.clipboard.writeText(text);
    if (isShort) {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Thiệp mời: ${title}`,
          url: shortUrl,
        });
      } catch (err) {
        // User cancelled or share not supported
      }
    } else {
      handleCopy(shortUrl);
    }
  };

  const handleGenerateExport = async () => {
    setIsExporting(true);
    setExportError("");
    setExportResult(null);

    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}/exports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: exportFormat,
          sizePreset: exportFormat === "PDF" ? "A4" : exportPreset,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Không thể tạo file xuất.");
      }

      setExportResult({
        downloadUrl: data.data.job.downloadUrl,
        format: data.data.job.format,
      });
    } catch (err: any) {
      setExportError(err.message || "Đã có lỗi xảy ra khi xuất file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-lg">Chia sẻ &amp; Xuất thiệp</h3>
          </div>
          <button
            onClick={onClose}
            data-testid="close-share-modal-btn"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("share")}
            data-testid="tab-share-link"
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition flex items-center justify-center gap-2 ${
              activeTab === "share"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Link &amp; Mã QR
          </button>
          <button
            onClick={() => setActiveTab("export")}
            data-testid="tab-export-file"
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition flex items-center justify-center gap-2 ${
              activeTab === "export"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Download className="w-4 h-4" />
            Xuất Poster &amp; PDF
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "share" ? (
            <div className="space-y-5">
              {/* QR Preview Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <img
                  src={`/api/v1/invitations/${invitationId}/qr?format=png&size=240`}
                  alt="Mã QR thiệp mời"
                  className="w-44 h-44 rounded-lg bg-white p-2 shadow-sm border border-slate-200"
                />
                <span className="text-xs text-slate-500 mt-2 font-mono">{shortUrl}</span>

                <div className="flex gap-2 mt-3">
                  <a
                    href={`/api/v1/invitations/${invitationId}/qr?format=png&download=true`}
                    download
                    data-testid="download-qr-png-btn"
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải QR (PNG)
                  </a>
                  <a
                    href={`/api/v1/invitations/${invitationId}/qr?format=svg&download=true`}
                    download
                    data-testid="download-qr-svg-btn"
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải QR (SVG)
                  </a>
                </div>
              </div>

              {/* Short Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Đường dẫn ngắn gọn (quét mã / gửi tin nhắn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shortUrl}
                    data-testid="share-short-link-input"
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(shortUrl, true)}
                    data-testid="copy-short-link-btn"
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-sm"
                  >
                    {copiedShort ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedShort ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Full Public Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Đường dẫn đầy đủ
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    data-testid="share-public-link-input"
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(publicUrl, false)}
                    data-testid="copy-public-link-btn"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1 border border-slate-200"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Native Share button */}
              <button
                onClick={handleNativeShare}
                data-testid="native-share-btn"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 className="w-4 h-4" /> Chia sẻ qua Zalo, Messenger, SMS...
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Format selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Chọn định dạng xuất
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setExportFormat("PDF");
                      setExportPreset("A4");
                    }}
                    data-testid="format-pdf-btn"
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      exportFormat === "PDF"
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <FileText className={`w-5 h-5 mt-0.5 ${exportFormat === "PDF" ? "text-indigo-600" : "text-slate-400"}`} />
                    <div>
                      <div className="font-semibold text-sm">Bản in PDF (A4)</div>
                      <div className="text-xs text-slate-500 mt-0.5">Vector sắc nét, có mã QR và liên kết</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExportFormat("PNG");
                      setExportPreset("POSTER_4_5");
                    }}
                    data-testid="format-png-btn"
                    className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                      exportFormat === "PNG"
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <ImageIcon className={`w-5 h-5 mt-0.5 ${exportFormat === "PNG" ? "text-indigo-600" : "text-slate-400"}`} />
                    <div>
                      <div className="font-semibold text-sm">Poster PNG (4:5)</div>
                      <div className="text-xs text-slate-500 mt-0.5">1080x1350px để đăng mạng xã hội</div>
                    </div>
                  </button>
                </div>
              </div>

              {exportError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {exportError}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerateExport}
                disabled={isExporting}
                data-testid="start-export-btn"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo file xuất...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Bắt đầu tạo file {exportFormat}
                  </>
                )}
              </button>

              {/* Result Download Box */}
              {exportResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-emerald-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Đã tạo thành công!
                    </div>
                    <div className="text-xs text-emerald-700 mt-0.5">
                      Định dạng: {exportResult.format}
                    </div>
                  </div>
                  <a
                    href={exportResult.downloadUrl}
                    download
                    data-testid="download-export-result-btn"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Tải về máy
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

