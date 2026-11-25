// backend/src/controllers/productIdeaController.js

const aiService = require("../services/aiService");

// ================================================================
// ✅ CRITICAL: This catalog MUST exactly match
// frontend/src/data/productGeneratorData.js → PRODUCTS_BY_CATEGORY
// ================================================================

const PRODUCT_CATALOG = {
  "Party Invitations": [
    "Birthday Invitation",
    "Kids Themed Birthday Invitation",
    "First Birthday Invitation",
    "Wedding Invitation",
    "Save the Date Card",
    "Baby Shower Invitation",
    "Bridal Shower Invitation",
    "Gender Reveal Invitation",
    "Bachelorette Invitation",
    "Christmas Invitation",
    "Halloween Invitation",
    "Thanksgiving Invitation",
    "New Year's Eve Invitation",
    "Graduation Invitation",
    "Sweet 16 Invitation",
    "Quinceañera Invitation",
    "Engagement Invitation",
    "Retirement Invitation",
    "Housewarming Invitation",
    "Anniversary Invitation",
  ],

  "Party Decorations": [
    "Welcome Sign",
    "Birthday Banner",
    "Milestone Board",
    "Baby Shower Welcome Sign",
    "Wedding Welcome Sign",
    "Bridal Shower Welcome Sign",
    "Gender Reveal Welcome Sign",
    "Graduation Banner",
    "Christmas Poster",
    "Halloween Poster",
    "New Year's Eve Banner",
    "Cupcake Toppers",
    "Cake Topper",
    "Pennant Banner",
    "Party Backdrop",
    "Dessert Table Sign",
    "Birthday Number Poster",
    "Bachelorette Banner",
    "Memory Display Sign",
    "Directional Signs",
  ],

  "Party Games & Activities": [
    "Christmas Bingo",
    "Baby Shower Bingo",
    "Birthday Bingo",
    "Thanksgiving Bingo",
    "Christmas Trivia",
    "Thanksgiving Trivia",
    "Birthday Trivia",
    "Bridal Shower Trivia",
    "Gift Exchange Game",
    "Left-Right Gift Exchange",
    "Holiday Scavenger Hunt",
    "Birthday Treasure Hunt",
    "Escape Room Kit",
    "Christmas Charades",
    "Would You Rather Cards",
    "Bachelorette Challenge Cards",
    "New Year's Eve Games",
    "Birthday Coloring Sheets",
    "Word Search Puzzle",
    "Holiday Office Games",
  ],

  "Party Favor Products": [
    "Thank You Tags",
    "Birthday Favor Tags",
    "Baby Shower Tags",
    "Wedding Favor Tags",
    "Bridal Shower Tags",
    "Christmas Gift Tags",
    "Halloween Bag Toppers",
    "Candy Bar Wrappers",
    "Water Bottle Labels",
    "Favor Bag Toppers",
    "Party Stickers",
    "Mini Thank You Cards",
    "Popcorn Labels",
    "Graduation Tags",
    "Bachelorette Labels",
    "Gender Reveal Tags",
    "Juice Box Wrappers",
    "Treat Box Designs",
    "Cookie Packaging Labels",
    "Bubble Wand Tags",
  ],

  "Party Planning Kits": [
    "Birthday Planner",
    "Wedding Checklist",
    "Baby Shower Planner",
    "Bridal Shower Planner",
    "Christmas Party Planner",
    "Thanksgiving Hosting Planner",
    "Halloween Party Planner",
    "New Year's Eve Planner",
    "Party Budget Tracker",
    "Guest List Organizer",
    "Party Timeline Planner",
    "Shopping Checklist",
    "Food & Drink Planner",
    "Wedding Seating Planner",
    "Vendor Contact Sheet",
    "Setup Checklist",
    "Kids Activity Schedule",
    "Graduation Planner",
    "Bachelorette Itinerary",
    "Event Planning Workbook",
  ],

  "Party Table Printables": [
    "Wedding Menu Card",
    "Christmas Dinner Menu",
    "Thanksgiving Dinner Menu",
    "Place Cards",
    "Buffet Food Labels",
    "Baby Shower Food Labels",
    "Dessert Table Labels",
    "Drink Station Sign",
    "Cocktail Menu",
    "Mocktail Menu",
    "Table Number Cards",
    "Reserved Table Signs",
    "Thanksgiving Place Cards",
    "Kids Food Labels",
    "Candy Buffet Labels",
    "Hot Cocoa Bar Sign",
    "Coffee Bar Menu",
    "Napkin Ring Designs",
    "Dessert Menu Cards",
    "Table Stationery Set",
  ],

  "Party Photo Booth Kits": [
    "Birthday Photo Props",
    "Wedding Photo Props",
    "Baby Shower Props",
    "Christmas Props",
    "Halloween Props",
    "Graduation Props",
    "Bachelorette Props",
    "New Year's Eve Props",
    "Speech Bubble Props",
    "Mustache & Glasses Props",
    "Photo Booth Welcome Sign",
    "Personalized Selfie Frame",
    "Selfie Station Sign",
    "Instruction Sign",
    "Wedding Hashtag Props",
    "Gender Reveal Props",
    "First Birthday Props",
    "Retirement Props",
    "Sweet 16 Props",
    "Complete Photo Booth Kit",
  ],
};

