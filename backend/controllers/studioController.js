// backend/controllers/studioController.js
const aiService = require("../services/aiService");
const PartyProduct = require("../models/PartyProduct");

const PROMPTS = {
  listing: (ctx) => ({
    system: `You are an expert Etsy / Creative Market copywriter.

Return ONLY valid JSON. No markdown. No code fences.

Schema:
{
  "title": "100-140 char SEO title",
  "description": "600-900 chars, 4 paragraphs, paragraph 2 uses • bullets.",
  "price": 6.99,
  "currency": "USD",
  "tags": ["...13 tags"],
  "seoKeywords": ["...8-12 keywords"],
  "instagramCaption": "1-2 sentences + 5-8 hashtags",
  "category": "Etsy category suggestion"
}`,
    user: `PRODUCT:
Type: ${ctx.productType}
Category: ${ctx.category}
Style: ${ctx.designStyle}
Format: ${ctx.isPdf ? "Multi-page PDF" : "Image"}
Form data: ${JSON.stringify(ctx.formData)}

Return listing JSON only.`,
  }),

  pricing: (ctx) => ({
    system: `You are the pricing strategist.

Return ONLY valid JSON.

Schema:
{
  "suggestedPrice": 6.99,
  "currency": "USD",
  "priceRange": { "min": 3.99, "max": 9.99 },
  "strategy": "premium | mid-market | budget | bundle",
  "reasoning": "2-3 sentences",
  "upsellIdea": "1 sentence",
  "competitorBenchmark": "1 sentence"
}`,
    user: `PRODUCT:
Type: ${ctx.productType}
Category: ${ctx.category}
Format: ${ctx.isPdf ? "PDF" : "Image"}
Theme: ${ctx.formData?.theme || "not specified"}

Return pricing JSON only.`,
  }),

  social: (ctx) => ({
    system: `You are the social media strategist.

Return ONLY valid JSON.

Schema:
{
  "instagram": [{ "caption": "...", "hashtags": ["#tag1"] }],
  "pinterest": [{ "title": "max 100 chars", "description": "max 300 chars" }],
  "tweets": ["max 240 chars"]
}

Provide exactly 3 instagram, 3 pinterest, 2 tweets.`,
    user: `PRODUCT:
Type: ${ctx.productType}
Category: ${ctx.category}
Theme: ${ctx.formData?.theme || "party"}

Return social pack JSON only.`,
  }),

  email: (ctx) => ({
    system: `You are the customer experience writer.

Return ONLY valid JSON.

Schema:
{
  "subject": "max 70 chars",
  "previewText": "max 100 chars",
  "body": "4-5 short paragraphs separated by \\n\\n",
  "ctaText": "button text"
}`,
    user: `PRODUCT:
Type: ${ctx.productType}
Category: ${ctx.category}
Format: ${ctx.isPdf ? "PDF" : "Image"}

Return buyer email JSON only.`,
  }),

  bundle: (ctx) => ({
    system: `You are the bundling strategist.

Return ONLY valid JSON.

Schema:
{
  "bundleName": "...",
  "bundleDescription": "300-500 chars",
  "bundlePrice": 24.99,
  "individualValue": 39.96,
  "savings": "37% off",
  "includedItems": ["..."],
  "tags": ["...10 tags"],
  "marketingAngle": "1-2 sentences"
}`,
    user: `PRODUCTS IN BUNDLE:
${ctx.products.map((p, i) => `${i + 1}. ${p.productType} (${p.category})`).join("\n")}

Return bundle JSON only.`,
  }),
};

function isPdfProduct(p) {
  if (!p) return false;
  if (String(p.outputFormat || "").toLowerCase() === "pdf") return true;
  if (String(p.imageMimeType || "").toLowerCase() === "application/pdf") return true;
  if (String(p.imageUrl || "").toLowerCase().endsWith(".pdf")) return true;
  return false;
}

function parseJson(raw) {
  return JSON.parse(String(raw).replace(/```json|```/g, "").trim());
}

exports.run = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { action, productId, productIds } = req.body || {};

    // ANALYTICS
    if (action === "analytics") {
      const items = await PartyProduct.find({ userId, status: "completed" }).lean();
      const total = items.length;
      const pdfCount = items.filter(isPdfProduct).length;
      const imageCount = total - pdfCount;

      const byCategory = {};
      const byStyle = {};
      items.forEach((i) => {
        byCategory[i.category] = (byCategory[i.category] || 0) + 1;
        byStyle[i.designStyle] = (byStyle[i.designStyle] || 0) + 1;
      });

      const topCategory =
        Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
      const topStyle =
        Object.entries(byStyle).sort((a, b) => b[1] - a[1])[0] || ["—", 0];

      return res.json({
        success: true,
        data: {
          action: "analytics",
          total,
          pdfCount,
          imageCount,
          pdfPercent: total ? Math.round((pdfCount / total) * 100) : 0,
          byCategory,
          byStyle,
          topCategory: { name: topCategory[0], count: topCategory[1] },
          topStyle: { name: topStyle[0], count: topStyle[1] },
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // BUNDLE
    if (action === "bundle") {
      if (!Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({
          success: false,
          message: "bundle requires at least 2 productIds",
        });
      }

      const products = await PartyProduct.find({
        _id: { $in: productIds },
        userId,
        status: "completed",
      }).lean();

      if (products.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least 2 completed products required",
        });
      }

      const prompt = PROMPTS.bundle({
        products: products.map((p) => ({
          productType: p.productType,
          category: p.category,
        })),
      });

      const raw = await aiService.chat({
        systemPrompt: prompt.system,
        userMessage: prompt.user,
        temperature: 0.6,
        maxTokens: 900,
      });

      let parsed;
      try {
        parsed = parseJson(raw);
      } catch {
        return res
          .status(500)
          .json({ success: false, message: "AI returned invalid JSON" });
      }

      return res.json({
        success: true,
        data: {
          action: "bundle",
          ...parsed,
          productCount: products.length,
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // SINGLE-PRODUCT ACTIONS
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId required" });
    }

    const product = await PartyProduct.findOne({
      _id: productId,
      userId,
    }).lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.status !== "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Product must be completed first" });
    }

    const promptFn = PROMPTS[action];
    if (!promptFn) {
      return res
        .status(400)
        .json({ success: false, message: `Unknown action: ${action}` });
    }

    const ctx = {
      productType: product.productType,
      category: product.category,
      designStyle: product.designStyle,
      formData: product.formData || {},
      isPdf: isPdfProduct(product),
    };

    const prompt = promptFn(ctx);

    const raw = await aiService.chat({
      systemPrompt: prompt.system,
      userMessage: prompt.user,
      temperature: 0.6,
      maxTokens: 1500,
    });

    let parsed;
    try {
      parsed = parseJson(raw);
    } catch {
      return res
        .status(500)
        .json({ success: false, message: "AI returned invalid JSON" });
    }

    return res.json({
      success: true,
      data: {
        action,
        productId: product._id,
        productType: product.productType,
        isPdf: ctx.isPdf,
        ...parsed,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("studioController error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "AI Party Business Studio request failed",
    });
  }
};