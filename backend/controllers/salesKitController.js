// backend/src/controllers/salesKitController.js
const fs = require("fs/promises");
const path = require("path");
const archiver = require("archiver");
const PartyProduct = require("../models/PartyProduct");
const aiService = require("../services/aiService");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

// ================================================================
// PLATFORM RULES
// ================================================================
const PLATFORM_RULES = {
  etsy: {
    titleMax: 140,
    tagCount: 13,
    tagMaxLen: 20,
    tone: "warm, handmade, SEO-friendly, keyword-rich",
    extra:
      "Etsy listings perform best with long-tail keyword phrases and emoji bullets.",
  },
  gumroad: {
    titleMax: 120,
    tagCount: 8,
    tagMaxLen: 30,
    tone: "modern, direct, benefit-driven",
    extra: "Gumroad buyers skim — use punchy headlines and short benefit bullets.",
  },
  payhip: {
    titleMax: 120,
    tagCount: 10,
    tagMaxLen: 25,
    tone: "friendly, conversion-focused",
    extra: "Payhip listings work best with clear 'what you get' sections.",
  },
  shopify: {
    titleMax: 70,
    tagCount: 10,
    tagMaxLen: 30,
    tone: "professional, ecommerce-optimised",
    extra: "Shopify product titles should be short and SEO-clean.",
  },
};

// ================================================================
// Helpers
// ================================================================
function publicUrlToAbsPath(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return null;
  const rel = publicUrl.replace(/^\/uploads\//, "");
  const abs = path.join(UPLOADS_ROOT, rel);
  if (!path.normalize(abs).startsWith(UPLOADS_ROOT)) return null;
  return abs;
}

function safeName(str, fallback = "file") {
  return (
    String(str || "")
      .replace(/[^\w\-. ]+/g, "_")
      .trim()
      .slice(0, 80) || fallback
  );
}

function extFromUrl(url, mime) {
  const m = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(url || "");
  if (m) return m[1].toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "bin";
}

// ================================================================
// POST /api/sales-kits/generate-listing
// Body: { productId, platform }
// ================================================================
async function generateListing(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId, platform = "etsy" } = req.body || {};
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
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

    const rules = PLATFORM_RULES[platform] || PLATFORM_RULES.etsy;

    const systemPrompt = `
You are an expert ${platform} listing copywriter for digital party printables.

Return ONLY valid JSON with this exact shape:
{
  "title": "string",
  "description": "string",
  "tags": ["string", "string", "..."]
}

Rules:
- Title max ${rules.titleMax} characters. Include product type + occasion + "Printable" + "Instant Download".
- Description: start with a hook, then a "What's Included" bullet list, then a "Perfect For" bullet list. Max 5000 characters.
- Exactly ${rules.tagCount} tags. Each tag max ${rules.tagMaxLen} characters. Lowercase, no duplicates, highly searchable.
- Tone: ${rules.tone}.
- ${rules.extra}
- Do NOT invent names, dates, brands, page counts, or file formats not supplied.
- Do NOT wrap the JSON in markdown code fences.
    `.trim();

    const userMessage = `
Generate a ${platform} listing for this exact product:

Product type: ${product.productType}
Category: ${product.category}
Design style: ${product.designStyle}
Output format: ${product.outputFormat || "Image"}
Extra user details: ${JSON.stringify(product.formData || {}, null, 2)}

Return the JSON object only.
    `.trim();

    const raw = await aiService.chat({
      systemPrompt,
      userMessage,
      temperature: 0.6,
      maxTokens: 1600,
      model: "deepseek-chat",
    });

    let cleaned = String(raw || "")
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first >= 0 && last > first) {
        parsed = JSON.parse(cleaned.slice(first, last + 1));
      } else {
        throw new Error("DeepSeek returned non-JSON output");
      }
    }

    const title = String(parsed.title || "")
      .slice(0, rules.titleMax)
      .trim();
    const description = String(parsed.description || "")
      .slice(0, 5000)
      .trim();
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((t) =>
            String(t).toLowerCase().trim().slice(0, rules.tagMaxLen)
          )
          .filter(Boolean)
          .slice(0, rules.tagCount)
      : [];

    if (!title || !description || tags.length === 0) {
      throw new Error("Incomplete listing returned by AI");
    }

    return res.json({
      success: true,
      data: {
        platform,
        productId: product._id,
        productType: product.productType,
        title,
        description,
        tags,
      },
    });
  } catch (err) {
    console.error("generateListing error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate listing",
    });
  }
}

