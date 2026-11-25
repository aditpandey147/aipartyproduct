// frontend/src/pages/PartyKitBuilder.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import heroBg from "../assets/images/party-banner.png";
import {
  Gift, Pencil, Layers, Layers3, ArrowRight, Check,
  Loader2, Download, Image as ImageIcon, FileText,
  Cake, PartyPopper, Baby, Gem, Ghost, TreePine,
  Flame, Sparkles,
} from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
};

const THEMES = [
  { name: "Birthday Party Kit", amount: "12+ Items", Icon: Cake },
  { name: "Kids Party Kit", amount: "10+ Items", Icon: PartyPopper },
  { name: "Baby Shower Kit", amount: "11+ Items", Icon: Baby },
  { name: "Wedding Party Kit", amount: "15+ Items", Icon: Gem },
  { name: "Halloween Party Kit", amount: "12+ Items", Icon: Ghost },
  { name: "Christmas Party Kit", amount: "14+ Items", Icon: TreePine },
];

const PartyKitBuilder = () => {
  const navigate = useNavigate();

  const [activeTheme, setActiveTheme] = useState(0);
  const [kitTitle, setKitTitle] = useState("Birthday Party Kit");
  const [ageGroup, setAgeGroup] = useState("Kids (5–10 Years)");
  const [partyStyle, setPartyStyle] = useState("Colorful & Fun");
  const [numItems, setNumItems] = useState("10–15 Items");
  const [requirements, setRequirements] = useState("");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [selectedIds, setSelectedIds] = useState({});

  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---- Load user's products via existing `api` service ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");
        const { data } = await api.get("/party-products");
        if (!alive) return;
        const items = (data?.data || []).filter(
          (p) => p.status === "completed" && p.imageUrl
        );
        setProducts(items);
      } catch (err) {
        if (!alive) return;
        if (err.response?.status === 401) {
          setProductsError("Please log in to see your products.");
        } else {
          setProductsError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load products"
          );
        }
      } finally {
        if (alive) setLoadingProducts(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds]
  );

  const handleThemeClick = (idx, themeName) => {
    setActiveTheme(idx);
    setKitTitle(themeName);
  };

  const toggleProduct = (id) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---- Generate ZIP (auto-download) ----
  const handleGenerate = async () => {
    setError("");
    setMessage("");

    const productIds = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (productIds.length === 0) {
      setError("Please select at least one product for your kit.");
      return;
    }

    try {
      setGenerating(true);

      const payload = {
        kitTitle,
        theme: THEMES[activeTheme]?.name || kitTitle,
        ageGroup,
        partyStyle,
        numItems,
        requirements,
        productIds,
      };

      const res = await api.post("/party-kits/generate", payload, {
        responseType: "blob",
      });

      const cd = res.headers["content-disposition"] || "";
      const match = /filename="?([^";]+)"?/i.exec(cd);
      const filename = match
        ? match[1]
        : `${kitTitle.replace(/\s+/g, "-")}.zip`;

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setMessage(`Your party kit "${kitTitle}" was built and downloaded.`);
    } catch (err) {
      let msg = err.message || "Failed to generate kit";
      if (err.response?.status === 401) {
        msg = "Your session expired. Please log in again.";
      } else if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          msg = json.message || msg;
        } catch {}
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />

        <main
          className="flex-1 overflow-y-auto px-5 pb-8 pt-5"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 78% 5%, #f2edff 0%, transparent 40%)",
          }}
        >
          {/* ===== HERO ===== */}
          <section className="relative mb-5 overflow-hidden rounded-[23px] border border-[#e8d5ff] px-8 py-10">
            <img
              src={heroBg}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50"
            />
            <div className="relative z-[2] max-w-[620px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d]">
                <Gift size={16} />
                Party Kit Builder
              </div>
              <h2
                className="mb-2 text-[34px] font-[850] leading-[1.15] tracking-[-1.4px]"
                style={{ color: C.heroTitle }}
              >
                Bundle Your
                <br />
                Generated Products{" "}
                <span style={{ color: C.heroAccent }}>into a Kit</span>
              </h2>
              <p
                className="mb-4 max-w-[520px] text-[15px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Pick products you've already generated, fill in the kit details,
                and download everything as a single ZIP — ready to sell.
              </p>
              <button
                onClick={() => navigate("/create-mystery")}
                className="flex items-center gap-3 rounded-full px-7 py-3 text-[15px] font-bold text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                style={{ background: C.gradientBtn }}
              >
                <Sparkles size={18} />
                Generate More Products <ArrowRight size={18} />
              </button>
            </div>
          </section>

          {/* ===== POPULAR THEMES ===== */}
          <section
            className="rounded-[20px] p-4 mb-4"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,.91),rgba(250,248,255,.83))",
              border: "1px solid #dcd9ff",
              boxShadow: "0 5px 12px #3f20a61a",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-[20px] flex items-center gap-2 text-[#080d35]">
                <Flame size={22} style={{ color: "#8500ff" }} strokeWidth={2.4} />
                Popular Party Kit Themes
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {THEMES.map((theme, i) => {
                const active = activeTheme === i;
                const ThemeIcon = theme.Icon;
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => handleThemeClick(i, theme.name)}
                    className="relative flex flex-col items-center text-center px-2 py-3 rounded-[17px] transition"
                    style={{
                      border: active ? "2px solid #8612ff" : "1px solid #dad8fa",
                      background: active
                        ? "linear-gradient(150deg,#fff,#f4eaff)"
                        : "linear-gradient(140deg,#fff,#faf8ff)",
                      boxShadow: active
                        ? "0 4px 9px #6c20f73b"
                        : "0 4px 7px #4a26ae17",
                      cursor: "pointer",
                    }}
                  >
                    {active && (
                      <span
                        className="absolute grid place-items-center rounded-full bg-[#7000ff] text-white"
                        style={{ top: 9, right: 9, width: 25, height: 25 }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                    <div className="flex items-center justify-center py-3">
                      <span
                        className="grid place-items-center rounded-full"
                        style={{
                          width: 60,
                          height: 60,
                          background: active
                            ? "linear-gradient(135deg,#f2ddff,#e4ccff)"
                            : "linear-gradient(135deg,#f7f1ff,#efe7ff)",
                          color: "#8500ff",
                        }}
                      >
                        <ThemeIcon size={30} strokeWidth={2} />
                      </span>
                    </div>
                    <strong className="text-[13px] font-extrabold text-[#080d35] leading-tight">
                      {theme.name}
                    </strong>
                    <div className="text-[12px] text-[#5d5191] mt-0.5">
                      {theme.amount}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ===== MAIN GRID ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-4">
            {/* --- Kit Details --- */}
            <section
              className="rounded-[20px] p-5"
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,.91),rgba(250,248,255,.83))",
                border: "1px solid #dcd9ff",
                boxShadow: "0 5px 12px #3f20a61a",
              }}
            >
              <h2 className="flex items-center gap-3 font-extrabold text-[19px] mb-4 text-[#080d35]">
                <Pencil size={22} style={{ color: "#8500ff" }} strokeWidth={2.4} />
                Party Kit Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <label className="font-bold text-[13px] text-[#080d35]">
                  Kit Title <span className="text-red-500">*</span>
                  <input
                    value={kitTitle}
                    onChange={(e) => setKitTitle(e.target.value)}
                    className="field mt-2"
                  />
                </label>

                <label className="font-bold text-[13px] text-[#080d35]">
                  Target Age Group
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="field mt-2"
                  >
                    <option>Kids (5–10 Years)</option>
                    <option>Toddlers (1–4 Years)</option>
                    <option>Teens (11–17 Years)</option>
                    <option>Adults (18+ Years)</option>
                    <option>All Ages</option>
                  </select>
                </label>

                <label className="font-bold text-[13px] text-[#080d35]">
                  Party Theme / Style <span className="text-red-500">*</span>
                  <select
                    value={partyStyle}
                    onChange={(e) => setPartyStyle(e.target.value)}
                    className="field mt-2"
                  >
                    <option>Colorful & Fun</option>
                    <option>Elegant</option>
                    <option>Minimal</option>
                    <option>Festive</option>
                    <option>Pastel</option>
                  </select>
                </label>

                <label className="font-bold text-[13px] text-[#080d35]">
                  Number of Items
                  <select
                    value={numItems}
                    onChange={(e) => setNumItems(e.target.value)}
                    className="field mt-2"
                  >
                    <option>10–15 Items</option>
                    <option>5–10 Items</option>
                    <option>15–20 Items</option>
                    <option>20+ Items</option>
                  </select>
                </label>

                <label className="font-bold text-[13px] text-[#080d35] col-span-full">
                  Additional Requirements{" "}
                  <span className="font-normal">(Optional)</span>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="field mt-2 !h-auto py-2 resize-y"
                    rows={3}
                    placeholder="e.g., include editable files, specific colors, or custom text..."
                  />
                </label>
              </div>
            </section>

            {/* --- Your Generated Products --- */}
            <section
              className="rounded-[20px] p-5"
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,.91),rgba(250,248,255,.83))",
                border: "1px solid #dcd9ff",
                boxShadow: "0 5px 12px #3f20a61a",
              }}
            >
              <h2 className="flex items-center gap-3 font-extrabold text-[19px] text-[#080d35]">
                <Layers size={22} style={{ color: "#8500ff" }} strokeWidth={2.4} />
                Your Generated Products
              </h2>
              <p className="text-[13px] text-[#5d5191] mt-1 mb-4">
                Pick the products to include in this kit. Selected items become
                files in the downloaded ZIP.
              </p>

              {loadingProducts && (
                <div className="flex items-center gap-2 text-[13px] text-[#5d5191]">
                  <Loader2 size={16} className="animate-spin" /> Loading your
                  products…
                </div>
              )}

              {productsError && (
                <div className="text-[13px] text-red-600">{productsError}</div>
              )}

              {!loadingProducts && !productsError && products.length === 0 && (
                <div className="text-[13px] text-[#5d5191]">
                  You haven't generated any products yet.{" "}
                  <button
                    onClick={() => navigate("/create-mystery")}
                    className="text-[#7700ff] font-semibold underline"
                  >
                    Create one first →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const checked = !!selectedIds[p._id];
                  const isPdf = p.outputFormat === "PDF";
                  return (
                    <label
                      key={p._id}
                      className="flex flex-col gap-2 rounded-[14px] p-2.5 cursor-pointer transition"
                      style={{
                        border: checked
                          ? "2px solid #a584ff"
                          : "1px solid #d4d1fa",
                        background: checked
                          ? "linear-gradient(140deg,#f8f2ff,#f3eaff)"
                          : "linear-gradient(140deg,#fff,#fbfaff)",
                        boxShadow: "0 3px 5px #3b2a9912",
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-[#f4f0ff]">
                        {isPdf ? (
                          <div className="w-full h-full grid place-items-center text-[#7700ff]">
                            <FileText size={36} />
                          </div>
                        ) : (
                          <img
                            src={resolveUrl(p.imageUrl)}
                            alt={p.productType}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(p._id)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 accent-[#7600ff] cursor-pointer"
                        />
                      </div>
                      <div className="text-[12px] font-bold text-[#080d35] leading-tight line-clamp-2">
                        {p.productType}
                      </div>
                      <div className="text-[11px] text-[#5d5191] flex items-center gap-1">
                        {isPdf ? (
                          <>
                            <FileText size={12} /> PDF
                          </>
                        ) : (
                          <>
                            <ImageIcon size={12} /> Image
                          </>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ===== SUMMARY + GENERATE ===== */}
          <section
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] p-4"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,.91),rgba(250,248,255,.83))",
              border: "1px solid #dcd9ff",
              boxShadow: "0 5px 12px #3f20a61a",
            }}
          >
            <h2 className="font-extrabold text-[19px] flex items-center gap-2 text-[#080d35] whitespace-nowrap">
              <Layers3 size={22} style={{ color: "#8500ff" }} strokeWidth={2.4} />
              Your Party Kit
            </h2>

            <div className="rounded-full bg-[#f2eaff] px-5 py-2 font-semibold text-[13px] whitespace-nowrap text-[#080d35]">
              Selected Products:{" "}
              <b className="text-[#7700ff] text-[16px] ml-1">{selectedCount}</b>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || selectedCount === 0}
              className="rounded-full px-6 py-3 font-bold text-[15px] text-white whitespace-nowrap shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: C.gradientBtn }}
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Building ZIP…
                </>
              ) : (
                <>
                  <Download size={18} />
                  Generate Kit & Download ZIP
                </>
              )}
            </button>
          </section>

          {error && (
            <p className="mt-2 text-sm text-red-600 font-semibold">{error}</p>
          )}
          {message && (
            <p className="mt-2 text-sm text-green-700 font-semibold">{message}</p>
          )}

          <style>{`
            .field {
              width: 100%;
              border: 1px solid #c9c8fb;
              border-radius: 11px;
              background: linear-gradient(#fff,#fbfaff);
              padding: 10px 14px;
              outline: none;
              box-shadow: 0 2px 4px #39259c12;
              font-size: 14px;
            }
            .field:focus { border-color: #8b19ff; }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}</style>
        </main>
      </div>
    </div>
  );
};

export default PartyKitBuilder;