// ✅ Allowed ratios — MUST match RATIO_OPTIONS values on the frontend
const ALLOWED_RATIOS = [
  "5:7",
  "7:5",
  "2:3",
  "3:2",
  "1:1",
  "148:210",
  "105:148",
  "4:5",
  "9:16",
];

// ================================================================
// JSON PARSER
// ================================================================

function parseAIJson(raw) {
  if (!raw) throw new Error("AI returned empty response");

  let text = String(raw).trim();
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(text);
}

// ================================================================
// POST /api/product-ideas/generate
// ================================================================

exports.generateIdeas = async (req, res) => {
  try {
    const idea = String(req.body?.idea || "").trim();

    if (!idea) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a party idea." });
    }
    if (idea.length > 500) {
      return res
        .status(400)
        .json({ success: false, message: "Idea is too long." });
    }

    const catalogText = Object.entries(PRODUCT_CATALOG)
      .map(
        ([category, products]) =>
          `${category}:\n${products.map((p) => `- ${p}`).join("\n")}`
      )
      .join("\n\n");

    const systemPrompt = `
You are a senior digital-product strategist specializing in party
printables, invitations, party games, decorations and event products.

A user will describe ANY party-related idea. Turn it into commercially
useful product concepts for our generator.

==================================================
SUPPORTED PRODUCTS — USE EXACT STRINGS ONLY
==================================================

${catalogText}

You MUST choose "category" and "productType" ONLY from this catalog.
Do NOT invent new categories or product names.

The "name" can be creative and theme-specific, but "productType" MUST
exactly equal one supported product name above.

==================================================
OUTPUT — VALID JSON ONLY (no markdown, no code fences)
==================================================

{
  "searchSummary": "short useful sentence",
  "ideas": [
    {
      "id": "idea-1",
      "name": "creative marketable product title",
      "category": "EXACT supported category",
      "productType": "EXACT supported product",
      "demand": "Very High" | "High" | "Medium",
      "trendScore": 1-100,
      "opportunityScore": 1-100,
      "competition": "Low" | "Medium" | "High",
      "priceMin": 3.99,
      "priceMax": 8.99,
      "targetBuyer": "short target buyer",
      "reason": "one concise reason",
      "designStyle": "Cute" | "Modern" | "Elegant",
      "colorIndex": 0-4,
      "formData": {
        "theme": "...",
        "age": "8",
        "ratio": "5:7"
      }
    }
  ]
}

==================================================
RULES
==================================================

1. Generate exactly 8 ideas.
2. Prefer variety across categories.
3. demand ∈ {"Very High","High","Medium"}
4. competition ∈ {"Low","Medium","High"}
5. designStyle ∈ {"Cute","Modern","Elegant"}
6. colorIndex ∈ [0..4]
   (0=pink, 1=purple, 2=yellow/gold, 3=blue, 4=green)
7. ratio MUST be one of:
   ${ALLOWED_RATIOS.join(", ")}
8. formData keys should be generic and useful (theme, age, ratio,
   childName, coupleNames, guestCount, playerCount, etc.).
9. NEVER invent personal names, exact dates, addresses or RSVP info
   that the user did not supply.
10. This is AI-estimated market analysis — do NOT claim verified
    marketplace statistics.
`.trim();

    const userMessage = `
USER PARTY IDEA:

${idea}

Generate 8 commercially useful product ideas for this party idea.
Return JSON only.
`.trim();

    const raw = await aiService.chat({
      systemPrompt,
      userMessage,
      temperature: 0.55,
      maxTokens: 3500,
    });

    const parsed = parseAIJson(raw);

    if (!Array.isArray(parsed.ideas)) {
      throw new Error("AI response did not contain ideas");
    }

    // ============================================================
    // ✅ SERVER-SIDE VALIDATION — never trust LLM blindly
    // ============================================================

    const ideas = parsed.ideas
      .filter((item) => {
        if (!item) return false;
        const products = PRODUCT_CATALOG[item.category];
        return Array.isArray(products) && products.includes(item.productType);
      })
      .slice(0, 8)
      .map((item, index) => {
        // Sanitize formData
        const rawForm =
          item.formData &&
          typeof item.formData === "object" &&
          !Array.isArray(item.formData)
            ? item.formData
            : {};

        const safeForm = {};

        Object.entries(rawForm).forEach(([k, v]) => {
          if (v === undefined || v === null || v === "") return;
          if (typeof v === "string" && !v.trim()) return;

          // Ratio normalization
          if (k === "ratio") {
            const found = ALLOWED_RATIOS.find(
              (r) => String(r).toLowerCase() === String(v).toLowerCase()
            );
            if (found) safeForm.ratio = found;
            return;
          }

          safeForm[k] = v;
        });

        return {
          id: item.id || `idea-${index + 1}`,
          name:
            String(item.name || item.productType).trim() || item.productType,
          category: item.category,
          productType: item.productType,

          demand: ["Very High", "High", "Medium"].includes(item.demand)
            ? item.demand
            : "Medium",

          trendScore: Math.max(
            1,
            Math.min(100, Number(item.trendScore) || 50)
          ),
          opportunityScore: Math.max(
            1,
            Math.min(100, Number(item.opportunityScore) || 50)
          ),

          competition: ["Low", "Medium", "High"].includes(item.competition)
            ? item.competition
            : "Medium",

          priceMin: Math.max(0, Number(item.priceMin) || 2.99),
          priceMax: Math.max(
            Number(item.priceMin) || 2.99,
            Number(item.priceMax) || 7.99
          ),

          targetBuyer: String(item.targetBuyer || "").trim(),
          reason: String(item.reason || "").trim(),

          designStyle: ["Cute", "Modern", "Elegant"].includes(item.designStyle)
            ? item.designStyle
            : "Modern",

          colorIndex: Math.max(
            0,
            Math.min(4, Number(item.colorIndex) || 0)
          ),

          formData: safeForm,
        };
      });

    if (!ideas.length) {
      throw new Error(
        "AI did not return any supported products. Please try again."
      );
    }

    return res.json({
      success: true,
      data: {
        query: idea,
        searchSummary:
          String(parsed.searchSummary || "").trim() ||
          `AI product opportunities for "${idea}"`,
        ideas,
      },
    });
  } catch (error) {
    console.error("generateIdeas error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate product ideas.",
    });
  }
};

module.exports.PRODUCT_CATALOG = PRODUCT_CATALOG;