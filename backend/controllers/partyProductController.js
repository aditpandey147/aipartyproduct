// backend/src/controllers/partyProductController.js

const fs = require("fs/promises");

const path = require("path");
const Replicate = require("replicate");
const axios = require("axios");

const { generateProductPdf } = require("../services/productPdfService");

const PartyProduct = require("../models/PartyProduct");

const aiService = require("../services/aiService");

const REFERENCE_ROOT = path.resolve(
  __dirname,
  "../../frontend/public/product-images",
);
const REFERENCE_FOLDERS = {
  "Party Invitations": "01-party-invitations",
  "Party Decorations": "02-party-decorations",
  "Party Games & Activities": "03-party-games-activities",
  "Party Favor Products": "04-party-favor-products",
  "Party Planning Kits": "05-party-planning-kits",
  "Party Table Printables": "06-party-table-printables",
  "Party Photo Booth Kits": "07-party-photo-booth-kits",
};

async function getTrustedReferenceUrl({
  category,
  productType,
  referenceImagePath,
}) {
  const folder = REFERENCE_FOLDERS[category];
  if (!folder) throw new Error("Unsupported category");
  if (typeof referenceImagePath !== "string")
    throw new Error("Reference image is required");
  const prefix = `/product-images/${folder}/`;
  const cleanPath = referenceImagePath.split(/[?#]/)[0];
  if (!cleanPath.startsWith(prefix))
    throw new Error("Reference category mismatch");
  const filename = cleanPath.slice(prefix.length);
  const slug = String(productType)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (
    !/^\d{3}-[a-z0-9-]+\.(png|jpg|jpeg|webp)$/i.test(filename) ||
    !filename
      .replace(/^\d{3}-/, "")
      .replace(/\.(png|jpg|jpeg|webp)$/i, "")
      .endsWith(slug)
  ) {
    throw new Error("Reference image does not match product");
  }
  const absolute = path.resolve(REFERENCE_ROOT, folder, filename);
  const relative = path.relative(REFERENCE_ROOT, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error("Unsafe reference path");
  await fs.access(absolute);
  const origin = process.env.PUBLIC_IMAGE_ORIGIN;
  if (!origin) throw new Error("PUBLIC_IMAGE_ORIGIN is not configured");
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:")
    throw new Error("PUBLIC_IMAGE_ORIGIN must use HTTPS");
  return new URL(`/product-images/${folder}/${filename}`, parsed).toString();
}

// ================================================================

// STORAGE CONFIG

// ================================================================

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "party-products");

/**

 * Download a Replicate URL and save it to local disk.

 * Returns the public path served by Express.

 */

async function storeImageLocally(replicateUrl, userId, genId, ext = "png") {
  const userDir = path.join(UPLOAD_ROOT, String(userId));

  await fs.mkdir(userDir, { recursive: true });

  const res = await axios.get(replicateUrl, {
    responseType: "arraybuffer",

    timeout: 60_000,
  });

  const filename = `${genId}.${ext}`;

  const localPath = path.join(userDir, filename);

  await fs.writeFile(localPath, Buffer.from(res.data));

  return {
    url: `/uploads/party-products/${userId}/${filename}`,

    localPath,

    sizeBytes: res.data.byteLength || res.data.length,

    mimeType: res.headers["content-type"] || "image/png",
  };
}

async function storePdfLocally(sourcePdf, userId, genId) {
  const userDir = path.join(UPLOAD_ROOT, String(userId));

  await fs.mkdir(userDir, { recursive: true });

  const filename = `${genId}.pdf`;

  const localPath = path.join(userDir, filename);

  await fs.copyFile(sourcePdf.filePath, localPath);

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

 * Delete a generated file from local disk by its public URL.

 * Safe to call if the file is already gone.

 */

async function deleteLocalImage(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/party-products/")) return;

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

// ================================================================

// IMAGE PROMPT — premium flat artwork with controlled typography

// ================================================================

async function buildImagePrompt({
  category,

  productType,

  designStyle,

  formData,

  textMode = "baked",
}) {
  const blueprint = pickBlueprint(productType);

  const style = pickStyle(designStyle);

  const requestedRatio = formData?.ratio || blueprint.aspectRatio;

  const fields = Object.entries(formData || {}).filter(([, value]) => {
    if (value === undefined || value === null || value === false) return false;

    return typeof value !== "string" || value.trim() !== "";
  });

  // Normalize field names for matching only. Preserve the original visible text.

  const fieldWords = (key) =>
    String(key)
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")

      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")

      .replace(/[^a-zA-Z0-9]+/g, " ")

      .toLowerCase()

      .trim();

  const designFieldPattern =
    /\b(?:theme|style|design|template|background|color|colors|colour|colours|palette|font|typography|ratio|size|quantity|count|format|reference|prompt|file|url|notes?|options?|show|hide|include|placement|alignment)\b/;

  const printFieldPattern =
    /\b(?:name|names|title|heading|headline|subheading|subtitle|message|text|wording|caption|greeting|phrase|date|time|venue|location|address|rsvp|age|year|hashtag|host|dress code|table number|instructions|menu items)\b/;

  const printableFields = [];

  const visualFields = [];

  for (const [key, value] of fields) {
    const words = fieldWords(key);

    const isPrintable =
      !designFieldPattern.test(words) && printFieldPattern.test(words);

    if (isPrintable) {
      // Support a single text field or a list of text lines.

      const values = Array.isArray(value) ? value : [value];

      for (const line of values) {
        const isText = typeof line === "string" && line.trim() !== "";

        const isNumber = typeof line === "number" && Number.isFinite(line);

        if (textMode !== "none" && (isText || isNumber)) {
          printableFields.push({
            field: key,

            text: String(line),
          });
        }
      }

      continue;
    }

    if (words !== "ratio" && words !== "output format") {
      visualFields.push([key, value]);
    }
  }

  const visualDetails = Object.fromEntries(visualFields);

  const categoryArtDirection = {
    "Party Invitations":
      "Use a distinctive occasion-specific illustration or ornamental motif as the anchor. Give the invitation wording a single calm reading column. Keep the honoree and event details distinctly separated by size and spacing.",

    "Party Decorations":
      "Design for recognition from a distance. Use one bold silhouette or motif, simple color contrast, and strong visual rhythm. For a banner, make each panel consistent in scale and spacing. For a sign, let the central information dominate.",

    "Party Games & Activities":
      "Apply decoration to the header and perimeter. Keep the play area light, aligned, and easy to read. Preserve usable cells, answer spaces, and writing areas. Do not cover gameplay elements with decorative artwork.",

    "Party Favor Products":
      "Design motifs that remain recognizable at small print sizes. Keep repeated pieces aligned and consistently sized. Preserve clear cut lines and leave room for any holes, folds, or closures required by the product.",

    "Party Planning Kits":
      "Give the page a designed header and quiet writing areas. Use a consistent grid, fine rules, and subtle section separation. Keep boxes and fields large enough to fill in by hand.",

    "Party Table Printables":
      "Use polished stationery styling with clear reading order at tabletop distance. Keep margins consistent and related elements coordinated. Preserve fold areas and the readability of names, numbers, or menu details when supplied.",

    "Party Photo Booth Kits":
      "Use bold, recognizable silhouettes and playful details. Make every prop a separate piece on the sheet with consistent cut outlines, clean gaps, and no overlaps.",
  };

  const categoryDirection =
    categoryArtDirection[category] ||
    "Use a strong focal point, a cohesive illustration language, and a clear layout suited to the named product. Preserve any areas needed for reading, cutting, folding, or writing.";

  const occasionText = [
    productType,

    ...visualFields

      .filter(([key, value]) => {
        const words = fieldWords(key);

        return (
          /\b(?:theme|occasion|event|season|holiday)\b/.test(words) &&
          typeof value === "string"
        );
      })

      .map(([, value]) => value),
  ].join(" ");

  const occasionDetails = [
    [/christmas/i, "evergreen, paper ornaments, berries, and ribbon motifs"],

    [/halloween/i, "playful bats, pumpkins, and a strong seasonal silhouette"],

    [
      /thanksgiving/i,
      "autumn foliage, harvest motifs, and soft warm contrasts",
    ],

    [/new year/i, "midnight tones, metallic ink accents, and restrained stars"],

    [
      /bridal shower/i,
      "delicate florals, ribbon linework, and refined framing",
    ],

    [/wedding/i, "refined floral linework, soft neutrals, and elegant framing"],

    [/baby shower/i, "gentle colors and a small illustrated nursery motif"],

    [
      /gender reveal/i,
      "a balanced pair of colors suited to the supplied theme",
    ],

    [/graduation/i, "academic motifs, crisp geometry, and celebratory accents"],

    [/bachelorette/i, "playful disco shapes and expressive graphic details"],

    [/birthday/i, "a motif drawn from the specific birthday theme"],
  ].find(([pattern]) => pattern.test(occasionText));

  const occasionDirection =
    occasionDetails?.[1] ||
    "A small set of motifs drawn from the specified occasion or theme.";

  const visualInstructions = Object.keys(visualDetails).length
    ? `Use the relevant visual preferences below. Treat these as design inputs. Do not render their keys or values as lettering.



${JSON.stringify(visualDetails, null, 2)}`
    : "Choose a palette, background, and motif that fit the product, occasion, and design style.";

  // Ask the text model for supporting art direction only. The final prompt

  // always includes the fixed layout, background, and text requirements.

  const systemPrompt = `

You are the art director for a premium printable party stationery collection.

Write one short paragraph of visual art direction for a finished flat design.



Choose a distinctive focal motif, an intentional background treatment,

a cohesive palette, and a supporting detail that suit the product and theme.

Explain where to place them so the focal point is clear and the text or

functional area stays readable. Respect supplied colors and theme. If the

product is a cut sheet, keep the paper area plain and put visual interest

inside each cut piece.



Use concrete descriptions of shapes, color, placement, and illustration

technique. Avoid generic decoration and redundant adjectives. Describe

only design elements that belong inside the finished artwork. Do not

supply visible wording, invent event details, change the format, or add a

photographic setting. Return one plain-prose paragraph of 60–110 words.

`.trim();

  const userMessage = `

Product: ${productType}

Category: ${category}

Format: ${blueprint.format}

Layout: ${blueprint.layout}

Components: ${blueprint.components}

Requested artwork ratio: ${requestedRatio}



Style: ${style.name}

Style direction: ${style.direction}

Category direction: ${categoryDirection}

Optional occasion motifs, when consistent with the chosen theme: ${occasionDirection}



${visualInstructions}

`.trim();

  const fallbackArtDirection = `

Use one hero motif tailored to the specified theme. If no specific theme

was provided, select a fitting motif from this direction: ${occasionDirection}

Echo it sparingly in the border, corners, or individual cut pieces.

Balance the strongest visual detail with a calm, high-contrast information

area. Use a restrained palette and one consistent illustration technique.

Keep any texture subtle and behind the content. Make the whole composition

feel designed as a single coordinated product.

`.trim();

  let artDirection = fallbackArtDirection;

  try {
    const result = await aiService.chat({
      systemPrompt,

      userMessage,

      temperature: 0.45,

      maxTokens: 350,
    });

    const cleaned = String(result || "")
      .replace(/^["'`]+|["'`]+$/g, "")

      .replace(/^(?:art direction|prompt)\s*:\s*/i, "")

      .trim();

    if (cleaned.length >= 100 && cleaned.length <= 1500) {
      artDirection = cleaned;
    }
  } catch (err) {
    console.warn("buildImagePrompt fallback:", err.message);
  }

  const textInstruction =
    textMode === "none" || printableFields.length === 0
      ? `

Render no readable text, letters, numerals, watermarks, or fake typography.

Keep intentional blank areas inside the artwork for later personalization.

Finish those areas with the same background treatment so they feel designed.

Use unlettered lines, dividers, grids, or writing boxes where the product

requires them.

`.trim()
      : `

Render only the text values listed below. The field names indicate where

each value belongs. They are not part of the printable wording. Copy each

value exactly, preserving its language, spelling, capitalization, accents,

punctuation, and digits. Do not add a name, date, slogan, heading, shop

branding, website, or filler phrase.



EXACT PRINTABLE TEXT:

${printableFields

  .map(({ field, text }) => `${field}: ${JSON.stringify(text)}`)

  .join("\n")}



Use a clear hierarchy based on the available text: ${blueprint.textLevels}.

Skip any level for which no wording was supplied. Use no more than two

coordinated type styles. Reserve decorative lettering for short display

text and use clear, open letterforms for details. Keep text horizontal,

sharp, consistently spaced, and comfortably inside the print-safe area.

Set important words against a calm background with strong contrast.

Never place important text over a busy motif, detailed texture, or dark

decorative edge. Give longer wording more space and use natural line

breaks without dropping, duplicating, or rewriting any words. Repeat

wording only when the product is a repeated-piece sheet that requires it.

`.trim();

  const isCutSheet = /plain white background/i.test(blueprint.format);

  const backgroundDirection = isCutSheet
    ? `

Use clean white printable sheet space between separate cut pieces.

Place the theme, color, illustration, and subtle texture inside each piece.

Keep outlines crisp and gutters clear so every piece is easy to cut out.

The sheet itself fills the entire image canvas.

`.trim()
    : `

Make the background part of the artwork and extend it to all four canvas

edges. Use an intentional base color, a soft tonal variation, or fine

paper grain where it suits the selected style. Create visual depth with

flat layers, illustrated framing, or subtle tone-on-tone details.

Concentrate visual interest near the focal point and edges, then reduce

detail behind the text and functional areas. Preserve any explicitly

requested plain, minimal, or solid-color background.

`.trim();

  return `

The entire image canvas is the finished ${productType} artwork, edge to edge.

Create one straight-on, flat, high-detail design suitable for a premium

printable party stationery collection. Compose for the boundaries of

the actual output canvas and keep all important content fully visible.



PRODUCT SPECIFICATION

Category: ${category}

Product type: ${productType}

Format: ${blueprint.format}

Requested artwork ratio: ${requestedRatio}

Layout: ${blueprint.layout}

Components: ${blueprint.components}

Category-specific priorities: ${categoryDirection}



ART DIRECTION

Design style: ${style.name}.

Style treatment: ${style.direction}.

${artDirection}



${visualInstructions}



COMPOSITION AND FINISH

Create a clear visual hierarchy with one focal element and a small set

of complementary accents. Use a cohesive palette, deliberate alignment,

balanced spacing, clean edges, and a consistent illustration technique.

Scale motifs to the product's reading distance and intended use. Keep

essential text and artwork inside an internal print-safe area. For a

finished card or sign, the safe area is inside the design. For a cut

sheet, keep every cut piece away from the sheet edges. Preserve writing

space, usable grids, and clean cut lines wherever the format needs them.



BACKGROUND

${backgroundDirection}



TYPOGRAPHY

${textInstruction}



FINAL OUTPUT

Render only the complete artwork or the single coordinated printable

sheet specified above. No product mockup, card sitting on a surface,

photographed scene, hands, unrelated props, presentation frame, hanging

display, perspective tilt, exterior whitespace, contact shadows, collage

panels, duplicate sheets, cropped content, or watermark.

`.trim();
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

exports.generate = async (req, res) => {
  const startedAt = Date.now();
  let record = null;

  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ============================================
    // 2. REQUEST DATA
    // ============================================

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
        message: "Category and productType are required",
      });
    }

    if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
      return res.status(400).json({
        success: false,
        message: "Invalid formData",
      });
    }

    // ============================================
    // 3. OUTPUT SETTINGS
    // ============================================

    const ratioLabel = formData.ratio || null;
    const aspectRatio = mapAspect(ratioLabel);

    const isPdf = String(outputFormat).toLowerCase() === "pdf";

    // ============================================
    // 4. CREATE PENDING PRODUCT RECORD
    // ============================================

    record = await PartyProduct.create({
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

    // ============================================
    // 5. BUILD DYNAMIC AI PROMPT
    // ============================================

    const aiPrompt = await buildImagePrompt({
      category,
      productType,
      designStyle,
      formData,
    });

    // ============================================
    // 6. LOCAL REFERENCE IMAGE CONFIG
    // ============================================

    const REFERENCE_ROOT = path.resolve(
      __dirname,
      "../../frontend/public/product-images",
    );

    const CATEGORY_FOLDERS = {
      "Party Invitations": "01-party-invitations",

      "Party Decorations": "02-party-decorations",

      "Party Games & Activities": "03-party-games-activities",

      "Party Favor Products": "04-party-favor-products",

      "Party Planning Kits": "05-party-planning-kits",

      "Party Table Printables": "06-party-table-printables",

      "Party Photo Booth Kits": "07-party-photo-booth-kits",
    };

    const categoryFolder = CATEGORY_FOLDERS[category];

    if (!categoryFolder) {
      throw new Error(`Unsupported category: ${category}`);
    }

    // ============================================
    // 7. VALIDATE REFERENCE IMAGE
    // ============================================

    if (typeof referenceImagePath !== "string" || !referenceImagePath.trim()) {
      throw new Error("Reference image path is required");
    }

    const expectedPrefix = `/product-images/${categoryFolder}/`;

    const cleanReferencePath = referenceImagePath.split(/[?#]/)[0];

    if (!cleanReferencePath.startsWith(expectedPrefix)) {
      throw new Error("Reference image category mismatch");
    }

    const imageFilename = cleanReferencePath.slice(expectedPrefix.length);

    const productSlug = String(productType)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const imageMatch = imageFilename.match(
      /^\d{3}-([a-z0-9-]+)\.(png|jpg|jpeg|webp)$/i,
    );

    if (!imageMatch || imageMatch[1] !== productSlug) {
      throw new Error("Reference image does not match selected product");
    }

    const imagePath = path.resolve(
      REFERENCE_ROOT,
      categoryFolder,
      imageFilename,
    );

    const relativePath = path.relative(REFERENCE_ROOT, imagePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error("Invalid reference image path");
    }

    // ============================================
    // 8. READ LOCAL IMAGE
    // ============================================

    await fs.access(imagePath);

    const imageBuffer = await fs.readFile(imagePath);

    if (!imageBuffer.length) {
      throw new Error("Reference image is empty");
    }

    console.log("Reference Image:", imagePath);

    console.log("Image Size:", imageBuffer.length, "bytes");

    // ============================================
    // 9. ENHANCE IMAGE-TO-IMAGE PROMPT
    // ============================================

    const enhancedPrompt = `
${aiPrompt}

IMAGE-TO-IMAGE DESIGN INSTRUCTIONS:

Use the supplied reference image as the primary
visual reference for the finished party product.

PRODUCT:
${productType}

CATEGORY:
${category}

DESIGN STYLE:
${designStyle}

USER CUSTOMIZATION DETAILS:
${JSON.stringify(formData, null, 2)}

DESIGN REQUIREMENTS:

1. Follow the reference image's professional
   composition and visual direction.

2. Customize the artwork according to the
   user's selected theme and preferences.

3. Use balanced spacing, premium typography,
   and a harmonious color palette.

4. Generate a single complete product design.

5. Artwork must fill the entire canvas.

6. No mockups.

7. No desk scenes.

8. No hands holding products.

9. No picture frames or watermarks.

10. Do not place a printable inside another
    product image.

11. Maintain a clean, print-friendly layout.

12. Follow the user's product information.

FINAL OUTPUT:
Premium flat party product artwork.
`;

    // ============================================
    // 10. CALL EXISTING AI SERVICE
    // ============================================

    console.log("Starting Image-to-Image Generation...");

    const replicateUrl = await aiService.imageToImage({
      prompt: enhancedPrompt,

      // Local reference image Buffer
      images: [imageBuffer],

      aspectRatio: formData.ratio ? aspectRatio : "match_input_image",

      outputFormat: "png",

      outputQuality: 95,

      outputMegapixels: "1",

      goFast: false,

      disableSafetyChecker: false,
    });

    if (!replicateUrl) {
      throw new Error("AI returned no generated image URL");
    }

    console.log("Generated Image URL:", replicateUrl);

    // ============================================
    // 11. STORE GENERATED IMAGE
    // ============================================

    const storedImage = await storeImageLocally(
      replicateUrl,
      userId,
      record._id,
      "png",
    );

    // ============================================
    // 12. PDF OUTPUT
    // ============================================

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

      // Save PDF record
      record.status = "completed";

      record.aiPrompt = enhancedPrompt;

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

          filename: `${productSlug}.pdf`,

          mimeType: "application/pdf",

          durationMs: Date.now() - startedAt,
        },
      });
    }

    // ============================================
    // 13. IMAGE OUTPUT
    // ============================================

    record.status = "completed";

    record.aiPrompt = enhancedPrompt;

    record.imageUrl = storedImage.url;

    record.imageMimeType = storedImage.mimeType;

    record.imageSizeBytes = storedImage.sizeBytes;

    record.thumbnailUrl = storedImage.url;

    await record.save();

    return res.json({
      success: true,

      data: {
        id: record._id,

        type: "image",

        outputFormat: "Image",

        url: storedImage.url,

        thumbnailUrl: storedImage.url,

        filename: `${productSlug}.png`,

        prompt: enhancedPrompt,

        durationMs: Date.now() - startedAt,
      },
    });
  } catch (err) {
    // ============================================
    // 14. ERROR HANDLING
    // ============================================

    console.error("Party Product Generation Failed:", err);

    if (record) {
      try {
        record.status = "failed";

        record.errorMessage = err.message || "Unknown error";

        await record.save();
      } catch (saveError) {
        console.error("Failed to update product status:", saveError);
      }
    }

    return res.status(500).json({
      success: false,

      message: err.message || "Product generation failed",

      ...(record ? { id: record._id } : {}),
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

    if (item.imageUrl) {
      await deleteLocalImage(item.imageUrl);
    }

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
