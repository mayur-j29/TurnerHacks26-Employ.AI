const ACCOUNTS_KEY = "employAI_accounts";

export const DEMO_CREDENTIALS = {
  email: "demo@employ.ai",
  password: "demo1234",
};

function loadAccounts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    localStorage.removeItem(ACCOUNTS_KEY);
    return {};
  }
}

function saveAccounts(accounts: Record<string, string>): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function registerAccount(
  email: string,
  password: string
): { ok: true } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  const accounts = loadAccounts();
  if (accounts[normalized]) {
    return { ok: false, error: "An account with this email already exists." };
  }
  accounts[normalized] = password;
  saveAccounts(accounts);
  return { ok: true };
}

export function loginAccount(
  email: string,
  password: string
): { ok: true } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: "Enter your email and password." };
  }
  if (
    normalized === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    return { ok: true };
  }
  const accounts = loadAccounts();
  if (accounts[normalized] === password) {
    return { ok: true };
  }
  return { ok: false, error: "Invalid email or password." };
}

export function applyDemoCredentials(): {
  email: string;
  password: string;
} {
  return { ...DEMO_CREDENTIALS };
}

export function accountExists(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_CREDENTIALS.email) return false;
  const accounts = loadAccounts();
  return Boolean(accounts[normalized]);
}

export function resetAccountPassword(
  email: string,
  newPassword: string
): { ok: true } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !newPassword) {
    return { ok: false, error: "Email and new password are required." };
  }
  if (newPassword.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  if (normalized === DEMO_CREDENTIALS.email) {
    return { ok: false, error: "The demo account password cannot be reset." };
  }
  const accounts = loadAccounts();
  if (!accounts[normalized]) {
    return { ok: false, error: "No account found for this email." };
  }
  accounts[normalized] = newPassword;
  saveAccounts(accounts);
  return { ok: true };
}
