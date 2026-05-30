import { NextResponse } from "next/server";
import { analyzeInterviewWithGemini } from "@/lib/geminiAnalysis";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      audioBase64?: string;
      mimeType?: string;
      question?: string;
      roleTitle?: string;
      durationSeconds?: number;
      browserTranscript?: string;
      degree?: string;
      apiKey?: string;
    };

    const apiKey =
      process.env.GOOGLE_GEMINI_API_KEY?.trim() ||
      body.apiKey?.trim() ||
      process.env.GOOGLE_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No Google Gemini API key. Add GOOGLE_GEMINI_API_KEY to .env.local or paste your key in Dashboard → AI settings.",
        },
        { status: 400 }
      );
    }

    if (!body.audioBase64 || !body.mimeType) {
      return NextResponse.json(
        { ok: false, error: "No audio recording found." },
        { status: 400 }
      );
    }

    const analysis = await analyzeInterviewWithGemini(
      body.audioBase64,
      body.mimeType,
      {
        question: body.question ?? "Interview practice",
        roleTitle: body.roleTitle ?? "Practice",
        durationSeconds: body.durationSeconds ?? 0,
        browserTranscript: body.browserTranscript,
        degree: body.degree,
      },
      apiKey
    );

    return NextResponse.json({ ok: true, ...analysis });
  } catch (err) {
    console.error("[analyze-interview]", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Analysis failed. Check your API key and try again.",
      },
      { status: 500 }
    );
  }
}
