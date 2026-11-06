"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TemplateRenderer from "@/components/template-renderer/TemplateRenderer";
import { TEMPLATES_REGISTRY } from "@/lib/templates/registry";
import { InvitationContent } from "@/lib/templates/schema";
import ShareModal from "@/components/share/ShareModal";
import {
  Sparkles,
  Save,
  Globe,
  Lock,
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle,
  ExternalLink,
  Eye,
  Sliders,
  Share2,
  Trash2,
  Calendar,
  MapPin,
  Heart,
} from "lucide-react";

export default function EditorPage({
  params,
}: {
  params: { invitationId: string };
}) {
  const router = useRouter();
  const invitationId = params.invitationId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "UNSAVED" | "SAVING">("SAVED");
  const [publishing, setPublishing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareShortCode, setShareShortCode] = useState<string | undefined>(undefined);
  const [publishModal, setPublishModal] = useState<{
    open: boolean;
    publicUrl: string;
    shortUrl: string;
    slug: string;
  } | null>(null);

  const [invitationMeta, setInvitationMeta] = useState<{
    id: string;
    title: string;
    slug: string;
    status: string;
    privacyMode: "UNLISTED" | "PASSWORD" | "PUBLIC" | "ARCHIVED";
    templateSlug: string;
    revision: number;
  } | null>(null);

  const [content, setContent] = useState<InvitationContent | null>(null);
  const [passcode, setPasscode] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load invitation from DB
  const loadInvitation = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/sign-in?callbackUrl=/editor/${invitationId}`);
          return;
        }
        throw new Error("Không thể tải thông tin thiệp.");
      }
      const data = await res.json();
      const inv = data.data.invitation;

      setInvitationMeta({
        id: inv.id,
        title: inv.title,
        slug: inv.slug,
        status: inv.status,
        privacyMode: inv.privacyMode,
        templateSlug: inv.template.slug,
        revision: inv.revision,
      });

      setContent(inv.content);
      if (inv.shareLink) {
        setShareShortCode(inv.shareLink);
      }
    } catch (err: unknown) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : "Đã xảy ra lỗi tải thiệp.");
    } finally {
      setLoading(false);
    }
  }, [invitationId, router]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  // Save manual or autosave
  const saveDraft = async (newContent?: InvitationContent) => {
    if (!invitationMeta || !content) return;
    setSaving(true);
    setSaveStatus("SAVING");

    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: invitationMeta.revision,
          title: newContent?.title || content.title,
          privacyMode: invitationMeta.privacyMode,
          passcode: passcode || undefined,
          content: newContent || content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Lưu thất bại.");
      }

      setInvitationMeta((prev) => (prev ? { ...prev, revision: data.data.revision } : null));
      setSaveStatus("SAVED");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("UNSAVED");
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Save latest content first
      await saveDraft();

      const res = await fetch(`/api/v1/invitations/${invitationId}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Xuất bản thất bại.");
      }

      setInvitationMeta((prev) => (prev ? { ...prev, status: "PUBLISHED" } : null));
      setShareShortCode(data.data.shortCode);
      setPublishModal({
        open: true,
        publicUrl: data.data.publicUrl,
        shortUrl: data.data.shortUrl,
        slug: data.data.slug,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setPublishing(false);
    }
  };

  // Unpublish
  const handleUnpublish = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy xuất bản thiệp mời này về bản nháp?")) return;
    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}/unpublish`, {
        method: "POST",
      });
      if (res.ok) {
        setInvitationMeta((prev) => (prev ? { ...prev, status: "DRAFT" } : null));
        alert("Đã hủy xuất bản thiệp mời về bản nháp.");
      }
    } catch {
      alert("Lỗi khi hủy xuất bản.");
    }
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("invitationId", invitationId);

      const res = await fetch("/api/v1/assets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Tải ảnh lên thất bại.");
      }

      const imageUrl = data.data.url;

      if (isCover) {
        const updated = { ...content, coverImageUrl: imageUrl };
        setContent(updated);
        saveDraft(updated);
      } else {
        const updated = { ...content, galleryUrls: [...content.galleryUrls, imageUrl] };
        setContent(updated);
        saveDraft(updated);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải ảnh.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loadError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-700 space-y-3">
        <p className="text-rose-600 font-bold">Không thể tải thiệp mời:</p>
        <p className="text-xs text-slate-500">{loadError}</p>
        <button
          onClick={() => loadInvitation()}
          className="px-4 py-2 bg-rose-600 text-white rounded-full text-xs font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (loading || !content || !invitationMeta) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const templateMeta =
    TEMPLATES_REGISTRY[invitationMeta.templateSlug] || TEMPLATES_REGISTRY["wedding-classic"];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
      {/* Top Action Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900 line-clamp-1">{content.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span
                className={`font-semibold px-1.5 py-0.2 rounded ${
                  invitationMeta.status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {invitationMeta.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                {saveStatus === "SAVING"
                  ? "Đang lưu..."
                  : saveStatus === "SAVED"
                  ? "Đã lưu"
                  : "Chưa lưu"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-3 py-1 text-xs font-semibold rounded-md ${
              activeTab === "form" ? "bg-white shadow text-slate-900" : "text-slate-600"
            }`}
          >
            Biểu mẫu
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 text-xs font-semibold rounded-md ${
              activeTab === "preview" ? "bg-white shadow text-slate-900" : "text-slate-600"
            }`}
          >
            Xem trước
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveDraft()}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưu nháp</span>
          </button>

          {invitationMeta.status === "PUBLISHED" ? (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                data-testid="open-share-modal-btn"
                className="px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chia sẻ &amp; Xuất</span>
              </button>
              <Link
                href={`/i/${invitationMeta.slug}`}
                target="_blank"
                className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem thiệp</span>
              </Link>
              <button
                onClick={handleUnpublish}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Hủy xuất bản
              </button>
            </>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105 flex items-center gap-1.5 disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span>Xuất bản ngay</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Pane Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Form Panel */}
        <div
          className={`w-full md:w-1/2 md:max-w-xl h-full overflow-y-auto p-4 sm:p-6 bg-white border-r border-slate-200 space-y-6 ${
            activeTab === "form" ? "block" : "hidden md:block"
          }`}
        >
          {/* Section: Thông tin chung */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Thông tin chung</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề thiệp mời *
              </label>
              <input
                type="text"
                required
                data-testid="invitation-title-input"
                value={content.title}
                onChange={(e) => {
                  setContent({ ...content, title: e.target.value });
                  setSaveStatus("UNSAVED");
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phụ đề / Câu thông điệp
              </label>
              <input
                type="text"
                value={content.subtitle || ""}
                onChange={(e) => {
                  setContent({ ...content, subtitle: e.target.value });
                  setSaveStatus("UNSAVED");
                }}
                placeholder="Ví dụ: Hành trình yêu thương bước sang trang mới"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {/* People Names */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhân vật chính / Tên cô dâu - chú rể / Người gửi
              </label>
              <div className="space-y-2">
                {content.people?.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={p.displayName}
                      onChange={(e) => {
                        const updated = [...(content.people || [])];
                        updated[idx].displayName = e.target.value;
                        setContent({ ...content, people: updated });
                        setSaveStatus("UNSAVED");
                      }}
                      placeholder={`Tên nhân vật ${idx + 1}`}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lời mời / Thư tình */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lời mời / Lời nhắn gửi
              </label>
              <textarea
                rows={3}
                value={content.message || ""}
                onChange={(e) => {
                  setContent({ ...content, message: e.target.value });
                  setSaveStatus("UNSAVED");
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
          </div>

          {/* Section: Thời gian & Địa điểm */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Thời gian & Địa điểm tổ chức</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  value={content.event?.startsAt ? content.event.startsAt.substring(0, 16) : ""}
                  onChange={(e) => {
                    const startsAt = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                    setContent({
                      ...content,
                      event: { ...content.event, startsAt },
                    });
                    setSaveStatus("UNSAVED");
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên địa điểm / Hội trường</label>
                <input
                  type="text"
                  value={content.event?.venueName || ""}
                  onChange={(e) => {
                    setContent({
                      ...content,
                      event: { ...content.event, venueName: e.target.value },
                    });
                    setSaveStatus("UNSAVED");
                  }}
                  placeholder="Ví dụ: The Adora Center"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi tiết</label>
              <input
                type="text"
                value={content.event?.address || ""}
                onChange={(e) => {
                  setContent({
                    ...content,
                    event: { ...content.event, address: e.target.value },
                  });
                  setSaveStatus("UNSAVED");
                }}
                placeholder="431 Hoàng Văn Thụ, Tân Bình, TP.HCM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps URL</label>
              <input
                type="url"
                value={content.event?.mapsUrl || ""}
                onChange={(e) => {
                  setContent({
                    ...content,
                    event: { ...content.event, mapsUrl: e.target.value },
                  });
                  setSaveStatus("UNSAVED");
                }}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Hình ảnh & Media */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Hình ảnh & Album</span>
            </h3>

            {/* Cover image upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh bìa chính</label>
              <div className="flex items-center gap-3">
                {content.coverImageUrl && (
                  <img
                    src={content.coverImageUrl}
                    alt="Cover"
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                )}
                <label className="cursor-pointer px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? "Đang tải..." : "Chọn ảnh bìa mới"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                </label>
              </div>
            </div>

            {/* Gallery images upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Album ảnh kỷ niệm</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {content.galleryUrls?.map((url, i) => (
                  <div key={i} className="relative group w-14 h-14 rounded-lg overflow-hidden border">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = content.galleryUrls.filter((_, idx) => idx !== i);
                        setContent({ ...content, galleryUrls: updated });
                        setSaveStatus("UNSAVED");
                      }}
                      className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Thêm ảnh vào album</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, false)}
                />
              </label>
            </div>
          </div>

          {/* Section: Quyền riêng tư & Bảo mật */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>Quyền riêng tư & Mật mã xem thiệp</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chế độ riêng tư</label>
              <select
                value={invitationMeta.privacyMode}
                onChange={(e) => {
                  const mode = e.target.value as any;
                  setInvitationMeta({ ...invitationMeta, privacyMode: mode });
                  setSaveStatus("UNSAVED");
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="UNLISTED">Không công khai (Chỉ người có link/QR mới xem được - Mặc định)</option>
                <option value="PASSWORD">Khóa mật mã (Yêu cầu nhập mật mã khi mở thiệp)</option>
                <option value="PUBLIC">Công khai hoàn toàn (Cho phép Google lập chỉ mục)</option>
                <option value="ARCHIVED">Lưu trữ (Tạm khóa mọi tương tác)</option>
              </select>
            </div>

            {invitationMeta.privacyMode === "PASSWORD" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật mã bảo vệ *
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setSaveStatus("UNSAVED");
                  }}
                  placeholder="Nhập mật khẩu xem thiệp..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div
          className={`flex-1 h-full overflow-y-auto bg-slate-900 flex items-center justify-center p-4 sm:p-8 ${
            activeTab === "preview" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="w-[375px] max-h-[820px] bg-white rounded-[36px] shadow-2xl border-[8px] border-slate-800 overflow-y-auto scrollbar-thin">
            <TemplateRenderer
              content={content}
              theme={templateMeta.theme}
              slug={invitationMeta.slug}
              isPreview={true}
            />
          </div>
        </div>
      </div>

      {/* Published Congratulation Modal */}
      {publishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Xuất bản thiệp thành công! 🎉
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mini website thiệp mời của bạn đã sẵn sàng được gửi tới người thân và bạn bè.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border text-left text-xs font-mono space-y-1">
              <p className="text-slate-400 text-[10px]">Đường dẫn xem thiệp:</p>
              <p className="text-rose-600 font-bold break-all">{publishModal.publicUrl}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/i/${publishModal.slug}`}
                target="_blank"
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <span>Mở xem ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => {
                  setPublishModal(null);
                  setIsShareModalOpen(true);
                }}
                data-testid="publish-success-open-share-btn"
                className="flex-1 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ &amp; Xuất</span>
              </button>

              <button
                onClick={() => setPublishModal(null)}
                className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share & Export Modal */}
      {invitationMeta && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          invitationId={invitationId}
          slug={invitationMeta.slug}
          title={content.title}
          shortCode={shareShortCode}
        />
      )}
    </div>
  );
}
