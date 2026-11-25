const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const archiver = require("archiver");

const PartyProduct = require("../models/PartyProduct");

// Everything under backend/src/uploads
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

/**
 * "/uploads/party-products/<uid>/<id>.png"
 *   -> absolute disk path
 * Returns null if the URL is not under /uploads/ or the file is missing.
 */
function publicUrlToAbsPath(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return null;
  const rel = publicUrl.replace(/^\/uploads\//, "");
  const abs = path.join(UPLOADS_ROOT, rel);
  // block path traversal
  const normal = path.normalize(abs);
  if (!normal.startsWith(UPLOADS_ROOT)) return null;
  return normal;
}

function safeName(str, fallback = "item") {
  const cleaned = String(str || "")
    .replace(/[^\w\-. ]+/g, "_")
    .trim()
    .slice(0, 80);
  return cleaned || fallback;
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
// POST /api/party-kits/generate
// Body: {
//   kitTitle, theme, ageGroup, partyStyle, numItems, requirements,
//   productIds: ["<mongoId>", ...]
// }
// Streams back a ZIP. No DB writes.
// ================================================================
exports.generate = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      kitTitle = "Party Kit",
      theme = "",
      ageGroup = "",
      partyStyle = "",
      numItems = "",
      requirements = "",
      productIds = [],
    } = req.body || {};

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Select at least one product" });
    }

    // Fetch only this user's products — ensures ownership
    const products = await PartyProduct.find({
      _id: { $in: productIds },
      userId,
    }).lean();

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching products found" });
    }

    // Resolve existing files on disk; skip anything missing
    const files = [];
    for (const p of products) {
      const abs = publicUrlToAbsPath(p.imageUrl);
      if (!abs) continue;
      try {
        await fs.access(abs);
      } catch {
        continue; // file was deleted from disk
      }
      const ext = extFromUrl(p.imageUrl, p.imageMimeType);
      const base = safeName(p.productType || "product", "product");
      files.push({
        abs,
        zipName: `${base}-${String(p._id).slice(-6)}.${ext}`,
        product: p,
      });
    }

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "None of the selected products have files on disk",
      });
    }

    // ---- Build manifest (metadata only; not the product files) ----
    const manifest = {
      kitTitle,
      theme,
      ageGroup,
      partyStyle,
      numItems,
      requirements,
      generatedAt: new Date().toISOString(),
      itemCount: files.length,
      items: files.map((f) => ({
        productId: String(f.product._id),
        productType: f.product.productType,
        category: f.product.category,
        designStyle: f.product.designStyle,
        outputFormat: f.product.outputFormat || "Image",
        file: f.zipName,
      })),
    };

    // ---- Headers for auto-download ----
    const safeTitle = safeName(kitTitle, "party-kit").replace(/\s+/g, "-");
    const zipFilename = `${safeTitle}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`
    );
    // allow frontend to read the filename
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    // ---- Stream the zip ----
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("warning", (err) => {
      // ENOENT on a file is non-fatal; log and continue
      console.warn("archiver warning:", err.message);
    });
    archive.on("error", (err) => {
      console.error("archiver error:", err);
      try {
        res.destroy(err);
      } catch {}
    });

    archive.pipe(res);

    // folder inside the zip
    const folder = safeTitle || "party-kit";
    archive.append(JSON.stringify(manifest, null, 2), {
      name: `${folder}/manifest.json`,
    });

    for (const f of files) {
      archive.file(f.abs, { name: `${folder}/${f.zipName}` });
    }

    await archive.finalize();
  } catch (err) {
    console.error("generateKit error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
    try {
      res.destroy(err);
    } catch {}
  }
};