// ================================================================
// POST /api/sales-kits/export
// Body: { productId, platform, title, description, tags, includeFiles }
// Streams a ZIP.
// ================================================================
async function exportSalesKit(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      productId,
      platform = "etsy",
      title = "",
      description = "",
      tags = [],
      includeFiles = true,
    } = req.body || {};

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "title and description are required",
      });
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

    const safeProduct = safeName(product.productType, "product");
    const folder = `${platform}-${safeProduct.toLowerCase().replace(/\s+/g, "-")}`;
    const zipFilename = `${folder}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("warning", (err) =>
      console.warn("archiver warn:", err.message)
    );
    archive.on("error", (err) => {
      console.error("archiver error:", err);
      try {
        res.destroy(err);
      } catch {}
    });
    archive.pipe(res);

    // 1. listing.json
    archive.append(
      JSON.stringify(
        {
          platform,
          product: product.productType,
          category: product.category,
          designStyle: product.designStyle,
          outputFormat: product.outputFormat || "Image",
          title,
          description,
          tags,
          generatedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      { name: `${folder}/listing.json` }
    );

    // 2-4. txt files
    archive.append(
      `${platform.toUpperCase()} TITLE (${title.length} chars)\n\n${title}\n`,
      { name: `${folder}/title.txt` }
    );
    archive.append(
      `${platform.toUpperCase()} DESCRIPTION (${description.length} chars)\n\n${description}\n`,
      { name: `${folder}/description.txt` }
    );
    archive.append(
      `TAGS (${tags.length})\n\n${tags.join("\n")}\n`,
      { name: `${folder}/tags.txt` }
    );

    // 5. csv
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    archive.append(
      [
        "field,value",
        `platform,${esc(platform)}`,
        `product,${esc(product.productType)}`,
        `title,${esc(title)}`,
        `description,${esc(description)}`,
        `tags,${esc(tags.join(" | "))}`,
      ].join("\n"),
      { name: `${folder}/listing.csv` }
    );

    // 6. README
    archive.append(
      `Sales Kit — ${product.productType}\n` +
        `Platform: ${platform}\n` +
        `Generated: ${new Date().toLocaleString()}\n\n` +
        `Files:\n` +
        `  • listing.json     — machine readable\n` +
        `  • title.txt        — copy-paste title\n` +
        `  • description.txt  — copy-paste description\n` +
        `  • tags.txt         — one tag per line\n` +
        `  • listing.csv      — spreadsheet import\n` +
        (includeFiles && product.imageUrl
          ? `  • product.*        — your generated product file\n`
          : ``) +
        `\nUpload the product.* file along with the listing text on ${platform}.\n`,
      { name: `${folder}/README.txt` }
    );

    // 7. actual product file
    if (includeFiles && product.imageUrl) {
      const abs = publicUrlToAbsPath(product.imageUrl);
      if (abs) {
        try {
          await fs.access(abs);
          const ext = extFromUrl(product.imageUrl, product.imageMimeType);
          archive.file(abs, { name: `${folder}/product.${ext}` });
        } catch {
          console.warn("product file missing on disk:", abs);
        }
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error("exportSalesKit error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
    try {
      res.destroy(err);
    } catch {}
  }
}

// ================================================================
// EXPORTS
// ================================================================
exports.generateListing = generateListing;
exports.exportSalesKit = exportSalesKit;