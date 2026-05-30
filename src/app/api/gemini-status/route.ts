import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message: "No Gemini API key in .env.local",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
    const response = await ai.models.generateContent({
      model,
      contents: "Reply with exactly: ok",
    });
    const text = response.text?.trim();
    return NextResponse.json({
      ok: true,
      configured: true,
      message: text ? "Gemini API connected." : "Gemini responded.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      configured: true,
      message:
        msg.includes("401") || msg.includes("UNAUTHENTICATED")
          ? "API key is invalid or expired. Generate a new one at aistudio.google.com/apikey"
          : msg.slice(0, 200),
    });
  }
}
