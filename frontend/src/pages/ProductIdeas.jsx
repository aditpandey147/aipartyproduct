// frontend/src/pages/ProductIdeas.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

import heroBg from "../assets/images/product-ideas.png";

import {
  Search,
  TrendingUp,
  Tag,
  ShoppingCart,
  Star,
  BarChart3,
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";

import { CATEGORIES, normalizeKey } from "../data/productGeneratorData";

// ================================================================
// THEME
// ================================================================

const C = {
  heroTitle: "#4e118c",
  heroAccent: "#cb0a91",
  heroText: "#584985",

  gradientBtn: "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",

  ink: "#080b32",
  muted: "#62558f",
};

// ================================================================
// CATEGORY DISPLAY
// ================================================================

const CATEGORY_LABELS = {
  "Party Invitations": "Invitations",
  "Party Decorations": "Decorations",
  "Party Games & Activities": "Games & Activities",
  "Party Favor Products": "Party Favors",
  "Party Planning Kits": "Planning Kits",
  "Party Table Printables": "Table Printables",
  "Party Photo Booth Kits": "Photo Booth",
};

const CATEGORY_COLORS = {
  "Party Invitations": "#dfe6ff",
  "Party Decorations": "#ffe0f0",
  "Party Games & Activities": "#ede1ff",
  "Party Favor Products": "#ffe0e0",
  "Party Planning Kits": "#dfe7ff",
  "Party Table Printables": "#e9dbff",
  "Party Photo Booth Kits": "#e8d9ff",
};

const DEMAND_COLORS = {
  "Very High": {
    bg: "#d4f8d9",
    color: "#093a16",
  },

  High: {
    bg: "#e6f8d4",
    color: "#1a4a0a",
  },

  Medium: {
    bg: "#fff0c6",
    color: "#543007",
  },
};

const COMPETITION_COLORS = {
  Low: {
    bg: "#dcfce7",
    color: "#166534",
  },

  Medium: {
    bg: "#fef3c7",
    color: "#92400e",
  },

  High: {
    bg: "#fee2e2",
    color: "#991b1b",
  },
};

const FILTERS = [
  {
    value: "All",
    label: "♧ All",
  },
  {
    value: "Party Games & Activities",
    label: "Games & Activities",
  },
  {
    value: "Party Invitations",
    label: "Invitations",
  },
  {
    value: "Party Decorations",
    label: "Decorations",
  },
  {
    value: "Party Favor Products",
    label: "Party Favors",
  },
  {
    value: "Party Planning Kits",
    label: "Planning Kits",
  },
  {
    value: "Party Table Printables",
    label: "Table Printables",
  },
  {
    value: "Party Photo Booth Kits",
    label: "Photo Booth",
  },
];

// ================================================================
// DEFAULT IDEAS
// These are starter examples only.
// AI search replaces them.
// ================================================================

const DEFAULT_PRODUCTS = [
  {
    id: "default-1",
    name: "Kids Birthday Bingo Game",
    category: "Party Games & Activities",
    productType: "Birthday Bingo",
    demand: "Very High",
    trendScore: 91,
    opportunityScore: 89,
    competition: "Medium",
    priceMin: 3.99,
    priceMax: 7.99,
    targetBuyer: "Parents planning kids birthday parties",
    reason:
      "Interactive printable games are easy to use and work across many birthday themes.",
    designStyle: "Cute",
    colorIndex: 0,
    formData: {
      theme: "Colorful Birthday",
      ratio: "7:5",
    },
  },

  {
    id: "default-2",
    name: "Modern Kids Birthday Invitation",
    category: "Party Invitations",
    productType: "Kids Birthday Invitation",
    demand: "Very High",
    trendScore: 94,
    opportunityScore: 91,
    competition: "High",
    priceMin: 4.99,
    priceMax: 9.99,
    targetBuyer: "Parents organizing children's birthday parties",
    reason:
      "Personalized invitations have strong visual appeal and support almost any birthday theme.",
    designStyle: "Cute",
    colorIndex: 1,
    formData: {
      theme: "Modern Kids Birthday",
      ratio: "5:7",
    },
  },

  {
    id: "default-3",
    name: "Indoor Birthday Scavenger Hunt",
    category: "Party Games & Activities",
    productType: "Indoor Scavenger Hunt",
    demand: "High",
    trendScore: 86,
    opportunityScore: 88,
    competition: "Medium",
    priceMin: 4.99,
    priceMax: 9.99,
    targetBuyer: "Parents looking for indoor party activities",
    reason:
      "Scavenger hunts provide a complete activity and can be adapted to many party themes.",
    designStyle: "Cute",
    colorIndex: 3,
    formData: {
      theme: "Birthday Adventure",
      ratio: "7:5",
    },
  },

  {
    id: "default-4",
    name: "Premium Birthday Welcome Sign",
    category: "Party Decorations",
    productType: "Birthday Welcome Sign",
    demand: "High",
    trendScore: 84,
    opportunityScore: 82,
    competition: "Medium",
    priceMin: 4.99,
    priceMax: 10.99,
    targetBuyer: "Birthday hosts wanting coordinated decorations",
    reason:
      "Welcome signs create a strong visual centerpiece and support personalization.",
    designStyle: "Modern",
    colorIndex: 1,
    formData: {
      theme: "Premium Birthday",
      ratio: "4:5",
    },
  },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

const ProductIdeas = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);

  const [activeCategory, setActiveCategory] = useState("All");

  const [sortBy, setSortBy] = useState("opportunity");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [searchSummary, setSearchSummary] = useState("");

  const [searched, setSearched] = useState(false);

  // ================================================================
  // FILTER + SORT
  // ================================================================

  const filtered = useMemo(() => {
    let arr = products.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) {
        return false;
      }

      return true;
    });

    arr = [...arr];

    if (sortBy === "opportunity") {
      arr.sort(
        (a, b) =>
          Number(b.opportunityScore || 0) - Number(a.opportunityScore || 0),
      );
    }

    if (sortBy === "trend") {
      arr.sort((a, b) => Number(b.trendScore || 0) - Number(a.trendScore || 0));
    }

    if (sortBy === "price") {
      arr.sort((a, b) => Number(b.priceMax || 0) - Number(a.priceMax || 0));
    }

    if (sortBy === "name") {
      arr.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    return arr;
  }, [products, activeCategory, sortBy]);

  // ================================================================
  // METRICS
  // ================================================================

  const metrics = useMemo(() => {
    if (!products.length) {
      return {
        averageOpportunity: 0,
        averageTrend: 0,
        highDemand: 0,
        averagePrice: 0,
      };
    }

    const averageOpportunity =
      products.reduce(
        (sum, item) => sum + Number(item.opportunityScore || 0),
        0,
      ) / products.length;

    const averageTrend =
      products.reduce((sum, item) => sum + Number(item.trendScore || 0), 0) /
      products.length;

    const highDemand = products.filter(
      (item) => item.demand === "Very High" || item.demand === "High",
    ).length;

    const averagePrice =
      products.reduce(
        (sum, item) =>
          sum + (Number(item.priceMin || 0) + Number(item.priceMax || 0)) / 2,
        0,
      ) / products.length;

    return {
      averageOpportunity: Math.round(averageOpportunity),

      averageTrend: Math.round(averageTrend),

      highDemand,

      averagePrice: averagePrice.toFixed(2),
    };
  }, [products]);

  // ================================================================
  // AI SEARCH
  // ================================================================

  const handleSearch = async (e) => {
    e?.preventDefault();

    const idea = query.trim();

    if (!idea) {
      setError("Enter a party idea first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearchSummary("");

      const response = await api.post("/product-ideas/generate", {
        idea,
      });

      const data = response.data?.data;

      if (!data || !Array.isArray(data.ideas) || !data.ideas.length) {
        throw new Error("AI returned no product ideas.");
      }

      setProducts(data.ideas);

      setSearchSummary(data.searchSummary || "");

      setActiveCategory("All");
      setSortBy("opportunity");
      setSearched(true);
    } catch (err) {
      console.error("Product idea search:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate ideas.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // GO TO CREATE PAGE
  // ================================================================

  const handleGenerate = (product) => {
    // ✅ Validate category against shared CATEGORIES
    const categoryExists = CATEGORIES.some(
      (c) => normalizeKey(c.name) === normalizeKey(product.category),
    );

    if (!categoryExists) {
      console.error("Unknown category from AI:", product.category);
      setError(
        `The AI returned an unsupported category "${product.category}". Please try a different search.`,
      );
      return;
    }

    const prefill = {
      source: "product-ideas",
      ideaName: product.name,
      category: product.category,
      productType: product.productType,
      designStyle: ["Cute", "Modern", "Elegant"].includes(product.designStyle)
        ? product.designStyle
        : "Modern",
      colorIndex:
        Number.isInteger(Number(product.colorIndex)) &&
        Number(product.colorIndex) >= 0 &&
        Number(product.colorIndex) <= 4
          ? Number(product.colorIndex)
          : 0,
      formData:
        product.formData &&
        typeof product.formData === "object" &&
        !Array.isArray(product.formData)
          ? { ...product.formData }
          : {},
      marketInsight: {
        demand: product.demand,
        trendScore: product.trendScore,
        opportunityScore: product.opportunityScore,
        competition: product.competition,
        priceMin: product.priceMin,
        priceMax: product.priceMax,
        targetBuyer: product.targetBuyer,
        reason: product.reason,
      },
    };

    navigate("/product-generator", {
      state: { aiPrefill: prefill },
    });
  };

  // IMPORTANT:
  // Change "/product-generator" above if your actual
  // ProductGeneratorStudio route uses another URL.

  // ================================================================
  // UI
  // ================================================================

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
          {/* ===================================================== */}
          {/* HERO */}
          {/* ===================================================== */}

          <section className="relative mb-[22px] overflow-hidden rounded-[23px] border border-[#e8d5ff] px-[32px] py-[40px]">
            <img
              src={heroBg}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-right"
            />

            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f6e9ff]/95 via-[#f9e5fa]/80 to-[#e6caff]/50" />

            <div className="relative z-[2] max-w-[620px]">
              <div className="mb-3 inline-flex rounded-full bg-white px-4 py-1 text-[13px] font-extrabold text-[#4b075d]">
                ✨ AI Product Opportunity Finder
              </div>

              <h2
                className="mb-2 text-[34px] font-[850] leading-[1.15] tracking-[-1.4px]"
                style={{
                  color: C.heroTitle,
                }}
              >
                Turn Any Party Idea
                <br />
                Into{" "}
                <span
                  style={{
                    color: C.heroAccent,
                  }}
                >
                  Sellable Products
                </span>
              </h2>

              <p
                className="mb-[17px] max-w-[530px] text-[15px] leading-[1.6]"
                style={{
                  color: C.heroText,
                }}
              >
                Describe a theme, event, audience, or idea. AI will turn it into
                practical digital party-product opportunities ready for your
                generator.
              </p>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("idea-search")?.focus();
                }}
                className="flex items-center gap-[10px] rounded-full px-7 py-3 text-[15px] font-bold text-white transition hover:brightness-110"
                style={{
                  background: C.gradientBtn,
                }}
              >
                <Sparkles size={18} />
                Find Product Ideas
                <ArrowRight size={18} />
              </button>
            </div>
          </section>

          {/* ===================================================== */}
          {/* SEARCH */}
          {/* ===================================================== */}

          <form onSubmit={handleSearch} className="mt-[22px] flex gap-[10px]">
            <div className="flex flex-1 items-center gap-4 rounded-full border border-violet-500 bg-white px-7 py-3 shadow-md">
              <Search className="h-6 w-6 shrink-0 text-[#5d5191]" />

              <input
                id="idea-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent text-[15px] outline-none disabled:opacity-60"
                placeholder="Describe any idea — e.g. space birthday for an 8 year old, elegant garden wedding, pink princess first birthday..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[150px] items-center justify-center gap-2 rounded-full px-8 py-3 text-[15px] font-bold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: C.gradientBtn,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Researching
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Find Ideas
                </>
              )}
            </button>
          </form>

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-5 py-3 text-[13px] font-semibold text-red-600">
              ❌ {error}
            </div>
          )}

          {/* SEARCH SUMMARY */}

          {searched && searchSummary && (
            <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[#ded6ff] bg-white/80 px-5 py-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#8e15e5]" />

              <div>
                <div className="text-[12px] font-extrabold uppercase tracking-wide text-[#8e15e5]">
                  AI Analysis
                </div>

                <p className="mt-1 text-[14px] leading-[1.6] text-[#584985]">
                  {searchSummary}
                </p>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* METRICS */}
          {/* ===================================================== */}

          <div className="mt-[22px] grid grid-cols-2 gap-[12px] md:grid-cols-3 lg:grid-cols-5">
            {[
              {
                icon: BarChart3,
                value: products.length,
                label: searched ? "AI Product Ideas" : "Starter Ideas",
                color: "#c026d3",
                bg: "#fae8ff",
              },

              {
                icon: Tag,
                value: metrics.highDemand,
                label: "High-Demand Ideas",
                color: "#059669",
                bg: "#ecfdf5",
              },

              {
                icon: ShoppingCart,
                value: `$${metrics.averagePrice}`,
                label: "Avg. Suggested Price",
                color: "#f43f5e",
                bg: "#fff1f2",
              },

              {
                icon: TrendingUp,
                value: `${metrics.averageTrend}/100`,
                label: "Avg. Trend Potential",
                color: "#7c3aed",
                bg: "#f3e8ff",
              },

              {
                icon: Target,
                value: `${metrics.averageOpportunity}/100`,
                label: "Avg. Opportunity",
                color: "#f97316",
                bg: "#fff7ed",
              },
            ].map((m, i) => {
              const Icon = m.icon;

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl p-3 py-4"
                  style={{
                    background: "rgba(255,255,255,.69)",

                    border: "1px solid #dcd7ff",

                    boxShadow: "0 4px 7px #4e27b514,0 2px 2px #4e27b512",
                  }}
                >
                  <div
                    className="grid shrink-0 place-items-center rounded-[14px] p-3"
                    style={{
                      background: m.bg,
                      color: m.color,
                    }}
                  >
                    <Icon size={28} strokeWidth={1.8} />
                  </div>

                  <div>
                    <div className="text-[18px] font-extrabold leading-tight text-[#080b32]">
                      {m.value}
                    </div>

                    <div className="mt-0.5 text-[12px] text-[#62558f]">
                      {m.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===================================================== */}
          {/* FILTERS */}
          {/* ===================================================== */}

          <div className="mb-[22px] mt-[20px] flex flex-wrap items-center gap-[10px]">
            {FILTERS.map((f) => {
              const active = activeCategory === f.value;

              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActiveCategory(f.value)}
                  className="rounded-full px-5 py-2.5 text-[13px] font-bold transition"
                  style={{
                    border: active ? "none" : "1px solid #cec4ff",

                    background: active
                      ? "linear-gradient(110deg,#a845f5,#7100f9)"
                      : "linear-gradient(#fff,#f9f7ff)",

                    color: active ? "#fff" : "#080b32",

                    boxShadow: "0 3px 5px #4c21b521",
                  }}
                >
                  {f.label}
                </button>
              );
            })}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto cursor-pointer rounded-full border border-[#cec4ff] bg-white px-4 py-2.5 text-[13px] font-bold"
            >
              <option value="opportunity">Sort: Opportunity</option>

              <option value="trend">Sort: Trend Potential</option>

              <option value="price">Sort: Suggested Price</option>

              <option value="name">Sort: Name</option>
            </select>
          </div>

          {/* ===================================================== */}
          {/* TABLE */}
          {/* ===================================================== */}

          <div
            className="overflow-hidden rounded-[15px]"
            style={{
              background: "rgba(255,255,255,.75)",

              border: "1px solid #dcd7ff",

              boxShadow: "0 4px 7px #4e27b514,0 2px 2px #4e27b512",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Product Idea",
                      "Category",
                      "AI Demand",
                      "Price",
                      "Trend",
                      "Opportunity",
                      "Competition",
                      "Action",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-3 py-3 text-left text-[12px] font-extrabold"
                        style={{
                          background: "rgba(255,255,255,.5)",

                          textAlign:
                            index === 0 || index === 8 ? "center" : "left",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((product, index) => {
                    const demand =
                      DEMAND_COLORS[product.demand] || DEMAND_COLORS.Medium;

                    const competition =
                      COMPETITION_COLORS[product.competition] ||
                      COMPETITION_COLORS.Medium;

                    return (
                      <tr key={product.id || `${product.productType}-${index}`}>
                        <td className="border-t border-[#e4e2f5] px-3 py-4 text-center font-bold">
                          {index + 1}
                        </td>

                        <td className="min-w-[240px] border-t border-[#e4e2f5] px-3 py-4">
                          <div className="font-extrabold text-[#080b32]">
                            {product.name}
                          </div>

                          <div className="mt-1 text-[11.5px] font-semibold text-[#8b7fb3]">
                            {product.productType}
                          </div>
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4">
                          <span
                            className="inline-block rounded-full px-3 py-1.5 text-[12px] font-bold"
                            style={{
                              background:
                                CATEGORY_COLORS[product.category] || "#e9dbff",

                              color: "#2500b5",
                            }}
                          >
                            {CATEGORY_LABELS[product.category] ||
                              product.category}
                          </span>
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4">
                          <span
                            className="inline-block rounded-full px-3 py-1.5 text-[12px] font-bold"
                            style={{
                              background: demand.bg,

                              color: demand.color,
                            }}
                          >
                            {product.demand}
                          </span>
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4 font-bold text-[#080b32]">
                          ${Number(product.priceMin).toFixed(2)}
                          {" – $"}
                          {Number(product.priceMax).toFixed(2)}
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4">
                          <strong className="text-[#7c3aed]">
                            {product.trendScore}
                            /100
                          </strong>
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4">
                          <strong className="text-[#059669]">
                            {product.opportunityScore}
                            /100
                          </strong>
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4">
                          <span
                            className="rounded-full px-3 py-1.5 text-[12px] font-bold"
                            style={{
                              background: competition.bg,

                              color: competition.color,
                            }}
                          >
                            {product.competition}
                          </span>
                        </td>

                        <td className="whitespace-nowrap border-t border-[#e4e2f5] px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleGenerate(product)}
                            className="rounded-[10px] px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:brightness-110"
                            style={{
                              background: C.gradientBtn,
                            }}
                          >
                            Generate with AI ✨
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!filtered.length && (
              <div className="p-10 text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#8e15e5]" />

                <div className="font-bold text-[#080b32]">
                  No matching ideas
                </div>

                <div className="mt-1 text-sm text-[#62558f]">
                  Try another category or search for a new idea.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductIdeas;
