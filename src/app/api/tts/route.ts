import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Persistent memory cache for TTS audio
const ttsMemoryCache = new Map<string, { audioBase64: string; mimeType: string }>();

const CACHE_DIR = path.join(process.cwd(), ".tts-cache");

function getCacheKey(text: string, voice: string, lang: string): string {
  const raw = `${lang}_${voice}_${text.trim().toLowerCase().slice(0, 100)}`;
  return raw.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80);
}

function readDiskCache(key: string): { audioBase64: string; mimeType: string } | null {
  try {
    if (ttsMemoryCache.has(key)) return ttsMemoryCache.get(key)!;
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      ttsMemoryCache.set(key, data);
      return data;
    }
  } catch {}
  return null;
}

function writeDiskCache(key: string, data: { audioBase64: string; mimeType: string }) {
  try {
    ttsMemoryCache.set(key, data);
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(data), "utf-8");
  } catch {}
}

// Clean text for speech synthesis to avoid robotic reading of codes, symbols, or lists
function sanitizeSpeechText(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText
    .replace(/[#*_~`\\[\]()<>]/g, " ") // Remove markdown & code symbols
    .replace(/\b(pack of \d+|sku|ref|id|code|qty):\s*\w+/gi, "") // Remove internal codes
    .replace(/\b₹\s*(\d+)/gi, "$1 rupees") // Say "rupees" instead of symbol
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  // Add natural SSML-like punctuation for pauses and human rhythm
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}

// Add standard 44-byte RIFF/WAVE header to raw PCM data so every browser decodes it natively
function addWavHeader(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voiceName = "Charon", style, language = "English" } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanText = sanitizeSpeechText(text);
    const chosenVoice = voiceName || "Charon";

    // Check disk/memory cache first for instant (< 5ms) zero-quota playback
    const cacheKey = getCacheKey(cleanText, chosenVoice, language);
    const cached = readDiskCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
        modelUsed: "cache",
      });
    }

    const defaultStyle =
      language === "Hindi"
        ? "डिस्कवरी चैनल और नेशनल ज्योग्राफिक जैसा आत्मीय, गहरा, शांत और सौम्य भारतीय वृत्तचित्र पुरुष वाचक। स्वाभाविक मानवीय सांस, सहज विराम, गरिमामयी ठहराव और मखमली स्वर। किसी भी प्रकार की कृत्रिम या रोबोटिक ध्वनि नहीं।"
        : "Deep, calm, warm, and captivating Discovery Channel male documentary narrator. Speaks in a calm, relaxed, intimate cadence with natural human warmth, gentle pauses, and rich resonant depth. Unhurried, poetic, and soothing. Never robotic, brisk, or synthetic.";

    const narrationStyle = style || defaultStyle;

    // Prioritize working Gemini audio models per @google/genai guidelines
    const ttsModels = [
      "gemini-2.5-flash-preview-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-3.8-flash-tts",
      "gemini-2.5-pro-preview-tts",
      "gemini-3.1-flash-tts-preview",
    ];
    let lastError: Error | null = null;

    for (const model of ttsModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: narrationStyle,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find(
          (p: any) => p.inlineData && p.inlineData.data
        );

        if (audioPart && audioPart.inlineData?.data) {
          const rawBase64 = audioPart.inlineData.data;
          const mime = audioPart.inlineData.mimeType || "audio/pcm";

          let finalBase64 = rawBase64;
          let finalMime = "audio/wav";

          // If the model output is raw PCM (e.g. audio/L16 or audio/pcm), wrap in standard WAV container
          if (!mime.includes("wav")) {
            const pcmBuffer = Buffer.from(rawBase64, "base64");
            const wavBuffer = addWavHeader(pcmBuffer, 24000, 1, 16);
            finalBase64 = wavBuffer.toString("base64");
          } else {
            finalMime = mime;
          }

          const responseData = {
            audioBase64: finalBase64,
            mimeType: finalMime,
          };

          // Save to memory & disk cache
          writeDiskCache(cacheKey, responseData);

          return NextResponse.json({
            ...responseData,
            modelUsed: model,
          });
        }
      } catch (err: any) {
        console.warn(`TTS generation with model ${model} failed, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }

    return NextResponse.json(
      { error: lastError?.message || "Failed to generate speech with available AI models" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate speech" },
      { status: 500 }
    );
  }
}
