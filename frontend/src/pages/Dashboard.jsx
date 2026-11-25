// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import heroBg from "../assets/images/banner-bg.png";
import {
  House,
  Sparkles,
  Gamepad2,
  Copy,
  MapPin,
  Mail,
  Palette,
  Users,
  Package,
  Tag,
  LayoutGrid,
  Folder,
  Download,
  Settings,
  Crown,
  Search,
  Bell,
  ChevronDown,
  Layers3,
  Heart,
  ChartNoAxesColumnIncreasing,
  Star,
  ArrowRight,
  Clock3,
  Ellipsis,
  Flame,
  TrendingUp,
  ChevronRight,
  Cake,
  TreePine,
  Ghost,
  Gem,
  Baby,
  PartyPopper,
} from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// 🎨 THEME — exact HTML palette
// ================================================================
const C = {
  mainBg: "#faf9ff",
  sidebarBg: "linear-gradient(130deg,#fbfaff,#f2edff)",
  sidebarBorder: "#e8e2f8",
  card: "#ffffffb8",
  panelBorder: "#ede8fb",
  ink: "#151032",
  muted: "#62558f",
  brandPink: "#bd079e",
  navText: "#1a1243",
  navIcon: "#5b4b9b",
  navHover: "#eee8ff",
  navActive: "linear-gradient(100deg,#7924ff,#7d20e8)",
  navActiveShadow: "0 5px 12px #7924ff30",
  violet: "#7620e8",
  violetBright: "#7800eb",
  pink: "#ec0b89",
  searchBorder: "#ded7fa",
  searchBg: "#ffffffb8",
  bellBorder: "#e4ddfa",
  avatarGradient: "linear-gradient(145deg,#b944ff,#5b00ce)",
  avatarShadow: "0 5px 12px #9b4be233",
  heroBorder: "#e8d5ff",
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
  statBg: "#ffffffc7",
  statBorder: "#eae5fa",
  statIconBg: "#f7f2ff",
  statIconPinkBg: "#fff1f8",
  statIconColor: "#8624f5",
  statIconPink: "#fc1380",
  gainBg: "#e8f8ee",
  gainColor: "#008d34",
  panelBg: "#ffffffb8",
  subheading: "#66578e",
  textLink: "#7800eb",
  occasionBorder: "#f3ddec",
  occasion1: "linear-gradient(135deg,#fff1f9,#fae6f5)",
  occasion2: "#e9f8f5",
  occasion3: "#fff5ee",
  occasion4: "#f5f0ff",
  occasion5: "#edf7ff",
  occasion6: "#f2ebff",
  recentBorder: "#eee9f8",
  projectArt1: "linear-gradient(130deg,#f9ddf1,#f8e5ff)",
  projectArt2: "#e5f5ed",
  projectArt3: "#f2e5ff",
  projectTime: "#665990",
  statusBg: "#e1f8e9",
  statusColor: "#00812f",
  statusDraftBg: "#fff4df",
  statusDraftColor: "#a25a0c",
  moreColor: "#6e5b9e",
  proBg: "#fff2d8",
  proColor: "#a85b00",
  progressBg: "#ebe6f8",
  progressFill: "linear-gradient(90deg,#7424f0,#d52de9)",
  featuredImage: "linear-gradient(120deg,#ffe6f7,#e7ccff)",
  circleArrowBorder: "#e6d3ff",
  circleArrowColor: "#8c1aff",
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean.startsWith("/mystery-templates/")) return clean;
  return `${SERVER_URL}${clean}`;
};

