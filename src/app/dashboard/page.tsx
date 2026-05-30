"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { PrepChecklist } from "@/components/PrepChecklist";
import { computePracticeStats, loadPracticeLogs } from "@/lib/session";
import { isQuizCompleted } from "@/lib/prepProgress";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { degree, preparingFor, email, isAuthenticated } = useUser();
  const [stats, setStats] = useState(computePracticeStats([]));
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (email) setQuizDone(isQuizCompleted(email));
  }, [email]);

  useEffect(() => {
    const refresh = () => {
      if (email) setQuizDone(isQuizCompleted(email));
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [email]);

  useEffect(() => {
    if (email) setStats(computePracticeStats(loadPracticeLogs(email)));
    else setStats(computePracticeStats([]));
  }, [email]);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
    if (mounted && isAuthenticated && !degree) router.replace("/");
  }, [mounted, isAuthenticated, degree, router]);

  if (!mounted) return <PageLoader />;

  const focusTip =
    stats.totalSessions > 0 && stats.avgFillers > 4
      ? "Focus next session on reducing filler words — pause instead of saying um or uh."
      : stats.totalSessions > 0 && stats.avgWpm < 100
        ? "Try speaking a bit faster — aim for 120–150 words per minute."
        : stats.totalSessions > 0 && stats.avgStarScore < 2.5
          ? "Structure answers with STAR: situation, task, action, result."
          : !quizDone
            ? "Take the quiz to test your degree knowledge."
            : stats.totalSessions === 0
              ? "Record your first practice answer to get feedback."
              : null;

  return (
    <AppShell
      title="Dashboard"
      subtitle={
        preparingFor && degree ? `${preparingFor} · ${degree}` : undefined
      }
      wide
    >
      <div className="space-y-6 max-w-2xl">
        {focusTip && (
          <p className="text-sm text-cyan-400/90 border-l-2 border-cyan-500/40 pl-3 animate-fade-in">
            {focusTip}
          </p>
        )}

        <PrepChecklist
          practiceCount={stats.totalSessions}
          quizDone={quizDone}
        />

        <section className="card p-5 page-enter stagger-2 opacity-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent sessions</h2>
            {stats.totalSessions > 0 && (
              <span className="text-xs text-zinc-600 tabular-nums">
                {stats.avgWpm} WPM · {stats.avgFillers} fillers avg
              </span>
            )}
          </div>

          {stats.totalSessions === 0 ? (
            <p className="text-sm text-zinc-500 mb-4">
              No recordings yet.
            </p>
          ) : (
            <ul className="space-y-1 mb-4">
              {stats.recentSessions.slice(0, 5).map((s) => (
                <li
                  key={s.id ?? s.recordedAt}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-zinc-300 truncate">{s.roleTitle}</p>
                    <p className="text-xs text-zinc-600">{formatDate(s.recordedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500 tabular-nums">
                    <span>{s.wordsPerMinute} WPM</span>
                    <span>{s.fillerWordCount} fillers</span>
                    {s.id && (
                      <Link
                        href={`/analytics?id=${encodeURIComponent(s.id)}`}
                        className="link-subtle"
                      >
                        Report
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link href="/practice" className="btn-primary text-sm">
            {stats.totalSessions > 0 ? "Practice again" : "Start practicing"}
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
