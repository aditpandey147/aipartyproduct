// ================================================================
// AI PARTY PRODUCT FACTORY
// PARTY PRODUCT CONTROLLER
//
// Reference Image + User Text
//             ↓
// Strict Text Replacement Prompt
//             ↓
// FLUX.2 Klein Image-to-Image
//             ↓
// Save Image / Generate PDF
//             ↓
// MongoDB + Download
//
// No DeepSeek prompt generation in this flow.
// ================================================================

const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");

const PartyProduct = require("../models/PartyProduct");
const aiService = require("../services/aiService");

const { generateProductPdf } = require("../services/productPdfService");

// ================================================================
// CONFIGURATION
// ================================================================

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "party-products");

const PRODUCT_IMAGE_ORIGIN =
  process.env.PRODUCT_IMAGE_ORIGIN || "https://aipartyproduct.albinolabs.com";

// ================================================================
// PRODUCT CATEGORY FOLDERS
// ================================================================

const PRODUCT_IMAGE_FOLDERS = {
  "Party Invitations": "01-party-invitations",

  "Party Decorations": "02-party-decorations",

  "Party Games & Activities": "03-party-games-activities",

  "Party Favor Products": "04-party-favor-products",

  "Party Planning Kits": "05-party-planning-kits",

  "Party Table Printables": "06-party-table-printables",

  "Party Photo Booth Kits": "07-party-photo-booth-kits",
};

// ================================================================
// NON-PRINTABLE FORM FIELDS
// ================================================================

const NON_TEXT_FIELDS = new Set([
  "productType",
  "category",
  "theme",
  "designStyle",
  "colorPalette",
  "colorIndex",
  "ratio",
  "cardSize",
  "orientation",
  "paperSize",
  "pageSize",
  "background",
  "backgroundColor",
  "font",
  "fontFamily",
  "fontSize",
  "layout",
  "difficulty",
  "numberOfPlayers",
  "players",
  "gameDuration",
  "duration",
  "quantity",
  "numberOfCards",
  "cardCount",
  "includeAnswers",
  "outputFormat",
]);

// ================================================================
// GENERATE ID-SAFE FILENAME
// ================================================================