// ================================================================
// RECENT PROJECTS — live from /mysteries (matches HTML .recent)
// ================================================================
function RecentProjects() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  const resolveUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
  };

  const DAILY_KEY = "trendingTemplates_v2"; // bump version so old 6-item cache is cleared
  const DAY_MS = 24 * 60 * 60 * 1000;
  const COUNT = 12; // ⬅️ 12 templates

  const getDailySeed = () => Math.floor(Date.now() / DAY_MS);

  const shuffleWithSeed = (arr, seed) => {
    const copy = [...arr];
    let s = seed;
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const pickDaily = (allTemplates) => {
    const seed = getDailySeed();
    const cacheKey = `${DAILY_KEY}_${seed}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const ids = JSON.parse(cached);
        const picked = ids
          .map((id) => allTemplates.find((t) => t._id === id))
          .filter(Boolean);
        if (picked.length === COUNT) return picked; // ⬅️ 12
      }
    } catch {}
    const shuffled = shuffleWithSeed(allTemplates, seed);
    const picked = shuffled.slice(0, COUNT); // ⬅️ 12
    try {
      localStorage.setItem(cacheKey, JSON.stringify(picked.map((t) => t._id)));
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(DAILY_KEY) && k !== cacheKey)
          localStorage.removeItem(k);
      });
    } catch {}
    return picked;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/product-templates");
        if (!cancelled && res.data?.success) {
          const all = (res.data.data || []).filter((t) => t.isActive !== false);
          const daily = pickDaily(all);
          setTemplates(daily);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUse = (t) => {
    navigate("/product-generator", { state: { aiPrefill: t.prefill } });
  };

  return (
    <section
      className="panel"
      style={{
        background: C.panelBg,
        border: `1px solid ${C.panelBorder}`,
        borderRadius: 24,
        boxShadow: "0 7px 18px #5a478b0c",
        padding: "12px 16px 12px",
      }}
    >
      {/* Header */}
      <div
        className="panel-head"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingBottom: 10,
          borderBottom: `1px solid ${C.recentBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Flame
            size={20}
            color="#ec4899"
            strokeWidth={2}
            style={{ fill: "#ffd1e5" }}
          />
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                margin: 0,
                color: C.ink,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Trending Templates
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg,#ec4899,#a855f7)",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 999,
                  lineHeight: 1,
                }}
              >
                <TrendingUp size={8} strokeWidth={3} /> Hot
              </span>
            </h2>
            <p style={{ margin: "1px 0 0", fontSize: 11, color: C.subheading }}>
              Fresh {COUNT} templates — refreshes every 24h
            </p>
          </div>
        </div>
        <a
          href="#templates"
          onClick={(e) => {
            e.preventDefault();
            navigate("/templates");
          }}
          style={{
            color: C.textLink,
            textDecoration: "none",
            fontWeight: 600,
            whiteSpace: "nowrap",
            fontSize: 12,
          }}
        >
          Browse All →
        </a>
      </div>

      {/* Body — 4 columns × 3 rows = 12 cards */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))", // ⬅️ 4 columns
            gap: 8,
            marginTop: 12,
          }}
        >
          {Array.from({ length: COUNT }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                aspectRatio: "1 / 1",
                background: "#f5f0ff",
                border: `1px solid ${C.recentBorder}`,
                borderRadius: 10,
              }}
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.muted }}>
            No templates available yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))", // ⬅️ 4 columns
            gap: 8,
            marginTop: 12,
          }}
        >
          {templates.map((t, idx) => {
            const cover = resolveUrl(t.imageUrl);
            const isFeatured = idx % 2 === 0;

            return (
              <button
                key={t._id || idx}
                type="button"
                onClick={() => handleUse(t)}
                className="group relative flex flex-col overflow-hidden text-left"
                style={{
                  background: "#fff",
                  border: `1px solid ${C.panelBorder}`,
                  borderRadius: 12,
                  boxShadow: "0 2px 5px #4b237314",
                  cursor: "pointer",
                  transition:
                    "transform .18s, box-shadow .18s, border-color .18s",
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px #4b23732e";
                  e.currentTarget.style.borderColor = "#b794ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 5px #4b237314";
                  e.currentTarget.style.borderColor = C.panelBorder;
                }}
              >
                {/* Square image */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    background: C.projectArt1,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={t.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform .4s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<div style="display:grid;place-items:center;width:100%;height:100%;color:#8500ed;font-size:22px">✨</div>';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "100%",
                        height: "100%",
                        color: "#8500ed",
                        fontSize: 22,
                      }}
                    >
                      ✨
                    </div>
                  )}

                  {/* Tag */}
                  <span
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 5,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      background: isFeatured
                        ? "linear-gradient(135deg,#a855f7,#7620e8)"
                        : "linear-gradient(135deg,#ec4899,#f43f5e)",
                      color: "#fff",
                      borderRadius: 999,
                      padding: "3px 6px",
                      fontSize: 8,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                      boxShadow: "0 2px 4px rgba(0,0,0,.25)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isFeatured ? (
                      <>
                        <Star
                          size={8}
                          strokeWidth={2.5}
                          style={{ fill: "#fff" }}
                        />
                        Featured
                      </>
                    ) : (
                      <>
                        <TrendingUp size={8} strokeWidth={2.5} />
                        Trending
                      </>
                    )}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: "6px 8px 8px" }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: C.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.3,
                    }}
                  >
                    {t.title}
                  </strong>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: 9.5,
                      color: C.subheading,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.prefill?.productType || "Template"}
                  </p>

                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        color: C.subheading,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.prefill?.category || t.group || "General"}
                    </span>
                    <ChevronRight size={11} color={C.textLink} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FeaturedTemplate() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  const resolveUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/product-templates");
        if (!cancelled && res.data?.success) {
          const all = (res.data.data || []).filter((t) => t.isActive !== false);
          // Prefer a template explicitly marked featured; else pick the first
          const pick =
            all.find((t) => t.isFeatured === true) ||
            all.find((t) => t.featured === true) ||
            all[0] ||
            null;
          setFeatured(pick);
        }
      } catch (err) {
        console.error("Failed to load featured template:", err);
        if (!cancelled) setFeatured(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = () => {
    if (featured) {
      navigate("/product-generator", {
        state: { aiPrefill: featured.prefill },
      });
    } else {
      navigate("/templates");
    }
  };

  return (
    <section
      className="panel featured"
      style={{
        background: C.panelBg,
        border: `1px solid ${C.panelBorder}`,
        borderRadius: 24,
        boxShadow: "0 7px 18px #5a478b0c",
        padding: "18px 19px 19px",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: "-0.6px",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: C.ink,
        }}
      >
        <Star size={24} color="#fbbf24" style={{ fill: "#ffb900" }} />
        Featured Template
      </h2>

      {/* Image / Loading */}
      <div
        className="featured-image"
        style={{
          height: 180,
          borderRadius: 15,
          background: C.featuredImage,
          margin: "14px 0 12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {loading ? (
          <div
            className="animate-pulse"
            style={{ width: "100%", height: "100%", background: "#f5f0ff" }}
          />
        ) : featured && featured.imageUrl ? (
          <img
            src={resolveUrl(featured.imageUrl)}
            alt={featured.title || "Featured template"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div style="display:grid;place-items:center;width:100%;height:100%;color:#8500ed;font-size:48px">✨</div>';
            }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "100%",
              height: "100%",
              color: "#8500ed",
              fontSize: 48,
            }}
          >
            ✨
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div
        className="featured-bottom"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <strong
            style={{
              fontSize: 16,
              color: C.ink,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {loading
              ? "Loading..."
              : featured?.title || "Complete Birthday Party Kit"}
          </strong>
          <p
            style={{
              margin: "4px 0 0",
              color: "#675990",
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {loading
              ? "Fetching the latest featured template..."
              : featured?.prefill?.productType ||
                featured?.group ||
                "Games, cards, printables, and more."}
          </p>
        </div>
        <button
          className="circle-arrow"
          aria-label="Open featured template"
          onClick={handleOpen}
          disabled={loading}
          style={{
            height: 45,
            width: 45,
            flexShrink: 0,
            border: `1px solid ${C.circleArrowBorder}`,
            background: "white",
            borderRadius: "50%",
            color: C.circleArrowColor,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 3px 8px #9b4bd329",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "transform .18s, box-shadow .18s",
          }}
          onMouseEnter={(e) => {
            if (loading) return;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px #9b4bd344";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 3px 8px #9b4bd329";
          }}
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </section>
  );
}

// ================================================================
// OCCASION CARDS — Quick Create (matches HTML .occasion-grid)
// ================================================================
const OCCASIONS = [
  {
    label: "Birthday\nParty",
    bg: C.occasion1,
    border: C.occasionBorder,
    icon: Cake,
    iconColor: "#ec4899",
  },
  {
    label: "Christmas\nParty",
    bg: C.occasion2,
    border: "#d4efea",
    icon: TreePine,
    iconColor: "#16a34a",
  },
  {
    label: "Halloween\nParty",
    bg: C.occasion3,
    border: "#fbe7d9",
    icon: Ghost,
    iconColor: "#f97316",
  },
  {
    label: "Wedding\nParty",
    bg: C.occasion4,
    border: "#e7ddff",
    icon: Gem,
    iconColor: "#a855f7",
  },
  {
    label: "Baby\nShower",
    bg: C.occasion5,
    border: "#d8eafd",
    icon: Baby,
    iconColor: "#3b82f6",
  },
  {
    label: "Custom\nParty",
    bg: C.occasion6,
    border: "#e6d7ff",
    icon: PartyPopper,
    iconColor: "#8b5cf6",
  },
];
// ================================================================
// STATS DATA (matches HTML values)
// ================================================================
const STATS = [
  {
    num: "24",
    label: "Total Products",
    gain: "↑ +12%",
    icon: Layers3,
    pink: false,
  },
  {
    num: "128",
    label: "Total Downloads",
    gain: "↑ +28%",
    icon: Download,
    pink: false,
  },
  {
    num: "6",
    label: "Favorite Templates",
    gain: null,
    icon: Heart,
    pink: true,
  },
  {
    num: "2,480",
    label: "AI Generations",
    gain: null,
    icon: Sparkles,
    pink: false,
  },
];

// ================================================================
// MAIN DASHBOARD
// ================================================================
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className=" min-h-screen"
      style={{ background: C.mainBg, color: C.ink }}
    >
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />

        <main
          className="flex-1 overflow-y-auto bg-[#faf9ff] px-[20px] pb-[32px] pl-[25px] pt-[19px]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 78% 5%, #f2edff 0%, transparent 40%)",
          }}
        >
          <div className="max-w-[1650px] mx-auto">
            {/* ===== HERO ===== */}
            <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
              {/* Absolute background image — fills the hero */}
              <img
                src={heroBg}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
              />

              {/* Soft overlay so text stays readable over the image */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50"
              />

              {/* Decorative blobs */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-[100px] -top-[180px] z-[1] h-[300px] w-[490px] rotate-[-20deg] rounded-full bg-[#cda4f44d]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[60px] -bottom-[145px] z-[1] h-[210px] w-[380px] rounded-full bg-[#ffffff38]"
              />

              {/* Content */}
              <div className="relative z-[2] max-w-[550px]">
                {/* ✅ TOP TAG */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                  🎉 Stunning Party Products in Seconds
                </div>

                <h2
                  className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                  style={{ color: C.heroTitle }}
                >
                  Create Amazing
                  <br />
                  Party Products{" "}
                  <span style={{ color: C.heroAccent }}>with AI</span>
                </h2>

                <p
                  className="mb-[17px] max-w-[465px] text-[16px] leading-[1.5]"
                  style={{ color: C.heroText }}
                >
                  Generate games, printables, invitations, and complete party
                  kits in minutes.
                </p>

                <button
                  onClick={() => navigate("/create-mystery")}
                  className="flex items-center gap-[13px] rounded-full border-0 px-8 py-3 text-[16px] font-[750] text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                  style={{ background: C.gradientBtn }}
                >
                  ✨ &nbsp;Create with AI <ArrowRight size={20} />
                </button>
              </div>
            </section>

            {/* ===== STATS ===== */}
            <section
              className="stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="stat"
                    style={{
                      height: 84,
                      background: C.statBg,
                      border: `1px solid ${C.statBorder}`,
                      borderRadius: 19,
                      boxShadow: "0 6px 16px #5e479211",
                      display: "flex",
                      alignItems: "center",
                      padding: "13px 15px",
                      gap: 13,
                    }}
                  >
                    <div
                      className="stat-icon"
                      style={{
                        height: 51,
                        width: 51,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: s.pink ? C.statIconPinkBg : C.statIconBg,
                        display: "grid",
                        placeItems: "center",
                        color: s.pink ? C.statIconPink : C.statIconColor,
                        boxShadow: "0 4px 10px #8e4ac51c",
                      }}
                    >
                      <Icon size={28} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div
                        className="stat-num"
                        style={{
                          fontSize: 23,
                          fontWeight: 800,
                          letterSpacing: "-0.8px",
                          lineHeight: 1.1,
                          color: C.ink,
                        }}
                      >
                        {s.num}
                      </div>
                      <div
                        className="stat-label"
                        style={{
                          fontSize: 13,
                          color: "#65578e",
                          marginTop: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                    {s.gain && (
                      <span
                        className="gain"
                        style={{
                          marginLeft: "auto",
                          color: C.gainColor,
                          background: C.gainBg,
                          borderRadius: 16,
                          fontSize: 12,
                          padding: "5px 7px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.gain}
                      </span>
                    )}
                  </div>
                );
              })}
            </section>

            {/* ===== CONTENT GRID ===== */}
            <div
              className="content-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) 351px",
                gap: 18,
              }}
            >
              {/* LEFT COLUMN */}
              <div
                className="left-col"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  minWidth: 0,
                }}
              >
                {/* QUICK CREATE */}
                <section
                  className="panel quick"
                  style={{
                    background: C.panelBg,
                    border: `1px solid ${C.panelBorder}`,
                    borderRadius: 24,
                    boxShadow: "0 7px 18px #5a478b0c",
                    padding: "18px 21px 17px",
                  }}
                >
                  <div
                    className="panel-head"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: "-0.7px",
                        margin: 0,
                        color: C.ink,
                      }}
                    >
                      Quick Create
                    </h2>
                    <a
                      href="#tools"
                      className="text-link"
                      style={{
                        color: C.textLink,
                        textDecoration: "none",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        fontSize: 14,
                      }}
                    >
                      View All Tools →
                    </a>
                  </div>
                  <p
                    className="subheading"
                    style={{
                      color: C.subheading,
                      margin: "3px 0 18px",
                      fontSize: 14,
                    }}
                  >
                    Start a new party product in seconds.
                  </p>

                  <div
                    className="occasion-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6,minmax(0,1fr))",
                      gap: 13,
                    }}
                  >
                    {OCCASIONS.map((o, idx) => {
                      const Icon = o.icon;
                      return (
                        <button
                          key={idx}
                          className="occasion"
                          onClick={() => navigate("/create-mystery")}
                          style={{
                            height: 124,
                            border: `1px solid ${o.border}`,
                            borderRadius: 18,
                            background: o.bg,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            cursor: "pointer",
                            fontWeight: 650,
                            fontSize: 14,
                            lineHeight: 1.2,
                            color: C.ink,
                            padding: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 7px 12px #4b23731a";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {/* ✅ Lucide icon replaces the emoji */}
                          <div
                            className="occasion-art"
                            style={{
                              width: 65,
                              height: 66,
                              marginBottom: 7,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon
                              size={48}
                              strokeWidth={1.6}
                              style={{ color: o.iconColor }}
                            />
                          </div>
                          <span style={{ whiteSpace: "pre-line" }}>
                            {o.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* RECENT PROJECTS */}
                <RecentProjects />
              </div>

              {/* RIGHT COLUMN */}
              <div
                className="right-col"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  minWidth: 0,
                }}
              >
                {/* QUICK INSTRUCTIONS */}
                <section className="rounded-[24px] border border-[#ede8fb] bg-[#ffffffb8] px-5 py-5 shadow-[0_7px_18px_#5a478b0c]">
                  {/* Header */}
                  <div className="mb-[18px] flex items-center justify-between">
                    <h2 className="m-0 flex items-center gap-3 text-[19px] font-extrabold tracking-[-0.6px] text-[#151032]">
                      <Sparkles size={22} className="text-[#7620e8]" />
                      Quick Instructions
                    </h2>
                    <span className="rounded-full bg-[#e8f8ee] px-[11px] py-[6px] text-[13px] font-[750] text-[#008d34]">
                      Start Here
                    </span>
                  </div>

                  {/* Steps */}
                  <ol className="m-0 flex list-none flex-col gap-3 p-0">
                    {[
                      {
                        n: 1,
                        title: "Pick an occasion",
                        desc: "Choose from Birthday, Christmas, Wedding, or Custom.",
                      },
                      {
                        n: 2,
                        title: "Generate with AI",
                        desc: "Click “Create with AI” and describe your party idea.",
                      },
                      {
                        n: 3,
                        title: "Customize & export",
                        desc: "Edit the kit, then download as PDF or ZIP.",
                      },
                    ].map((step) => (
                      <li key={step.n} className="flex items-start gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7620e8] text-[13px] font-bold text-white">
                          {step.n}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#151032]">
                            {step.title}
                          </div>
                          <div className="mt-[3px] text-[13px] leading-[1.5] text-[#62558f]">
                            {step.desc}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>

                  {/* CTA */}
                  <button
                    onClick={() => navigate("/create-mystery")}
                    className="mt-[18px] flex h-10 w-full items-center justify-center gap-2 rounded-full border-0 bg-[linear-gradient(110deg,#d634ef_0%,#8e15e5_50%,#4d00af_100%)] text-[14px] font-bold text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                  >
                    Get Started <ArrowRight size={16} />
                  </button>
                </section>
                {/* FEATURED TEMPLATE */}
                <FeaturedTemplate />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
