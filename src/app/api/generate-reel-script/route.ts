import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Memory & Disk cache for instant script generation (<50ms)
const scriptMemoryCache = new Map<string, string>();
const CACHE_DIR = path.join(process.cwd(), ".reel-script-cache");

function getCacheKey(data: Record<string, any>): string {
  const raw = `${data.language || "English"}_${data.productName || ""}_${data.craftType || ""}_${data.materials || ""}_${data.region || ""}_${data.artisanName || ""}_${data.hookTitle || ""}`.toLowerCase();
  return crypto.createHash("md5").update(raw).digest("hex");
}

function readCache(key: string): string | null {
  if (scriptMemoryCache.has(key)) {
    return scriptMemoryCache.get(key)!;
  }
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (data && data.script) {
        scriptMemoryCache.set(key, data.script);
        return data.script;
      }
    }
  } catch {}
  return null;
}

function writeCache(key: string, script: string) {
  try {
    scriptMemoryCache.set(key, script);
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(CACHE_DIR, `${key}.json`), JSON.stringify({ script, timestamp: Date.now() }), "utf-8");
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName = "",
      craftType = "",
      materials = "",
      region = "",
      artisanName = "",
      story = "",
      description = "",
      language = "English",
      hookTitle = "",
    } = body || {};

    if (!productName && !craftType) {
      return NextResponse.json(
        { success: false, error: "Product name or craft type is required." },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey({
      productName,
      craftType,
      materials,
      region,
      artisanName,
      hookTitle,
      language,
    });

    const cachedScript = readCache(cacheKey);
    if (cachedScript) {
      return NextResponse.json({ success: true, script: cachedScript, cached: true });
    }

    // Build intelligent prompt for Gemini 3.8 Flash
    const prompt = `You are a master cultural documentarian, National Geographic storyteller, and luxury art curator.
Write a concise, captivating 2 to 3 sentence spoken documentary narration script (approx 25 to 35 words total, taking 10 to 14 seconds when read out loud) for a video reel showcasing this Indian art item:

Item Details:
- Product Name: ${productName}
- Craft / Art Form: ${craftType || "Traditional Indian Craft"}
- Materials Used: ${materials || "Traditional materials"}
- Geographical Origin: ${region || "India"}
- Background Story / Technique: ${story || description || "A celebrated cultural craft form"}
- Video Story Hook / Title: ${hookTitle || productName}
- Narration Language: ${language}

CRITICAL EDITORIAL GUIDELINES:
1. FOCUS ON WHAT MAKES THE PRODUCT UNIQUE: Tell a real story about the item itself — its texture, form, historical technique, and cultural significance.
2. STRICT ZERO-REPETITION DISCIPLINE: Never use repetitive fluff. Do NOT repeat words like "handcrafted", "authentic", "heritage", "masterpiece", "tradition", or "handmade" multiple times. Use vivid, specific verbs and sensory nouns instead (e.g. "forged", "sculpted", "woven from pure tussar silk", "cast in bell metal", "painted with natural earth pigments", "carved from fragrant wood").
3. DO NOT mention account usernames, placeholder names, or phrases like "brought to life by artisan ...". End with a graceful, poetic tribute to the art form or enduring Indian craft culture.
4. DO NOT include greetings, intro phrases like "Welcome to", quotes, markdown bolding, hashtags, emojis, or sound effect cues.
5. Output ONLY the raw spoken text in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    let generatedScript = (response.text || "").trim();

    // Clean any quotes or markdown
    generatedScript = generatedScript
      .replace(/^["']|["']$/g, "")
      .replace(/\*\*/g, "")
      .replace(/[\n\r]+/g, " ")
      .trim();

    if (!generatedScript || generatedScript.length < 15) {
      throw new Error("Generated script too short");
    }

    writeCache(cacheKey, generatedScript);

    return NextResponse.json({
      success: true,
      script: generatedScript,
      cached: false,
    });
  } catch (error: any) {
    console.error("Reel script generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate script",
      },
      { status: 500 }
    );
  }
}