function safeFilename(value) {
  return String(value || "party-product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// ================================================================
// GET USER ID
// ================================================================

function getUserId(req) {
  return req.user?.id || req.user?._id || null;
}

// ================================================================
// MAP ASPECT RATIO
// ================================================================

function mapAspect(ratio) {
  const ratios = {
    "1:1": "square",

    "5:7": "portrait",

    "7:5": "wide",

    "2:3": "portrait",

    "3:2": "wide",

    "4:5": "portrait",

    "5:4": "wide",

    "9:16": "portrait",

    "16:9": "wide",

    "148:210": "portrait",

    "105:148": "portrait",
  };

  return ratios[ratio] || "square";
}

function getAspectRatio(productType) {
  return "square";
}

// ================================================================
// RESOLVE TRUSTED REFERENCE IMAGE
// ================================================================

function getTrustedReferenceUrl(category, referenceImagePath) {
  const categoryFolder = PRODUCT_IMAGE_FOLDERS[category];

  if (!categoryFolder) {
    throw new Error("Unsupported product category");
  }

  if (typeof referenceImagePath !== "string" || !referenceImagePath.trim()) {
    throw new Error("Selected product reference image is missing");
  }

  const origin = new URL(PRODUCT_IMAGE_ORIGIN);

  if (origin.protocol !== "https:") {
    throw new Error("Product image origin must use HTTPS");
  }

  const imageUrl = new URL(referenceImagePath, origin);

  if (imageUrl.origin !== origin.origin) {
    throw new Error("External reference images are not allowed");
  }

  const requiredPrefix = `/product-images/${categoryFolder}/`;

  if (!imageUrl.pathname.startsWith(requiredPrefix)) {
    throw new Error("Reference image does not match the selected category");
  }

  const validImagePath =
    /^\/product-images\/[a-z0-9-]+\/\d{3}-[a-z0-9-]+\.png$/i;

  if (!validImagePath.test(imageUrl.pathname)) {
    throw new Error("Invalid product reference image filename");
  }

  if (imageUrl.search || imageUrl.hash) {
    throw new Error("Reference image URL contains invalid parameters");
  }

  return imageUrl.toString();
}

// ================================================================
// EXTRACT PRINTABLE USER TEXT
// ================================================================

function extractPrintableText(formData = {}) {
  const textFields = {};

  for (const [key, value] of Object.entries(formData)) {
    if (NON_TEXT_FIELDS.has(key)) {
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      textFields[key] = value.trim();

      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      textFields[key] = String(value);
    }
  }

  return textFields;
}

// ================================================================
// BUILD STRICT TEXT-REPLACEMENT PROMPT
// NO DEEPSEEK
// ================================================================

function buildTextReplacementPrompt({ productType, textFields }) {
  const entries = Object.entries(textFields || {});

  if (!entries.length) {
    throw new Error("Please enter text to replace on the product");
  }

  const replacementText = entries
    .map(([field, value]) => `${field}: ${JSON.stringify(value)}`)
    .join("\n");

  return `
STRICT REFERENCE IMAGE EDITING TASK

You are editing an existing party product image.

You are NOT generating a new party product design.

The supplied reference image is the FINAL APPROVED DESIGN.

Your task is to preserve the image as closely as possible
and replace ONLY the existing text with the user's new text.

PRODUCT TYPE:
${productType}

USER-PROVIDED REPLACEMENT TEXT:

${replacementText}

================================================
CRITICAL DESIGN PRESERVATION RULES
================================================

1. Preserve the original image composition.

2. Preserve the exact background design.

3. Preserve the original colors and gradients.

4. Preserve all illustrations and decorative elements.

5. Preserve the original borders and shapes.

6. Preserve all patterns and textures.

7. Keep the original text positions.

8. Match the original font appearance as closely as possible.

9. Preserve the original text alignment.

10. Preserve the existing visual hierarchy.

11. Do not redesign the image.

12. Do not change the illustration style.

13. Do not introduce new decorative elements.

14. Do not add new colors.

15. Do not remove existing illustrations.

16. Do not change the canvas dimensions.

17. Do not change the aspect ratio.

18. Do not change the orientation.

19. Do not add a watermark.

20. Do not create a product mockup.

================================================
TEXT REPLACEMENT INSTRUCTIONS
================================================

Replace only the corresponding existing text.

Use the user's supplied values exactly.

Preserve:

- Spelling
- Capitalization
- Numbers
- Punctuation
- Special characters

Remove the original text completely before replacing it.

Do not leave the previous text visible.

Do not place new text over the original text.

Do not add any words that the user did not request.

Do not display JSON field names.

Do not display technical labels.

Do not display instructions.

Do not invent names, dates, greetings or slogans.

================================================
TEXT POSITIONING
================================================

Use the same text placement as the reference image.

Match the existing typography style.

Keep the text centered or aligned exactly as in the reference.

Keep text inside the original text boundaries.

If the new text is longer:

Reduce the font size minimally to fit.

Do not move other design elements.

Do not alter the surrounding decorations.

================================================
FINAL OUTPUT
================================================

One complete flat party product image.

The output must look visually as close as possible
to the supplied reference image.

The ONLY intended visible difference is the updated text.

NO REDESIGN.

NO NEW ILLUSTRATIONS.

NO MOCKUP.

NO EXTRA TEXT.

NO WATERMARK.

STRICT TEXT-ONLY IMAGE EDIT.
`.trim();

  const TYPOGRAPHY_MATCHING_RULES = `
CRITICAL TYPOGRAPHY MATCHING — HIGHEST PRIORITY

The reference image is the absolute source of truth.

Replace the original text with the user's new text while preserving
the exact visual appearance of the original typography.

FONT MATCHING:
- Match the original font family as closely as possible.
- Match the original font style: serif, sans-serif, script, handwritten, or decorative.
- Match the original font weight and thickness.
- Match italic angles, letter shapes, curves, and decorative flourishes.
- Do not introduce a different typography style.

COLOR MATCHING:
- Sample the text color from the reference image.
- Match the same fill color, gradient, opacity, and saturation.
- Match existing text outlines and stroke thickness.
- Preserve any text shadow, glow, embossing, or texture.
- Do not introduce new text colors.

SIZE AND SPACING:
- Match the original font size and visual scale.
- Preserve letter spacing and kerning.
- Preserve word spacing and line height.
- Preserve the same number of lines when the replacement allows it.
- Match original text rotation, curvature, and baseline.
- Keep the original text block's width, height, and position.
- If the new text is longer, make the smallest possible size adjustment.
- Never overlap surrounding decorations.

POSITION AND ALIGNMENT:
- Match the original horizontal and vertical alignment.
- Preserve the original text area's padding and margins.
- Keep the same distance from borders, icons, and illustrations.
- Match the original centerline and baseline.
- Do not move or resize unrelated elements.

CLEAN TEXT REPLACEMENT:
- Completely remove the original lettering.
- Reconstruct the background underneath removed text seamlessly.
- Add the new lettering in the exact same location.
- Do not leave ghost lettering, duplicated text, or visible editing artifacts.
- Preserve spelling, capitalization, punctuation, and numbers exactly.
- Never display field names or technical instructions.

FINAL QUALITY CHECK:
The replacement text must look as if it was part of
the original professionally designed image.

The typography should be visually indistinguishable
from the original except for the changed wording.

Do not redesign any other part of the artwork.
`;
}

// ================================================================
// COMPATIBILITY EXPORT FOR OTHER MODULES
// ================================================================

async function buildImagePrompt({ productType, formData = {} }) {
  const textFields = extractPrintableText(formData);

  return buildTextReplacementPrompt({
    productType,
    textFields,
  });
}

// ================================================================
// SAVE GENERATED IMAGE LOCALLY
// ================================================================

async function storeImageLocally(replicateUrl, userId, genId, ext = "png") {
  if (
    typeof replicateUrl !== "string" ||
    !replicateUrl.startsWith("https://")
  ) {
    throw new Error("AI returned an invalid image URL");
  }

  const userDir = path.join(UPLOAD_ROOT, String(userId));

  await fs.mkdir(userDir, {
    recursive: true,
  });

  const response = await axios.get(replicateUrl, {
    responseType: "arraybuffer",

    timeout: 120000,

    maxContentLength: 30 * 1024 * 1024,
  });

  const filename = `${genId}.${ext}`;

  const localPath = path.join(userDir, filename);

  const imageBuffer = Buffer.from(response.data);

  if (!imageBuffer.length) {
    throw new Error("Downloaded AI image is empty");
  }

  await fs.writeFile(localPath, imageBuffer);

  return {
    url: `/uploads/party-products/${userId}/${filename}`,

    localPath,

    sizeBytes: imageBuffer.length,

    mimeType: response.headers["content-type"] || "image/png",
  };
}

// ================================================================
// SAVE GENERATED PDF LOCALLY
// ================================================================

async function storePdfLocally(sourcePdf, userId, genId) {
  if (!sourcePdf?.filePath) {
    throw new Error("PDF generator returned no file path");
  }

  const userDir = path.join(UPLOAD_ROOT, String(userId));

  await fs.mkdir(userDir, {
    recursive: true,
  });

  const filename = `${genId}.pdf`;

  const localPath = path.join(userDir, filename);

  await fs.copyFile(sourcePdf.filePath, localPath);

  // Remove temporary PDF after saving.
  if (path.resolve(sourcePdf.filePath) !== path.resolve(localPath)) {
    try {
      await fs.unlink(sourcePdf.filePath);
    } catch (error) {
      console.warn("Temporary PDF cleanup:", error.message);
    }
  }

  const stat = await fs.stat(localPath);

  return {
    url: `/uploads/party-products/${userId}/${filename}`,

    localPath,

    sizeBytes: stat.size,

    mimeType: "application/pdf",
  };
}

// ================================================================
// DELETE LOCAL GENERATED FILE
// ================================================================

async function deleteLocalImage(publicUrl) {
  const prefix = "/uploads/party-products/";

  if (typeof publicUrl !== "string" || !publicUrl.startsWith(prefix)) {
    return;
  }

  const relativePath = publicUrl.slice(prefix.length);

  const absolutePath = path.resolve(UPLOAD_ROOT, relativePath);

  const root = path.resolve(UPLOAD_ROOT);

  if (!absolutePath.startsWith(root + path.sep)) {
    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("File cleanup error:", error.message);
    }
  }
}

// ================================================================
// GENERATE PARTY PRODUCT
// POST /api/party-products/generate
// ================================================================

exports.generate = async (req, res) => {
  const startedAt = Date.now();

  try {
    // ------------------------------------------------------------
    // AUTHENTICATION
    // ------------------------------------------------------------

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    // ------------------------------------------------------------
    // REQUEST DATA
    // ------------------------------------------------------------

    const {
      category,

      productType,

      designStyle = "Modern",

      formData = {},

      outputFormat = "Image",

      referenceImagePath,
    } = req.body || {};

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    if (!category || !productType) {
      return res.status(400).json({
        success: false,

        message: "Category and product type are required",
      });
    }

    if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
      return res.status(400).json({
        success: false,

        message: "Invalid form data",
      });
    }

    // ------------------------------------------------------------
    // RESOLVE SELECTED REFERENCE IMAGE
    // ------------------------------------------------------------

    let referenceImageUrl;

    try {
      referenceImageUrl = getTrustedReferenceUrl(category, referenceImagePath);
    } catch (error) {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }

    // ------------------------------------------------------------
    // USER'S PRINTABLE TEXT
    // ------------------------------------------------------------

    const textFields = extractPrintableText(formData);

    if (Object.keys(textFields).length === 0) {
      return res.status(400).json({
        success: false,

        message: "Please enter the text you want to replace",
      });
    }

    // ------------------------------------------------------------
    // GENERATION SETTINGS
    // ------------------------------------------------------------

    const ratioLabel = formData.ratio || null;

    const aspectRatio = mapAspect(ratioLabel);

    const isPdf = String(outputFormat).toLowerCase() === "pdf";

    // ------------------------------------------------------------
    // CREATE STRICT PROMPT
    // ------------------------------------------------------------

    // DeepSeek is NOT used.
    // Existing creative prompt generator is NOT used.

    const aiPrompt = `
      ${buildTextReplacementPrompt({
        productType,
        textFields,
      })}

      ${TYPOGRAPHY_MATCHING_RULES}
      `.trim();

    // ------------------------------------------------------------
    // CREATE DATABASE RECORD
    // ------------------------------------------------------------

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
      // ==========================================================
      // FLUX.2 KLEIN IMAGE-TO-IMAGE
      // ==========================================================

      console.log("Starting FLUX.2 Klein image editing...");

      console.log("Sending reference image:", referenceImageUrl);

      // Existing aiService.js method.

      const replicateUrl = await aiService.imageToImage({
        prompt: aiPrompt,

        images: [referenceImageUrl],

        aspectRatio: "match_input_image",

        outputFormat: "png",

        outputQuality: 95,

        outputMegapixels: "1",

        goFast: false,

        disableSafetyChecker: false,
      });

      if (!replicateUrl || typeof replicateUrl !== "string") {
        throw new Error("FLUX.2 Klein returned no valid image URL");
      }

      console.log("FLUX.2 Klein generation completed");

      // ==========================================================
      // SAVE GENERATED IMAGE
      // ==========================================================

      const storedImage = await storeImageLocally(
        replicateUrl,

        userId,

        record._id,

        "png",
      );

      console.log("Generated image saved:", storedImage.url);

      // ==========================================================
      // GENERATE PDF WHEN REQUESTED
      // ==========================================================

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

        const storedPdf = await storePdfLocally(
          pdfResult,

          userId,

          record._id,
        );

        // --------------------------------------------------------
        // UPDATE MONGODB
        // --------------------------------------------------------

        record.status = "completed";

        record.aiPrompt = aiPrompt;

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

        // --------------------------------------------------------
        // PDF RESPONSE
        // --------------------------------------------------------

        return res.json({
          success: true,

          data: {
            id: record._id,

            type: "pdf",

            outputFormat: "PDF",

            url: storedPdf.url,

            thumbnailUrl: storedImage.url,

            filename: `${safeFilename(productType)}.pdf`,

            mimeType: "application/pdf",

            durationMs: Date.now() - startedAt,
          },
        });
      }

      // ==========================================================
      // IMAGE OUTPUT
      // ==========================================================

      record.status = "completed";

      record.aiPrompt = aiPrompt;

      record.imageUrl = storedImage.url;

      record.imageMimeType = storedImage.mimeType;

      record.imageSizeBytes = storedImage.sizeBytes;

      record.thumbnailUrl = storedImage.url;

      await record.save();

      // ----------------------------------------------------------
      // IMAGE RESPONSE
      // ----------------------------------------------------------

      return res.json({
        success: true,

        data: {
          id: record._id,

          type: "image",

          outputFormat: "Image",

          url: storedImage.url,

          thumbnailUrl: storedImage.url,

          filename: `${safeFilename(productType)}.png`,

          mimeType: storedImage.mimeType,

          prompt: aiPrompt,

          durationMs: Date.now() - startedAt,
        },
      });
    } catch (generationError) {
      // ==========================================================
      // GENERATION FAILED
      // ==========================================================

      console.error("Party Product Generation Failed:", generationError);

      record.status = "failed";

      record.errorMessage = generationError.message || "Generation failed";

      try {
        await record.save();
      } catch (saveError) {
        console.error("Failed to save generation error:", saveError.message);
      }

      return res.status(500).json({
        success: false,

        message: generationError.message || "Party product generation failed",

        id: record._id,
      });
    }
  } catch (error) {
    // ============================================================
    // INTERNAL SERVER ERROR
    // ============================================================

    console.error("Party Product Controller Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Internal server error",
    });
  }
};

