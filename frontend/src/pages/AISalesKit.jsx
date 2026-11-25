// frontend/src/pages/AISalesKit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import heroBg from "../assets/images/game-banner.png";
import {
  Gift, Layers3, Sparkles, Search, Tags, TrendingUp,
  ArrowRight, Check, Copy, Download, RefreshCw,
  ShoppingBag, Store, CreditCard, Globe, Loader2, Wand2,
} from "lucide-react";

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
};

const PLATFORMS = [
  {
    key: "etsy",
    name: "Etsy",
    tagline: "Handmade & digital marketplace",
    Icon: ShoppingBag,
    badgeBg: "#f97316",
    badgeColor: "#ffffff",
    accent: "#f97316",
    softBg: "linear-gradient(135deg,#fff3e8,#ffe6d2)",
    previewCard: "#ffe4f2",
    previewBorder: "#e9bddb",
    previewText: "#a88aba",
    priceLabel: "$4.99",
    exportSlug: "etsy-sales-kit",
  },
  {
    key: "gumroad",
    name: "Gumroad",
    tagline: "Sell digital products & memberships",
    Icon: Store,
    badgeBg: "#ff90e8",
    badgeColor: "#1a1a1a",
    accent: "#ff90e8",
    softBg: "linear-gradient(135deg,#fff0fb,#ffe4f6)",
    previewCard: "#ffe7f7",
    previewBorder: "#f7bfe7",
    previewText: "#b57aa2",
    priceLabel: "$5.00",
    exportSlug: "gumroad-sales-kit",
  },
  {
    key: "payhip",
    name: "Payhip",
    tagline: "Instant digital storefront",
    Icon: CreditCard,
    badgeBg: "#22c55e",
    badgeColor: "#ffffff",
    accent: "#22c55e",
    softBg: "linear-gradient(135deg,#edfdf3,#dff7e7)",
    previewCard: "#e4fbf0",
    previewBorder: "#bfe9d3",
    previewText: "#7aa493",
    priceLabel: "$4.50",
    exportSlug: "payhip-sales-kit",
  },
  {
    key: "shopify",
    name: "Shopify",
    tagline: "Full ecommerce store",
    Icon: Globe,
    badgeBg: "#95bf47",
    badgeColor: "#ffffff",
    accent: "#95bf47",
    softBg: "linear-gradient(135deg,#f2f9e6,#e6f2d1)",
    previewCard: "#e9f4d8",
    previewBorder: "#c9dfa2",
    previewText: "#7a9159",
    priceLabel: "$5.99",
    exportSlug: "shopify-sales-kit",
  },
];

const TABS = ["Listing", "Tags & SEO", "Mockups", "Insights"];

const AISalesKit = () => {
  const navigate = useNavigate();

  // ---- Products loaded from backend ----
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Listing");
  const [tags, setTags] = useState([]);
  const [platformKey, setPlatformKey] = useState("etsy");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info"); // info | error | success

  const platform = useMemo(
    () => PLATFORMS.find((p) => p.key === platformKey) || PLATFORMS[0],
    [platformKey]
  );

  // Listing content (empty until generated)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ---------- Load user's products ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");
        const { data } = await api.get("/party-products");
        if (!alive) return;
        const items = (data?.data || [])
          .filter((p) => p.status === "completed")
          .map((p) => ({
            _id: p._id,
            name: p.productType,
            meta: `${p.category} • ${p.outputFormat || "Image"}`,
          }));
        setProducts(items);
        setSelectedIndex(0);
      } catch (err) {
        if (!alive) return;
        setProductsError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load products"
        );
      } finally {
        if (alive) setLoadingProducts(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const selectedProduct = products[selectedIndex] || null;

  const filteredProducts = useMemo(
    () =>
      products
        .map((p, i) => ({ ...p, idx: i }))
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [products, searchQuery]
  );

  const handleSelectProduct = (idx) => {
    setSelectedIndex(idx);
    // reset generated content when switching product
    setTitle("");
    setDescription("");
    setTags([]);
    setNotice("");
  };

  const handleRemoveTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setNoticeType("success");
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNoticeType("error");
      setNotice("Clipboard unavailable; select and copy the text manually.");
    }
  };

  // ---------- Generate listing via DeepSeek ----------
  const handleGenerateListing = async () => {
    if (!selectedProduct) {
      setNoticeType("error");
      setNotice("Select a product first.");
      return;
    }
    try {
      setGenerating(true);
      setNotice("");
      const { data } = await api.post("/sales-kits/generate-listing", {
        productId: selectedProduct._id,
        platform: platformKey,
      });
      const listing = data?.data;
      if (!listing) throw new Error("Empty listing returned");
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setTags(Array.isArray(listing.tags) ? listing.tags : []);
      setNoticeType("success");
      setNotice(
        `Listing generated with DeepSeek for "${selectedProduct.name}" on ${platform.name}.`
      );
    } catch (err) {
      setNoticeType("error");
      setNotice(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate listing"
      );
    } finally {
      setGenerating(false);
    }
  };

  // ---------- Export via backend (archiver) ----------
  const handleExport = async () => {
    if (!selectedProduct) {
      setNoticeType("error");
      setNotice("Select a product first.");
      return;
    }
    if (!title || !description) {
      setNoticeType("error");
      setNotice("Generate or fill in title and description before exporting.");
      return;
    }

    try {
      setExporting(true);
      setNotice("");

      const res = await api.post(
        "/sales-kits/export",
        {
          productId: selectedProduct._id,
          platform: platformKey,
          title,
          description,
          tags,
          includeFiles: true,
        },
        { responseType: "blob" }
      );

      // Read filename from Content-Disposition if present
      const cd = res.headers["content-disposition"] || "";
      const match = /filename="?([^";]+)"?/i.exec(cd);
      const filename = match
        ? match[1]
        : `${platform.exportSlug}-${selectedProduct.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.zip`;

      // Auto-download
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setNoticeType("success");
      setNotice(`${filename} built and downloaded.`);
    } catch (err) {
      // blob error → read as text to extract JSON message
      let msg = err.message || "Export failed";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          msg = json.message || msg;
        } catch {}
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setNoticeType("error");
      setNotice(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== "Listing") {
      setNoticeType("info");
      setNotice(`This is a UI preview. Connect your data for the ${tab} tab.`);
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
          {/* ================= TOP BANNER ================= */}
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
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[100px] -top-[180px] z-[1] h-[300px] w-[490px] rotate-[-20deg] rounded-full bg-[#cda4f44d]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[60px] -bottom-[145px] z-[1] h-[210px] w-[380px] rounded-full bg-[#ffffff38]"
            />

            <div className="relative z-[2] max-w-[620px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                <Gift size={16} />
                &nbsp;AI Sales Kit
              </div>
              <h2
                className="mb-2 text-[34px] font-[850] leading-[1.15] tracking-[-1.4px]"
                style={{ color: C.heroTitle }}
              >
                Boost Your Sales
                <br />
                on {platform.name}{" "}
                <span style={{ color: C.heroAccent }}>with AI</span>
              </h2>
              <p
                className="mb-4 max-w-[520px] text-[15px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Generate complete party listing content — titles, descriptions,
                tags, and professional mockups — using AI.
              </p>
              <button
                onClick={() => navigate("/create-mystery")}
                className="flex items-center gap-3 rounded-full px-7 py-3 text-[15px] font-bold text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                style={{ background: C.gradientBtn }}
              >
                ✨ &nbsp;Start Selling Now <ArrowRight size={18} />
              </button>
            </div>
          </section>

          {/* ================= STEP INDICATOR ================= */}
          <div
            className="mb-5 flex flex-wrap items-center justify-around gap-3 rounded-[17px] px-6 py-4"
            style={{
              background: "rgba(255,255,255,.76)",
              border: "1px solid #e0d8ff",
              boxShadow: "0 3px 7px #5e2ce41c,0 1px 1px #a89cf566",
            }}
          >
            {[
              { n: 1, label: "Choose Platform" },
              { n: 2, label: "Select Product" },
              { n: 3, label: "Generate Listing" },
              { n: 4, label: "Review & Export" },
            ].map((step, i) => (
              <React.Fragment key={step.n}>
                <div
                  className={`flex items-center gap-3 text-[14px] font-bold whitespace-nowrap ${
                    i === 0
                      ? "rounded-full px-4 py-1.5 text-white"
                      : "text-[#090c38]"
                  }`}
                  style={
                    i === 0
                      ? { background: "linear-gradient(130deg,#a523ff,#4600e9)" }
                      : {}
                  }
                >
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-full text-[16px] font-bold ${
                      i === 0
                        ? "bg-white text-[#140849]"
                        : "border-2 border-[#c4bafa] bg-white text-[#090c38]"
                    }`}
                  >
                    {step.n}
                  </span>
                  {step.label}
                </div>
                {i < 3 && (
                  <ArrowRight
                    size={20}
                    className="hidden sm:block text-[#9b9bd8]"
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ================= PLATFORM SELECTOR ================= */}
          <section
            className="rounded-[17px] p-5 mb-4"
            style={{
              background: "rgba(255,255,255,.76)",
              border: "1px solid #e0d8ff",
              boxShadow: "0 3px 7px #5e2ce41c,0 1px 1px #a89cf566",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag size={28} style={{ color: "#7800ff" }} />
              <div>
                <h2 className="font-black text-[20px] tracking-[-0.7px] text-[#090c38]">
                  Choose Listing Platform
                </h2>
                <p className="text-[13px] text-[#302d62]">
                  Pick where you want to sell — listing format adapts to the
                  platform.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map((p) => {
                const active = platformKey === p.key;
                const Icon = p.Icon;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPlatformKey(p.key);
                      setNotice("");
                    }}
                    className="relative flex flex-col items-start text-left rounded-[14px] p-3 transition hover:brightness-[1.02]"
                    style={{
                      border: active
                        ? `2px solid ${p.accent}`
                        : "1px solid #dcd3ff",
                      background: active ? p.softBg : "#faf9ff",
                      boxShadow: active
                        ? "0 4px 9px #6c20f73b"
                        : "0 3px 5px #3d19a21b",
                      cursor: "pointer",
                    }}
                  >
                    {active && (
                      <span
                        className="absolute grid place-items-center rounded-full text-white"
                        style={{
                          top: 9,
                          right: 9,
                          width: 22,
                          height: 22,
                          background: p.accent,
                        }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                    <span
                      className="grid place-items-center rounded-[10px] mb-2"
                      style={{
                        width: 38,
                        height: 38,
                        background: p.badgeBg,
                        color: p.badgeColor,
                      }}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <strong className="text-[14px] font-extrabold text-[#090c38]">
                      {p.name}
                    </strong>
                    <span className="text-[11.5px] leading-[15px] text-[#5d5191] mt-0.5">
                      {p.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ================= LOWER GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-[378px_minmax(0,1fr)] gap-4">
            {/* LEFT: PRODUCT LIST */}
            <section
              className="rounded-[17px] p-4 flex flex-col"
              style={{
                background: "rgba(255,255,255,.76)",
                border: "1px solid #e0d8ff",
                boxShadow: "0 3px 7px #5e2ce41c,0 1px 1px #a89cf566",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <Layers3 size={24} style={{ color: "#7800ff" }} />
                <div>
                  <h2 className="font-black text-[18px] tracking-[-0.6px] text-[#090c38]">
                    Select Your Product
                  </h2>
                  <p className="text-[12px] leading-[18px] text-[#302d62]">
                    Choose one of your generated products to build a{" "}
                    {platform.name} sales kit.
                  </p>
                </div>
              </div>

              <div
                className="flex items-center px-3 py-2 rounded-[12px] gap-2 mb-3"
                style={{
                  background: "rgba(255,255,255,.8)",
                  border: "1px solid #d9d1ff",
                  boxShadow: "0 2px 4px #4d25bf16",
                }}
              >
                <Search size={18} className="text-[#302d62]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[12px] outline-none"
                  placeholder="Search your products..."
                />
              </div>

              {loadingProducts && (
                <div className="flex items-center gap-2 text-[12px] text-[#5d5191] mb-2">
                  <Loader2 size={14} className="animate-spin" /> Loading
                  products…
                </div>
              )}

              {productsError && (
                <div className="text-[12px] text-red-600 mb-2">
                  {productsError}
                </div>
              )}

              {!loadingProducts &&
                !productsError &&
                products.length === 0 && (
                  <div className="text-[12px] text-[#5d5191]">
                    No completed products yet.{" "}
                    <button
                      onClick={() => navigate("/create-mystery")}
                      className="text-[#7700ff] font-semibold underline"
                    >
                      Create one →
                    </button>
                  </div>
                )}

              <div className="flex flex-col gap-1.5 max-h-[278px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const active = selectedIndex === p.idx;
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => handleSelectProduct(p.idx)}
                      className="flex items-center gap-3 text-left px-3 py-2.5 rounded-[11px] transition"
                      style={{
                        border: active
                          ? "1px solid #8300ff"
                          : "1px solid #dcd3ff",
                        background: active ? "#f3e9ff" : "#faf9ff",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        readOnly
                        className="w-4 h-4 accent-[#7400f7] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-[13px] text-[#090c38] truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#302d62]">
                          {p.meta}
                        </div>
                      </div>
                      <span
                        className="text-[16px]"
                        style={{ color: active ? "#7400f7" : "#a89ccf" }}
                      >
                        {active ? "●" : "○"}
                      </span>
                    </button>
                  );
                })}
                {filteredProducts.length === 0 &&
                  products.length > 0 &&
                  !loadingProducts && (
                    <div className="text-center text-[12px] text-[#302d62] py-6">
                      No products match your search.
                    </div>
                  )}
              </div>

              {/* Generate Listing button */}
              <button
                type="button"
                onClick={handleGenerateListing}
                disabled={generating || !selectedProduct}
                className="mt-3 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold text-white shadow-[0_4px_8px_#5b0ed633] transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: C.gradientBtn }}
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate Listing
                  </>
                )}
              </button>
              {selectedProduct && (
                <p className="mt-2 text-[11px] text-center text-[#5d5191]">
                  Uses <b>{selectedProduct.name}</b> on{" "}
                  <b>{platform.name}</b>.
                </p>
              )}
            </section>

            {/* RIGHT: AI SALES KIT */}
            <section
              className="rounded-[17px] p-5"
              style={{
                background: "rgba(255,255,255,.76)",
                border: "1px solid #e0d8ff",
                boxShadow: "0 3px 7px #5e2ce41c,0 1px 1px #a89cf566",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="font-black text-[18px] tracking-[-0.6px] flex gap-2 items-center text-[#090c38]">
                  <Sparkles size={22} style={{ color: "#7800ff" }} />
                  AI Generated {platform.name} Sales Kit
                </h2>
                <span
                  className={`rounded-full text-[11px] px-3 py-1 font-semibold ${
                    title
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {title ? "✔ Ready to Publish" : "Awaiting generation"}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {TABS.map((tab) => {
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleTabClick(tab)}
                      className="rounded-full px-4 py-2 text-[13px] font-bold transition"
                      style={{
                        background: active
                          ? "linear-gradient(180deg,#a900ff,#4300ed)"
                          : "#f3efff",
                        border: active
                          ? "1px solid transparent"
                          : "1px solid #e2d8ff",
                        color: active ? "#fff" : "#090c38",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Listing Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.88fr] gap-5">
                {/* Left: Title + Description */}
                <div>
                  <div className="flex justify-between font-bold text-[13px] text-[#090c38] mb-1">
                    <label>{platform.name} Title</label>
                    <span className="text-[#332ca1] font-normal">
                      {title.length}/140
                    </span>
                  </div>
                  <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Click Generate Listing to populate this..."
                    className="w-full px-4 py-3 text-[13px] resize-none leading-5 rounded-[12px]"
                    style={{
                      background: "rgba(255,255,255,.8)",
                      border: "1px solid #d9d1ff",
                      boxShadow: "0 2px 4px #4d25bf16",
                      minHeight: 56,
                    }}
                    rows={2}
                  />

                  <div className="flex justify-between font-bold text-[13px] text-[#090c38] mt-3 mb-1">
                    <label>{platform.name} Description</label>
                    <span className="text-[#332ca1] font-normal">
                      {description.length}/5000
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Click Generate Listing to populate this..."
                    className="w-full p-4 text-[13px] resize-none leading-[18px] rounded-[12px]"
                    style={{
                      background: "rgba(255,255,255,.8)",
                      border: "1px solid #d9d1ff",
                      boxShadow: "0 2px 4px #4d25bf16",
                      minHeight: 200,
                    }}
                    rows={8}
                  />
                </div>

                {/* Right: Platform Preview */}
                <div
                  className="p-3 rounded-[12px]"
                  style={{
                    background: "rgba(255,255,255,.8)",
                    border: "1px solid #d9d1ff",
                    boxShadow: "0 2px 4px #4d25bf16",
                  }}
                >
                  <h3 className="font-extrabold text-[13px] flex items-center gap-2 mb-2 text-[#090c38]">
                    <span
                      className="text-white px-2 rounded"
                      style={{
                        background: platform.badgeBg,
                        color: platform.badgeColor,
                      }}
                    >
                      {platform.name.charAt(0)}
                    </span>
                    Listing Preview ({platform.name} Style)
                  </h3>

                  <div
                    className="rounded-[12px] flex items-center justify-center text-[12px]"
                    style={{
                      minHeight: 152,
                      background: platform.previewCard,
                      color: platform.previewText,
                      border: `1px dashed ${platform.previewBorder}`,
                    }}
                  >
                    🖼️ Add your mockup image
                  </div>

                  <div className="font-bold text-[13px] leading-[17px] mt-2 text-[#090c38]">
                    {title
                      ? title.slice(0, 80) + (title.length > 80 ? "..." : "")
                      : "Your listing title will appear here."}
                  </div>

                  <div className="flex justify-between mt-2 text-[12px]">
                    <span className="text-[#090c38]">
                      ⭐ <b>4.8</b> (1,240 reviews)
                    </span>
                    <span className="bg-orange-100 text-orange-800 rounded-full px-2">
                      🔥 Best Seller
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <b className="text-[20px] text-[#090c38]">
                      {platform.priceLabel}
                    </b>
                    <span className="bg-[#eee1ff] text-[#3900bc] rounded-full px-3 py-1 text-[11px] font-bold">
                      ⇩ Instant Download
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ================= TAGS + INSIGHTS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_.95fr] gap-4 mt-4">
            <section
              className="rounded-[17px] px-5 py-4"
              style={{
                background: "rgba(255,255,255,.76)",
                border: "1px solid #e0d8ff",
                boxShadow: "0 3px 7px #5e2ce41c,0 1px 1px #a89cf566",
              }}
            >
              <h3 className="font-extrabold flex gap-2 items-center mb-3 text-[#090c38]">
                <Tags size={18} style={{ color: "#7800ff" }} />
                Generated Tags ({tags.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <span className="text-[12px] text-[#5d5191]">
                    Tags appear after you generate a listing.
                  </span>
                )}
                {tags.map((tag, i) => (
                  <button
                    key={`${tag}-${i}`}
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className="bg-[#eee1ff] text-[#3900bc] rounded-full px-3 py-1.5 text-[11px] font-bold hover:bg-[#e2d0ff] transition"
                  >
                    {tag} &nbsp;×
                  </button>
                ))}
              </div>
            </section>

            <section
              className="rounded-[17px] px-5 py-4"
              style={{
                background: "rgba(255,255,255,.76)",
                border: "1px solid #e0d8ff",
                boxShadow: "0 3px 7px #5e2ce41c,0 1px 1px #a89cf566",
              }}
            >
              <h3 className="font-extrabold flex gap-2 items-center mb-3 text-[#090c38]">
                <TrendingUp size={18} style={{ color: "#7800ff" }} />
                {platform.name} Sales Insights
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-[11px] text-[#302d62] mb-1">
                    Est. Monthly Sales
                  </div>
                  <span className="bg-green-100 rounded-full px-3 py-1 font-bold text-green-900 text-[12px] inline-block">
                    380 – 1,200
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-[#302d62] mb-1">
                    Avg. Price
                  </div>
                  <b className="text-[#090c38] text-[13px]">$3.99 – $6.99</b>
                </div>
                <div>
                  <div className="text-[11px] text-[#302d62] mb-1">
                    Est. Revenue
                  </div>
                  <b className="text-[#090c38] text-[13px]">
                    $1,518 – $8,388
                  </b>
                </div>
                <div>
                  <div className="text-[11px] text-[#302d62] mb-1">Demand</div>
                  <span className="bg-green-100 rounded-full px-4 py-1 font-bold text-green-900 text-[12px] inline-block">
                    High
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
            <button
              onClick={handleGenerateListing}
              disabled={generating || !selectedProduct}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-[#090c38] transition hover:bg-[#f3efff] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(#fff,#f9f7ff)",
                border: "1px solid #d7c9ff",
                boxShadow: "0 3px 5px #3d19a21b",
              }}
            >
              <RefreshCw
                size={16}
                className={generating ? "animate-spin" : ""}
              />
              Regenerate
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyText(title, "Title")}
                disabled={!title}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-[#090c38] transition hover:bg-[#f3efff] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(#fff,#f9f7ff)",
                  border: "1px solid #d7c9ff",
                  boxShadow: "0 3px 5px #3d19a21b",
                }}
              >
                <Copy size={16} /> Copy Title
              </button>
              <button
                onClick={() => copyText(description, "Description")}
                disabled={!description}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-[#090c38] transition hover:bg-[#f3efff] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(#fff,#f9f7ff)",
                  border: "1px solid #d7c9ff",
                  boxShadow: "0 3px 5px #3d19a21b",
                }}
              >
                <Copy size={16} /> Copy Description
              </button>
              <button
                onClick={() => copyText(tags.join(", "), "Tags")}
                disabled={tags.length === 0}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-[#090c38] transition hover:bg-[#f3efff] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(#fff,#f9f7ff)",
                  border: "1px solid #d7c9ff",
                  boxShadow: "0 3px 5px #3d19a21b",
                }}
              >
                <Copy size={16} /> Copy Tags
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || !title || !description}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-[0_4px_8px_#5b0ed633] transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: C.gradientBtn }}
              >
                {exporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Building ZIP…
                  </>
                ) : (
                  <>
                    <Download size={16} /> Export {platform.name} Kit (ZIP)
                  </>
                )}
              </button>
            </div>
          </div>

          {notice && (
            <p
              className={`text-center text-xs mt-3 ${
                noticeType === "error"
                  ? "text-red-600"
                  : noticeType === "success"
                  ? "text-green-700"
                  : "text-purple-700"
              }`}
            >
              {notice}
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default AISalesKit;