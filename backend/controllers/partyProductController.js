// backend/src/controllers/partyProductController.js
const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");
const { generateProductPdf } = require("../services/productPdfService");

const PartyProduct = require("../models/PartyProduct");
const aiService = require("../services/aiService");

// ================================================================
// LIVE PRODUCT REFERENCE IMAGE
// ================================================================

const PRODUCT_IMAGE_ORIGIN =
  process.env.PRODUCT_IMAGE_ORIGIN || "https://aipartyproduct.albinolabs.com";

const PRODUCT_IMAGE_FOLDERS = {
  "Party Invitations": "01-party-invitations",
  "Party Decorations": "02-party-decorations",
  "Party Games & Activities": "03-party-games-activities",
  "Party Favor Products": "04-party-favor-products",
  "Party Planning Kits": "05-party-planning-kits",
  "Party Table Printables": "06-party-table-printables",
  "Party Photo Booth Kits": "07-party-photo-booth-kits",
};

function getTrustedReferenceUrl(category, imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    throw new Error("Selected product reference image is missing");
  }

  const categoryFolder = PRODUCT_IMAGE_FOLDERS[category];

  if (!categoryFolder) {
    throw new Error("Unsupported party product category");
  }

  const origin = new URL(PRODUCT_IMAGE_ORIGIN);

  if (origin.protocol !== "https:") {
    throw new Error("Product image origin must use HTTPS");
  }

  const referenceUrl = new URL(imagePath, origin);

  if (referenceUrl.origin !== origin.origin) {
    throw new Error("External reference image URLs are not allowed");
  }

  const expectedPrefix = `/product-images/${categoryFolder}/`;

  if (!referenceUrl.pathname.startsWith(expectedPrefix)) {
    throw new Error("Reference image does not match selected category");
  }

  if (!/\/\d{3}-[a-z0-9-]+\.png$/i.test(referenceUrl.pathname)) {
    throw new Error("Invalid product reference image filename");
  }

  if (referenceUrl.search || referenceUrl.hash) {
    throw new Error("Reference image URL contains unexpected parameters");
  }

  return referenceUrl.toString();
}

// ================================================================
// STORAGE CONFIG
// ================================================================
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "party-products");

/**
 * Download a Replicate URL and save it to local disk.
 * Returns the public path you'll serve via Express (e.g. /uploads/party-products/<uid>/<id>.png)
 */
async function storeImageLocally(replicateUrl, userId, genId, ext = "png") {
  // 1. Ensure the user's folder exists
  const userDir = path.join(UPLOAD_ROOT, String(userId));
  await fs.mkdir(userDir, { recursive: true });

  // 2. Download bytes from Replicate
  const res = await axios.get(replicateUrl, {
    responseType: "arraybuffer",
    timeout: 60_000,
  });

  // 3. Save to disk
  const filename = `${genId}.${ext}`;
  const localPath = path.join(userDir, filename);
  await fs.writeFile(localPath, Buffer.from(res.data));

  // 4. Return the public URL (served by server.js at /uploads/...)
  return {
    url: `/uploads/party-products/${userId}/${filename}`,
    localPath,
    sizeBytes: res.data.byteLength || res.data.length,
    mimeType: res.headers["content-type"] || "image/png",
  };
}

// ✅ NEW: helper to move the PDF that generateProductPdf wrote
// into the same user-scoped folder the image flow uses.
async function storePdfLocally(sourcePdf, userId, genId) {
  const userDir = path.join(UPLOAD_ROOT, String(userId));
  await fs.mkdir(userDir, { recursive: true });

  const filename = `${genId}.pdf`;
  const localPath = path.join(userDir, filename);

  // generateProductPdf wrote to a temp file — copy it into our folder
  await fs.copyFile(sourcePdf.filePath, localPath);

  // Best-effort delete the temp file the service created
  try {
    await fs.unlink(sourcePdf.filePath);
  } catch (_) {}

  const stat = await fs.stat(localPath);

  return {
    url: `/uploads/party-products/${userId}/${filename}`,
    localPath,
    sizeBytes: stat.size,
    mimeType: "application/pdf",
  };
}

