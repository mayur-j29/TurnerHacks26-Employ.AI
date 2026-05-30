"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { PythonEditor } from "@/components/PythonEditor";
import { useUser } from "@/context/UserContext";
import { CODING_PROBLEMS, CodingProblem } from "@/lib/degreeContent";
import { runPythonTests, TestResult } from "@/lib/codingRunner";
import { shouldShowCoding } from "@/lib/degreeProfile";

export default function CodingPage() {
  const router = useRouter();
  const { degree, preparingFor, isAuthenticated } = useUser();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [code, setCode] = useState(CODING_PROBLEMS[0].starterCode);
  const [showHints, setShowHints] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const showCoding = shouldShowCoding(degree, preparingFor);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
    if (mounted && !showCoding) router.replace("/dashboard");
  }, [mounted, isAuthenticated, showCoding, router]);

  const selectProblem = (p: CodingProblem) => {
    setActive(p);
    setCode(p.starterCode);
    setShowHints(false);
    setResults(null);
    setRunError(null);
  };

  const handleRunTests = async () => {
    setRunning(true);
    setResults(null);
    setRunError(null);
    try {
      const testResults = await runPythonTests(code, active.tests);
      setResults(testResults);
    } catch (err) {
      setRunError(
        err instanceof Error ? err.message : "Could not run tests. Check your connection."
      );
    } finally {
      setRunning(false);
    }
  };

  if (!mounted || !showCoding) return <PageLoader />;

  const allPassed = results?.every((r) => r.passed) ?? false;

  return (
    <AppShell
      title="Coding problems"
      subtitle="LeetCode-style practice for technical interviews"
    >
      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl">
        <aside className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {CODING_PROBLEMS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProblem(p)}
              className={`w-full text-left card p-4 transition-all duration-200 animate-fade-in-up opacity-0 ${
                active.id === p.id
                  ? "border-cyan-700/50 bg-cyan-950/20"
                  : "hover:border-zinc-700"
              }`}
              style={{ animationDelay: `${i * 0.04}s`, animationFillMode: "forwards" }}
            >
              <p className="text-sm font-medium text-zinc-200">{p.title}</p>
              <p className="text-xs text-zinc-500 mt-1">{p.difficulty}</p>
            </button>
          ))}
          <Link href="/learn" className="block text-xs text-zinc-500 hover:text-cyan-400 pt-2">
            ← Learn topics
          </Link>
        </aside>

        <div key={active.id} className="lg:col-span-2 space-y-4 animate-fade-in-up">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium text-zinc-200">{active.title}</h2>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded border border-zinc-700 text-zinc-500">
                {active.difficulty}
              </span>
            </div>
            <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed">
              {active.description}
            </pre>
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 text-xs text-zinc-500">
              solution.py
            </div>
            <PythonEditor value={code} onChange={setCode} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunTests}
              disabled={running}
              className="btn-primary text-xs disabled:opacity-50"
            >
              {running ? "Running tests…" : "Run tests"}
            </button>
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="btn-ghost text-xs"
            >
              {showHints ? "Hide hints" : "Hints"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCode(active.starterCode);
                setResults(null);
                setRunError(null);
              }}
              className="btn-ghost text-xs"
            >
              Reset
            </button>
          </div>

          {runError && (
            <p className="text-sm text-red-400">{runError}</p>
          )}

          {results && (
            <div
              className={`card p-4 space-y-2 ${
                allPassed ? "border-green-800/40" : "border-red-900/40"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  allPassed ? "text-green-400" : "text-red-400"
                }`}
              >
                {allPassed
                  ? `All ${results.length} tests passed`
                  : `${results.filter((r) => r.passed).length} / ${results.length} tests passed`}
              </p>
              <ul className="space-y-1">
                {results.map((r) => (
                  <li
                    key={r.name}
                    className={`text-xs ${
                      r.passed ? "text-green-400/80" : "text-red-400/90"
                    }`}
                  >
                    {r.passed ? "✓" : "✗"} {r.name}
                    {!r.passed && r.message ? ` — ${r.message}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showHints && (
            <ul className="card p-4 space-y-2">
              {active.hints.map((h) => (
                <li key={h} className="text-sm text-zinc-500">
                  • {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
