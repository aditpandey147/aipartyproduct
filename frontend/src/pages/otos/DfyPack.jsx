// frontend/src/pages/oto/DfyPack.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import heroBg from "../../assets/images/game-banner.png";
import {
  Sparkles, ArrowRight, Package, Download, Loader2, Check,
  FileText, Image as ImageIcon, Crown, Star, Zap, AlertCircle,
} from "lucide-react";

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
};

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

// ================================================================
// DFY PACKS — 8 static packs
// Update zipUrl + preview to match your /public/public path
// ================================================================
const DFY_PACKS = [
  {
    id: "invitations",
    title: "Invitations Pack",
    subtitle: "20 Designs",
    description: "Birthday, Wedding, Baby Shower, Graduation, and more — print-ready PNG + PDF.",
    count: 20,
    icon: ImageIcon,
    color: "#ec4899",
    bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
    zipUrl: "/public/dfy/invitations.zip",
    preview: "/public/dfy/samples/invitation-1.png",
  },
  {
    id: "games",
    title: "Games & Activities Pack",
    subtitle: "15 Designs",
    description: "Bingo, Trivia, Scavenger Hunts, Word Search, and printable card games.",
    count: 15,
    icon: Sparkles,
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#f3e8ff,#e9d5ff)",
    zipUrl: "/public/dfy/games.zip",
    preview: "/public/dfy/samples/game-1.png",
  },
  {
    id: "decorations",
    title: "Decorations Pack",
    subtitle: "15 Designs",
    description: "Banners, Welcome Signs, Milestone Boards, and party backdrop designs.",
    count: 15,
    icon: Star,
    color: "#f59e0b",
    bg: "linear-gradient(135deg,#fef3c7,#fde68a)",
    zipUrl: "/public/dfy/decorations.zip",
    preview: "/public/dfy/samples/decoration-1.png",
  },
  {
    id: "favors",
    title: "Favor Products Pack",
    subtitle: "10 Designs",
    description: "Thank You Tags, Candy Wrappers, Gift Tags, and treat box templates.",
    count: 10,
    icon: Package,
    color: "#059669",
    bg: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
    zipUrl: "/public/dfy/favors.zip",
    preview: "/public/dfy/samples/favor-1.png",
  },
  {
    id: "table",
    title: "Table Printables Pack",
    subtitle: "10 Designs",
    description: "Menu Cards, Place Cards, Food Labels, and table stationery sets.",
    count: 10,
    icon: FileText,
    color: "#0ea5e9",
    bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    zipUrl: "/public/dfy/table.zip",
    preview: "/public/dfy/samples/table-1.png",
  },
  {
    id: "planning",
    title: "Planning Kits Pack",
    subtitle: "5 Designs",
    description: "Birthday Planners, Wedding Checklists, and party budget trackers.",
    count: 5,
    icon: Crown,
    color: "#a855f7",
    bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
    zipUrl: "/public/dfy/planning.zip",
    preview: "/public/dfy/samples/planning-1.png",
  },
  {
    id: "photobooth",
    title: "Photo Booth Pack",
    subtitle: "5 Designs",
    description: "Photo props, speech bubbles, selfie frame designs, and more.",
    count: 5,
    icon: Zap,
    color: "#f97316",
    bg: "linear-gradient(135deg,#ffedd5,#fed7aa)",
    zipUrl: "/public/dfy/photobooth.zip",
    preview: "/public/dfy/samples/photobooth-1.png",
  },
  {
    id: "full-bundle",
    title: "Complete Silver Bundle",
    subtitle: "All 80 Products",
    description: "Every single product from all 7 categories in one ZIP. Best value!",
    count: 80,
    icon: Package,
    color: "#d634ef",
    bg: "linear-gradient(135deg,#fae8ff,#e9d5ff)",
    zipUrl: "/public/dfy/full-bundle.zip",
    preview: "/public/dfy/samples/full-bundle.webp",
    featured: true,
  },
];

