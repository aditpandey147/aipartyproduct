// backend/src/services/aiService.js

const axios = require("axios");
const Replicate = require("replicate");

// ================================================================
// 🤖 MODELS
// ================================================================

const MODELS = {
  VISION_GPT: "openai/gpt-5.4",

  IMAGE_SDXL:
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",

  IMAGE_GROK: "xai/grok-imagine-image",

  IMAGE_FLUX_KLEIN: "black-forest-labs/flux-2-klein-9b",

  VIDEO_WAN: "wan-video/wan-2.2-5b-fast",

  VIDEO_PRUNE: "prunaai/p-video",

  TEXT_CHAT: "deepseek-chat",

  ENDPOINTS: {
    deepseek: "https://api.deepseek.com/v1/chat/completions",
  },

  DEFAULTS: {
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 90000,
  },
};

// ================================================================
// 🔌 INIT REPLICATE CLIENT
// ================================================================

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ================================================================
// 🔧 VALIDATION HELPERS
// ================================================================

function requireReplicateToken() {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }
}

function requirePrompt(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("prompt is required");
  }
}

// ================================================================
// 🔧 OUTPUT URL HELPER
// ================================================================

function extractOutputUrl(output) {
  if (!output) {
    throw new Error("AI model returned empty output");
  }

  if (Array.isArray(output)) {
    if (output.length === 0) {
      throw new Error("AI model returned an empty array");
    }

    return extractOutputUrl(output[0]);
  }

  if (typeof output === "string") {
    return output;
  }

  // Replicate FileOutput
  if (typeof output.url === "function") {
    return String(output.url());
  }

  if (typeof output.url === "string") {
    return output.url;
  }

  // Nested output
  if (output.output) {
    return extractOutputUrl(output.output);
  }

  throw new Error("Unsupported Replicate output format");
}

function extractImageUrl(output) {
  return extractOutputUrl(output);
}

function extractVideoUrl(output) {
  return extractOutputUrl(output);
}

// ================================================================
// 💬 CHAT — DeepSeek
// ================================================================

