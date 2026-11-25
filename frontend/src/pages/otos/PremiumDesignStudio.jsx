// frontend/src/pages/PremiumDesignStudio.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import heroBg from "../../assets/images/game-banner.png";
import {
  Sparkles,
  Wand2,
  Maximize2,
  Check,
  Download,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Crown,
  Star,
  Palette,
  Zap,
  ArrowRight,
  RefreshCw,
  X,
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

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

// ================================================================
// OPTIONS
// ================================================================
const RATIO_OPTIONS = [
  { label: "5 × 7 Portrait", value: "5:7", icon: "📐", sdxl: "portrait" },
  { label: "7 × 5 Landscape", value: "7:5", icon: "📐", sdxl: "wide" },
  { label: "Square 1:1", value: "1:1", icon: "⬛", sdxl: "square" },
  { label: "Instagram 4:5", value: "4:5", icon: "📱", sdxl: "portrait" },
  { label: "Story 9:16", value: "9:16", icon: "📱", sdxl: "portrait" },
  { label: "A5 Print", value: "148:210", icon: "🖨️", sdxl: "portrait" },
];

const PREMIUM_STYLES = [
  {
    id: "luxury",
    label: "Luxury",
    icon: Crown,
    colors: ["#fbbf24", "#f59e0b"],
    hint: "elegant gold foil accents, refined serif typography, rich jewel tones",
  },
  {
    id: "vintage",
    label: "Vintage",
    icon: Star,
    colors: ["#a855f7", "#7c3aed"],
    hint: "retro 1950s aesthetic, soft muted colors, ornate flourishes",
  },
  {
    id: "modern",
    label: "Modern",
    icon: Zap,
    colors: ["#3b82f6", "#0ea5e9"],
    hint: "clean minimal layout, bold sans-serif, high contrast, geometric",
  },
  {
    id: "cute",
    label: "Cute",
    icon: Sparkles,
    colors: ["#ec4899", "#f43f5e"],
    hint: "playful pastel colors, rounded shapes, kid-friendly illustrations",
  },
  {
    id: "elegant",
    label: "Elegant",
    icon: Wand2,
    colors: ["#8b5cf6", "#a855f7"],
    hint: "soft florals, delicate script fonts, refined pastel palette",
  },
  {
    id: "festive",
    label: "Festive",
    icon: Palette,
    colors: ["#f97316", "#dc2626"],
    hint: "vibrant holiday colors, confetti, glitter, celebratory energy",
  },
  {
    id: "minimal",
    label: "Minimal",
    icon: Maximize2,
    colors: ["#475569", "#1e293b"],
    hint: "lots of white space, single accent color, thin lines, geometric simplicity",
  },
  {
    id: "bohemian",
    label: "Boho",
    icon: Sparkles,
    colors: ["#a16207", "#78350f"],
    hint: "earthy tones, hand-drawn elements, natural textures, wanderlust vibe",
  },
];

// ================================================================
// MAIN PAGE
// ================================================================
const PremiumDesignStudio = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("5:7");
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [polishError, setPolishError] = useState("");

  const toggleStyle = (id) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handlePolish = async () => {
    if (!prompt.trim()) {
      setPolishError("Type something first, then click polish.");
      return;
    }

    setPolishing(true);
    setPolishError("");

    try {
      const res = await api.post("/premium-design/polish", {
        prompt: prompt.trim(),
        styleTags: selectedStyles,
      });

      if (res.data?.success && res.data?.data?.prompt) {
        setPrompt(res.data.data.prompt);
      } else {
        throw new Error(res.data?.message || "Polishing failed");
      }
    } catch (err) {
      setPolishError(
        err.response?.data?.message || err.message || "Failed to polish prompt",
      );
    } finally {
      setPolishing(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a design description first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const selectedRatio = RATIO_OPTIONS.find((r) => r.value === ratio);

    try {
      const res = await api.post("/premium-design/generate", {
        prompt: prompt.trim(),
        ratio,
        sdxlRatio: selectedRatio?.sdxl || "portrait",
        styleTags: selectedStyles,
        designStyle: selectedStyles[0] || "Modern",
      });

      if (res.data?.success && res.data?.data?.url) {
        setResult(res.data.data);
      } else {
        throw new Error(res.data?.message || "No image returned from server");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Generation failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

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
          {/* ================= TOP BANNER ================= */}
          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
            <img
              src={heroBg}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />
            <div className="pointer-events-none absolute -right-[100px] -top-[180px] z-[1] h-[300px] w-[490px] rotate-[-20deg] rounded-full bg-[#cda4f44d]" />
            <div className="pointer-events-none absolute right-[60px] -bottom-[145px] z-[1] h-[210px] w-[380px] rounded-full bg-[#ffffff38]" />

            <div className="relative z-[2] max-w-[550px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                <Crown
                  size={14}
                  className="text-[#fbbf24]"
                  style={{ fill: "#fbbf24" }}
                />
                &nbsp;Premium Design Studio
              </div>
              <h2
                className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                style={{ color: C.heroTitle }}
              >
                Design Your Own
                <br />
                Party Masterpiece{" "}
                <span style={{ color: C.heroAccent }}>with AI</span>
              </h2>
              <p
                className="mb-[17px] max-w-[465px] text-[16px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Describe any party design in your own words. Pick a premium
                style, choose a ratio, and let AI render a print-ready
                masterpiece in seconds.
              </p>
            </div>
          </section>

          {/* ================= TWO-COLUMN LAYOUT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-[500px_minmax(0,1fr)] gap-5">
            {/* ================= LEFT: FORM ================= */}
            <section
              className="flex flex-col overflow-hidden rounded-[20px]"
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,.93),rgba(251,249,255,.85))",
                border: "1px solid #dcd8fa",
                boxShadow: "0 8px 17px #35218416",
              }}
            >
              <div className="flex items-center gap-3 border-b border-[#eeeaff] bg-white/25 px-6 py-4">
                <Wand2 className="h-7 w-7" style={{ color: "#8200ff" }} />
                <div>
                  <h3 className="text-[19px] font-extrabold tracking-tight text-[#080d39]">
                    Design Studio
                  </h3>
                  <p className="text-[12px] text-[#5d5191]">
                    Describe your design, pick a style & ratio
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleGenerate}
                className="flex flex-1 flex-col gap-4 px-6 py-5"
              >
                {/* PROMPT */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#080d39]">
                    <Sparkles
                      className="h-4 w-4"
                      style={{ color: "#8200ff" }}
                    />
                    Design Description <b className="text-red-600">*</b>
                  </label>

                  <div className="relative mt-1.5">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. A whimsical unicorn birthday invitation with pastel rainbow colors, gold sparkles, and elegant script typography for a 5-year-old girl..."
                      className="w-full resize-y rounded-[12px] border border-[#c8c4f4] bg-white px-4 pb-12 pt-3 text-[13.5px] leading-[1.55] outline-none focus:border-[#8900ff]"
                      rows={5}
                      maxLength={800}
                    />

                    {/* ✨ POLISH BUTTON — bottom-right corner of textarea */}
                    <button
                      type="button"
                      onClick={handlePolish}
                      disabled={polishing || !prompt.trim()}
                      title="Polish prompt with AI"
                      aria-label="Polish prompt with AI"
                      className="absolute bottom-4 right-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        background: polishing
                          ? "linear-gradient(135deg,#e9d5ff,#ddd6fe)"
                          : "linear-gradient(135deg,#d634ef,#8e15e5)",
                        color: "#fff",
                        boxShadow: polishing ? "none" : "0 3px 10px #8819dd55",
                      }}
                      onMouseEnter={(e) => {
                        if (!polishing && prompt.trim()) {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {polishing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Polishing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3.5 w-3.5" />
                          Polish with AI
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-1 flex justify-between text-[10.5px] text-[#8b7fb3]">
                    <span>
                      Be descriptive — colors, mood, font style, theme
                    </span>
                    <span>{prompt.length}/800</span>
                  </div>

                  {polishError && (
                    <p className="mt-1 text-[11px] text-[#dc2626]">
                      ❌ {polishError}
                    </p>
                  )}
                </div>

                {/* RATIO */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#080d39]">
                    <Maximize2
                      className="h-4 w-4"
                      style={{ color: "#8200ff" }}
                    />
                    Aspect Ratio
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {RATIO_OPTIONS.map((r) => {
                      const active = ratio === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRatio(r.value)}
                          className="flex flex-col items-center justify-center gap-0.5 rounded-[11px] px-2 py-2.5 text-center transition"
                          style={{
                            border: active
                              ? "2px solid #8900ff"
                              : "1px solid #c8c4f4",
                            background: active
                              ? "linear-gradient(135deg,#f4e9ff,#fae6ff)"
                              : "#fff",
                            boxShadow: active
                              ? "0 4px 10px #8819dd33"
                              : "0 2px 4px #3b248010",
                          }}
                        >
                          <span className="text-[16px] leading-none">
                            {r.icon}
                          </span>
                          <span
                            className="mt-0.5 text-[10.5px] font-bold"
                            style={{ color: active ? "#6c00c8" : "#080d39" }}
                          >
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PREMIUM STYLES */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#080d39]">
                    <Crown className="h-4 w-4" style={{ color: "#fbbf24" }} />
                    Premium Style Tags
                    <span className="ml-auto text-[10.5px] font-normal text-[#8b7fb3]">
                      {selectedStyles.length} selected
                    </span>
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PREMIUM_STYLES.map((style) => {
                      const Icon = style.icon;
                      const active = selectedStyles.includes(style.id);
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => toggleStyle(style.id)}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition"
                          style={{
                            border: active
                              ? "1px solid transparent"
                              : "1px solid #d6d0f6",
                            background: active
                              ? `linear-gradient(135deg, ${style.colors[0]}, ${style.colors[1]})`
                              : "#fff",
                            color: active ? "#fff" : "#080d39",
                            boxShadow: active
                              ? `0 3px 8px ${style.colors[0]}55`
                              : "0 2px 4px #3b248010",
                          }}
                        >
                          <Icon
                            size={12}
                            strokeWidth={2.4}
                            style={{ color: active ? "#fff" : style.colors[0] }}
                          />
                          {style.label}
                          {active && <Check size={11} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GENERATE BUTTON */}
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[16px] font-extrabold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(170deg,#d845ff,#8000ff 58%,#3000b9)",
                    boxShadow: "0 6px 14px #5600bd3a",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Masterpiece...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Premium Design
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-2.5 text-[12.5px] text-[#dc2626]">
                    ❌ {error}
                  </div>
                )}
              </form>
            </section>

            {/* ================= RIGHT: RESULT ================= */}
            <section
              className="flex flex-col overflow-hidden rounded-[20px]"
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,.93),rgba(251,249,255,.85))",
                border: "1px solid #dcd8fa",
                boxShadow: "0 8px 17px #35218416",
              }}
            >
              <div className="flex items-center justify-between border-b border-[#eeeaff] bg-white/25 px-6 py-4">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-7 w-7" style={{ color: "#8200ff" }} />
                  <div>
                    <h3 className="text-[19px] font-extrabold tracking-tight text-[#080d39]">
                      Generated Design
                    </h3>
                    <p className="text-[12px] text-[#5d5191]">
                      Your AI masterpiece will appear here
                    </p>
                  </div>
                </div>
                {result && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full p-2 transition hover:bg-[#f5f0ff]"
                    aria-label="Clear result"
                  >
                    <X className="h-4 w-4 text-[#5d5191]" />
                  </button>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                {/* EMPTY STATE */}
                {!result && !loading && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] border border-dashed border-[#d6d2f4] bg-white/60 py-16 text-center">
                    <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#f4e9ff] to-[#fae6ff]">
                      <Sparkles className="h-10 w-10 text-[#8200ff]" />
                    </div>
                    <h4 className="text-[16px] font-extrabold text-[#080d39]">
                      Ready to create something stunning?
                    </h4>
                    <p className="mt-1.5 max-w-[340px] text-[12.5px] text-[#5d5191]">
                      Describe your dream party design on the left, pick a
                      premium style and ratio, then hit <b>Generate</b>.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                      {["Luxury", "Elegant", "Boho", "Modern"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[#f4e9ff] px-2.5 py-1 text-[10.5px] font-bold text-[#7620e8]"
                        >
                          ✨ {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* LOADING STATE */}
                {loading && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-gradient-to-br from-[#f9f3ff] to-[#fae6ff] py-16">
                    <div className="relative mb-5 h-24 w-24">
                      <div className="absolute inset-0 animate-ping rounded-full bg-[#a845f5]/20" />
                      <div
                        className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#d634ef] border-r-[#8e15e5]"
                        style={{ animationDuration: "1.2s" }}
                      />
                      <div className="absolute inset-0 grid place-items-center">
                        <Sparkles className="h-10 w-10 text-[#8200ff]" />
                      </div>
                    </div>
                    <h4 className="text-[16px] font-extrabold text-[#080d39]">
                      Rendering your design...
                    </h4>
                    <p className="mt-1.5 max-w-[340px] text-center text-[12.5px] text-[#5d5191]">
                      Crafting a premium, print-ready masterpiece. This usually
                      takes 15–30 seconds.
                    </p>
                    <div className="mt-6 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-white/60">
                      <div
                        className="h-full w-1/3 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, #d634ef, #8e15e5, transparent)",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                    </div>
                  </div>
                )}

                {result && !loading && (
                  <div className="flex flex-1 flex-col">
                    {/* ✅ FIXED: bounded preview area — portrait & landscape both fit */}
                    <div
                      className="relative flex items-center justify-center overflow-hidden rounded-[14px] border border-[#e8dcff] bg-gradient-to-br from-[#faf7ff] to-[#f4e9ff] p-2 shadow-[0_4px_12px_#4b149514]"
                      style={{ minHeight: 240, maxHeight: 520 }}
                    >
                      <img
                        src={resolveUrl(result.url)}
                        alt="Generated premium design"
                        className="max-h-[500px] w-auto max-w-full rounded-[10px] object-contain shadow-[0_2px_8px_#4b149514]"
                      />
                    </div>

                    {result.prompt && (
                      <details className="mt-3 rounded-[10px] bg-[#f7f2ff] px-3 py-2 text-[11px] text-[#5d5191]">
                        <summary className="cursor-pointer font-bold text-[#080d39]">
                          View prompt used
                        </summary>
                        <p className="mt-1.5 leading-[1.55]">{result.prompt}</p>
                      </details>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={resolveUrl(result.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_10px_#8819dd33] transition hover:brightness-110"
                        style={{ background: C.gradientBtn }}
                      >
                        <ExternalLink className="h-4 w-4" /> Open Full Size
                      </a>
                      <a
                        href={resolveUrl(result.url)}
                        download={`premium-design-${Date.now()}.png`}
                        className="flex items-center gap-2 rounded-full border border-[#e9deff] bg-white px-5 py-2.5 text-[13px] font-bold text-[#8500f8] transition hover:bg-[#f5f0ff]"
                      >
                        <Download className="h-4 w-4" /> Download
                      </a>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex items-center gap-2 rounded-full border border-[#e9deff] bg-white px-5 py-2.5 text-[13px] font-bold text-[#8500f8] transition hover:bg-[#f5f0ff]"
                      >
                        <RefreshCw className="h-4 w-4" /> Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
        </main>
      </div>
    </div>
  );
};

export default PremiumDesignStudio;
