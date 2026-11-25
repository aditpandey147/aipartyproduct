// frontend/src/pages/AIPartyBusinessStudio.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import heroBg from "../../assets/images/game-banner.png";
import {
  Sparkles,
  FileText,
  DollarSign,
  Share2,
  Mail,
  Package,
  BarChart3,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

const isPdfItem = (item) => {
  if (!item) return false;
  if (String(item.outputFormat || "").toLowerCase() === "pdf") return true;
  if (String(item.imageMimeType || "").toLowerCase() === "application/pdf")
    return true;
  if (String(item.imageUrl || "").toLowerCase().endsWith(".pdf")) return true;
  return false;
};

const TABS = [
  { id: "listing", icon: FileText, label: "Listing" },
  { id: "pricing", icon: DollarSign, label: "Pricing" },
  { id: "social", icon: Share2, label: "Social Pack" },
  { id: "email", icon: Mail, label: "Buyer Email" },
  { id: "bundle", icon: Package, label: "Bundle" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

// ---------------- COPY BLOCK ----------------
function CopyBlock({ label, value, multiline = false }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
          {label}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-[#8500f8] transition hover:bg-[#f5f0ff]"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <div
        className={`mt-1.5 rounded-[10px] border border-[#e8dcff] bg-[#faf8ff] px-3.5 py-2.5 text-[13px] text-[#080d39] ${
          multiline ? "whitespace-pre-wrap leading-[1.55]" : ""
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

// ---------------- PRODUCT CARD ----------------
function ProductPickCard({ product, selected, onClick }) {
  const pdf = isPdfItem(product);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-[14px] border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_#4b149520]"
      style={{
        border: selected ? "2px solid #8e15e5" : "1px solid #e8dcff",
        boxShadow: selected ? "0 6px 16px #8819dd33" : "0 3px 8px #4b149510",
      }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f7f2ff]">
        {pdf ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#fef2f2] to-[#fecaca] text-[#991b1b]">
            <FileText className="h-10 w-10" strokeWidth={1.6} />
            <span className="mt-1 text-[9.5px] font-extrabold uppercase tracking-wider">
              PDF
            </span>
          </div>
        ) : product.imageUrl ? (
          <img
            src={resolveUrl(product.imageUrl)}
            alt={product.productType}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8b7fb3]">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}

        {selected && (
          <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#8e15e5] text-white shadow-[0_2px_6px_#8e15e555]">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="p-2.5">
        <div className="line-clamp-2 text-[12px] font-extrabold leading-tight text-[#080d39]">
          {product.productType}
        </div>
        <div className="mt-0.5 line-clamp-1 text-[10.5px] font-semibold text-[#7a6ba8]">
          {product.category}
        </div>
      </div>
    </button>
  );
}

// ---------------- MAIN ----------------
export default function AIPartyBusinessStudio() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);
  const [activeTab, setActiveTab] = useState("listing");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    api
      .get("/party-products")
      .then((res) => {
        const items = (res.data?.data || []).filter(
          (i) => i.status === "completed"
        );
        setProducts(items);
        if (items.length > 0) setSelectedProductId(items[0]._id);
      })
      .catch((err) =>
        setError(
          err.response?.data?.message || err.message || "Failed to load products"
        )
      )
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body = { action: activeTab };

      if (activeTab === "bundle") {
        if (selectedBundleIds.length < 2) {
          throw new Error("Select at least 2 products for a bundle");
        }
        body.productIds = selectedBundleIds;
      } else if (activeTab !== "analytics") {
        if (!selectedProductId) {
          throw new Error("Select a product first");
        }
        body.productId = selectedProductId;
      }

      const res = await api.post("/studio", body);
      setResult(res.data?.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics" && !loadingProducts) {
      handleRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loadingProducts]);

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
          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
            <img
              src={heroBg}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />
            <div className="relative z-[2] max-w-[640px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                <Sparkles size={14} className="text-[#cb0a91]" />
                &nbsp;AI Party Business Studio
              </div>
              <h2
                className="mb-3 text-[37px] font-[850] leading-[1.17] tracking-[-1.6px]"
                style={{ color: C.heroTitle }}
              >
                Turn Your Products
                <br />
                Into <span style={{ color: C.heroAccent }}>Real Business</span>
              </h2>
              <p
                className="max-w-[520px] text-[16px] leading-[1.5]"
                style={{ color: C.heroText }}
              >
                Listing copy, pricing, social content, buyer emails, bundles, and
                analytics — all in one place, powered by AI.
              </p>
            </div>
          </section>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#8e15e5]" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-[#d6d2f4] bg-white/60 py-16 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-[#8b7fb3]" />
              <h3 className="mt-3 text-[17px] font-extrabold text-[#080d39]">
                No completed products yet
              </h3>
              <p className="mt-1 text-[13px] text-[#5d5191]">
                Generate a product first, then come back here.
              </p>
              <button
                onClick={() => navigate("/product-generator")}
                className="mt-4 rounded-full px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_5px_12px_#8819dd33]"
                style={{ background: C.gradientBtn }}
              >
                ✨ Create a product
              </button>
            </div>
          ) : (
            <>
              {activeTab !== "analytics" && (
                <div className="mb-5 rounded-[16px] border border-[#e8dcff] bg-white p-4 shadow-[0_4px_10px_#4b149512]">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
                      {activeTab === "bundle"
                        ? `Select products (${selectedBundleIds.length} selected)`
                        : "Choose a product"}
                    </label>
                    {activeTab === "bundle" && selectedBundleIds.length > 0 && (
                      <button
                        onClick={() => setSelectedBundleIds([])}
                        className="text-[11px] font-bold text-[#8500f8] hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="grid max-h-[340px] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {products.map((p) => {
                      const isSelected =
                        activeTab === "bundle"
                          ? selectedBundleIds.includes(p._id)
                          : selectedProductId === p._id;

                      const handleClick = () => {
                        if (activeTab === "bundle") {
                          setSelectedBundleIds((ids) =>
                            isSelected
                              ? ids.filter((x) => x !== p._id)
                              : [...ids, p._id]
                          );
                        } else {
                          setSelectedProductId(p._id);
                        }
                      };

                      return (
                        <ProductPickCard
                          key={p._id}
                          product={p}
                          selected={isSelected}
                          onClick={handleClick}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-5 flex flex-wrap gap-2">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id);
                        setResult(null);
                        setError("");
                      }}
                      className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition"
                      style={{
                        border: active ? "none" : "1px solid #cec4ff",
                        background: active
                          ? "linear-gradient(110deg,#a845f5,#7100f9)"
                          : "linear-gradient(#fff,#f9f7ff)",
                        color: active ? "#fff" : "#080d39",
                        boxShadow: "0 3px 5px #4c21b521",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {activeTab !== "analytics" && (
                <button
                  onClick={handleRun}
                  disabled={loading}
                  className="mb-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-bold text-white shadow-[0_5px_14px_#8819dd33] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: C.gradientBtn }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Run {TABS.find((t) => t.id === activeTab)?.label}
                    </>
                  )}
                </button>
              )}

              {error && (
                <div className="mb-5 flex items-start gap-2 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b91c1c]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#e8dcff] bg-white/60 py-14">
                  <Loader2 className="h-10 w-10 animate-spin text-[#8e15e5]" />
                  <p className="mt-3 text-[13px] font-bold text-[#080d39]">
                    AI Party Business Studio is thinking...
                  </p>
                </div>
              )}

              {result && !loading && (
                <ResultPanel result={result} activeTab={activeTab} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ---------------- RESULT PANELS ----------------
function ResultPanel({ result, activeTab }) {
  if (activeTab === "listing") return <ListingResult data={result} />;
  if (activeTab === "pricing") return <PricingResult data={result} />;
  if (activeTab === "social") return <SocialResult data={result} />;
  if (activeTab === "email") return <EmailResult data={result} />;
  if (activeTab === "bundle") return <BundleResult data={result} />;
  if (activeTab === "analytics") return <AnalyticsResult data={result} />;
  return null;
}

function ListingResult({ data }) {
  return (
    <div className="space-y-4 rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
      <CopyBlock label="Title" value={data.title} />
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
          Suggested Price
        </div>
        <div className="mt-1.5 inline-flex items-baseline gap-2 rounded-[12px] border border-[#e8dcff] bg-gradient-to-br from-[#faf5ff] to-[#f4e9ff] px-4 py-2.5">
          <span className="text-[24px] font-extrabold text-[#8200ff]">
            ${Number(data.price || 0).toFixed(2)}
          </span>
          <span className="text-[12px] font-semibold text-[#5d5191]">
            {data.currency || "USD"}
          </span>
        </div>
      </div>
      <CopyBlock label="Description" value={data.description} multiline />
      <CopyBlock
        label={`Tags (${(data.tags || []).length})`}
        value={(data.tags || []).join(", ")}
      />
      <CopyBlock label="SEO Keywords" value={(data.seoKeywords || []).join(" · ")} />
      {data.instagramCaption && (
        <CopyBlock
          label="Instagram Caption"
          value={data.instagramCaption}
          multiline
        />
      )}
    </div>
  );
}

function PricingResult({ data }) {
  return (
    <div className="space-y-4 rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#e8dcff] bg-gradient-to-br from-[#faf5ff] to-[#f4e9ff] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            Suggested
          </div>
          <div className="mt-1 text-[26px] font-extrabold text-[#8200ff]">
            ${Number(data.suggestedPrice || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#5d5191]">{data.currency || "USD"}</div>
        </div>
        <div className="rounded-[12px] border border-[#e8dcff] bg-white p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            Range
          </div>
          <div className="mt-1 text-[16px] font-extrabold text-[#080d39]">
            ${Number(data.priceRange?.min || 0).toFixed(2)} — $
            {Number(data.priceRange?.max || 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-[12px] border border-[#e8dcff] bg-white p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            Strategy
          </div>
          <div className="mt-1 text-[16px] font-extrabold capitalize text-[#080d39]">
            {data.strategy || "—"}
          </div>
        </div>
      </div>
      <CopyBlock label="Reasoning" value={data.reasoning} multiline />
      <CopyBlock label="Upsell Idea" value={data.upsellIdea} multiline />
      <CopyBlock
        label="Competitor Benchmark"
        value={data.competitorBenchmark}
        multiline
      />
    </div>
  );
}

function SocialResult({ data }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
        <h4 className="mb-3 text-[14px] font-extrabold text-[#080d39]">
          Instagram
        </h4>
        <div className="space-y-3">
          {(data.instagram || []).map((ig, i) => (
            <div key={i} className="rounded-[10px] bg-[#faf8ff] p-3">
              <CopyBlock
                label={`Caption ${i + 1}`}
                value={ig.caption}
                multiline
              />
              <CopyBlock
                label="Hashtags"
                value={(ig.hashtags || []).join(" ")}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
        <h4 className="mb-3 text-[14px] font-extrabold text-[#080d39]">
          Pinterest
        </h4>
        <div className="space-y-3">
          {(data.pinterest || []).map((p, i) => (
            <div key={i} className="rounded-[10px] bg-[#faf8ff] p-3">
              <CopyBlock label={`Pin ${i + 1} — Title`} value={p.title} />
              <CopyBlock label="Description" value={p.description} multiline />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
        <h4 className="mb-3 text-[14px] font-extrabold text-[#080d39]">
          Twitter / X
        </h4>
        <div className="space-y-3">
          {(data.tweets || []).map((t, i) => (
            <CopyBlock key={i} label={`Tweet ${i + 1}`} value={t} multiline />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailResult({ data }) {
  return (
    <div className="space-y-4 rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
      <CopyBlock label="Subject" value={data.subject} />
      <CopyBlock label="Preview Text" value={data.previewText} />
      <CopyBlock label="Body" value={data.body} multiline />
      <CopyBlock label="CTA Text" value={data.ctaText} />
    </div>
  );
}

function BundleResult({ data }) {
  return (
    <div className="space-y-4 rounded-[16px] border border-[#e8dcff] bg-white p-5 shadow-[0_4px_10px_#4b149512]">
      <CopyBlock label="Bundle Name" value={data.bundleName} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#e8dcff] bg-gradient-to-br from-[#faf5ff] to-[#f4e9ff] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            Bundle Price
          </div>
          <div className="mt-1 text-[22px] font-extrabold text-[#8200ff]">
            ${Number(data.bundlePrice || 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-[12px] border border-[#e8dcff] bg-white p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            Individual Value
          </div>
          <div className="mt-1 text-[16px] font-extrabold text-[#080d39]">
            ${Number(data.individualValue || 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-[12px] border border-[#e8dcff] bg-white p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            Savings
          </div>
          <div className="mt-1 text-[16px] font-extrabold text-[#059669]">
            {data.savings || "—"}
          </div>
        </div>
      </div>
      <CopyBlock
        label="Bundle Description"
        value={data.bundleDescription}
        multiline
      />
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#7620e8]">
          Included Items
        </div>
        <ul className="mt-1.5 space-y-1 text-[13px] text-[#080d39]">
          {(data.includedItems || []).map((it, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#8200ff]">•</span>
              {it}
            </li>
          ))}
        </ul>
      </div>
      <CopyBlock label="Tags" value={(data.tags || []).join(", ")} />
      <CopyBlock label="Marketing Angle" value={data.marketingAngle} multiline />
    </div>
  );
}

function AnalyticsResult({ data }) {
  const stats = [
    { label: "Total products", value: data.total, color: "#7c3aed" },
    { label: "PDF products", value: data.pdfCount, color: "#dc2626" },
    { label: "Image products", value: data.imageCount, color: "#2563eb" },
    { label: "PDF %", value: `${data.pdfPercent}%`, color: "#059669" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-[#e8dcff] bg-white p-4 shadow-[0_4px_10px_#4b149512]"
          >
            <div className="text-[11px] font-semibold text-[#5d5191]">
              {s.label}
            </div>
            <div
              className="mt-1 text-[24px] font-extrabold"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-[#e8dcff] bg-white p-4 shadow-[0_4px_10px_#4b149512]">
          <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            By Category
          </div>
          {Object.entries(data.byCategory || {}).map(([cat, n]) => (
            <div key={cat} className="flex justify-between py-1 text-[13px]">
              <span className="text-[#5d5191]">{cat}</span>
              <span className="font-bold text-[#080d39]">{n}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[14px] border border-[#e8dcff] bg-white p-4 shadow-[0_4px_10px_#4b149512]">
          <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#7620e8]">
            By Style
          </div>
          {Object.entries(data.byStyle || {}).map(([style, n]) => (
            <div key={style} className="flex justify-between py-1 text-[13px]">
              <span className="text-[#5d5191]">{style}</span>
              <span className="font-bold text-[#080d39]">{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#e8dcff] bg-gradient-to-br from-[#faf5ff] to-[#f4e9ff] p-4">
        <div className="text-[12px] font-extrabold uppercase tracking-wide text-[#7620e8]">
          Insights
        </div>
        <p className="mt-2 text-[13px] text-[#080d39]">
          Your top category is <b>{data.topCategory?.name || "—"}</b> (
          {data.topCategory?.count || 0} products).
        </p>
        <p className="mt-1 text-[13px] text-[#080d39]">
          Your most-used style is <b>{data.topStyle?.name || "—"}</b> (
          {data.topStyle?.count || 0} products).
        </p>
      </div>
    </div>
  );
}