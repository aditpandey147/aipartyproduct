// frontend/src/pages/oto/TrafficMachine.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import heroBg from "../../assets/images/game-banner.png";
import {
  Sparkles, ArrowRight, Rocket, Loader2, Copy, Check,
  Image as ImageIcon, RefreshCw,
  Camera, Users, Video, Mail, ShoppingBag, MapPin,
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

const PLATFORMS = [
  { id: "Instagram", label: "Instagram",  icon: Camera,      color: "#ec4899" },
  { id: "Pinterest", label: "Pinterest",  icon: MapPin,      color: "#e11d48" },
  { id: "TikTok",    label: "TikTok",     icon: Video,       color: "#000000" },
  { id: "Facebook",  label: "Facebook",   icon: Users,       color: "#1877f2" },
  { id: "Email",     label: "Email",      icon: Mail,        color: "#8b5cf6" },
  { id: "Etsy",      label: "Etsy",       icon: ShoppingBag, color: "#f97316" },
];

// ================================================================
const TrafficMachine = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Load user's generated products
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/party-products");
        const list = (res.data?.data || []).filter(
          (p) => p.status === "completed" && p.imageUrl
        );
        setProducts(list);
        if (list.length > 0) setSelectedProductId(list[0]._id);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError("Pick a product first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const res = await api.post("/traffic/generate", {
        product: {
          title: selectedProduct.productType,
          category: selectedProduct.category,
          prompt: selectedProduct.aiPrompt || "",
        },
        platform,
        extra: extra.trim(),
      });

      if (res.data?.success && res.data?.data?.copy) {
        setResult(res.data.data);
      } else {
        throw new Error("No content returned");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.copy) return;
    try {
      await navigator.clipboard.writeText(result.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard not available — select & copy manually.");
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
                <Rocket size={14} className="text-[#ec4899]" />
                &nbsp;Traffic Machine
              </div>
              <h2
                className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                style={{ color: C.heroTitle }}
              >
                Turn Any Product
                <br />
                Into Ready-to-Post{" "}
                <span style={{ color: C.heroAccent }}>Traffic</span>
              </h2>
              <p
                className="mb-[17px] max-w-[500px] text-[16px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Pick one of your generated products, choose a platform, and let
                AI write captions, hashtags, emails, and listings that drive
                buyers to your offer.
              </p>
              <button
                onClick={() => navigate("/product-generator")}
                className="flex items-center gap-[13px] rounded-full px-8 py-3 text-[16px] font-[750] text-white shadow-[0_7px_13px_#8819dd33] transition hover:brightness-110"
                style={{ background: C.gradientBtn }}
              >
                <Sparkles size={18} />
                Create More Products
                <ArrowRight size={18} />
              </button>
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
                <Rocket className="h-7 w-7" style={{ color: "#8200ff" }} />
                <div>
                  <h3 className="text-[19px] font-extrabold text-[#080d39]">
                    Traffic Settings
                  </h3>
                  <p className="text-[12px] text-[#5d5191]">
                    Product + platform = ready-to-post copy
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-1 flex-col gap-4 px-6 py-5">
                {/* PRODUCT */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#080d39]">
                    <ImageIcon className="h-4 w-4" style={{ color: "#8200ff" }} />
                    Choose Product <b className="text-red-600">*</b>
                  </label>

                  {loadingProducts ? (
                    <div className="mt-1.5 flex items-center gap-2 rounded-[12px] border border-[#c8c4f4] bg-white px-4 py-3 text-[12.5px] text-[#8b7fb3]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading your products...
                    </div>
                  ) : products.length === 0 ? (
                    <div className="mt-1.5 rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[12.5px] text-[#92400e]">
                      No products yet.{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/product-generator")}
                        className="font-bold underline"
                      >
                        Generate one first →
                      </button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="mt-1.5 w-full rounded-[12px] border border-[#c8c4f4] bg-white px-4 py-3 text-[13px] font-semibold text-[#080d39] outline-none focus:border-[#8900ff]"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.productType} — {p.category}
                          </option>
                        ))}
                      </select>

                      {selectedProduct?.imageUrl && (
                        <div className="mt-2 flex items-center gap-2 rounded-[10px] bg-[#f7f2ff] px-2 py-2">
                          <img
                            src={resolveUrl(selectedProduct.imageUrl)}
                            alt={selectedProduct.productType}
                            className="h-12 w-12 rounded-[8px] object-cover"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-bold text-[#080d39]">
                              {selectedProduct.productType}
                            </div>
                            <div className="truncate text-[10.5px] text-[#8b7fb3]">
                              {selectedProduct.category}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* PLATFORM */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#080d39]">
                    <Sparkles className="h-4 w-4" style={{ color: "#8200ff" }} />
                    Platform
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => {
                      const Icon = p.icon;
                      const active = platform === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlatform(p.id)}
                          className="flex flex-col items-center justify-center gap-1 rounded-[11px] px-2 py-2.5 text-center transition"
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
                          <Icon
                            size={18}
                            strokeWidth={2}
                            style={{ color: active ? "#7620e8" : p.color }}
                          />
                          <span
                            className="text-[10.5px] font-bold"
                            style={{ color: active ? "#6c00c8" : "#080d39" }}
                          >
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* EXTRA CONTEXT */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#080d39]">
                    <Sparkles className="h-4 w-4" style={{ color: "#8200ff" }} />
                    Extra Context{" "}
                    <span className="font-normal text-[#8b7fb3]">(optional)</span>
                  </label>
                  <textarea
                    value={extra}
                    onChange={(e) => setExtra(e.target.value)}
                    placeholder="e.g. launching for the holiday season, targeting moms 25-45, add a 20% launch discount code"
                    className="mt-1.5 w-full resize-y rounded-[12px] border border-[#c8c4f4] bg-white px-4 py-3 text-[13.5px] leading-[1.55] outline-none focus:border-[#8900ff]"
                    rows={3}
                    maxLength={400}
                  />
                  <div className="mt-1 text-right text-[10.5px] text-[#8b7fb3]">
                    {extra.length}/400
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading || !selectedProduct}
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
                      Generating Traffic Copy...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      Generate Traffic Copy
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
                  <Sparkles className="h-7 w-7" style={{ color: "#8200ff" }} />
                  <div>
                    <h3 className="text-[19px] font-extrabold text-[#080d39]">
                      Generated Copy
                    </h3>
                    <p className="text-[12px] text-[#5d5191]">
                      Ready to post — copy & use anywhere
                    </p>
                  </div>
                </div>

                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold text-white transition hover:brightness-110"
                      style={{ background: C.gradientBtn }}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="rounded-full border border-[#e9deff] bg-white p-2 text-[#8500f8] transition hover:bg-[#f5f0ff] disabled:opacity-40"
                      title="Regenerate"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {!result && !loading && (
                  <div className="flex h-full flex-col items-center justify-center rounded-[16px] border border-dashed border-[#d6d2f4] bg-white/60 py-16 text-center">
                    <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#f4e9ff] to-[#fae6ff]">
                      <Rocket className="h-10 w-10 text-[#8200ff]" />
                    </div>
                    <h4 className="text-[16px] font-extrabold text-[#080d39]">
                      Your traffic copy will appear here
                    </h4>
                    <p className="mt-1.5 max-w-[340px] text-[12.5px] text-[#5d5191]">
                      Pick a product, choose a platform, and hit Generate to get
                      captions, hashtags, emails, and more.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex h-full flex-col items-center justify-center py-16">
                    <div className="relative mb-5 h-24 w-24">
                      <div className="absolute inset-0 animate-ping rounded-full bg-[#a845f5]/20" />
                      <div
                        className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#d634ef] border-r-[#8e15e5]"
                        style={{ animationDuration: "1.2s" }}
                      />
                      <div className="absolute inset-0 grid place-items-center">
                        <Rocket className="h-10 w-10 text-[#8200ff]" />
                      </div>
                    </div>
                    <h4 className="text-[16px] font-extrabold text-[#080d39]">
                      Writing your traffic copy...
                    </h4>
                    <p className="mt-1.5 text-[12.5px] text-[#5d5191]">
                      Crafting captions, hashtags, and CTAs. Hold tight.
                    </p>
                  </div>
                )}

                {result && !loading && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-[#f4e9ff] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#7620e8]">
                        {result.platform}
                      </span>
                      <span className="truncate text-[11px] text-[#8b7fb3]">
                        for {result.productTitle}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words rounded-[12px] border border-[#e8dcff] bg-[#faf8ff] p-4 text-[12.5px] leading-[1.65] font-sans text-[#151032]">
{result.copy}
                    </pre>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrafficMachine;