import { GoogleGenAI } from "@google/genai";
import { SessionReport } from "@/types/session";

export interface GeminiAnalysisResult {
  transcript: string;
  fillerWordCount: number;
  fillerWords: string[];
  wordsPerMinute: number;
  star: SessionReport["star"];
  feedbackSummary: string;
  analyzedByAi: true;
}

const ANALYSIS_PROMPT = `You are an expert interview coach analyzing a practice interview answer from AUDIO.

Listen carefully to the recording. Your transcript MUST include every filler word and disfluency you hear: um, uh, uhhh, ummmm, er, ah, hmm, like (when used as filler), you know, I mean, basically, actually, sort of, kind of, so (when filler), etc.

The browser may have provided a partial transcript that often OMITS fillers — trust the audio over the browser text.

Return ONLY valid JSON with this exact shape:
{
  "transcript": "full transcript including all fillers exactly as spoken",
  "fillerWords": ["um", "uh", ...],
  "fillerWordCount": 0,
  "wordsPerMinute": 0,
  "star": { "situation": false, "task": false, "action": false, "result": false },
  "feedbackSummary": "2-3 sentences of specific, actionable feedback"
}

Rules:
- fillerWordCount must equal fillerWords.length
- Count each filler occurrence separately in fillerWords
- wordsPerMinute: count substantive words only, exclude fillers, based on audio duration
- star: true only if that STAR element is clearly present in the answer
- Be honest about high filler usage — if they say uhhh/ummm many times, count them all`;

function friendlyGeminiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("401") || msg.includes("UNAUTHENTICATED") || msg.includes("API key")) {
    return "Invalid Gemini API key. Create a new key at aistudio.google.com/apikey (starts with AIzaSy or AQ.) and add it to .env.local as GOOGLE_GEMINI_API_KEY.";
  }
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "Gemini rate limit reached. Wait a minute and try again.";
  }
  if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
    return "Gemini API access denied. Enable the Generative Language API for your key.";
  }
  return msg.slice(0, 240);
}

export async function analyzeInterviewWithGemini(
  audioBase64: string,
  mimeType: string,
  context: {
    question: string;
    roleTitle: string;
    durationSeconds: number;
    browserTranscript?: string;
    degree?: string;
  },
  apiKey: string
): Promise<GeminiAnalysisResult> {
  const contextText = [
    ANALYSIS_PROMPT,
    "",
    `Interview question: ${context.question}`,
    `Role: ${context.roleTitle}`,
    `Recording duration: ${context.durationSeconds} seconds`,
    context.degree ? `Candidate degree/field: ${context.degree}` : "",
    context.browserTranscript
      ? `Browser speech transcript (often missing fillers — verify against audio): ${context.browserTranscript}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const ai = new GoogleGenAI({ apiKey });

  let rawText: string;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: audioBase64 } },
            { text: contextText },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    rawText = response.text ?? "";
    if (!rawText) throw new Error("Gemini returned an empty response.");
  } catch (err) {
    throw new Error(friendlyGeminiError(err));
  }

  let parsed: Partial<GeminiAnalysisResult>;
  try {
    parsed = JSON.parse(rawText) as Partial<GeminiAnalysisResult>;
  } catch {
    throw new Error("Gemini returned invalid JSON. Try recording again.");
  }

  const fillerWords = Array.isArray(parsed.fillerWords)
    ? parsed.fillerWords.map(String)
    : [];

  return {
    transcript: String(parsed.transcript ?? context.browserTranscript ?? ""),
    fillerWords,
    fillerWordCount:
      typeof parsed.fillerWordCount === "number"
        ? parsed.fillerWordCount
        : fillerWords.length,
    wordsPerMinute:
      typeof parsed.wordsPerMinute === "number" ? parsed.wordsPerMinute : 0,
    star: {
      situation: Boolean(parsed.star?.situation),
      task: Boolean(parsed.star?.task),
      action: Boolean(parsed.star?.action),
      result: Boolean(parsed.star?.result),
    },
    feedbackSummary: String(
      parsed.feedbackSummary ?? "Review your pacing and reduce filler words."
    ),
    analyzedByAi: true,
  };
}
