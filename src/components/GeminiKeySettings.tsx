"use client";

import { useEffect, useState } from "react";
import { setGeminiApiKey, hasGeminiApiKey } from "@/lib/geminiKey";

export function GeminiKeySettings({ compact }: { compact?: boolean }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    setConfigured(hasGeminiApiKey());
    fetch("/api/gemini-status")
      .then((r) => r.json())
      .then((data: { ok?: boolean; message?: string; configured?: boolean }) => {
        setServerOk(data.ok ?? false);
        setServerStatus(data.message ?? null);
        if (data.configured && data.ok) setConfigured(true);
      })
      .catch(() => setServerStatus("Could not check server key."));
  }, [saved]);

  const handleSave = () => {
    setGeminiApiKey(key);
    setConfigured(hasGeminiApiKey());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className={compact ? "" : "card p-5 space-y-3"}>
      {!compact && (
        <>
          <h2 className="text-sm font-medium text-zinc-300">AI analysis (Google Gemini)</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Detects filler words like &quot;uhhh&quot; and &quot;ummmm&quot; from your
            recording audio. Key is loaded from{" "}
            <code className="text-zinc-400">.env.local</code> on the server, or paste
            one below as backup. Get a key at{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-500 hover:text-cyan-400"
            >
              Google AI Studio
            </a>
            .
          </p>
        </>
      )}
      {serverStatus && (
        <p
          className={`text-xs ${serverOk ? "text-green-400/80" : "text-amber-400/90"}`}
        >
          {serverOk ? "✓ " : "⚠ "}
          {serverStatus}
        </p>
      )}
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={configured ? "••••••••••••••••" : "AIza... or AQ...."}
          className="input-field flex-1 text-sm"
        />
        <button type="button" onClick={handleSave} className="btn-primary text-xs shrink-0">
          {saved ? "Saved" : "Save key"}
        </button>
      </div>
      {configured && !serverOk && (
        <p className="text-xs text-zinc-600">
          Browser key saved as backup when server key is missing or invalid.
        </p>
      )}
    </section>
  );
}