// ================================================================
const DfyPack = () => {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  // ------------------------------
  // Download — direct browser download, no backend
  // ------------------------------
  const handleDownload = (pack) => {
    setError("");
    setDownloadingId(pack.id);

    try {
      const url = resolveUrl(pack.zipUrl);

      // Trigger browser download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pack.id}-pack.zip`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Small cooldown so spinner is visible
      setTimeout(() => setDownloadingId(null), 800);
    } catch (err) {
      setError("Download failed — please try again.");
      setDownloadingId(null);
    }
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
          {/* ================= HERO BANNER ================= */}
          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
            <img
              src={heroBg}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />
            <div className="pointer-events-none absolute -right-[100px] -top-[180px] z-[1] h-[300px] w-[490px] rotate-[-20deg] rounded-full bg-[#cda4f44d]" />
            <div className="pointer-events-none absolute right-[60px] -bottom-[145px] z-[1] h-[210px] w-[380px] rounded-full bg-[#ffffff38]" />

            <div className="relative z-[2] max-w-[600px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                <Package size={14} className="text-[#8b5cf6]" />
                &nbsp;DFY Pack
              </div>
              <h2
                className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                style={{ color: C.heroTitle }}
              >
                80 Done-For-You
                <br />
                Party Products{" "}
                <span style={{ color: C.heroAccent }}>Ready to Sell</span>
              </h2>
              <p
                className="mb-[17px] max-w-[500px] text-[16px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Skip the design work — download professionally crafted party
                products, ready to print and sell. Commercial license included.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    document
                      .getElementById("dfy-packs")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex items-center gap-[13px] rounded-full px-8 py-3 text-[16px] font-[750] text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                  style={{ background: C.gradientBtn }}
                >
                  <Download size={18} />
                  Browse Packs
                  <ArrowRight size={18} />
                </button>
                <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-extrabold text-[#4e118c] shadow-sm">
                  <Crown size={16} className="text-[#fbbf24]" style={{ fill: "#fbbf24" }} />
                  Commercial License Included
                </div>
              </div>
            </div>
          </section>

          {/* ================= STATS ================= */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Products", value: "80", color: "#7c3aed" },
              { label: "Packs", value: "8", color: "#ec4899" },
              { label: "File Formats", value: "PNG + PDF", color: "#059669" },
              { label: "License", value: "Commercial", color: "#f59e0b" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[16px] border border-[#e8dcff] bg-white/80 px-4 py-3 shadow-[0_4px_10px_#4b14950f]"
              >
                <div className="text-[12px] font-semibold text-[#62558f]">
                  {s.label}
                </div>
                <div
                  className="mt-1 text-[20px] font-extrabold leading-none"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ================= PACKS GRID (3 per row) ================= */}
          <section id="dfy-packs">
            <div className="mb-4">
              <h2 className="text-[22px] font-extrabold text-[#080d39]">
                Your DFY Packs
              </h2>
              <p className="mt-1 text-[13px] text-[#5d5191]">
                Download any pack individually or grab the full bundle.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {DFY_PACKS.map((pack) => {
                const Icon = pack.icon;
                const isDownloading = downloadingId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className="group flex flex-col overflow-hidden rounded-[18px] border bg-white transition hover:-translate-y-0.5"
                    style={{
                      borderColor: pack.featured ? "#d634ef" : "#dcd7ff",
                      boxShadow: pack.featured
                        ? "0 8px 24px #d634ef2e"
                        : "0 4px 12px #4b149512",
                    }}
                  >
                    {/* Preview image / gradient */}
                    <div
                      className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
                      style={{ background: pack.bg }}
                    >
                      <img
                        src={resolveUrl(pack.preview)}
                        alt={pack.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.style.background = pack.bg;
                        }}
                      />

                      {/* Count badge */}
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-[#080d39] shadow-sm">
                        <Package size={11} />
                        {pack.count} files
                      </span>

                      {/* Featured badge */}
                      {pack.featured && (
                        <span
                          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#d634ef,#8e15e5)",
                          }}
                        >
                          <Star size={10} strokeWidth={3} style={{ fill: "#fff" }} />
                          Best Value
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-[16px] font-extrabold leading-tight text-[#080d39]">
                        {pack.title}
                      </h3>
                      <p
                        className="mt-0.5 text-[11.5px] font-semibold uppercase tracking-wide"
                        style={{ color: pack.color }}
                      >
                        {pack.subtitle}
                      </p>
                      <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.5] text-[#5d5191]">
                        {pack.description}
                      </p>

                      {/* Feature pills */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f4e9ff] px-2 py-0.5 text-[10px] font-bold text-[#7620e8]">
                          <Check size={10} strokeWidth={3} />
                          PNG
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f4e9ff] px-2 py-0.5 text-[10px] font-bold text-[#7620e8]">
                          <Check size={10} strokeWidth={3} />
                          PDF
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f4e9ff] px-2 py-0.5 text-[10px] font-bold text-[#7620e8]">
                          <Check size={10} strokeWidth={3} />
                          Commercial
                        </span>
                      </div>

                      {/* Download button */}
                      <button
                        onClick={() => handleDownload(pack)}
                        disabled={isDownloading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{
                          background: pack.featured
                            ? "linear-gradient(170deg,#d845ff,#8000ff 58%,#3000b9)"
                            : C.gradientBtn,
                          boxShadow: "0 4px 10px #8819dd33",
                        }}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download Pack
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#dc2626]">
                <AlertCircle className="mr-1 inline h-4 w-4" />
                {error}
              </div>
            )}
          </section>

          {/* ================= LICENSE INFO ================= */}
          <section
            className="mt-8 rounded-[20px] border border-[#e8d5ff] p-6"
            style={{
              background:
                "linear-gradient(135deg,#f6e9ff,#f9e5fa 50%,#e6caff)",
            }}
          >
            <h3 className="mb-3 flex items-center gap-2 text-[18px] font-extrabold text-[#4e118c]">
              <Crown
                size={20}
                className="text-[#fbbf24]"
                style={{ fill: "#fbbf24" }}
              />
              Commercial License Included
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                <h4 className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#166534]">
                  <Check size={16} strokeWidth={3} />
                  You CAN
                </h4>
                <ul className="space-y-1 text-[12px] text-[#166534]">
                  <li>✓ Sell products on Etsy, Shopify, Fiverr</li>
                  <li>✓ Use in client projects</li>
                  <li>✓ Edit & rebrand designs</li>
                  <li>✓ Use in social media ads</li>
                </ul>
              </div>
              <div className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] p-4">
                <h4 className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-[#991b1b]">
                  <AlertCircle size={16} strokeWidth={3} />
                  You CANNOT
                </h4>
                <ul className="space-y-1 text-[12px] text-[#991b1b]">
                  <li>✗ Resell the bundle as-is</li>
                  <li>✗ Claim original authorship</li>
                  <li>✗ Redistribute source files</li>
                  <li>✗ Share with other sellers</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DfyPack;