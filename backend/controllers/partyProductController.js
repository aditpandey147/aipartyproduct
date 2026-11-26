// ================================================================
// AI PARTY PRODUCT FACTORY
// PARTY PRODUCT CONTROLLER
//
// IMAGE-TO-IMAGE TEXT REPLACEMENT
//
// Reference Image + User Text
//              ↓
// Strict Typography Matching Prompt
//              ↓
// FLUX.2 Klein 9B
//              ↓
// Generated Image / PDF
//              ↓
// Local Storage + MongoDB
//
// No DeepSeek prompt generation.
// ================================================================

const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");

const PartyProduct = require("../models/PartyProduct");
const aiService = require("../services/aiService");

const {
  generateProductPdf,
} = require("../services/productPdfService");

// ================================================================
// CONFIGURATION
// ================================================================

const UPLOAD_ROOT = path.join(
  __dirname,
  "..",
  "uploads",
  "party-products"
);

const PRODUCT_IMAGE_ORIGIN =
  process.env.PRODUCT_IMAGE_ORIGIN ||
  "https://aipartyproduct.albinolabs.com";

// ================================================================
// PRODUCT CATEGORY FOLDERS
// ================================================================

const PRODUCT_IMAGE_FOLDERS = {
  "Party Invitations": "01-party-invitations",

  "Party Decorations": "02-party-decorations",

  "Party Games & Activities":
    "03-party-games-activities",

  "Party Favor Products":
    "04-party-favor-products",

  "Party Planning Kits":
    "05-party-planning-kits",

  "Party Table Printables":
    "06-party-table-printables",

  "Party Photo Booth Kits":
    "07-party-photo-booth-kits",
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
// HELPERS
// ================================================================

function getUserId(req) {
  return req.user?.id || req.user?._id || null;
}

function safeFilename(value) {
  return String(value || "party-product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

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
// TRUSTED REFERENCE IMAGE URL
// ================================================================

function getTrustedReferenceUrl(
  category,
  referenceImagePath
) {
  const folder = PRODUCT_IMAGE_FOLDERS[category];

  if (!folder) {
    throw new Error("Unsupported product category");
  }

  if (
    typeof referenceImagePath !== "string" ||
    !referenceImagePath.trim()
  ) {
    throw new Error(
      "Selected product reference image is missing"
    );
  }

  const origin = new URL(PRODUCT_IMAGE_ORIGIN);

  if (origin.protocol !== "https:") {
    throw new Error(
      "Product image origin must use HTTPS"
    );
  }

  const imageUrl = new URL(
    referenceImagePath,
    origin
  );

  if (imageUrl.origin !== origin.origin) {
    throw new Error(
      "External reference images are not allowed"
    );
  }

  const expectedPrefix =
    `/product-images/${folder}/`;

  if (!imageUrl.pathname.startsWith(expectedPrefix)) {
    throw new Error(
      "Reference image does not match selected category"
    );
  }

  const validPath =
    /^\/product-images\/[a-z0-9-]+\/\d{3}-[a-z0-9-]+\.png$/i;

  if (!validPath.test(imageUrl.pathname)) {
    throw new Error(
      "Invalid product reference image filename"
    );
  }

  if (imageUrl.search || imageUrl.hash) {
    throw new Error(
      "Invalid reference image parameters"
    );
  }

  return imageUrl.toString();
}

// ================================================================
// EXTRACT USER'S PRINTABLE TEXT
// ================================================================

function extractPrintableText(formData = {}) {
  const textFields = {};

  for (const [key, value] of Object.entries(
    formData
  )) {
    if (NON_TEXT_FIELDS.has(key)) {
      continue;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      textFields[key] = value.trim();
      continue;
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      textFields[key] = String(value);
    }
  }

  return textFields;
}

// ================================================================
// STRICT TEXT REPLACEMENT + TYPOGRAPHY MATCHING PROMPT
// ================================================================

function buildTextReplacementPrompt({
  productType,
  textFields,
}) {
  const entries = Object.entries(
    textFields || {}
  );

  if (!entries.length) {
    throw new Error(
      "Please enter text to replace on the product"
    );
  }

  const replacementText = entries
    .map(
      ([field, value]) =>
        `${field}: ${JSON.stringify(value)}`
    )
    .join("\n");

  return `
STRICT REFERENCE IMAGE TEXT EDITING

ROLE:
You are a professional image editor specializing in
precise text replacement within existing graphic designs.

You are NOT creating a new design.

The supplied reference image is the final approved artwork.

Your task is to change ONLY the original text while
preserving every other visual detail.

================================================
PRODUCT INFORMATION
================================================

PRODUCT TYPE:
${productType}

NEW USER TEXT:

${replacementText}

The field names describe the text's purpose.
Never render field names as visible lettering.

================================================
HIGHEST PRIORITY: REFERENCE PRESERVATION
================================================

The provided reference image is the absolute visual source
of truth for this editing task.

Preserve the image as closely as possible.

Keep unchanged:

- Background artwork
- Illustrations
- Decorative elements
- Icons
- Borders
- Shapes
- Textures
- Color palette
- Gradients
- Composition
- Layout
- Visual hierarchy
- Spacing
- Margins
- Orientation
- Canvas framing

Do not redraw, redesign, rearrange, or reinterpret
the reference image.

Do not introduce any new illustrations or decorations.

Do not remove unrelated existing elements.

================================================
CRITICAL TYPOGRAPHY MATCHING
================================================

The replacement text must match the original text's
visual appearance as closely as possible.

FONT FAMILY:

Identify the original typography appearance.

Match its font family or closest visual equivalent.

Preserve whether it is:

- Serif
- Sans-serif
- Script
- Handwritten
- Calligraphy
- Decorative display
- Rounded
- Geometric
- Vintage
- Modern
- Elegant
- Playful

Do not replace decorative lettering with generic fonts.

FONT WEIGHT AND STYLE:

Match the original:

- Font weight
- Stroke thickness
- Character proportions
- Italic angle
- Curvature
- Letter shapes
- Decorative flourishes
- Uppercase and lowercase treatment

FONT COLOR:

Match the existing text color.

Preserve:

- Fill color
- Hue
- Saturation
- Brightness
- Opacity
- Gradient fill
- Color transitions

FONT EFFECTS:

Match any original:

- Text outline
- Stroke thickness
- Drop shadow
- Inner shadow
- Glow
- Embossing
- Texture
- Highlight
- Metallic effect

Do not introduce effects absent from the reference.

================================================
FONT SIZE AND SPACING
================================================

Match the original text's:

- Font size
- Visual scale
- Letter spacing
- Kerning
- Word spacing
- Line height
- Paragraph spacing
- Text width
- Text height
- Baseline
- Rotation
- Curvature

Maintain the same visual density as the original lettering.

For longer replacement text:

Use the smallest possible font-size adjustment
needed to fit the original text region.

Never allow the new text to overlap decorative elements.

================================================
TEXT POSITION AND ALIGNMENT
================================================

Place replacement text in the same location as
the corresponding original text.

Preserve:

- Horizontal alignment
- Vertical alignment
- Centerline
- Baseline
- Left and right padding
- Top and bottom margins
- Distance from surrounding illustrations
- Distance from borders

Do not move other elements to accommodate text.

================================================
CLEAN TEXT REPLACEMENT
================================================

Completely remove the original text being replaced.

Reconstruct the background beneath removed lettering
as naturally and accurately as possible.

Place the new text into the original text region.

Never leave:

- Ghost lettering
- Duplicate characters
- Fragments of previous words
- Blurry text
- Editing artifacts
- Distorted characters

================================================
EXACT TEXT REQUIREMENTS
================================================

Copy user-provided text exactly.

Preserve:

- Spelling
- Capitalization
- Punctuation
- Numbers
- Special characters
- Accents

Do not invent any additional text.

Do not add sample names, dates, slogans, or headings.

Do not display:

- JSON field names
- Technical instructions
- Placeholder values
- Form labels
- Prompt text

================================================
DESIGN RESTRICTIONS
================================================

Do not generate a new template.

Do not change the overall image style.

Do not change the background.

Do not change the color scheme.

Do not change the illustrations.

Do not change the layout.

Do not change canvas dimensions.

Do not change image orientation.

Do not create a mockup.

Do not place the design on a table.

Do not add hands holding the product.

Do not add picture frames.

Do not add watermarks.

================================================
FINAL QUALITY OBJECTIVE
================================================

The replacement text should look as if it was originally
part of the professionally designed reference image.

Match the original typography, color, effects, position,
size, alignment, letter spacing, and visual hierarchy
as closely as possible.

The finished image should remain visually identical
to the reference wherever no text replacement is needed.

The ONLY intended change is the user's new text.

OUTPUT:

One complete flat edited party product artwork.

NO REDESIGN.

NO EXTRA TEXT.

NO NEW DECORATIONS.

NO MOCKUP.

STRICT TEXT-ONLY IMAGE EDIT.
`.trim();
}

// ================================================================
// COMPATIBILITY PROMPT EXPORT
// ================================================================

async function buildImagePrompt({
  productType,
  formData = {},
}) {
  return buildTextReplacementPrompt({
    productType,
    textFields: extractPrintableText(formData),
  });
}

// ================================================================
// STORE GENERATED IMAGE
// ================================================================

async function storeImageLocally(
  replicateUrl,
  userId,
  genId,
  ext = "png"
) {
  if (
    typeof replicateUrl !== "string" ||
    !replicateUrl.startsWith("https://")
  ) {
    throw new Error(
      "AI returned an invalid image URL"
    );
  }

  const userDir = path.join(
    UPLOAD_ROOT,
    String(userId)
  );

  await fs.mkdir(userDir, {
    recursive: true,
  });

  const response = await axios.get(
    replicateUrl,
    {
      responseType: "arraybuffer",
      timeout: 120000,
      maxContentLength: 30 * 1024 * 1024,
    }
  );

  const imageBuffer = Buffer.from(
    response.data
  );

  if (!imageBuffer.length) {
    throw new Error(
      "Downloaded image is empty"
    );
  }

  const filename = `${genId}.${ext}`;

  const localPath = path.join(
    userDir,
    filename
  );

  await fs.writeFile(
    localPath,
    imageBuffer
  );

  return {
    url:
      `/uploads/party-products/${userId}/${filename}`,

    localPath,

    sizeBytes: imageBuffer.length,

    mimeType:
      response.headers["content-type"] ||
      "image/png",
  };
}

// ================================================================
// STORE GENERATED PDF
// ================================================================

async function storePdfLocally(
  sourcePdf,
  userId,
  genId
) {
  if (!sourcePdf?.filePath) {
    throw new Error(
      "PDF generator returned no file path"
    );
  }

  const userDir = path.join(
    UPLOAD_ROOT,
    String(userId)
  );

  await fs.mkdir(userDir, {
    recursive: true,
  });

  const filename = `${genId}.pdf`;

  const localPath = path.join(
    userDir,
    filename
  );

  await fs.copyFile(
    sourcePdf.filePath,
    localPath
  );

  if (
    path.resolve(sourcePdf.filePath) !==
    path.resolve(localPath)
  ) {
    try {
      await fs.unlink(sourcePdf.filePath);
    } catch (error) {
      console.warn(
        "Temporary PDF cleanup:",
        error.message
      );
    }
  }

  const stat = await fs.stat(
    localPath
  );

  return {
    url:
      `/uploads/party-products/${userId}/${filename}`,

    localPath,

    sizeBytes: stat.size,

    mimeType: "application/pdf",
  };
}

// ================================================================
// DELETE GENERATED FILE
// ================================================================

async function deleteLocalImage(publicUrl) {
  const prefix =
    "/uploads/party-products/";

  if (
    typeof publicUrl !== "string" ||
    !publicUrl.startsWith(prefix)
  ) {
    return;
  }

  const relativePath =
    publicUrl.slice(prefix.length);

  const absolutePath = path.resolve(
    UPLOAD_ROOT,
    relativePath
  );

  const root = path.resolve(
    UPLOAD_ROOT
  );

  if (
    !absolutePath.startsWith(
      root + path.sep
    )
  ) {
    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(
        "File cleanup error:",
        error.message
      );
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ============================================================
    // REQUEST DATA
    // ============================================================

    const {
      category,
      productType,
      designStyle = "Modern",
      formData = {},
      outputFormat = "Image",
      referenceImagePath,
    } = req.body || {};

    // ============================================================
    // VALIDATE PRODUCT
    // ============================================================

    if (!category || !productType) {
      return res.status(400).json({
        success: false,
        message:
          "Category and productType are required",
      });
    }

    if (
      !formData ||
      typeof formData !== "object" ||
      Array.isArray(formData)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data",
      });
    }

    // ============================================================
    // REFERENCE IMAGE URL
    // ============================================================

    let referenceImageUrl;

    try {
      referenceImageUrl =
        getTrustedReferenceUrl(
          category,
          referenceImagePath
        );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // ============================================================
    // EXTRACT USER TEXT
    // ============================================================

    const textFields =
      extractPrintableText(formData);

    if (
      Object.keys(textFields).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter the text you want to replace",
      });
    }

    // ============================================================
    // OUTPUT SETTINGS
    // ============================================================

    const ratioLabel =
      formData.ratio || null;

    const aspectRatio =
      mapAspect(ratioLabel);

    const isPdf =
      String(outputFormat).toLowerCase() ===
      "pdf";

    // ============================================================
    // STRICT TEXT EDITING PROMPT
    // ============================================================

    // No DeepSeek call.
    // No creative design prompt.

    const aiPrompt =
      buildTextReplacementPrompt({
        productType,
        textFields,
      });

    console.log(
      "======================================"
    );

    console.log(
      "PARTY PRODUCT TEXT REPLACEMENT"
    );

    console.log(
      "======================================"
    );

    console.log(
      "Product:",
      productType
    );

    console.log(
      "Reference:",
      referenceImageUrl
    );

    console.log(
      "Replacement fields:",
      Object.keys(textFields)
    );

    console.log(
      "Output:",
      isPdf ? "PDF" : "Image"
    );

    // ============================================================
    // CREATE DATABASE RECORD
    // ============================================================

    const record =
      await PartyProduct.create({
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

        outputFormat:
          isPdf ? "PDF" : "Image",
      });

    try {
      // ==========================================================
      // FLUX.2 KLEIN IMAGE-TO-IMAGE
      // ==========================================================

      console.log(
        "Starting FLUX.2 Klein..."
      );

      console.log(
        "Reference Image:",
        referenceImageUrl
      );

      const replicateUrl =
        await aiService.imageToImage({
          prompt: aiPrompt,

          images: [
            referenceImageUrl,
          ],

          aspectRatio:
            "match_input_image",

          outputFormat: "png",

          outputQuality: 95,

          outputMegapixels: "1",

          goFast: false,

          disableSafetyChecker: false,
        });

      if (
        !replicateUrl ||
        typeof replicateUrl !== "string"
      ) {
        throw new Error(
          "FLUX.2 Klein returned no valid image URL"
        );
      }

      console.log(
        "FLUX.2 Klein completed"
      );

      // ==========================================================
      // STORE GENERATED IMAGE
      // ==========================================================

      const storedImage =
        await storeImageLocally(
          replicateUrl,
          userId,
          record._id,
          "png"
        );

      console.log(
        "Image saved:",
        storedImage.url
      );

      // ==========================================================
      // PDF OUTPUT
      // ==========================================================

      if (isPdf) {
        const generatedDir =
          path.join(
            __dirname,
            "..",
            "uploads",
            "generated"
          );

        await fs.mkdir(
          generatedDir,
          {
            recursive: true,
          }
        );

        const pdfResult =
          await generateProductPdf({
            productType,
            category,
            formData,
            designStyle,
            outputDir: generatedDir,
            imagePath:
              storedImage.localPath,
          });

        const storedPdf =
          await storePdfLocally(
            pdfResult,
            userId,
            record._id
          );

        // Update MongoDB

        record.status = "completed";

        record.aiPrompt = aiPrompt;

        record.imageUrl =
          storedPdf.url;

        record.imageMimeType =
          storedPdf.mimeType;

        record.imageSizeBytes =
          storedPdf.sizeBytes;

        record.thumbnailUrl =
          storedImage.url;

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

            thumbnailUrl:
              storedImage.url,

            filename:
              `${safeFilename(productType)}.pdf`,

            mimeType:
              "application/pdf",

            durationMs:
              Date.now() - startedAt,
          },
        });
      }

      // ==========================================================
      // IMAGE OUTPUT
      // ==========================================================

      record.status = "completed";

      record.aiPrompt = aiPrompt;

      record.imageUrl =
        storedImage.url;

      record.imageMimeType =
        storedImage.mimeType;

      record.imageSizeBytes =
        storedImage.sizeBytes;

      record.thumbnailUrl =
        storedImage.url;

      await record.save();

      return res.json({
        success: true,

        data: {
          id: record._id,

          type: "image",

          outputFormat: "Image",

          url:
            storedImage.url,

          thumbnailUrl:
            storedImage.url,

          filename:
            `${safeFilename(productType)}.png`,

          mimeType:
            storedImage.mimeType,

          prompt:
            aiPrompt,

          durationMs:
            Date.now() - startedAt,
        },
      });
    } catch (generationError) {
      // ==========================================================
      // GENERATION ERROR
      // ==========================================================

      console.error(
        "Party Product Generation Failed:",
        generationError
      );

      record.status = "failed";

      record.errorMessage =
        generationError.message ||
        "Generation failed";

      try {
        await record.save();
      } catch (saveError) {
        console.error(
          "Error saving failed record:",
          saveError.message
        );
      }

      return res.status(500).json({
        success: false,

        message:
          generationError.message ||
          "Party product generation failed",

        id: record._id,
      });
    }
  } catch (error) {
    console.error(
      "Party Product Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Internal server error",
    });
  }
};

