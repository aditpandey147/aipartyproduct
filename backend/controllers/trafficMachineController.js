// backend/src/controllers/trafficMachineController.js
const aiService = require("../services/aiService");

// ================================================================
// POST /api/traffic/generate
// Takes a product + platform + optional extra context, returns ready-to-post copy.
// ================================================================
exports.generate = async (req, res) => {
  try {
    const { product, platform = "Instagram", extra = "" } = req.body;

    if (!product || !product.title) {
      return res.status(400).json({ success: false, message: "product is required" });
    }

    // ---------- Platform-specific instructions ----------
    const PLATFORM_GUIDE = {
      Instagram: `Write 3 Instagram captions. Each 100–180 words.
Include an emoji-rich hook, a short story or benefit, and a clear call-to-action.
End each with 12–15 relevant hashtags on a new line.`,
      Pinterest: `Write 5 Pinterest pin descriptions. Each 60–120 words.
Focus on search keywords, benefits, and a save-worthy CTA.
Include 8–10 search-optimized hashtags at the end.`,
      TikTok: `Write 3 TikTok/Reels scripts. Each 30–60 seconds spoken.
Include a hook (first 3s), a quick demo/benefit, and a CTA to "link in bio".
Format as: [HOOK] / [BODY] / [CTA].`,
      Facebook: `Write 3 Facebook posts. Each 80–150 words.
Conversational tone, story-driven, strong CTA at the end.
Add 5–7 hashtags.`,
      Email: `Write 1 email blast. Include: subject line (max 60 chars),
preview text (max 90 chars), body (200–300 words), and a CTA.
Tone: warm, excited, personal.`,
      Etsy: `Write an Etsy listing. Include:
- SEO title (max 140 chars)
- Description (200–300 words, keyword-rich)
- 13 tags (max 20 chars each)
- 1 short "What's included" bullet list.`,
    };

    const platformGuide = PLATFORM_GUIDE[platform] || PLATFORM_GUIDE.Instagram;

    const systemPrompt = `
You are an expert social media & marketplace copywriter for digital party products.
Write high-converting, ready-to-post copy.
Never invent stats, discounts, or fake reviews.
Output ONLY the content — no preamble, no labels unless specified.
`.trim();

    const userMessage = `
Product: ${product.title}
Category: ${product.category || "Party Product"}
${product.prompt ? `Design detail: ${product.prompt.slice(0, 200)}` : ""}
${extra ? `Extra context from the seller: ${extra}` : ""}

Platform: ${platform}

Instructions:
${platformGuide}
`.trim();

    const copy = await aiService.chat({
      systemPrompt,
      userMessage,
      temperature: 0.75,
      maxTokens: 900,
    });

    if (!copy || copy.length < 20) {
      throw new Error("AI returned empty content");
    }

    return res.json({
      success: true,
      data: { platform, copy: copy.trim(), productTitle: product.title },
    });
  } catch (err) {
    console.error("traffic/generate error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate traffic copy",
    });
  }
};