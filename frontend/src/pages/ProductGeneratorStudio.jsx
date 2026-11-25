// frontend/src/pages/ProductGeneratorStudio.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import heroBg from "../assets/images/game-banner.png";

import {
  Search, X, Sparkles, Wand2, Palette, Blend, Maximize2, Check,
  MapPin, Layers, ArrowRight, Lightbulb, Download, ChevronDown,
  Loader2, ExternalLink, Image as ImageIcon, FileText,
} from "lucide-react";

import {
  CATEGORIES,
  IMAGE_CATEGORIES,
  RATIO_OPTIONS,
  RATIO_ORIENTATION,
  PRODUCTS_BY_CATEGORY,
  PRODUCT_FIELDS,
  CATEGORY_ICON,
  getProductIcon,
  getFieldIcon,
  normalizeKey,
  getOutputFormat,      // ✅ NEW
  isPdfProduct,         // ✅ NEW
} from "../data/productGeneratorData";

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",
  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const resolveUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SERVER_URL}${p.startsWith("/") ? p : "/" + p}`;
};

// Place the 140 image folders from the supplied ZIP in
// frontend/public/product-images/. Vite serves these URLs from public/.
const PRODUCT_IMAGE_FOLDERS = [
  "01-party-invitations",
  "02-party-decorations",
  "03-party-games-activities",
  "04-party-favor-products",
  "05-party-planning-kits",
  "06-party-table-printables",
  "07-party-photo-booth-kits",
];

const getProductImageUrl = (category, product) => {
  const categoryIndex = CATEGORIES.findIndex((item) => item.name === category);
  const productIndex = PRODUCTS_BY_CATEGORY[category]?.indexOf(product) ?? -1;
  if (categoryIndex < 0 || productIndex < 0) return "";

  const number = String(categoryIndex * 20 + productIndex + 1).padStart(3, "0");
  const slug = product
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const baseUrl = import.meta.env.BASE_URL || "/";
  return `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}product-images/${PRODUCT_IMAGE_FOLDERS[categoryIndex]}/${number}-${slug}.png`;
};

function ProductCardImage({ category, product }) {
  const [hasError, setHasError] = useState(false);
  const src = getProductImageUrl(category, product);
  const ProductIcon = getProductIcon(product, category);

  useEffect(() => setHasError(false), [src]);

  return (
    <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#f4efff]">
      {src && !hasError ? (
        <img
          src={src}
          alt={product}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ProductIcon className="h-8 w-8" style={{ color: "#8200ff" }} />
      )}
    </span>
  );
}

// ================================================================
// STYLED SELECT
// ================================================================

function StyledSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-[11px] border bg-white px-3.5 text-left text-[13.5px] font-semibold transition ${
          open
            ? "border-[#8900ff] ring-2 ring-[#8900ff]/15"
            : "border-[#c8c4f4] hover:border-[#a98bff]"
        }`}
        style={{ boxShadow: "0 3px 5px #3b248015" }}
      >
        <span className={`truncate ${value ? "text-[#080d39]" : "text-[#8b7fb3]"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#8200ff] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.2}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[240px] overflow-y-auto rounded-[12px] border border-[#dcd8fa] bg-white p-1.5 shadow-[0_18px_40px_rgba(80,40,160,.18)]">
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-[9px] px-3 py-2 text-left text-[13px] font-semibold transition ${
                  selected
                    ? "bg-[#f4e9ff] text-[#7620e8]"
                    : "text-[#080d39] hover:bg-[#f7f2ff]"
                }`}
              >
                <span className="truncate">{opt}</span>
                {selected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#7620e8]" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ================================================================
// PRODUCT MODAL
// ================================================================

function ProductSelectModal({ isOpen, category, products, onSelect, onClose }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) setSearch("");
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = products.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(21,16,50,.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(80,40,160,.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#eeeaff] px-6 pb-4 pt-6">
          <div>
            <h3 className="text-[22px] font-extrabold tracking-tight text-[#080d39]">
              Select a Product
            </h3>
            <p className="mt-1 text-[13px] text-[#5d5191]">
              Choose a product from <b>{category}</b>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#f5f0ff]"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-[#5d5191]" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-4 top-2.5 h-5 w-5 text-[#5d5191]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[42px] w-full rounded-[12px] border border-[#c8c4f4] bg-white pl-12 pr-4 text-[13.5px] outline-none focus:border-[#8900ff]"
              placeholder={`Search ${category.toLowerCase()}...`}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((product) => {
              return (
                <button
                  key={`${category}-${product}`}
                  type="button"
                  onClick={() => onSelect(product)}
                  className="flex flex-col items-center gap-2 rounded-[14px] border p-2.5 text-center transition hover:border-[#8c00ff] hover:bg-[#faf5ff]"
                  style={{
                    border: "1px solid #e2dff8",
                    background: "linear-gradient(145deg,#fff,#faf8ff)",
                    boxShadow: "0 3px 5px #4335aa12",
                  }}
                >
                  <ProductCardImage category={category} product={product} />
                  <strong className="flex min-h-[34px] items-center justify-center text-[13px] leading-tight text-[#080d39]">
                    {product}
                  </strong>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-[#8b7fb3]">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// GENERATING OVERLAY
// ================================================================

function GeneratingOverlay({ productName }) {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(21,16,50,.85)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        <div className="relative mb-8 h-32 w-32">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#a845f5]/20" />
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#d634ef] border-r-[#8e15e5]"
            style={{ animationDuration: "1.2s" }}
          />
          <div
            className="absolute inset-3 animate-spin rounded-full border-4 border-transparent border-b-[#a845f5] border-l-[#d634ef]"
            style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mb-2 text-[24px] font-extrabold text-white">Generating{dots}</h2>
        <p className="mb-1 text-[15px] font-semibold text-[#e5d4ff]">{productName}</p>
        <p className="max-w-[320px] text-[13px] leading-[1.6] text-[#c9b8e8]">
          Our AI is designing your product. This usually takes 15–30 seconds.
        </p>
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// SUCCESS OVERLAY
// ================================================================

function SuccessOverlay({ productName }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(21,16,50,.85)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        <div className="relative mb-8 h-32 w-32">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#22c55e]/30" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 0 60px rgba(34,197,94,.6)",
              animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <svg
              viewBox="0 0 52 52"
              className="h-16 w-16"
              style={{ animation: "checkDraw 0.6s 0.2s ease-out forwards" }}
            >
              <path
                d="M14 27 L22 35 L38 18"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 40,
                  strokeDashoffset: 40,
                  animation: "checkDraw 0.6s 0.2s ease-out forwards",
                }}
              />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-[26px] font-extrabold text-white">Generation Successful!</h2>
        <p className="mb-6 text-[14px] font-semibold text-[#e5d4ff]">
          Your <b className="text-white">{productName}</b> is ready.
        </p>
        <p className="text-[13px] text-[#c9b8e8]">Redirecting to My Creations...</p>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================

const ProductGeneratorStudio = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [formValues, setFormValues] = useState({
    productType: PRODUCTS_BY_CATEGORY[CATEGORIES[0].name][0],
  });
  const [activeStyle, setActiveStyle] = useState("Cute");
  const [activeColor, setActiveColor] = useState(0);
  const [activePill, setActivePill] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [hasUserPickedCategory, setHasUserPickedCategory] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [prefillWarning, setPrefillWarning] = useState("");

  const prefillConsumedRef = useRef(false);

  const currentCategory = CATEGORIES[selectedCategory].name;
  const productList = PRODUCTS_BY_CATEGORY[currentCategory] || [];
  const selectedProductType = formValues.productType || "";
  const isImageCategory = IMAGE_CATEGORIES.includes(currentCategory);
  const fields = selectedProductType
    ? PRODUCT_FIELDS[selectedProductType] || []
    : [];

  // ✅ Output format derived once
  const outputFormat = selectedProductType
    ? getOutputFormat(selectedProductType)
    : "Image";
  const isPdf = outputFormat === "PDF";

  // ==============================================================
  // AI PREFILL
  // ==============================================================

  useEffect(() => {
    const prefill = location.state?.aiPrefill;
    if (!prefill) return;
    if (prefillConsumedRef.current) return;
    prefillConsumedRef.current = true;

    const warnings = [];

    const categoryIndex = CATEGORIES.findIndex(
      (c) => normalizeKey(c.name) === normalizeKey(prefill.category)
    );

    if (categoryIndex === -1) {
      console.warn("AI prefill: category not found", prefill.category);
      setPrefillWarning(
        `We couldn't auto-select the category "${prefill.category}". Please choose manually.`
      );
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    const categoryName = CATEGORIES[categoryIndex].name;
    const availableProducts = PRODUCTS_BY_CATEGORY[categoryName] || [];

    const matchedProduct = availableProducts.find(
      (p) => normalizeKey(p) === normalizeKey(prefill.productType)
    );

    if (!matchedProduct) {
      console.warn("AI prefill: product not found", prefill.productType);
      setPrefillWarning(
        `We couldn't auto-select the product "${prefill.productType}". Please choose manually.`
      );
      setSelectedCategory(categoryIndex);
      setHasUserPickedCategory(true);
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    const productType = matchedProduct;
    const productFields = PRODUCT_FIELDS[productType] || [];

    const incomingData =
      prefill.formData &&
      typeof prefill.formData === "object" &&
      !Array.isArray(prefill.formData)
        ? prefill.formData
        : {};

    const allowedKeys = new Set(productFields.map((f) => f.key));
    allowedKeys.add("ratio");
    allowedKeys.add("orientation");

    const safeFormData = {};

    Object.entries(incomingData).forEach(([key, value]) => {
      if (!allowedKeys.has(key)) return;
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "string" && !value.trim()) return;

      const field = productFields.find((f) => f.key === key);

      if (field && Array.isArray(field.options) && field.options.length > 0) {
        const matchingOption = field.options.find(
          (option) => normalizeKey(option) === normalizeKey(value)
        );
        if (matchingOption !== undefined) {
          safeFormData[key] = matchingOption;
        }
        return;
      }

      safeFormData[key] = value;
    });

    if (incomingData.ratio) {
      const ratioOption = RATIO_OPTIONS.find(
        (ratio) =>
          normalizeKey(ratio.value) === normalizeKey(incomingData.ratio) ||
          normalizeKey(ratio.label) === normalizeKey(incomingData.ratio)
      );

      if (ratioOption) {
        safeFormData.ratio = ratioOption.label;
        const autoOrientation = RATIO_ORIENTATION[ratioOption.value];
        if (autoOrientation) {
          safeFormData.orientation = autoOrientation;
        }
      } else {
        warnings.push(`Aspect ratio "${incomingData.ratio}" wasn't recognized.`);
      }
    }

    setSelectedCategory(categoryIndex);
    setHasUserPickedCategory(false);
    setFormValues({ productType, ...safeFormData });

    const pillValues = {};
    productFields.forEach((field) => {
      if (field.type === "pill" && safeFormData[field.key] !== undefined) {
        pillValues[field.key] = safeFormData[field.key];
      }
    });
    if (safeFormData.orientation) {
      pillValues.orientation = safeFormData.orientation;
    }
    setActivePill(pillValues);

    if (["Cute", "Modern", "Elegant"].includes(prefill.designStyle)) {
      setActiveStyle(prefill.designStyle);
    }

    const colorIndex = Number(prefill.colorIndex);
    if (Number.isInteger(colorIndex) && colorIndex >= 0 && colorIndex <= 4) {
      setActiveColor(colorIndex);
    }

    setModalOpen(false);
    setError("");

    if (warnings.length) setPrefillWarning(warnings.join(" "));

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!hasUserPickedCategory) return;
    setFormValues({});
    setActivePill({});
    setModalOpen(true);
  }, [selectedCategory, hasUserPickedCategory]);

  const handleCategoryClick = (idx) => {
    setHasUserPickedCategory(true);
    if (idx === selectedCategory) {
      setModalOpen(true);
    } else {
      setSelectedCategory(idx);
    }
  };

  const handleProductSelect = (product) => {
    setFormValues({ productType: product });
    setActivePill({});
    setModalOpen(false);
    setError("");
  };

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "ratio") {
        const opt = RATIO_OPTIONS.find((r) => r.label === value);
        if (opt && RATIO_ORIENTATION[opt.value]) {
          const autoOrientation = RATIO_ORIENTATION[opt.value];
          next.orientation = autoOrientation;
          setActivePill((p) => ({ ...p, orientation: autoOrientation }));
        }
      }
      return next;
    });
  };

  const handlePillSelect = (fieldKey, option) => {
    setActivePill((prev) => ({ ...prev, [fieldKey]: option }));
    handleFieldChange(fieldKey, option);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ratioValue = (() => {
      const label = formValues.ratio;
      if (!label) return null;
      const opt = RATIO_OPTIONS.find((r) => r.label === label);
      return opt ? opt.value : null;
    })();

    try {
      await api.post("/party-products/generate", {
        category: currentCategory,
        productType: selectedProductType,
        designStyle: activeStyle,
        outputFormat,                        // ✅ "PDF" or "Image"
        formData: {
          ...formValues,
          ratio: ratioValue,
          designStyle: activeStyle,
          colorIndex: activeColor,
        },
      });

      setSuccess(true);
      setTimeout(() => navigate("/my-creations"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Generation failed"
      );
      setLoading(false);
    }
  };

  const colors = [
    "linear-gradient(#ff8ad2,#ff0095)",
    "linear-gradient(#d98bff,#7900ef)",
    "linear-gradient(#fff57b,#ffba00)",
    "linear-gradient(#9defff,#008bfa)",
    "linear-gradient(#b6ed70,#2caa20)",
  ];

  const CategoryIcon = CATEGORY_ICON[currentCategory] || Sparkles;

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
          {/* BANNER */}
          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[36px]">
            <img
              src={heroBg}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />
            <div className="relative z-[2] max-w-[550px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-extrabold text-[#4b075d] shadow-sm">
                ✨ &nbsp;New AI Image & PDF Engine
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
                Generate games, printables, invitations, and complete party kits in minutes.
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

          {prefillWarning && (
            <div className="mb-4 flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 px-5 py-3 text-[13px] text-amber-800">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">{prefillWarning}</div>
              <button
                onClick={() => setPrefillWarning("")}
                className="text-amber-600 hover:text-amber-900"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* CATEGORY */}
          <section className="mb-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-4xl">✨</span>
              <div>
                <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#080d39]">
                  Choose a Category
                </h2>
                <p className="text-[14px] text-[#5d5191]">
                  Select a party category — a product picker will open.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[9px] sm:grid-cols-4 md:grid-cols-7">
              {CATEGORIES.map((cat, i) => {
                const active = selectedCategory === i;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryClick(i)}
                    className="relative flex flex-col items-center justify-end px-2 pb-3"
                    style={{
                      height: 158,
                      border: active ? "2px solid #8c00ff" : "1px solid #e2dff8",
                      borderRadius: 19,
                      background: active
                        ? "linear-gradient(145deg,#fff,#f4e5ff)"
                        : "linear-gradient(145deg,#fff,#f7f4ff)",
                      boxShadow: "0 3px 5px #4335aa18",
                      cursor: "pointer",
                    }}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 z-10 flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#8200fa] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                    <div
                      className="mb-1 flex w-full items-center justify-center overflow-hidden rounded-[13px]"
                      style={{ height: 91 }}
                    >
                      <img
                        src={cat.img}
                        alt={cat.name}
                        loading="lazy"
                        className="h-full w-full rounded-[13px] object-cover"
                      />
                    </div>
                    <strong className="text-center text-[15px] leading-[19px] text-[#080d39]">
                      {cat.name}
                    </strong>
                  </button>
                );
              })}
            </div>
          </section>

          {/* TWO-COLUMN */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* LEFT: FORM */}
            <section
              className="flex flex-col overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,.93),rgba(251,249,255,.85))",
                border: "1px solid #dcd8fa",
                boxShadow: "0 8px 17px #35218416",
                borderRadius: 20,
              }}
            >
              {/* ✅ HEADER — badge top-right */}
              <div className="flex items-start justify-between gap-3 border-b border-[#eeeaff] bg-white/25 px-6 py-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon className="h-8 w-8" style={{ color: "#8200ff" }} />
                  <div>
                    <h3 className="text-[20px] font-extrabold tracking-tight text-[#080d39]">
                      {selectedProductType || currentCategory}
                    </h3>
                    <p className="text-[12.5px] text-[#5d5191]">
                      {selectedProductType
                        ? "Fill in the details to generate."
                        : "Pick a product to see its form."}
                    </p>
                  </div>
                </div>

                {/* ✅ RIGHT SIDE: output badge + change button */}
                <div className="flex items-center gap-2">
                  {selectedProductType && (
                    <span
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide"
                      style={{
                        background: isPdf
                          ? "linear-gradient(135deg,#fee2e2,#fecaca)"
                          : "linear-gradient(135deg,#dbeafe,#bfdbfe)",
                        color: isPdf ? "#991b1b" : "#1e40af",
                        boxShadow: isPdf
                          ? "0 2px 6px rgba(153,27,27,.15)"
                          : "0 2px 6px rgba(30,64,175,.15)",
                      }}
                      title={
                        isPdf
                          ? "This product generates a multi-page printable PDF"
                          : "This product generates a single printable image"
                      }
                    >
                      {isPdf ? (
                        <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                      )}
                      {isPdf ? "Printable PDF" : "Printable Image"}
                    </span>
                  )}

                  {selectedProductType && (
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="rounded-full px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap text-white transition hover:brightness-110"
                      style={{
                        background: C.gradientBtn,
                        boxShadow: "0 4px 8px #8819dd33",
                      }}
                    >
                      ↻ Change
                    </button>
                  )}
                </div>
              </div>

              {!selectedProductType ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                  <div
                    className="mb-4 grid h-20 w-20 place-items-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg,#f4e9ff,#fae6ff)",
                      color: "#8200ff",
                    }}
                  >
                    <CategoryIcon className="h-10 w-10" />
                  </div>
                  <h3 className="mb-1 text-[18px] font-extrabold text-[#080d39]">
                    No product selected yet
                  </h3>
                  <p className="mb-5 max-w-[360px] text-[13.5px] text-[#5d5191]">
                    Choose a product from <b>{currentCategory}</b> to see the form.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="rounded-full px-6 py-2.5 text-[14px] font-bold text-white transition hover:brightness-110"
                    style={{
                      background: C.gradientBtn,
                      boxShadow: "0 5px 12px #8819dd33",
                    }}
                  >
                    Choose Product →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-5">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    {fields.map((field) => {
                      const Icon = getFieldIcon(field);
                      const value = formValues[field.key] || "";

                      return (
                        <div key={field.key}>
                          <label className="flex gap-3">
                            <Icon
                              className="mt-0.5 h-6 w-6 shrink-0"
                              style={{ color: "#8200ff" }}
                            />
                            <div className="w-full">
                              <span className="text-[13px] font-bold text-[#080d39]">
                                {field.label}{" "}
                                {field.required && <b className="text-red-600">*</b>}
                              </span>

                              {["text", "number", "date", "time"].includes(
                                field.type
                              ) && (
                                <input
                                  type={field.type}
                                  required={field.required}
                                  value={value}
                                  placeholder={field.placeholder || ""}
                                  onChange={(e) =>
                                    handleFieldChange(field.key, e.target.value)
                                  }
                                  className="field mt-1"
                                />
                              )}

                              {field.type === "select" && (
                                <div className="mt-1">
                                  <StyledSelect
                                    value={value}
                                    onChange={(v) => handleFieldChange(field.key, v)}
                                    options={field.options || []}
                                    placeholder={`Select ${field.label}`}
                                  />
                                </div>
                              )}

                              {field.type === "pill" && (
                                <div className="mt-2 flex gap-2">
                                  {field.options?.map((opt) => {
                                    const isActive = activePill[field.key] === opt;
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() =>
                                          handlePillSelect(field.key, opt)
                                        }
                                        className="flex-1"
                                        style={{
                                          border: isActive
                                            ? "1px solid #8b00ff"
                                            : "1px solid #c8c2f6",
                                          borderRadius: 10,
                                          padding: "7px 12px",
                                          fontSize: 12.5,
                                          background: isActive ? "#f1ddff" : "#fff",
                                          boxShadow: "0 3px 5px #372b8a17",
                                          cursor: "pointer",
                                        }}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {field.type === "checkbox" && (
                                <div className="mt-2">
                                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-[#080d39]">
                                    <input
                                      type="checkbox"
                                      className="h-[17px] w-[17px] accent-[#8100ed]"
                                      checked={!!value}
                                      onChange={(e) =>
                                        handleFieldChange(field.key, e.target.checked)
                                      }
                                    />
                                    {field.label}
                                  </label>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      );
                    })}

                    {isImageCategory && (
                      <div>
                        <label className="flex gap-3">
                          <Maximize2
                            className="mt-0.5 h-6 w-6 shrink-0"
                            style={{ color: "#8200ff" }}
                          />
                          <div className="w-full">
                            <span className="text-[13px] font-bold text-[#080d39]">
                              Aspect Ratio <b className="text-red-600">*</b>
                            </span>
                            <div className="mt-1">
                              <StyledSelect
                                value={formValues.ratio || ""}
                                onChange={(v) => handleFieldChange("ratio", v)}
                                options={RATIO_OPTIONS.map((r) => r.label)}
                                placeholder="Select Aspect Ratio"
                              />
                            </div>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Design Style */}
                    <div className="flex gap-3">
                      <Wand2
                        className="mt-0.5 h-6 w-6 shrink-0"
                        style={{ color: "#8200ff" }}
                      />
                      <div className="w-full">
                        <span className="text-[13px] font-bold text-[#080d39]">
                          Design Style
                        </span>
                        <div className="mt-2 flex gap-2">
                          {["Cute", "Modern", "Elegant"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setActiveStyle(s)}
                              className="flex-1"
                              style={{
                                border:
                                  activeStyle === s
                                    ? "1px solid #8b00ff"
                                    : "1px solid #c8c2f6",
                                borderRadius: 10,
                                padding: "7px 12px",
                                fontSize: 12.5,
                                background: activeStyle === s ? "#f1ddff" : "#fff",
                                boxShadow: "0 3px 5px #372b8a17",
                                cursor: "pointer",
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="flex gap-3">
                      <Blend
                        className="mt-0.5 h-6 w-6 shrink-0"
                        style={{ color: "#8200ff" }}
                      />
                      <div className="w-full">
                        <span className="text-[13px] font-bold text-[#080d39]">
                          Color Palette
                        </span>
                        <div className="mt-2 flex items-center gap-2.5">
                          {colors.map((bg, i) => (
                            <button
                              key={i}
                              type="button"
                              aria-label={`Color ${i + 1}`}
                              onClick={() => setActiveColor(i)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: bg,
                                boxShadow: "inset 0 -4px 6px #0002,0 3px 6px #0002",
                                outline: activeColor === i ? "3px solid #ede0ff" : "none",
                                outlineOffset: 3,
                                cursor: "pointer",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-full py-3 text-[18px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(170deg,#d845ff,#8000ff 58%,#3000b9)",
                      boxShadow: "0 5px 9px #5600bd28",
                    }}
                  >
                    ✨ &nbsp; Generate {selectedProductType} &nbsp; →
                  </button>

                  {error && (
                    <div className="mt-4 rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#dc2626]">
                      ❌ {error}
                    </div>
                  )}
                </form>
              )}
            </section>

            {/* RIGHT: INSTRUCTIONS */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-[20px] border border-[#ede8fb] bg-white/80 p-5 shadow-[0_7px_18px_#5a478b0c]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="m-0 flex items-center gap-2.5 text-[18px] font-extrabold tracking-[-0.4px] text-[#151032]">
                    <Lightbulb size={20} className="text-[#7620e8]" />
                    Quick Instructions
                  </h3>
                  <span className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-[11px] font-bold text-[#008d34]">
                    START HERE
                  </span>
                </div>

                <ol className="m-0 flex list-none flex-col gap-3 p-0">
                  {[
                    { n: 1, title: "Pick a category", desc: "Choose from Invitations, Decorations, Games, and more above." },
                    { n: 2, title: "Select a product", desc: "A picker opens — choose the specific product you want." },
                    { n: 3, title: "Fill in the details", desc: "Enter names, dates, themes, and pick an aspect ratio." },
                    { n: 4, title: "Generate & download", desc: "Click Generate, preview your product, and export it." },
                  ].map((step) => (
                    <li key={step.n} className="flex items-start gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#7620e8] text-[12px] font-bold text-white">
                        {step.n}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#151032]">
                          {step.title}
                        </div>
                        <div className="mt-[2px] text-[12px] leading-[1.5] text-[#62558f]">
                          {step.desc}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-[20px] border border-[#f3ddec] bg-gradient-to-br from-[#fff1f9] to-[#fae6f5] p-5 shadow-[0_7px_18px_#5a478b0c]">
                <h3 className="m-0 mb-3 flex items-center gap-2 text-[16px] font-extrabold text-[#4e118c]">
                  <Sparkles size={18} className="text-[#cb0a91]" />
                  Pro Tips
                </h3>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {[
                    "Pick the aspect ratio that matches your print size.",
                    "Use full names and exact dates for best results.",
                    "Match Design Style to your theme — 'Elegant' for weddings, 'Cute' for kids.",
                    "Generate 2–3 variations, then download your favorite.",
                  ].map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-[#584985]"
                    >
                      <Check size={14} className="mt-0.5 shrink-0 text-[#cb0a91]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          <style>{`
            .field {
              height: 35px;
              border: 1px solid #c8c4f4;
              border-radius: 11px;
              background: #fff;
              box-shadow: 0 3px 5px #3b248015;
              padding: 0 14px;
              width: 100%;
              font-size: 13.5px;
              outline: none;
            }
            .field:focus { border-color: #8900ff; }
          `}</style>
        </main>
      </div>

      <ProductSelectModal
        isOpen={modalOpen}
        category={currentCategory}
        products={productList}
        onSelect={handleProductSelect}
        onClose={() => setModalOpen(false)}
      />

      {loading && !success && (
        <GeneratingOverlay productName={selectedProductType} />
      )}

      {success && <SuccessOverlay productName={selectedProductType} />}
    </div>
  );
};

export default ProductGeneratorStudio;
