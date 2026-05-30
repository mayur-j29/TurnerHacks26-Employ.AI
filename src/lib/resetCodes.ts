/** Server-side recovery code store (in-memory, 15 min expiry). */

export interface ResetEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, ResetEntry>();

const CODE_TTL_MS = 15 * 60 * 1000;

export function generateRecoveryCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function saveRecoveryCode(email: string, code: string): void {
  const normalized = email.trim().toLowerCase();
  store.set(normalized, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  });
}

export function verifyRecoveryCode(email: string, code: string): boolean {
  const normalized = email.trim().toLowerCase();
  const entry = store.get(normalized);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(normalized);
    return false;
  }
  if (entry.code !== code.trim()) return false;
  store.delete(normalized);
  return true;
}

export function hasActiveCode(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const entry = store.get(normalized);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(normalized);
    return false;
  }
  return true;
}
