// backend/services/productPdfService.js
const fs = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");
const aiService = require("./aiService");

// ================================================================
// 1. DeepSeek content
// ================================================================
async function generateContent({ productType, category, designStyle, formData }) {
  const systemPrompt = `
You are a senior print designer for premium party products.
Return ONLY valid JSON. No markdown.

Schema:
{
  "headline": "main title shown on the printed product",
  "subtitle": "one-line subtitle",
  "sections": [
    { "heading": "section title", "lines": ["line 1", "line 2"] }
  ],
  "footer": "small footer text",
  "accentColor": "#RRGGBB"
}

Rules:
- Use only facts from the supplied formData.
- For games: create a "Bingo Cards" section with card lines, and a "Calling List" section.
- accentColor should match designStyle.
  `.trim();

  const userMessage = `
Product: ${productType}
Category: ${category}
Design style: ${designStyle}
Form data: ${JSON.stringify(formData, null, 2)}
  `.trim();

  const raw = await aiService.chat({
    systemPrompt,
    userMessage,
    temperature: 0.4,
    maxTokens: 1600,
  });

  const cleaned = String(raw || "")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

// ================================================================
// 2. Read image → base64 data URL (bulletproof embedding)
// ================================================================
async function imageToDataUrl(imagePath) {
  if (!imagePath) return "";

  try {
    const buf = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).slice(1).toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "webp"
          ? "image/webp"
          : "image/png";

    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    console.log(
      `📄 PDF: image loaded → ${imagePath} (${Math.round(buf.length / 1024)} KB, ${mime})`
    );
    return dataUrl;
  } catch (err) {
    console.warn(`⚠️ PDF: could not read image at ${imagePath}:`, err.message);
    return "";
  }
}

// ================================================================
// 3. Build HTML with image inlined as data URL
// ================================================================
function buildHtml({ productType, category, designStyle, content, imageDataUrl }) {
  const accent = content.accentColor || "#8e15e5";
  const safe = (s) =>
    String(s || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

  const sectionsHtml = (content.sections || [])
    .map(
      (s) => `
      <section class="card">
        <h2>${safe(s.heading)}</h2>
        <ul>${(s.lines || []).map((l) => `<li>${safe(l)}</li>`).join("")}</ul>
      </section>`
    )
    .join("");

  const imageHtml = imageDataUrl
    ? `<div class="image-wrap"><img src="${imageDataUrl}" alt="${safe(productType)}" /></div>`
    : `<div class="image-wrap image-missing">No preview image</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #1a1a2e; background: #fff; -webkit-print-color-adjust: exact; }
  .page { padding: 40px 48px; }
  header { background: ${accent}; color: #fff; padding: 32px 40px; border-radius: 16px; margin-bottom: 28px; }
  header h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.5px; }
  header p  { font-size: 15px; opacity: .9; margin-top: 6px; }
  .image-wrap { text-align: center; margin-bottom: 28px; }
  .image-wrap img { max-width: 100%; max-height: 340px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
  .image-missing { color: #b91c1c; font-size: 12px; padding: 20px; border: 1px dashed #fca5a5; border-radius: 12px; }
  .card { border: 1px solid #e2dff8; border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; background: #faf9ff; page-break-inside: avoid; }
  .card h2 { font-size: 18px; color: ${accent}; margin-bottom: 10px; font-weight: 800; }
  .card ul { list-style: none; padding: 0; }
  .card li { padding: 6px 0; font-size: 13px; line-height: 1.5; border-bottom: 1px dashed #e8e2ff; }
  .card li:last-child { border-bottom: none; }
  footer { margin-top: 32px; text-align: center; font-size: 11px; color: #8b7fb3; padding-top: 16px; border-top: 1px solid #e8e2ff; }
</style>
</head>
<body>
  <div class="page">
    <header>
      <h1>${safe(content.headline || productType)}</h1>
      <p>${safe(content.subtitle || category)}</p>
    </header>
    ${imageHtml}
    ${sectionsHtml}
    <footer>${safe(content.footer || `Design Style: ${designStyle}`)}</footer>
  </div>
</body>
</html>`;
}

// ================================================================
// 4. Render PDF — waits for images to fully load
// ================================================================
async function renderPdf(html, outputPath) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for all images to finish decoding
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              })
        )
      );
    });

    // Wait for fonts too
    await page.evaluate(() => document.fonts?.ready || Promise.resolve());

    await page.pdf({
      path: outputPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
  } finally {
    await browser.close();
  }
}

// ================================================================
// 5. Main export
// ================================================================
async function generateProductPdf({
  productType,
  category,
  formData = {},
  designStyle = "Modern",
  outputDir,
  imagePath = "",
}) {
  console.log("📄 PDF: start —", { productType, category, designStyle });
  console.log("📄 PDF: imagePath passed =", imagePath || "(empty)");

  await fs.mkdir(outputDir, { recursive: true });

  // 1. Content
  let content;
  try {
    console.log("📄 PDF: calling DeepSeek...");
    content = await generateContent({ productType, category, designStyle, formData });
    console.log(
      "📄 PDF: DeepSeek OK —",
      (content.sections || []).length,
      "sections"
    );
  } catch (err) {
    console.warn("⚠️ PDF: DeepSeek failed:", err.message);
    content = {
      headline: productType || "Printable Product",
      subtitle: category || "Party Printable",
      sections: [],
      footer: `Design Style: ${designStyle}`,
      accentColor: "#8e15e5",
    };
  }

  // 2. Image → base64
  const imageDataUrl = await imageToDataUrl(imagePath);

  // 3. HTML
  const html = buildHtml({ productType, category, designStyle, content, imageDataUrl });
  console.log(
    `📄 PDF: HTML built — ${html.length} chars, image ${imageDataUrl ? "INCLUDED" : "MISSING"}`
  );

  // 4. Render
  const safeName = String(productType || "product")
    .replace(/[^\w\-]+/g, "-")
    .toLowerCase();
  const filePath = path.join(outputDir, `${safeName}-${Date.now()}.pdf`);

  console.log("📄 PDF: launching Puppeteer...");
  await renderPdf(html, filePath);
  console.log("📄 PDF: done →", filePath);

  const stat = await fs.stat(filePath);
  return { filePath, sizeBytes: stat.size };
}

module.exports = { generateProductPdf };