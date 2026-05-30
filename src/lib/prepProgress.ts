const LEGACY_QUIZ_KEY = "employAI_quizCompleted";

function quizKey(email: string): string {
  return `employAI_quizCompleted_${email.trim().toLowerCase()}`;
}

export function isQuizCompleted(email?: string | null): boolean {
  if (typeof window === "undefined" || !email) return false;
  const key = quizKey(email);
  if (localStorage.getItem(key) === "true") return true;
  if (localStorage.getItem(LEGACY_QUIZ_KEY) === "true") {
    localStorage.setItem(key, "true");
    localStorage.removeItem(LEGACY_QUIZ_KEY);
    return true;
  }
  return false;
}

export function markQuizCompleted(email: string): void {
  localStorage.setItem(quizKey(email), "true");
}
