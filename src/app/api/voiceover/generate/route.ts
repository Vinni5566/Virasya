import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SARVAM_LANG_MAP: Record<string, { code: string; defaultSpeaker: string }> = {
  English: { code: "en-IN", defaultSpeaker: "arvind" },
  Hindi: { code: "hi-IN", defaultSpeaker: "arvind" },
  Tamil: { code: "ta-IN", defaultSpeaker: "arvind" },
  Telugu: { code: "te-IN", defaultSpeaker: "arvind" },
  Bengali: { code: "bn-IN", defaultSpeaker: "arvind" },
  Marathi: { code: "mr-IN", defaultSpeaker: "arvind" },
  Gujarati: { code: "gu-IN", defaultSpeaker: "arvind" },
  Kannada: { code: "kn-IN", defaultSpeaker: "arvind" },
  Malayalam: { code: "ml-IN", defaultSpeaker: "arvind" },
  Punjabi: { code: "pa-IN", defaultSpeaker: "arvind" },
  Odia: { code: "od-IN", defaultSpeaker: "arvind" },
};

function addWavHeader(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

function sanitizeSpeechText(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText
    .replace(/[#*_~`\\[\]()<>]/g, " ")
    .replace(/\b(pack of \d+|sku|ref|id|code|qty):\s*\w+/gi, "")
    .replace(/\b₹\s*(\d+)/gi, "$1 rupees")
    .replace(/\s+/g, " ")
    .trim();

  if (!/[.!?।]$/.test(cleaned)) {
    cleaned += ".";
  }
  return cleaned;
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
      return NextResponse.json({ error: "Product details required" }, { status: 400 });
    }

    // 1. Generate clean, non-repetitive documentary script
    let script = "";
    try {
      const prompt = `You are a master cultural documentarian and luxury art curator.
Write a concise 2 to 3 sentence spoken documentary narration script (approx 25 to 35 words total, taking 10 to 14 seconds when spoken) for a video reel showcasing this Indian art item:

Item Details:
- Product Name: ${productName}
- Craft: ${craftType || "Traditional Indian Craft"}
- Materials: ${materials || "Traditional materials"}
- Region: ${region || "India"}
- Story/Technique: ${story || description || "A celebrated cultural craft form"}
- Video Story Hook: ${hookTitle || productName}
- Narration Language: ${language}

CRITICAL RULES:
1. FOCUS ON THE PRODUCT: Tell a captivating story about the product's origin, form, texture, and cultural lineage.
2. ZERO REPETITION: Never repeat words like "handcrafted", "authentic", "heritage", or "masterpiece" multiple times. Use vivid verbs (e.g. woven, cast, carved, sculpted, molded).
3. DO NOT mention account usernames, placeholder names, or phrases like "brought to life by artisan ...". End with a graceful, poetic tribute to the art form or enduring Indian craft culture.
4. NO introductory greetings or sound effect cues.
5. Output ONLY the spoken narration in ${language}.`;

      const aiRes = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
      script = (aiRes.text || "").trim().replace(/^["']|["']$/g, "").replace(/\*\*/g, "").replace(/[\n\r]+/g, " ").trim();
    } catch {
      // Clean fallback script
      if (language === "Hindi") {
        script = `${region ? region + " की समृद्ध परंपरा से, " : ""}प्रस्तुत है ${productName}। ${materials ? materials + " से निर्मित, इसका प्रत्येक पहलू कलात्मक उत्कृष्टता दर्शाता है।" : ""} भारतीय सांस्कृतिक धरोहर और पारंपरिक कला का एक अनुपम प्रतीक।`;
      } else {
        script = `From the rich artisan traditions of ${region || "India"}, presenting the ${productName}. ${materials ? "Formed from " + materials + ", every line captures meticulous human devotion." : "Rooted in timeless artistic tradition."} A timeless celebration of enduring Indian artistic culture.`;
      }
    }

    if (!script || script.length < 10) {
      script = `Presenting the ${productName}, created with generational skill and enduring cultural devotion.`;
    }

    const cleanScript = sanitizeSpeechText(script);

    // 2. Synthesize High-Definition Audio using Sarvam AI as Primary Engine
    const sarvamApiKey =
      process.env.SARVAM_API_KEY ||
      process.env.SARVAM_AI_API_KEY ||
      process.env.SARVAM_KEY;

    if (sarvamApiKey && sarvamApiKey.trim().length > 0) {
      try {
        const langConfig = SARVAM_LANG_MAP[language] || SARVAM_LANG_MAP["English"];
        const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": sarvamApiKey.trim(),
          },
          body: JSON.stringify({
            inputs: [cleanScript],
            target_language_code: langConfig.code,
            speaker: langConfig.defaultSpeaker,
            pitch: 0,
            pace: 0.88,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: "bulbul:v1",
          }),
        });

        if (sarvamRes.ok) {
          const sarvamData = await sarvamRes.json();
          const base64Audio = sarvamData?.audios?.[0];
          if (base64Audio) {
            return NextResponse.json({
              success: true,
              audioBase64: base64Audio,
              mimeType: "audio/wav",
              script: cleanScript,
              provider: "sarvam",
              language,
            });
          }
        }
      } catch (err) {
        console.warn("Sarvam generation failed in generate endpoint:", err);
      }
    }

    // 3. Backup Engine: Gemini Studio TTS
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanScript,
                speechMetadata: {
                  style: "Deep, calm, warm, and captivating documentary narrator.",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Charon" },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.data);
      if (audioPart && audioPart.inlineData?.data) {
        const rawBase64 = audioPart.inlineData.data;
        const mime = audioPart.inlineData.mimeType || "audio/pcm";
        let finalBase64 = rawBase64;
        if (!mime.includes("wav")) {
          const pcmBuffer = Buffer.from(rawBase64, "base64");
          const wavBuffer = addWavHeader(pcmBuffer, 24000, 1, 16);
          finalBase64 = wavBuffer.toString("base64");
        }
        return NextResponse.json({
          success: true,
          audioBase64: finalBase64,
          mimeType: "audio/wav",
          script: cleanScript,
          provider: "gemini",
          language,
        });
      }
    } catch (gErr: any) {
      console.warn("Gemini Studio TTS backup failed in generate endpoint:", gErr?.message || gErr);
    }

    return NextResponse.json({
      success: true,
      audioBase64: "",
      mimeType: "audio/wav",
      script: cleanScript,
      provider: "fallback",
      language,
    });
  } catch (error: any) {
    console.error("Voiceover generate route error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate voiceover" }, { status: 500 });
  }
}
