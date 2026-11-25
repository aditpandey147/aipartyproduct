// frontend/src/pages/MyCreations.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import heroBg from "../assets/images/game-banner.png";
import {
  Search, Sparkles, ArrowRight, Download, Trash2, ExternalLink,
  Image as ImageIcon, Loader2, X, Calendar, AlertCircle, RefreshCw,
  LayoutGrid, AlertTriangle, FileText,
} from "lucide-react";

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
};

// ================================================================
// INLINE URL RESOLVER
// ================================================================
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

// ================================================================
// ✅ PDF DETECTION
// ================================================================
const isPdfItem = (item) => {
  if (!item) return false;
  if (String(item.outputFormat || "").toLowerCase() === "pdf") return true;
  if (String(item.imageMimeType || "").toLowerCase() === "application/pdf") return true;
  if (String(item.imageUrl || "").toLowerCase().endsWith(".pdf")) return true;
  return false;
};

// ================================================================
// ✅ DOWNLOAD EXTENSION HELPER
// ================================================================
const getExtension = (item) => (isPdfItem(item) ? "pdf" : "png");

const getDownloadName = (item) => {
  const base = String(item.productType || "creation")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${base}.${getExtension(item)}`;
};

const CATEGORY_FILTERS = [
  "All",
  "Party Invitations",
  "Party Decorations",
  "Party Games & Activities",
  "Party Favor Products",
  "Party Planning Kits",
  "Party Table Printables",
  "Party Photo Booth Kits",
];

const STATUS_FILTERS = ["All", "completed", "pending", "failed"];

// ================================================================
// MAIN PAGE
// ================================================================
const MyCreations = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [previewItem, setPreviewItem] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ---------- Fetch ----------
  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/party-products");
      setItems(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ---------- Filter ----------
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (activeStatus !== "All" && item.status !== activeStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${item.productType} ${item.category} ${item.designStyle || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCategory, activeStatus, search]);

  // ---------- Delete ----------
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeletingId(id);
    try {
      await api.delete(`/party-products/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- ✅ Download helper — handles PDF + image ----------
  const handleDownload = async (item) => {
    const url = item.imageUrl;
    const filename = getDownloadName(item);

    try {
      const fullUrl = resolveUrl(url);
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: open in new tab (works for both image and PDF)
      window.open(resolveUrl(url), "_blank");
    }
  };

  // ---------- Counts ----------
  const counts = useMemo(() => {
    return {
      total: items.length,
      completed: items.filter((i) => i.status === "completed").length,
      pending: items.filter((i) => i.status === "pending").length,
      failed: items.filter((i) => i.status === "failed").length,
    };
  }, [items]);

  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />

        <main
          className="flex-1 overflow-y-auto px-[20px] pb-[32px] pl-[25px] pt-[19px]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 78% 5%, #f2edff 0%, transparent 40%)",
          }}
        >
          {/* HERO */}
          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
            <img
              src={heroBg}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />
            <div className="relative z-[2] max-w-[550px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                🎨 &nbsp;My Creations
              </div>
              <h2
                className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                style={{ color: C.heroTitle }}
              >
                All Your Generated
                <br />
                Party Products{" "}
                <span style={{ color: C.heroAccent }}>in One Place</span>
              </h2>
              <p
                className="mb-[17px] max-w-[465px] text-[16px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Browse, preview, download, and manage every product you've
                created with AI — including multi-page PDFs.
              </p>
              <button
                onClick={() => navigate("/product-generator")}
                className="flex items-center gap-[13px] rounded-full px-8 py-3 text-[16px] font-[750] text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                style={{ background: C.gradientBtn }}
              >
                ✨ &nbsp;Create New <ArrowRight size={20} />
              </button>
            </div>
          </section>

          {/* STATS */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: counts.total, color: "#7c3aed" },
              { label: "Completed", value: counts.completed, color: "#059669" },
              { label: "Processing", value: counts.pending, color: "#f59e0b" },
              { label: "Failed", value: counts.failed, color: "#dc2626" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[16px] border border-[#e8dcff] bg-white/80 px-4 py-3 shadow-[0_4px_10px_#4b14950f]"
              >
                <div className="text-[12px] font-semibold text-[#62558f]">
                  {s.label}
                </div>
                <div
                  className="mt-1 text-[24px] font-extrabold leading-none"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {CATEGORY_FILTERS.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full px-4 py-2 text-[13px] font-bold transition"
                  style={{
                    border: active ? "none" : "1px solid #cec4ff",
                    background: active
                      ? "linear-gradient(110deg,#a845f5,#7100f9)"
                      : "linear-gradient(#fff,#f9f7ff)",
                    color: active ? "#fff" : "#080d39",
                    boxShadow: "0 3px 5px #4c21b521",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative max-w-[420px] flex-1">
              <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-[#5d5191]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product, category, style..."
                className="w-full rounded-[12px] border border-[#c8c4f4] bg-white py-2.5 pl-11 pr-4 text-[13.5px] outline-none focus:border-[#8900ff]"
              />
            </div>

            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="rounded-[12px] border border-[#c8c4f4] bg-white px-4 py-2.5 text-[13px] font-semibold outline-none focus:border-[#8900ff]"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={fetchItems}
              className="flex items-center gap-2 rounded-[12px] border border-[#c8c4f4] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#080d39] hover:border-[#8900ff]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#8e15e5]" />
              <p className="mt-3 text-[14px] text-[#5d5191]">Loading your creations...</p>
            </div>
          ) : error ? (
            <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] p-6 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-[#dc2626]" />
              <p className="text-[14px] font-semibold text-[#991b1b]">{error}</p>
              <button
                onClick={fetchItems}
                className="mt-3 rounded-full bg-[#dc2626] px-5 py-2 text-[13px] font-bold text-white hover:brightness-110"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d6d2f4] bg-white/60 py-20 text-center">
              <div className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-[#f4e9ff] text-[#8200ff]">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="text-[18px] font-extrabold text-[#080d39]">
                {items.length === 0 ? "No creations yet" : "No matches found"}
              </h3>
              <p className="mt-1 max-w-[360px] text-[13.5px] text-[#5d5191]">
                {items.length === 0
                  ? "Generate your first AI party product to see it here."
                  : "Try a different filter or search term."}
              </p>
              {items.length === 0 && (
                <button
                  onClick={() => navigate("/product-generator")}
                  className="mt-4 rounded-full px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_5px_12px_#8819dd33] transition hover:brightness-110"
                  style={{ background: C.gradientBtn }}
                >
                  ✨ Create Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <CreationCard
                  key={item._id}
                  item={item}
                  onPreview={() => setPreviewItem(item)}
                  onDelete={() => setDeleteTarget(item)}
                  onDownload={() => handleDownload(item)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(21,16,50,.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(80,40,160,.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#eeeaff] px-6 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[18px] font-extrabold text-[#080d39]">
                    {previewItem.productType}
                  </h3>
                  {isPdfItem(previewItem) && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#fee2e2] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#991b1b]">
                      <FileText className="h-3 w-3" strokeWidth={3} />
                      PDF
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-[#5d5191]">
                  {previewItem.category} ·{" "}
                  {previewItem.designStyle || "Standard"} style
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-full p-2 hover:bg-[#f5f0ff]"
              >
                <X className="h-5 w-5 text-[#5d5191]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* ✅ RENDER — PDF uses iframe, image uses img */}
              {previewItem.imageUrl ? (
                isPdfItem(previewItem) ? (
                  <div className="w-full overflow-hidden rounded-[12px] border border-[#e8dcff] bg-[#faf8ff]">
                    <iframe
                      src={resolveUrl(previewItem.imageUrl)}
                      title={previewItem.productType}
                      className="h-[60vh] w-full"
                      style={{ border: "none" }}
                    />
                  </div>
                ) : (
                  <img
                    src={resolveUrl(previewItem.imageUrl)}
                    alt={previewItem.productType}
                    className="mx-auto max-h-[60vh] rounded-[12px] object-contain"
                  />
                )
              ) : (
                <div className="grid place-items-center rounded-[12px] bg-[#f7f2ff] py-20 text-[#8b7fb3]">
                  <ImageIcon className="h-12 w-12" />
                  <p className="mt-2 text-[13px]">No file available</p>
                </div>
              )}

              {previewItem.aiPrompt && (
                <details className="mt-4 rounded-[12px] bg-[#f7f2ff] px-4 py-3 text-[12.5px] text-[#5d5191]">
                  <summary className="cursor-pointer font-bold text-[#080d39]">
                    AI Prompt used
                  </summary>
                  <p className="mt-2 leading-[1.6]">{previewItem.aiPrompt}</p>
                </details>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#eeeaff] px-6 py-4">
              <a
                href={resolveUrl(previewItem.imageUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_8px_#8819dd33] transition hover:brightness-110"
                style={{ background: C.gradientBtn }}
              >
                <ExternalLink className="h-4 w-4" />{" "}
                {isPdfItem(previewItem) ? "Open PDF" : "Open Full Size"}
              </a>
              <button
                onClick={() => handleDownload(previewItem)}
                className="flex items-center gap-2 rounded-full border border-[#e9deff] bg-white px-5 py-2.5 text-[13px] font-bold text-[#8500f8]"
              >
                <Download className="h-4 w-4" /> Download{" "}
                {isPdfItem(previewItem) ? "PDF" : "Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: "rgba(21,16,50,.65)", backdropFilter: "blur(6px)" }}
          onClick={() => !deletingId && setDeleteTarget(null)}
        >
          <div
            className="relative w-full max-w-[420px] overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(80,40,160,.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-7">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fee2e2] text-[#dc2626]">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </div>

            <div className="px-6 pb-2 pt-4 text-center">
              <h3 className="text-[19px] font-extrabold text-[#080d39]">
                Delete this creation?
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.5] text-[#5d5191]">
                You're about to permanently delete{" "}
                <b className="text-[#080d39]">{deleteTarget.productType}</b>.
                This action cannot be undone.
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-[#e8dcff] bg-[#faf8ff] p-3 text-left">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[#f4e9ff] text-[#8200ff]">
                  {isPdfItem(deleteTarget) ? (
                    <FileText className="h-6 w-6" />
                  ) : deleteTarget.imageUrl ? (
                    <img
                      src={resolveUrl(deleteTarget.imageUrl)}
                      alt={deleteTarget.productType}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-[#080d39]">
                    {deleteTarget.productType}
                  </div>
                  <div className="truncate text-[11.5px] text-[#7a6ba8]">
                    {deleteTarget.category}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-6 pb-6 pt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="flex-1 rounded-full border border-[#e8dcff] bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#080d39] transition hover:bg-[#f7f2ff] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingId}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#dc2626] px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_10px_#dc262633] transition hover:brightness-110 disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================================================
// CREATION CARD
// ================================================================
function CreationCard({ item, onPreview, onDelete, onDownload }) {
  const statusColors = {
    completed: { bg: "#dcfce7", text: "#166534" },
    pending: { bg: "#fef3c7", text: "#92400e" },
    failed: { bg: "#fee2e2", text: "#991b1b" },
  };
  const sc = statusColors[item.status] || statusColors.pending;
  const pdf = isPdfItem(item);

  const created = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="group flex flex-col overflow-hidden rounded-[18px] border border-[#e8dcff] bg-white shadow-[0_4px_12px_#4b149512] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_#4b14951f]">
      <button
        onClick={onPreview}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#f7f2ff]"
      >
        {item.status === "completed" && item.imageUrl ? (
          pdf ? (
            // ✅ PDF cover — clean file-card style
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#fef2f2] to-[#fecaca] text-[#991b1b]">
              <FileText className="h-14 w-14" strokeWidth={1.6} />
              <span className="mt-1.5 text-[11px] font-extrabold uppercase tracking-wider">
                PDF Document
              </span>
            </div>
          ) : (
            <img
              src={resolveUrl(item.imageUrl)}
              alt={item.productType}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#8b7fb3]">
            {item.status === "pending" ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#a845f5]" />
            ) : (
              <AlertCircle className="h-8 w-8 text-[#dc2626]" />
            )}
            <span className="mt-2 text-[12px] font-semibold capitalize">
              {item.status}
            </span>
          </div>
        )}

        {/* ✅ Type badge — top-left */}
        {item.status === "completed" && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-sm"
            style={{
              background: pdf ? "#fee2e2" : "#dbeafe",
              color: pdf ? "#991b1b" : "#1e40af",
            }}
          >
            {pdf ? (
              <FileText className="h-2.5 w-2.5" strokeWidth={3} />
            ) : (
              <ImageIcon className="h-2.5 w-2.5" strokeWidth={3} />
            )}
            {pdf ? "PDF" : "IMG"}
          </span>
        )}

        {/* Status badge — top-right */}
        <span
          className="absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: sc.bg, color: sc.text }}
        >
          {item.status}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-2 text-[14.5px] font-extrabold leading-tight text-[#080d39]">
          {item.productType}
        </h4>
        <p className="mt-1 text-[11.5px] font-semibold text-[#7a6ba8]">
          {item.category}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8b7fb3]">
          {item.designStyle && (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {item.designStyle}
            </span>
          )}
          {!pdf && item.aspectRatio && (
            <span className="flex items-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              {item.aspectRatio}
            </span>
          )}
          {pdf && (
            <span className="flex items-center gap-1 text-[#991b1b]">
              <FileText className="h-3 w-3" />
              Multi-page PDF
            </span>
          )}
          {created && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {created}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {item.status === "completed" && item.imageUrl && (
            <>
              <button
                onClick={onDownload}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#d634ef] via-[#8e15e5] to-[#4d00af] px-3 py-2 text-[12px] font-bold text-white transition hover:brightness-110"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <button
                onClick={onPreview}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e9deff] bg-white text-[#8500f8] transition hover:bg-[#f5f0ff]"
                aria-label="Preview"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={onDelete}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#fecaca] bg-white text-[#dc2626] transition hover:bg-[#fef2f2]"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyCreations;