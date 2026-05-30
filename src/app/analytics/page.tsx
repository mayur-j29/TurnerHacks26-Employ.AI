"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { getSessionById, loadSession } from "@/lib/session";
import { SessionReport } from "@/types/session";

const STAR_LABELS: { key: keyof SessionReport["star"]; label: string }[] = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
];

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { email, isAuthenticated } = useUser();
  const [mounted, setMounted] = useState(false);
  const [report, setReport] = useState<SessionReport | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!email) return;
    const id = searchParams.get("id");
    if (id) {
      setReport(getSessionById(email, id) ?? loadSession(email));
    } else {
      setReport(loadSession(email));
    }
  }, [email, searchParams]);

  if (!mounted) return <PageLoader />;

  if (!report) {
    return (
      <AppShell title="Report">
        <p className="text-sm text-zinc-500 mb-4">
          Complete a practice session to see your report.
        </p>
        <Link href="/practice" className="btn-primary inline-block text-sm">
          Start practicing
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title="Report" subtitle={report.roleTitle}>
      <div className="space-y-5 max-w-xl">
        <p className="text-sm text-zinc-300 leading-relaxed">{report.feedbackSummary}</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "WPM", value: report.wordsPerMinute },
            { label: "Fillers", value: report.fillerWordCount },
            { label: "Lighting", value: `${report.lightingScore}%` },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="stat-card animate-fade-in-up opacity-0"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "forwards" }}
            >
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value text-xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {report.fillerWords && report.fillerWords.length > 0 && (
          <p className="text-xs text-zinc-500">
            Fillers detected: {report.fillerWords.join(", ")}
          </p>
        )}

        <section className="card p-4 animate-fade-in-up opacity-0 stagger-2">
          <h2 className="stat-label mb-3">STAR</h2>
          <div className="grid grid-cols-2 gap-2">
            {STAR_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-md ${
                  report.star[key] ? "text-zinc-200" : "text-zinc-600"
                }`}
              >
                <span className={report.star[key] ? "text-cyan-400" : ""}>
                  {report.star[key] ? "✓" : "○"}
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>

        {report.transcript && (
          <section className="card p-4 animate-fade-in-up opacity-0 stagger-3">
            <h2 className="stat-label mb-2">Transcript</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{report.transcript}</p>
          </section>
        )}

        <div className="flex gap-3 pt-1">
          <Link
            href={`/practice?title=${encodeURIComponent(report.roleTitle)}`}
            className="btn-ghost text-sm"
          >
            Practice again
          </Link>
          <Link href="/dashboard" className="btn-primary text-sm">
            Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnalyticsContent />
    </Suspense>
  );
}