/**
 * Delete an image from local disk by its public URL.
 * Safe to call even if the file is already gone.
 */
async function deleteLocalImage(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/party-products/")) return;
  // Map /uploads/party-products/... → backend/src/uploads/party-products/...
  const relative = publicUrl.replace(/^\/uploads\//, "");
  const abs = path.join(__dirname, "..", "uploads", relative);
  try {
    await fs.unlink(abs);
  } catch (err) {
    if (err.code !== "ENOENT") console.warn("deleteLocalImage:", err.message);
  }
}

// ============================================================
// PRODUCT BLUEPRINTS — real print formats, layouts, components
// ============================================================
const PRODUCT_BLUEPRINTS = [
  {
    match: /invit/i,
    aspectRatio: "3:4",
    format: "single 5x7 inch portrait invitation card, full-bleed artwork",
    layout:
      "one finished card, centered focal illustration or framed ornamental panel, generous safe margins, text block centered or left-aligned inside the frame",
    components: "one complete invitation card only",
    textLevels:
      "headline, honoree name as the largest element, event details block, small supporting line",
  },
  {
    match: /welcome|sign|poster/i,
    aspectRatio: "2:3",
    format: "tall 24x36 inch portrait welcome sign, full-bleed artwork",
    layout:
      "large display headline in the upper-middle, decorative frame or illustrated corners, oversized readable lettering visible from a distance, one hero illustration cluster",
    components: "one complete sign only",
    textLevels:
      "huge welcome headline, honoree or event name, one short subline",
  },
  {
    match: /cupcake|topper/i,
    aspectRatio: "3:4",
    format: "US Letter printable sheet, flat top-down, plain white background",
    layout:
      "neat grid of twelve identical-size round 2-inch topper designs in 3 columns by 4 rows, equal spacing, thin hairline cut circles around each, consistent coordinated motifs",
    components:
      "twelve round toppers on one sheet, matching set, varied but cohesive motifs",
    textLevels:
      "very short text only on toppers (name or number), large and centered",
  },
  {
    match: /photo.?booth|prop/i,
    aspectRatio: "3:4",
    format: "US Letter printable sheet, flat top-down, plain white background",
    layout:
      "six to eight coordinated photo booth props (speech bubbles, glasses, crowns, mustaches, signs) arranged without overlap, each with a thin white die-cut outline and a small stick tab area",
    components: "one cohesive prop set on a single sheet",
    textLevels: "short, bold, readable phrases only on speech-bubble props",
  },
  {
    match: /menu/i,
    aspectRatio: "2:3",
    format: "4x9 or 5x7 inch portrait menu card, full-bleed artwork",
    layout:
      "title lockup at top, ornamental divider, three to four clearly separated menu sections with generous line spacing, subtle illustrated border",
    components: "one complete menu card only",
    textLevels: "menu title, section headings, item names, small descriptions",
  },
  {
    match: /favor|tag|label|sticker/i,
    aspectRatio: "3:4",
    format: "US Letter printable sheet, flat top-down, plain white background",
    layout:
      "grid of coordinated gift tags with punched-hole circles and thin cut lines, equal spacing, matching border treatment",
    components: "set of identical-format tags on one sheet",
    textLevels: "short thank-you line area, name line, small decorative motif",
  },
  {
    match: /banner|bunting|garland|pennant/i,
    aspectRatio: "16:9",
    format: "flat printable banner artwork, plain white background",
    layout:
      "row of evenly sized pennant flags or letter cards laid out flat in one horizontal line, matching ornaments between flags, string line across the top",
    components: "complete banner set laid flat, one letter or motif per flag",
    textLevels: "one large letter or word per flag, bold and centered",
  },
  {
    match: /plan|checklist|schedule|tracker/i,
    aspectRatio: "3:4",
    format: "US Letter portrait printable planner page, full-bleed",
    layout:
      "styled header with illustration, structured ruled sections and boxes with consistent margins, clear writing space, subtle decorative corners that never touch writing areas",
    components: "one complete planner page",
    textLevels: "page title, section headings, small field labels",
  },
  {
    match: /game|bingo|trivia|scavenger|puzzle|quiz/i,
    aspectRatio: "3:4",
    format: "US Letter portrait printable party game sheet, full-bleed",
    layout:
      "clean playable game structure (grid, cards or list) with clear header, instructions area, large readable cells, themed illustrations in margins only",
    components: "one complete, usable game sheet",
    textLevels: "game title, instruction line, cell labels",
  },
  {
    match: /thank|card|greeting/i,
    aspectRatio: "3:4",
    format: "5x7 inch portrait card, full-bleed artwork",
    layout: "framed focal illustration, elegant text area, balanced margins",
    components: "one complete card",
    textLevels: "headline, short message, small closing line",
  },
];

const DEFAULT_BLUEPRINT = {
  aspectRatio: "3:4",
  format: "US Letter portrait printable design, full-bleed artwork",
  layout:
    "clear focal point, framed decorative border, structured text area, balanced margins",
  components: "one complete finished product",
  textLevels: "headline, key name, event details, small supporting text",
};

// ============================================================
// STYLE LIBRARY — concrete art direction per style
// ============================================================
const STYLE_LIBRARY = {
  modern:
    "bold clean geometry, asymmetrical balance, confident sans-serif or refined display type, flat vector shapes with subtle grain, 3-4 colour palette, deliberate whitespace",
  luxury:
    "deep rich background tones, restrained real-looking gold foil accents with soft highlights, fine linework, high-contrast editorial serif, subtle embossed paper texture, symmetrical formal layout",
  minimal:
    "monochrome or two-tone palette, thin precise linework, one small illustrated accent, large margins, light elegant sans-serif, quiet and gallery-like",
  boho: "warm terracotta, sage, sand and cream palette, hand-painted pampas grass, dried florals, arches and moons, organic shapes, soft paper grain, relaxed serif or script pairing",
  watercolor:
    "hand-painted watercolor washes with visible pigment blooms and soft organic edges, loose botanical or themed illustrations, cold-press paper texture, delicate script with a clean serif",
  kids: "friendly hand-drawn characters and objects, bright but harmonious palette, rounded chunky lettering, confetti and playful shapes arranged in an organised composition",
  vintage:
    "muted nostalgic palette, period-appropriate lettering, fine engraved illustration style, ornamental frames, aged-paper texture kept subtle and clean",
  elegant:
    "refined ornamental frame, delicate floral or line-art details, graceful calligraphy paired with a classic serif, soft neutral palette with one accent, generous spacing",
};

function pickBlueprint(productType = "") {
  return (
    PRODUCT_BLUEPRINTS.find((b) => b.match.test(productType)) ||
    DEFAULT_BLUEPRINT
  );
}

function pickStyle(designStyle = "Modern") {
  const key = String(designStyle).toLowerCase();
  const hit = Object.keys(STYLE_LIBRARY).find((k) => key.includes(k));
  return {
    name: designStyle || "Modern",
    direction: STYLE_LIBRARY[hit || "modern"],
  };
}

// Use this to pass the right aspect ratio to Grok Imagine
function getAspectRatio(productType) {
  return pickBlueprint(productType).aspectRatio;
}

async function buildImagePrompt({
  category,
  productType,
  designStyle,
  formData,
  textMode = "baked",
}) {
  const blueprint = pickBlueprint(productType);
  const style = pickStyle(designStyle);

  const cleanedFormData = Object.fromEntries(
    Object.entries(formData || {}).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== false,
    ),
  );

  // The physical product must look different across these seven categories.
  const categoryScenes = {
    "Party Invitations":
      "Photograph one beautifully printed invitation card as the clear hero, " +
      "styled on a complementary surface with a few occasion-specific accents.",

    "Party Decorations":
      "Show the actual decoration at a believable party scale: a sign on an " +
      "easel, a banner hanging naturally, or the named decoration in its " +
      "proper setting. Keep the whole product visible.",

    "Party Games & Activities":
      "Show one coordinated printed game kit on a tabletop. Cards, sheets, " +
      "and any small game pieces should look like parts of one real product, " +
      "arranged naturally rather than as separate collage panels.",

    "Party Favor Products":
      "Show the named tag, label, wrapper, sticker, or package applied to " +
      "the appropriate real party favor. Make the printed product clearly visible.",

    "Party Planning Kits":
      "Show one premium printed planner or workbook, closed or partly open, " +
      "with a few relevant pages and a pen. Page layouts should have believable " +
      "structure and generous writing space.",

    "Party Table Printables":
      "Show the named printable in use at a refined table setting, such as " +
      "a menu beside a plate, place cards at seats, or food labels beside " +
      "the matching display.",

    "Party Photo Booth Kits":
      "Show the named photo booth product in a real festive booth setting. " +
      "Paper props should be mounted on sticks and displayed as one " +
      "coordinated physical set.",
  };

  const occasionDetails = [
    [
      /christmas/i,
      "evergreen branches, ribbon, ornaments, and warm festive lights",
    ],
    [
      /halloween/i,
      "pumpkins, playful bats, and a sophisticated orange-and-black palette",
    ],
    [/thanksgiving/i, "autumn foliage, small gourds, and warm harvest tones"],
    [
      /new year/i,
      "midnight tones, tasteful metallic accents, and restrained confetti",
    ],
    [/wedding/i, "refined ivory stationery, elegant florals, and soft linen"],
    [/bridal shower/i, "romantic flowers, ribbon, and delicate pearl details"],
    [/baby shower/i, "soft pastels and a few charming baby-themed details"],
    [/gender reveal/i, "balanced pink-and-blue celebration details"],
    [/graduation/i, "a graduation cap, diploma, and celebratory accents"],
    [/bachelorette/i, "playful disco-inspired party details"],
    [/birthday/i, "balloons, ribbon, and tasteful celebratory confetti"],
  ].find(([pattern]) => pattern.test(productType));

  const occasionDirection = occasionDetails
    ? occasionDetails[1]
    : "a few distinctive props that specifically suit this product and occasion";

  // Only fields intended to be printed may become visible lettering.
  // Theme, colour, style, quantity, etc. remain design instructions.
  const printableText = Object.entries(cleanedFormData)
    .filter(
      ([key, value]) =>
        /name|title|heading|message|date|time|venue|location|address|rsvp|age|year|hashtag|subtitle|host/i.test(
          key,
        ) &&
        (typeof value === "string" || typeof value === "number"),
    )
    .map(([key, value]) => `${key}: ${JSON.stringify(String(value))}`)
    .join("\n");

  const textInstruction =
    textMode === "none"
      ? `The image must contain NO readable words, letters, numbers, logos,
watermarks, fake typography, or placeholder gibberish. Leave the printable
areas intentionally blank while keeping the product visually finished.`
      : printableText
        ? `The only permitted readable text is listed below. Reproduce it
exactly, with correct spelling and punctuation. Do not add a shop name,
sample name, filler date, slogan, or other invented wording.

EXACT PRINTABLE TEXT:
${printableText}`
        : `No printable wording was supplied. Do not invent names, dates,
messages, or other readable text. Keep text areas intentionally blank.`;

  const systemPrompt = `
You are a senior print designer and art director for premium party
stationery. Write ONE precise image-generation prompt for xAI Grok Imagine.

GOAL
Create the ACTUAL finished, flat, print-ready ${productType} artwork.
The generated image itself IS the product. Its background and design must
extend to all four edges of the output canvas.

ABSOLUTE COMPOSITION RULE
Do not show a product inside another image. Do not show a printed card
lying on a table, an invitation inside a frame, a poster on a wall, or
a sheet surrounded by empty space. No mockup, photography, tabletop,
hands, props, environment, perspective, tilt, contact shadows, or
background outside the design.

PRODUCT ACCURACY
Follow the supplied blueprint for the actual ${productType}.
For an invitation, the whole image is ONE invitation design.
For a sign, the whole image is ONE sign design.
For a menu or planner, the whole image is the printable page.
For a multi-item product such as tags, toppers, or photo props, create
ONE clean, properly spaced print sheet containing only that coordinated set.
Never add an unrelated second product.

LAYOUT
Create one clear focal illustration suited specifically to the occasion.
Use coordinated borders, corner details, patterns, and typography only
where appropriate. The design background must reach every canvas edge.
Keep important text and artwork inside an INTERNAL print-safe area;
this is not a blank margin outside the product.
Use the requested aspect ratio for the artwork itself.
Do not put a portrait design inside a square background.

STYLE AND QUALITY
Use the supplied style and colours. Otherwise choose a restrained,
occasion-appropriate palette. Keep one consistent illustration technique.
Use crisp print detail, believable ink and paper texture within the
artwork, clean spacing, and professional typography. Avoid generic
flowers, gold, glitter, or balloons unless they fit the specific theme.

TEXT
${
  textMode === "none"
    ? `Do not render any words, letters, numbers, or fake text.
Leave intentional clean areas inside the design where text can be
added later.`
    : `Render only text explicitly supplied in the user details.
Copy spelling and punctuation exactly. Do not invent names, dates,
ages, addresses, RSVP information, headings, or placeholder text.`
}

OUTPUT
Return only the final image-generation prompt as plain prose.
Begin by stating: "The entire image canvas is the finished
${productType} artwork, edge to edge." Describe the product-specific
design, layout, illustration, colours, typography, and exact text.
End with: "No mockup, no card within a scene, no outer whitespace,
no surrounding surface, no perspective, no extra product, no watermark."
`.trim();

  const userMessage = `
Create the actual finished artwork for ${productType}.

Category: ${category}
Product type: ${productType}
Format: ${blueprint.format}
Layout: ${blueprint.layout}
Components: ${blueprint.components}
Text hierarchy: ${blueprint.textLevels}
Artwork aspect ratio: ${formData?.ratio || blueprint.aspectRatio}

Design style: ${style.name}
Style direction: ${style.direction}

User-provided details:
${JSON.stringify(cleanedFormData, null, 2)}

The output canvas itself must be the complete ${productType}.
Fill the canvas edge to edge with the product design. Keep the
important content inside an internal print-safe area, but leave
no blank space around the product. Do not create a photo or mockup.
`.trim();

  try {
    const result = await aiService.chat({
      systemPrompt,
      userMessage,
      temperature: 0.45,
      maxTokens: 1100,
    });

    const cleaned = String(result || "")
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/^prompt\s*:\s*/i, "")
      .trim();

    if (cleaned.length < 250) {
      throw new Error("AI returned an incomplete image prompt");
    }

    return cleaned;
  } catch (err) {
    console.warn("buildImagePrompt fallback:", err.message);

    return [
      `Create exactly one premium 1:1 square ecommerce product photograph`,
      `for "${productType}" in the "${category}" category.`,
      categoryScenes[category] ||
        "Show the real printed product as the central subject.",
      `Use ${occasionDirection}.`,
      `Follow this product format: ${blueprint.format}.`,
      `Include these product components: ${blueprint.components}.`,
      `Use a consistent ${style.name} style: ${style.direction}.`,
      `Show realistic paper and material texture, professional soft lighting,`,
      `natural contact shadows, a refined occasion-appropriate palette,`,
      `and a complete product centred with generous square-safe margins.`,
      textMode === "none"
        ? "No readable text, letters, numbers, logos, or watermark."
        : printableText
          ? `Render only this exact supplied text: ${printableText}.`
          : "Do not invent any readable text.",
      `One coherent photographic scene, not a collage or flat artwork.`,
      `Avoid distorted products, gibberish lettering, duplicate elements,`,
      `clutter, heavy effects, and cropped edges.`,
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

// ================================================================
// Ratio → SDXL keyword
// ================================================================
function mapAspect(ratio) {
  return (
    {
      "5:7": "portrait",
      "7:5": "wide",
      "2:3": "portrait",
      "3:2": "wide",
      "1:1": "square",
      "148:210": "portrait",
      "105:148": "portrait",
      "4:5": "portrait",
      "9:16": "portrait",
    }[ratio] || "square"
  );
}

// ================================================================
// POST /api/party-products/generate
// IMAGE-TO-IMAGE + PDF GENERATION
// ================================================================

exports.generate = async (req, res) => {
  const startedAt = Date.now();

  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      category,
      productType,
      designStyle = "Modern",
      formData = {},
      outputFormat = "Image",
      referenceImagePath,
    } = req.body;

    if (!category || !productType) {
      return res.status(400).json({
        success: false,
        message: "Category and product type are required",
      });
    }

    const ratioLabel = formData.ratio || null;
    const aspectRatio = mapAspect(ratioLabel);

    const isPdf = String(outputFormat).toLowerCase() === "pdf";

    // ============================================================
    // CREATE PENDING PRODUCT
    // ============================================================

    const record = await PartyProduct.create({
      userId,
      category,
      productType,
      designStyle,
      aspectRatio,
      formData: {
        ...formData,
        ratio: ratioLabel,
      },
      status: "pending",
      outputFormat: isPdf ? "PDF" : "Image",
    });

    try {
      // ============================================================
      // BUILD EXISTING PREMIUM PRODUCT PROMPT
      // ============================================================

      const aiPrompt = await buildImagePrompt({
        category,
        productType,
        designStyle,
        formData,
      });

      // ============================================================
      // RESOLVE LIVE PRODUCT REFERENCE
      // ============================================================

      const referenceImageUrl = getTrustedReferenceUrl(
        category,
        referenceImagePath,
      );

      console.log("======================================");
      console.log("AI PARTY PRODUCT GENERATION");
      console.log("Product:", productType);
      console.log("Category:", category);
      console.log("Reference Image:", referenceImageUrl);
      console.log("Output Format:", outputFormat);
      console.log("======================================");

      // ============================================================
      // IMAGE-TO-IMAGE GENERATION
      // ============================================================

      const imageToImagePrompt = `
${aiPrompt}

IMAGE-TO-IMAGE DESIGN INSTRUCTIONS:

Use the supplied reference image as the primary visual reference
for the finished party product.

PRODUCT:
${productType}

CATEGORY:
${category}

DESIGN STYLE:
${designStyle}

USER CUSTOMIZATION DETAILS:
${JSON.stringify(formData, null, 2)}

DESIGN REQUIREMENTS:

1. Follow the reference image's professional composition
   and visual direction.

2. Customize the artwork according to the user's selected
   theme, text, colors and preferences.

3. Use balanced spacing, premium typography,
   and a harmonious color palette.

4. Generate a single complete party product design.

5. Artwork must fill the entire canvas.

6. No mockups.

7. No desk scenes.

8. No hands holding products.

9. No picture frames or watermarks.

10. Do not place a printable inside another product image.

11. Maintain a clean, print-friendly layout.

12. Follow the user's product information.

13. Render user-provided text accurately.

FINAL OUTPUT:
Premium flat party product artwork.
      `.trim();

      // Existing aiService.js already supports this method.
      const replicateUrl = await aiService.imageToImage({
        prompt: imageToImagePrompt,

        images: [referenceImageUrl],

        aspectRatio: "match_input_image",

        outputFormat: "png",

        outputQuality: 95,

        outputMegapixels: "1",

        goFast: false,

        disableSafetyChecker: false,
      });

      if (!replicateUrl) {
        throw new Error("AI returned no image URL");
      }

      console.log("AI image generated:", replicateUrl);

      // ============================================================
      // SAVE GENERATED IMAGE LOCALLY
      // ============================================================

      const storedImage = await storeImageLocally(
        replicateUrl,
        userId,
        record._id,
        "png",
      );

      // ============================================================
      // PDF OUTPUT
      // ============================================================

      if (isPdf) {
        const generatedDir = path.join(__dirname, "..", "uploads", "generated");

        await fs.mkdir(generatedDir, {
          recursive: true,
        });

        const pdfResult = await generateProductPdf({
          productType,
          category,
          formData,
          designStyle,
          outputDir: generatedDir,
          imagePath: storedImage.localPath,
        });

        const storedPdf = await storePdfLocally(pdfResult, userId, record._id);

        record.status = "completed";
        record.aiPrompt = imageToImagePrompt;
        record.imageUrl = storedPdf.url;
        record.imageMimeType = storedPdf.mimeType;
        record.imageSizeBytes = storedPdf.sizeBytes;
        record.thumbnailUrl = storedImage.url;

        record.pdfPromptSnapshot = {
          productType,
          category,
          designStyle,
          formData,
        };

        await record.save();

        return res.json({
          success: true,

          data: {
            id: record._id,
            type: "pdf",
            outputFormat: "PDF",

            url: storedPdf.url,
            thumbnailUrl: storedImage.url,

            filename: `${productType.replace(/\s+/g, "-").toLowerCase()}.pdf`,

            mimeType: "application/pdf",

            durationMs: Date.now() - startedAt,
          },
        });
      }

      // ============================================================
      // IMAGE OUTPUT
      // ============================================================

      record.status = "completed";
      record.aiPrompt = imageToImagePrompt;
      record.imageUrl = storedImage.url;
      record.imageMimeType = storedImage.mimeType;
      record.imageSizeBytes = storedImage.sizeBytes;
      record.thumbnailUrl = storedImage.url;

      await record.save();

      console.log("Party product saved successfully");

      return res.json({
        success: true,

        data: {
          id: record._id,

          type: "image",

          outputFormat: "Image",

          url: storedImage.url,

          thumbnailUrl: storedImage.url,

          filename: `${productType.replace(/\s+/g, "-").toLowerCase()}.png`,

          prompt: imageToImagePrompt,

          durationMs: Date.now() - startedAt,
        },
      });
    } catch (genErr) {
      console.error("Party Product Generation Failed:", genErr);

      record.status = "failed";
      record.errorMessage = genErr.message;

      await record.save();

      return res.status(500).json({
        success: false,
        message: genErr.message || "Generation failed",
        id: record._id,
      });
    }
  } catch (err) {
    console.error("generate() error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

// ================================================================
// GET /api/party-products
// ================================================================
exports.listMine = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const items = await PartyProduct.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// GET /api/party-products/:id
// ================================================================
exports.getOne = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const item = await PartyProduct.findOne({
      _id: req.params.id,
      userId,
    }).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// DELETE /api/party-products/:id
// — removes Mongo document AND the local image file
// ================================================================
exports.remove = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const item = await PartyProduct.findOne({
      _id: req.params.id,
      userId,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // Delete the physical file first (best effort)
    if (item.imageUrl) {
      await deleteLocalImage(item.imageUrl);
    }

    // Then remove from DB
    await PartyProduct.deleteOne({ _id: item._id, userId });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// Exports
// ================================================================
exports.buildImagePrompt = buildImagePrompt;

exports.storeImageLocally = storeImageLocally;

exports.deleteLocalImage = deleteLocalImage;

exports.getAspectRatio = getAspectRatio;