async function chat({
  userMessage,
  systemPrompt = "",
  model = MODELS.TEXT_CHAT,
  temperature = MODELS.DEFAULTS.temperature,
  maxTokens = MODELS.DEFAULTS.maxTokens,
  timeout = MODELS.DEFAULTS.timeout,
}) {
  requirePrompt(userMessage);

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const messages = [];

  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  messages.push({
    role: "user",
    content: userMessage.trim(),
  });

  try {
    const response = await axios.post(
      process.env.DEEPSEEK_API_URL || MODELS.ENDPOINTS.deepseek,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout,
      },
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error(
      "❌ DeepSeek Chat Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
}

// ================================================================
// 🖼️ VISION — Replicate GPT
// ================================================================

async function vision({
  imageUrl,
  prompt,
  systemPrompt = "",
  model = MODELS.VISION_GPT,
}) {
  if (!imageUrl) {
    throw new Error("imageUrl is required");
  }

  requirePrompt(prompt);
  requireReplicateToken();

  const input = {
    image_input: [imageUrl],
    prompt: prompt.trim(),
    verbosity: "low",
    reasoning_effort: "low",

    ...(systemPrompt && {
      system_prompt: systemPrompt,
    }),
  };

  try {
    const output = await replicate.run(model, {
      input,
    });

    if (Array.isArray(output)) {
      return output.map(String).join(" ").trim();
    }

    if (typeof output === "string") {
      return output.trim();
    }

    if (output && typeof output.text === "string") {
      return output.text.trim();
    }

    return JSON.stringify(output);
  } catch (error) {
    console.error("❌ Vision Error:", error.message);
    throw error;
  }
}

// ================================================================
// 🎨 IMAGE — SDXL
// ================================================================

async function image({
  prompt,
  aspectRatio = "square",
  model = MODELS.IMAGE_SDXL,
  steps = 30,
  guidance = 7.5,
}) {
  requirePrompt(prompt);
  requireReplicateToken();

  let width = 1024;
  let height = 1024;

  if (aspectRatio === "portrait") {
    width = 832;
    height = 1216;
  } else if (aspectRatio === "wide") {
    width = 1344;
    height = 768;
  }

  const input = {
    prompt: prompt.trim(),
    width,
    height,
    num_outputs: 1,
    scheduler: "K_EULER",
    num_inference_steps: steps,
    guidance_scale: guidance,
  };

  console.log("🎨 [SDXL] Input:", {
    aspectRatio,
    width,
    height,
    prompt: prompt.slice(0, 100),
  });

  try {
    const output = await replicate.run(model, {
      input,
    });

    const imageUrl = extractImageUrl(output);

    console.log("✅ [SDXL] Image generated");

    return imageUrl;
  } catch (error) {
    console.error("❌ SDXL Image Error:", error.message);
    throw error;
  }
}

// ================================================================
// ⚡ IMAGE FAST — xAI Grok Imagine Image
// ================================================================

async function imageFast({
  prompt,
  aspectRatio = "1:1",
  model = MODELS.IMAGE_GROK,
}) {
  requirePrompt(prompt);
  requireReplicateToken();

  const FORMAT_MAP = {
    square: "1:1",
    portrait: "3:4",
    landscape: "4:3",
    wide: "16:9",
    story: "9:16",

    "1:1": "1:1",
    "3:4": "3:4",
    "4:3": "4:3",
    "2:3": "2:3",
    "3:2": "3:2",
    "9:16": "9:16",
    "16:9": "16:9",
  };

  const normalized = String(aspectRatio || "")
    .toLowerCase()
    .trim();

  const ratio = FORMAT_MAP[normalized] || "1:1";

  const input = {
    prompt: prompt.trim(),
    aspect_ratio: ratio,
  };

  console.log("⚡ [Grok Imagine] Input:", {
    aspect_ratio: ratio,
    prompt: prompt.slice(0, 100),
  });

  try {
    const output = await replicate.run(model, {
      input,
    });

    const imageUrl = extractImageUrl(output);

    console.log("✅ [Grok Imagine] Image generated:", imageUrl);

    return imageUrl;
  } catch (error) {
    console.error("❌ [Grok Imagine] Error:", error.message);
    throw error;
  }
}

// ================================================================
// 🖼️ IMAGE-TO-IMAGE — FLUX.2 Klein 9B
// ================================================================

async function imageToImage({
  prompt,
  images = [],
  aspectRatio = "match_input_image",
  outputFormat = "png",
  outputQuality = 95,
  outputMegapixels = "1",
  goFast = false,
  disableSafetyChecker = false,
  model = MODELS.IMAGE_FLUX_KLEIN,
}) {
  requirePrompt(prompt);
  requireReplicateToken();

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("At least one reference image is required");
  }

  // Support local Buffers and public image URLs.
  // Replicate SDK automatically uploads Buffer inputs.
  const refImages = images.slice(0, 5).filter((item) => {
    if (Buffer.isBuffer(item)) {
      return item.length > 0;
    }

    return typeof item === "string" && /^https?:\/\//i.test(item);
  });

  if (refImages.length === 0) {
    throw new Error("Provide a valid image Buffer or public image URL");
  }

  const VALID_ASPECTS = [
    "match_input_image",
    "1:1",
    "16:9",
    "9:16",
    "4:3",
    "3:4",
    "3:2",
    "2:3",
    "4:5",
    "5:4",
    "21:9",
    "9:21",
  ];

  const ratio = VALID_ASPECTS.includes(aspectRatio)
    ? aspectRatio
    : "match_input_image";

  const fmt = ["jpg", "png", "webp"].includes(outputFormat)
    ? outputFormat
    : "png";

  const input = {
    prompt: prompt.trim(),

    images: refImages,

    aspect_ratio: ratio,

    output_format: fmt,

    output_quality: Math.max(1, Math.min(100, Number(outputQuality) || 95)),

    output_megapixels: String(outputMegapixels || "1"),

    go_fast: Boolean(goFast),

    disable_safety_checker: Boolean(disableSafetyChecker),
  };

  console.log("Image-to-Image Generation Started", {
    model,
    aspectRatio: ratio,
    outputFormat: fmt,
    referenceImages: refImages.length,
    localImages: refImages.filter((item) => Buffer.isBuffer(item)).length,
  });

  try {
    const output = await replicate.run(model, {
      input,
    });

    const imageUrl = extractImageUrl(output);

    if (!imageUrl) {
      throw new Error("Image-to-Image returned no output URL");
    }

    console.log("Image-to-Image Generation Completed");

    return imageUrl;
  } catch (error) {
    console.error("Image-to-Image Error:", error.message);

    throw error;
  }
}

// ================================================================
// 🎥 VIDEO — Wan 2.2 5B Fast
// ================================================================

async function video({
  imageUrl,
  prompt,
  format = "landscape",
  resolution = "720p",
  numFrames = 121,
  fps = 24,
  sampleShift = 12,
  optimizePrompt = false,
  model = MODELS.VIDEO_WAN,
}) {
  if (!imageUrl) {
    throw new Error("imageUrl is required");
  }

  requirePrompt(prompt);
  requireReplicateToken();

  const FORMAT_MAP = {
    landscape: "16:9",
    portrait: "9:16",
    square: "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "1:1": "1:1",
    "4:3": "4:3",
    "3:4": "3:4",
  };

  const normalized = String(format || "")
    .toLowerCase()
    .trim();

  const aspectRatio = FORMAT_MAP[normalized] || "16:9";

  const frames = [81, 121].includes(Number(numFrames))
    ? Number(numFrames)
    : 121;

  const res = ["480p", "720p"].includes(resolution) ? resolution : "720p";

  const input = {
    image: imageUrl,
    prompt: prompt.trim(),
    go_fast: true,
    num_frames: frames,
    resolution: res,
    aspect_ratio: aspectRatio,
    sample_shift: sampleShift,
    optimize_prompt: Boolean(optimizePrompt),
    frames_per_second: fps,
  };

  console.log("🎥 [Wan] Input:", {
    aspectRatio,
    frames,
    resolution: res,
  });

  try {
    const output = await replicate.run(model, {
      input,
    });

    const videoUrl = extractVideoUrl(output);

    console.log("✅ [Wan] Video generated");

    return videoUrl;
  } catch (error) {
    console.error("❌ Wan Video Error:", error.message);
    throw error;
  }
}

// ================================================================
// ⚡ VIDEO FAST — Pruna P-Video
// ================================================================

async function videoFast({
  imageUrl,
  prompt,
  format = "landscape",
  duration = 10,
  resolution = "720p",
  fps = 24,
  saveAudio = true,
  draft = false,
  noOp = false,
  promptUpsampling = false,
  disableSafetyFilter = false,
  model = MODELS.VIDEO_PRUNE,
}) {
  if (!imageUrl) {
    throw new Error("imageUrl is required");
  }

  requirePrompt(prompt);
  requireReplicateToken();

  const FORMAT_MAP = {
    landscape: "16:9",
    portrait: "9:16",
    square: "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "1:1": "1:1",
    "4:3": "4:3",
    "3:4": "3:4",
  };

  const normalized = String(format || "")
    .toLowerCase()
    .trim();

  const aspectRatio = FORMAT_MAP[normalized] || "16:9";

  const dur = [5, 10].includes(Number(duration)) ? Number(duration) : 5;

  const res = ["480p", "720p"].includes(resolution) ? resolution : "720p";

  const input = {
    image: imageUrl,
    prompt: prompt.trim(),
    aspect_ratio: aspectRatio,
    duration: dur,
    resolution: res,
    fps,
    save_audio: Boolean(saveAudio),
    draft: Boolean(draft),
    no_op: Boolean(noOp),
    prompt_upsampling: Boolean(promptUpsampling),
    disable_safety_filter: Boolean(disableSafetyFilter),
  };

  console.log("⚡ [Pruna Video] Input:", {
    aspectRatio,
    duration: dur,
    resolution: res,
  });

  try {
    const output = await replicate.run(model, {
      input,
    });

    const videoUrl = extractVideoUrl(output);

    console.log("✅ [Pruna Video] Video generated");

    return videoUrl;
  } catch (error) {
    console.error("❌ Pruna Video Error:", error.message);
    throw error;
  }
}

// ================================================================
// 📦 EXPORTS
// ================================================================

module.exports = {
  MODELS,
  chat,
  vision,
  image,
  imageFast,
  imageToImage,
  video,
  videoFast,
  extractImageUrl,
  extractVideoUrl,
};
