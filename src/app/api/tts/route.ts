import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export async function POST(req: NextRequest) {
  try {
    const { text, voiceName = "Charon", style, language = "English" } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanText = sanitizeSpeechText(text);

    const defaultStyle =
      language === "Hindi"
        ? "आत्मीय, गंभीर, शांत भारतीय हस्तशिल्प वृत्तचित्र वाचक। स्वाभाविक मानवीय लय, हल्के विराम और मधुर स्वर।"
        : "Warm, dignified, calm artisanal documentary narrator. Human cadence with gentle pauses, resonant tone, and poetic pacing. Never robotic, hurried, or flat.";

    const narrationStyle = style || defaultStyle;

    // Try active Gemini models with AUDIO response modality
    const ttsModels = [
      "gemini-3.5-flash",
      "gemini-3.8-flash-tts",
      "gemini-3.1-flash-tts-preview",
      "gemini-3.8-flash-lite-tts",
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
                prebuiltVoiceConfig: { voiceName: voiceName || "Charon" },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find(
          (p: any) => p.inlineData && p.inlineData.data
        );

        if (audioPart && audioPart.inlineData?.data) {
          return NextResponse.json({
            audioBase64: audioPart.inlineData.data,
            mimeType: audioPart.inlineData.mimeType || "audio/wav",
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
