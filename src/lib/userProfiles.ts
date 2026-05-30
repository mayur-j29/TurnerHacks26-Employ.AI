import { PreparedFor } from "@/types";

const PROFILES_KEY = "employAI_profiles";
const SESSION_KEY = "employAI_session";

export interface UserProfile {
  degree: string | null;
  preparingFor: PreparedFor | null;
  tutorialCompleted: boolean;
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string | null;
}

function loadProfiles(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    localStorage.removeItem(PROFILES_KEY);
    return {};
  }
}

function saveProfiles(profiles: Record<string, UserProfile>): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function loadUserProfile(email: string): UserProfile | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return loadProfiles()[normalized] ?? null;
}

export function saveUserProfile(email: string, profile: UserProfile): void {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  const profiles = loadProfiles();
  profiles[normalized] = profile;
  saveProfiles(profiles);
}

export function clearUserProfile(email: string): void {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  const profiles = loadProfiles();
  delete profiles[normalized];
  saveProfiles(profiles);
}

export function loadSession(): UserSession {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, email: null };
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { isAuthenticated: false, email: null };
    const parsed = JSON.parse(raw) as UserSession;
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      email: typeof parsed.email === "string" ? parsed.email : null,
    };
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return { isAuthenticated: false, email: null };
  }
}

export function saveSessionState(session: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSessionState(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Migrate legacy single-user blob into per-account storage. */
export function migrateLegacyUserStorage(): void {
  if (typeof window === "undefined") return;
  const legacy = localStorage.getItem("employAIUser");
  if (!legacy) return;
  try {
    const parsed = JSON.parse(legacy) as Record<string, unknown>;
    const email =
      typeof parsed.email === "string" ? parsed.email.trim().toLowerCase() : null;
    if (email && (parsed.degree || parsed.preparingFor)) {
      const existing = loadUserProfile(email);
      if (!existing) {
        saveUserProfile(email, {
          degree: typeof parsed.degree === "string" ? parsed.degree : null,
          preparingFor: (parsed.preparingFor as PreparedFor | null) ?? null,
          tutorialCompleted: Boolean(parsed.tutorialCompleted),
        });
      }
      if (parsed.isAuthenticated) {
        saveSessionState({ isAuthenticated: true, email });
      }
    }
  } catch {
    /* ignore corrupt legacy data */
  }
  localStorage.removeItem("employAIUser");
}