// ================================================================
// LIST MY PRODUCTS
// GET /api/party-products
// ================================================================

exports.listMine = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const items = await PartyProduct.find({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50)
      .lean();

    return res.json({
      success: true,

      data: items,
    });
  } catch (error) {
    console.error("List Party Products Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ================================================================
// GET SINGLE PRODUCT
// GET /api/party-products/:id
// ================================================================

exports.getOne = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const item = await PartyProduct.findOne({
      _id: req.params.id,

      userId,
    }).lean();

    if (!item) {
      return res.status(404).json({
        success: false,

        message: "Product not found",
      });
    }

    return res.json({
      success: true,

      data: item,
    });
  } catch (error) {
    console.error("Get Party Product Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ================================================================
// DELETE PARTY PRODUCT
// DELETE /api/party-products/:id
// ================================================================

exports.remove = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,

        message: "Unauthorized",
      });
    }

    const item = await PartyProduct.findOne({
      _id: req.params.id,

      userId,
    });

    if (!item) {
      return res.status(404).json({
        success: false,

        message: "Product not found",
      });
    }

    // ------------------------------------------------------------
    // REMOVE GENERATED FILES
    // ------------------------------------------------------------

    if (item.imageUrl) {
      await deleteLocalImage(item.imageUrl);
    }

    if (item.thumbnailUrl && item.thumbnailUrl !== item.imageUrl) {
      await deleteLocalImage(item.thumbnailUrl);
    }

    // ------------------------------------------------------------
    // REMOVE DATABASE RECORD
    // ------------------------------------------------------------

    await PartyProduct.deleteOne({
      _id: item._id,

      userId,
    });

    return res.json({
      success: true,

      message: "Party product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Party Product Error:", error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ================================================================
// ADDITIONAL EXPORTS
// ================================================================

exports.buildImagePrompt = buildImagePrompt;

exports.buildTextReplacementPrompt = buildTextReplacementPrompt;

exports.getTrustedReferenceUrl = getTrustedReferenceUrl;

exports.extractPrintableText = extractPrintableText;

exports.storeImageLocally = storeImageLocally;

exports.storePdfLocally = storePdfLocally;

exports.deleteLocalImage = deleteLocalImage;

exports.getAspectRatio = getAspectRatio;

// ================================================================
// END OF PARTY PRODUCT CONTROLLER
// ================================================================
