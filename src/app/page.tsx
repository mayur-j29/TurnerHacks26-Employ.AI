"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { PreparedFor } from "@/types";
import { DegreeCombobox } from "@/components/DegreeCombobox";
import {
  applyDemoCredentials,
  accountExists,
  loginAccount,
  registerAccount,
  resetAccountPassword,
} from "@/lib/auth";

const PREPARED_FOR: PreparedFor[] = [
  "University",
  "Job",
  "Internship",
  "Placement",
];

type AuthTab = "login" | "signup";
type AuthView = "login" | "signup" | "forgot-send" | "forgot-reset";

export default function AuthPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    degree,
    preparingFor,
    login,
    setPreparingFor,
    setDegree,
  } = useUser();

  const [phase, setPhase] = useState<"auth" | "onboarding">("auth");
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [email, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [devRecoveryCode, setDevRecoveryCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPreparedFor, setSelectedPreparedFor] =
    useState<PreparedFor | null>(null);
  const [selectedDegree, setSelectedDegree] = useState("");

  useEffect(() => {
    if (isAuthenticated && degree && preparingFor) {
      router.replace("/dashboard");
    } else if (isAuthenticated) {
      setPhase("onboarding");
    } else {
      setPhase("auth");
    }
  }, [isAuthenticated, degree, preparingFor, router]);

  const completeAuth = (userEmail: string) => {
    const { needsOnboarding } = login(userEmail);
    if (needsOnboarding) {
      setSelectedPreparedFor(null);
      setSelectedDegree("");
      setPhase("onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const result = loginAccount(email, password);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    completeAuth(email);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    const result = registerAccount(email, password);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    completeAuth(email);
  };

  const handleDemo = () => {
    const demo = applyDemoCredentials();
    setEmailInput(demo.email);
    setPassword(demo.password);
    setConfirmPassword(demo.password);
    setAuthTab("login");
    setAuthError("");
  };

  const finishOnboarding = () => {
    if (!selectedPreparedFor || !selectedDegree.trim()) return;
    setPreparingFor(selectedPreparedFor);
    setDegree(selectedDegree.trim());
    router.push("/dashboard");
  };

  const switchTab = (tab: AuthTab) => {
    setAuthTab(tab);
    setAuthView(tab);
    setAuthError("");
    setForgotMessage("");
    setDevRecoveryCode(null);
    setRecoveryCode("");
    setConfirmPassword("");
  };

  const openForgotPassword = () => {
    setAuthView("forgot-send");
    setAuthError("");
    setForgotMessage("");
    setDevRecoveryCode(null);
    setRecoveryCode("");
    setPassword("");
  };

  const handleSendRecoveryCode = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setForgotMessage("");
    setDevRecoveryCode(null);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setAuthError("Enter your account email.");
      return;
    }
    if (!accountExists(normalized)) {
      setAuthError("No account found with this email. Sign up instead.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        devCode?: string;
      };
      if (!res.ok || !data.ok) {
        setAuthError(data.error ?? "Could not send recovery code.");
        return;
      }
      setForgotMessage(data.message ?? "Recovery code sent.");
      if (data.devCode) setDevRecoveryCode(data.devCode);
      setAuthView("forgot-reset");
    } catch {
      setAuthError("Network error — could not send recovery code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const normalized = email.trim().toLowerCase();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (password.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const verifyRes = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, code: recoveryCode }),
      });
      const verifyData = (await verifyRes.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!verifyRes.ok || !verifyData.ok) {
        setAuthError(verifyData.error ?? "Invalid recovery code.");
        return;
      }

      const resetResult = resetAccountPassword(normalized, password);
      if (!resetResult.ok) {
        setAuthError(resetResult.error);
        return;
      }

      setForgotMessage("Password updated. Log in with your new password.");
      setPassword("");
      setConfirmPassword("");
      setRecoveryCode("");
      setDevRecoveryCode(null);
      setAuthView("login");
      setAuthTab("login");
    } catch {
      setAuthError("Could not reset password. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-[400px] animate-scale-in">
        {phase === "auth" ? (
          <div className="card p-8">
            <div className="mb-6 text-center">
              <p className="text-lg font-semibold text-zinc-100 tracking-tight">
                Employ<span className="text-cyan-400">.</span>AI
              </p>
            </div>

            {(authView === "login" || authView === "signup") && (
              <div className="flex border border-zinc-800 rounded-md overflow-hidden mb-6 text-sm">
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className={`flex-1 py-2.5 font-medium transition-colors ${
                    authTab === "login"
                      ? "bg-zinc-800 text-cyan-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("signup")}
                  className={`flex-1 py-2.5 font-medium border-l border-zinc-800 transition-colors ${
                    authTab === "signup"
                      ? "bg-zinc-800 text-cyan-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            {authView === "forgot-send" ? (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-medium text-zinc-100">
                    Reset password
                  </h1>
                  <p className="text-sm text-zinc-500 mt-1">
                    We&apos;ll email you a 6-digit recovery code
                  </p>
                </div>
                <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      Account email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs text-red-400">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isLoading ? "Sending…" : "Send recovery code"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className="w-full text-center text-xs text-zinc-500 hover:text-cyan-400 mt-6"
                >
                  ← Back to log in
                </button>
              </>
            ) : authView === "forgot-reset" ? (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-medium text-zinc-100">
                    Enter recovery code
                  </h1>
                  <p className="text-sm text-zinc-500 mt-1">
                    {forgotMessage || "Check your email for the 6-digit code."}
                  </p>
                </div>
                {devRecoveryCode && (
                  <div className="mb-4 rounded-md border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                    <p className="text-xs text-amber-400/80 mb-1">
                      SMTP not configured — use this code:
                    </p>
                    <p className="font-mono text-lg tracking-widest">
                      {devRecoveryCode}
                    </p>
                  </div>
                )}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="recovery-code"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      Recovery code
                    </label>
                    <input
                      id="recovery-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(e) =>
                        setRecoveryCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="123456"
                      className="input-field font-mono tracking-widest"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      New password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-new"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirm-new"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs text-red-400">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || recoveryCode.length !== 6}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isLoading ? "Resetting…" : "Reset password"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setAuthView("forgot-send")}
                  className="w-full text-center text-xs text-zinc-500 hover:text-cyan-400 mt-4"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className="w-full text-center text-xs text-zinc-500 hover:text-cyan-400 mt-2"
                >
                  ← Back to log in
                </button>
              </>
            ) : authTab === "login" ? (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-medium text-zinc-100">Log in</h1>
                  <p className="text-sm text-zinc-500 mt-1">
                    Welcome back — enter your credentials
                  </p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <AuthFields
                    email={email}
                    password={password}
                    onEmailChange={setEmailInput}
                    onPasswordChange={setPassword}
                    passwordAutoComplete="current-password"
                    onForgotPassword={openForgotPassword}
                  />
                  {forgotMessage && (
                    <p className="text-xs text-green-400">{forgotMessage}</p>
                  )}
                  {authError && (
                    <p className="text-xs text-red-400">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isLoading ? "Logging in…" : "Log in"}
                  </button>
                </form>
                <p className="text-center text-xs text-zinc-500 mt-6">
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signup")}
                    className="text-cyan-500 hover:text-cyan-400"
                  >
                    Create an account
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-medium text-zinc-100">Sign up</h1>
                  <p className="text-sm text-zinc-500 mt-1">
                    Create your Employ.AI account
                  </p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <AuthFields
                    email={email}
                    password={password}
                    onEmailChange={setEmailInput}
                    onPasswordChange={setPassword}
                    passwordAutoComplete="new-password"
                  />
                  <div>
                    <label
                      htmlFor="confirm"
                      className="block text-xs font-medium text-zinc-400 mb-1.5"
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs text-red-400">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isLoading ? "Creating account…" : "Sign up"}
                  </button>
                </form>
                <p className="text-center text-xs text-zinc-500 mt-6">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    className="text-cyan-500 hover:text-cyan-400"
                  >
                    Log in
                  </button>
                </p>
              </>
            )}

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleDemo}
                className="w-full btn-ghost text-sm"
              >
                Use demo account
              </button>
              <p className="text-center text-[10px] text-zinc-600 mt-2">
                demo@employ.ai · demo1234
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-lg font-medium text-zinc-100">
                Complete your profile
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Two quick steps, then you&apos;re in.
              </p>
            </div>

            <div className="card p-6 space-y-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Preparing for
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PREPARED_FOR.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedPreparedFor(option)}
                    className={`px-3 py-2.5 text-sm rounded-md border transition-colors ${
                      selectedPreparedFor === option
                        ? "border-cyan-600/60 bg-cyan-950/40 text-cyan-400"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Degree or field of study
              </p>
              <DegreeCombobox
                value={selectedDegree}
                onChange={setSelectedDegree}
              />
              <p className="text-xs text-zinc-600">
                Type any major — suggestions appear as you type.
              </p>
            </div>

            <button
              type="button"
              onClick={finishOnboarding}
              disabled={!selectedPreparedFor || !selectedDegree.trim()}
              className="w-full btn-primary disabled:opacity-40"
            >
              Continue to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  passwordAutoComplete,
  onForgotPassword,
}: {
  email: string;
  password: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  passwordAutoComplete: "current-password" | "new-password";
  onForgotPassword?: () => void;
}) {
  return (
    <>
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium text-zinc-400 mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="input-field"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-zinc-400"
          >
            Password
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-cyan-500/80 hover:text-cyan-400"
            >
              Forgot password?
            </button>
          )}
        </div>
        <input
          id="password"
          type="password"
          autoComplete={passwordAutoComplete}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="••••••••"
          className="input-field"
        />
      </div>
    </>
  );
}