// ================================================================
// GET MY PRODUCTS
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

    const items =
      await PartyProduct.find({
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

    const item =
      await PartyProduct.findOne({
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

    const item =
      await PartyProduct.findOne({
        _id: req.params.id,
        userId,
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete generated product file.

    if (item.imageUrl) {
      await deleteLocalImage(
        item.imageUrl
      );
    }

    // Delete separate PDF thumbnail.

    if (
      item.thumbnailUrl &&
      item.thumbnailUrl !== item.imageUrl
    ) {
      await deleteLocalImage(
        item.thumbnailUrl
      );
    }

    // Delete MongoDB record.

    await PartyProduct.deleteOne({
      _id: item._id,
      userId,
    });

    return res.json({
      success: true,
      message:
        "Party product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// ADDITIONAL EXPORTS
// ================================================================

exports.buildImagePrompt =
  buildImagePrompt;

exports.buildTextReplacementPrompt =
  buildTextReplacementPrompt;

exports.getTrustedReferenceUrl =
  getTrustedReferenceUrl;

exports.extractPrintableText =
  extractPrintableText;

exports.storeImageLocally =
  storeImageLocally;

exports.storePdfLocally =
  storePdfLocally;

exports.deleteLocalImage =
  deleteLocalImage;

exports.getAspectRatio =
  getAspectRatio;

// ================================================================
// END OF CONTROLLER
// ================================================================
