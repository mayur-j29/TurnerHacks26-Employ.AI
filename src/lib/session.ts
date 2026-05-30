import { SessionReport } from "@/types/session";

const SESSION_KEY = "employAI_lastSession";
const LOGS_KEY = "employAI_practiceLogs";

function logsStorageKey(email: string): string {
  return `${LOGS_KEY}_${email.trim().toLowerCase()}`;
}

export interface PracticeStats {
  totalSessions: number;
  avgWpm: number;
  avgFillers: number;
  avgLighting: number;
  avgStarScore: number;
  recentSessions: SessionReport[];
}

function starScore(star: SessionReport["star"]): number {
  return Object.values(star).filter(Boolean).length;
}

export function appendPracticeLog(
  report: SessionReport,
  email?: string | null
): void {
  const withId: SessionReport = {
    ...report,
    id: report.id ?? `sess-${Date.now()}`,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(withId));

  if (!email) return;
  const logs = loadPracticeLogs(email);
  logs.unshift(withId);
  localStorage.setItem(logsStorageKey(email), JSON.stringify(logs.slice(0, 50)));
}

export function loadPracticeLogs(email?: string | null): SessionReport[] {
  if (typeof window === "undefined") return [];
  if (!email) return [];

  const key = logsStorageKey(email);
  const raw = localStorage.getItem(key);

  // One-time migration from shared logs key
  if (!raw) {
    const legacy = localStorage.getItem(LOGS_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as SessionReport[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 50)));
          localStorage.removeItem(LOGS_KEY);
          return parsed;
        }
      } catch {
        localStorage.removeItem(LOGS_KEY);
      }
    }
    const legacySession = sessionStorage.getItem(SESSION_KEY);
    if (legacySession) {
      try {
        const one = JSON.parse(legacySession) as SessionReport;
        return [{ ...one, id: one.id ?? "legacy-1" }];
      } catch {
        return [];
      }
    }
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionReport[]) : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

export function loadSession(email?: string | null): SessionReport | null {
  const logs = loadPracticeLogs(email);
  if (logs.length > 0) return logs[0];
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionReport;
  } catch {
    return null;
  }
}

export function getSessionById(
  email: string | null | undefined,
  id: string
): SessionReport | null {
  const logs = loadPracticeLogs(email);
  return logs.find((s) => s.id === id) ?? null;
}

export function saveSession(
  report: SessionReport,
  email?: string | null
): void {
  appendPracticeLog(report, email);
}

export function computePracticeStats(logs: SessionReport[]): PracticeStats {
  if (logs.length === 0) {
    return {
      totalSessions: 0,
      avgWpm: 0,
      avgFillers: 0,
      avgLighting: 0,
      avgStarScore: 0,
      recentSessions: [],
    };
  }
  const n = logs.length;
  const sum = logs.reduce(
    (acc, s) => ({
      wpm: acc.wpm + s.wordsPerMinute,
      fillers: acc.fillers + s.fillerWordCount,
      lighting: acc.lighting + s.lightingScore,
      star: acc.star + starScore(s.star),
    }),
    { wpm: 0, fillers: 0, lighting: 0, star: 0 }
  );
  return {
    totalSessions: n,
    avgWpm: Math.round(sum.wpm / n),
    avgFillers: Math.round((sum.fillers / n) * 10) / 10,
    avgLighting: Math.round(sum.lighting / n),
    avgStarScore: Math.round((sum.star / n) * 10) / 10,
    recentSessions: logs.slice(0, 8),
  };
}

const FILLER_PATTERNS: RegExp[] = [
  /\b(u+h+h*|uh+h*|u+m+m*h*|um+m*|erm+|er+r*|ah+h*|hm+m*|mhm+)\b/gi,
  /\b(you\s+know|i\s+mean|sort\s+of|kind\s+of)\b/gi,
  /\b(basically|actually|literally|obviously|honestly|right)\b/gi,
];

/** Standalone "like" / "so" / "well" only when surrounded by pauses or at sentence starts — kept conservative */
const FILLER_LOOSE = /\b(like|so|well|okay|ok)\b(?=\s*[,.]|\s+(you|i|it|that|this|um|uh)\b)/gi;

export function detectFillerWords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const pattern of FILLER_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(lower)) !== null) {
      found.push(match[0]);
    }
  }

  FILLER_LOOSE.lastIndex = 0;
  let loose: RegExpExecArray | null;
  while ((loose = FILLER_LOOSE.exec(lower)) !== null) {
    found.push(loose[0]);
  }

  return found;
}

export function countFillerWords(text: string): number {
  return detectFillerWords(text).length;
}

export function computeWpm(text: string, durationSeconds: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (durationSeconds < 1) return 0;
  return Math.round(words / (durationSeconds / 60));
}

export function analyzeStar(text: string): SessionReport["star"] {
  const t = text.toLowerCase();
  return {
    situation:
      /\b(when|while|at|during|situation|context|company|team|project)\b/.test(
        t
      ) && t.length > 40,
    task:
      /\b(task|goal|responsible|needed to|assigned|objective|role)\b/.test(t),
    action:
      /\b(i\s+(built|led|created|implemented|designed|worked|developed|fixed|managed))\b/.test(
        t
      ) || /\b(we\s+(built|launched|shipped))\b/.test(t),
    result:
      /\b(result|outcome|increased|reduced|improved|saved|achieved|%|\d+\s*(%|k|m|users|percent))\b/.test(
        t
      ),
  };
}

export function lightingFromScore(score: number): string {
  if (score >= 70) return "Good — face is well lit and visible.";
  if (score >= 45) return "Fair — try facing a window or lamp in front of you.";
  return "Low — add light in front of you; avoid strong backlight.";
}

export function buildFeedbackSummary(
  report: Pick<
    SessionReport,
    "wordsPerMinute" | "fillerWordCount" | "star" | "lightingScore" | "transcript"
  >
): string {
  const parts: string[] = [];
  if (report.wordsPerMinute < 100) {
    parts.push("Pace is slow — aim for 120–150 words per minute.");
  } else if (report.wordsPerMinute > 170) {
    parts.push("Pace is fast — pause briefly between points.");
  } else {
    parts.push("Speaking pace is in a solid range.");
  }
  if (report.fillerWordCount > 6) {
    parts.push(`Reduce filler words (${report.fillerWordCount} detected).`);
  }
  const starCount = Object.values(report.star).filter(Boolean).length;
  if (starCount < 3) {
    parts.push("Strengthen STAR structure: situation, task, action, and result.");
  } else {
    parts.push("STAR structure is present — tighten quantified results if possible.");
  }
  if (report.transcript.trim().length < 80) {
    parts.push("Answer was short — expand with one concrete example.");
  }
  return parts.join(" ");
}
