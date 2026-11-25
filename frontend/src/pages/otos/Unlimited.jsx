// frontend/src/pages/oto/Unlimited.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import heroBg from "../../assets/images/game-banner.png";
import {
  Sparkles, ArrowRight, Infinity as InfinityIcon, Search,
  Star, TrendingUp, ChevronRight, Crown, Loader2, AlertCircle,
} from "lucide-react";

// ================================================================
// THEME
// ================================================================
const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
  ink: "#151032",
  muted: "#62558f",
  panelBorder: "#dcd7ff",
};

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

const MAX_TEMPLATES = 30;

const ART_GRADIENTS = [
  "linear-gradient(135deg,#f3e8ff,#e9d5ff)",
  "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  "linear-gradient(135deg,#dbeafe,#bfdbfe)",
  "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  "linear-gradient(135deg,#fef3c7,#fde68a)",
  "linear-gradient(135deg,#ede9fe,#ddd6fe)",
];

const ICONS = [Sparkles, Star, Crown, TrendingUp, Sparkles, Star];

// ================================================================
// MAIN PAGE
// ================================================================
const Unlimited = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // ---------- Fetch from DB ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/product-templates");
        if (!cancelled && res.data?.success) {
          // ✅ Take only first 30 templates
          setTemplates((res.data.data || []).slice(0, MAX_TEMPLATES));
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to load templates");
          setTemplates([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---------- Dynamic categories from the 30 templates ----------
  const categories = useMemo(() => {
    const set = new Set();
    templates.forEach((t) => {
      const cat = t.prefill?.category || t.group || t.category;
      if (cat) set.add(cat);
    });
    return ["All", ...Array.from(set).sort()];
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const cat = t.prefill?.category || t.group || t.category || "";
      if (activeCategory !== "All" && cat !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${t.title || ""} ${cat} ${t.prefill?.productType || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [templates, activeCategory, search]);

  const handleUse = (t) => {
    navigate("/product-generator", { state: { aiPrefill: t.prefill } });
  };

  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main column with Navbar */}
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />

        <main
          className="flex-1 overflow-y-auto px-[20px] pb-[32px] pl-[25px] pt-[19px]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 78% 5%, #f2edff 0%, transparent 40%)",
          }}
        >
          {/* ================= HERO BANNER ================= */}
          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
            <img
              src={heroBg}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />

            <div className="relative z-[2] max-w-[620px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                <InfinityIcon size={15} strokeWidth={3} className="text-[#8b5cf6]" />
                &nbsp;Unlimited Access
              </div>

              <h1
                className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                style={{ color: C.heroTitle }}
              >
                30 Premium
                <br />
                Party Templates{" "}
                <span style={{ color: C.heroAccent }}>Unlimited</span>
              </h1>

              <p
                className="mb-[17px] max-w-[520px] text-[16px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Pick any of our 30 hand-crafted templates, customize it, and
                generate as many products as you want — no limits, forever.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/product-generator")}
                  className="flex items-center gap-[13px] rounded-full px-8 py-3 text-[16px] font-[750] text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                  style={{ background: C.gradientBtn }}
                >
                  <Sparkles size={18} />
                  Start Creating
                  <ArrowRight size={18} />
                </button>

                <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-extrabold text-[#4e118c] shadow-sm">
                  <Crown size={16} className="text-[#fbbf24]" style={{ fill: "#fbbf24" }} />
                  $47 One-Time · Lifetime Access
                </div>
              </div>
            </div>
          </section>

          {/* ================= FILTERS ================= */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
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
              <Search
                className="absolute left-3.5 top-2.5 h-5 w-5"
                style={{ color: C.muted }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${templates.length} templates...`}
                className="w-full rounded-[12px] border bg-white py-2.5 pl-11 pr-4 text-[13.5px] outline-none focus:border-[#8900ff]"
                style={{ borderColor: C.panelBorder }}
              />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold shadow-sm">
              <InfinityIcon size={16} className="text-[#8b5cf6]" />
              <span>
                {filtered.length} / {templates.length} templates
              </span>
            </div>
          </div>

          {/* ================= LOADING ================= */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-[14px] border border-[#e8dcff] bg-white"
                >
                  <div className="aspect-square w-full bg-[#f5f0ff]" />
                  <div className="p-2.5">
                    <div className="h-2.5 w-3/4 rounded bg-[#f5f0ff]" />
                    <div className="mt-1.5 h-2 w-1/2 rounded bg-[#f5f0ff]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[16px] border border-[#fecaca] bg-[#fef2f2] p-6 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-[#dc2626]" />
              <p className="text-[14px] font-semibold text-[#991b1b]">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d6d2f4] bg-white/60 py-20 text-center">
              <Sparkles className="mb-3 h-10 w-10 text-[#8b5cf6]" />
              <h3 className="text-[18px] font-extrabold text-[#080d39]">
                {templates.length === 0 ? "No templates available yet" : "No templates match"}
              </h3>
              <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
                {templates.length === 0
                  ? "Templates will appear here once added."
                  : "Try a different search or category."}
              </p>
            </div>
          ) : (
            /* ================= TEMPLATE GRID ================= */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((t, idx) => {
                const Icon = ICONS[idx % ICONS.length];
                const gradient = ART_GRADIENTS[idx % ART_GRADIENTS.length];
                const isFeatured = t.isFeatured === true;
                const cat = t.prefill?.category || t.group || t.category || "General";
                const cover = resolveUrl(t.imageUrl);

                return (
                  <button
                    key={t._id}
                    onClick={() => handleUse(t)}
                    className="group flex flex-col overflow-hidden rounded-[14px] border bg-white text-left transition hover:-translate-y-1"
                    style={{
                      borderColor: C.panelBorder,
                      boxShadow: "0 4px 10px #4b149514",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 12px 24px #4b14952e";
                      e.currentTarget.style.borderColor = "#b794ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 10px #4b149514";
                      e.currentTarget.style.borderColor = C.panelBorder;
                    }}
                  >
                    <div
                      className="relative flex aspect-square w-full items-center justify-center overflow-hidden"
                      style={{ background: gradient }}
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={t.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Icon size={44} strokeWidth={1.5} style={{ color: "#7c3aed" }} />
                      )}

                      <span
                        className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8.5px] font-extrabold uppercase tracking-wide text-white shadow-sm"
                        style={{
                          background: isFeatured
                            ? "linear-gradient(135deg,#a855f7,#7620e8)"
                            : "linear-gradient(135deg,#ec4899,#f43f5e)",
                        }}
                      >
                        {isFeatured ? (
                          <>
                            <Star size={8} strokeWidth={3} style={{ fill: "#fff" }} />
                            Featured
                          </>
                        ) : (
                          <>
                            <TrendingUp size={8} strokeWidth={3} />
                            Trending
                          </>
                        )}
                      </span>

                      <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-1 text-[8.5px] font-extrabold uppercase tracking-wide text-[#7c3aed] shadow-sm ring-1 ring-[#e8d5ff]">
                        <InfinityIcon size={10} strokeWidth={3.2} />
                        Unlimited
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-2.5">
                      <strong
                        className="line-clamp-2 text-[11.5px] font-extrabold leading-tight"
                        style={{ color: C.ink }}
                      >
                        {t.title}
                      </strong>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span
                          className="truncate text-[9.5px] font-semibold uppercase tracking-wide"
                          style={{ color: C.muted }}
                        >
                          {cat}
                        </span>
                        <ChevronRight size={12} style={{ color: "#8500f8" }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ================= BOTTOM CTA ================= */}
          <section className="mt-8 overflow-hidden rounded-[20px] border border-[#e8d5ff] p-6 text-center"
            style={{ background: "linear-gradient(110deg,#f6e9ff,#f9e5fa 50%,#e6caff)" }}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
              <InfinityIcon size={24} className="text-[#8b5cf6]" strokeWidth={3} />
            </div>
            <h2 className="mb-2 text-[22px] font-extrabold" style={{ color: C.heroTitle }}>
              Unlimited Access Unlocked
            </h2>
            <p className="mx-auto mb-4 max-w-[520px] text-[14px]" style={{ color: C.heroText }}>
              You have lifetime access to all 30 templates. New templates are added
              regularly — you'll get them all for free.
            </p>
            <button
              onClick={() => navigate("/product-generator")}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-[14px] font-bold text-white shadow-[0_6px_14px_#8819dd33] transition hover:brightness-110"
              style={{ background: C.gradientBtn }}
            >
              <Sparkles size={16} />
              Start Creating Now
              <ArrowRight size={14} />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Unlimited;