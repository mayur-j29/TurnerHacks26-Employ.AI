const STORAGE_KEY = "employAI_geminiKey";

export function getGeminiApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY)?.trim() || null;
}

export function setGeminiApiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}
