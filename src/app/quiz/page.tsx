"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { useUser } from "@/context/UserContext";
import { buildQuizSession, QuizQuestion } from "@/lib/degreeContent";
import { markQuizCompleted } from "@/lib/prepProgress";
import Link from "next/link";

export default function QuizPage() {
  const router = useRouter();
  const { degree, email, isAuthenticated } = useUser();
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const startNewQuiz = useCallback(() => {
    if (!degree) return;
    setQuestions(buildQuizSession(degree));
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setRevealed(false);
  }, [degree]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
    if (mounted && !degree) router.replace("/");
  }, [mounted, isAuthenticated, degree, router]);

  useEffect(() => {
    if (mounted && degree) startNewQuiz();
  }, [mounted, degree, startNewQuiz]);

  const q = questions[current];

  const handleCheck = () => {
    if (selected === null || !q) return;
    if (selected === q.correctIndex) setScore((s) => s + 1);
    setRevealed(true);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      markQuizCompleted(email ?? "");
      setFinished(true);
    }
  };

  if (!mounted || !degree || questions.length === 0) return <PageLoader />;

  return (
    <AppShell title="Quiz" subtitle={`${degree} · ${questions.length} questions`}>
      <div className="max-w-xl">
        {finished ? (
          <div className="card p-8 text-center space-y-4 animate-scale-in">
            <p className="text-3xl font-medium text-zinc-100 tabular-nums">
              {score} / {questions.length}
            </p>
            <p className="text-sm text-zinc-500">
              {score === questions.length
                ? "Perfect score — strong fundamentals."
                : "Review learn topics, then try a new quiz."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={startNewQuiz}
                className="btn-ghost text-sm"
              >
                New quiz
              </button>
              <Link href="/learn" className="btn-primary text-sm">
                Review learn
              </Link>
            </div>
          </div>
        ) : q ? (
          <div key={current} className="card p-6 space-y-5 animate-fade-in-up">
            <p className="text-xs text-zinc-500 tabular-nums">
              Question {current + 1} of {questions.length}
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed">{q.prompt}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={`${q.id}-${i}-${opt}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-3 text-sm rounded-lg border transition-all duration-200 ${
                    selected === i
                      ? "border-cyan-600/60 bg-cyan-950/30 text-cyan-300"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/20"
                  } ${
                    revealed && i === q.correctIndex
                      ? "border-green-700/50 bg-green-950/20 text-green-300/90"
                      : ""
                  } ${
                    revealed &&
                    selected === i &&
                    i !== q.correctIndex
                      ? "border-red-800/50 bg-red-950/20 text-red-300/90"
                      : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {revealed && (
              <p className="text-xs text-zinc-500 border-l-2 border-zinc-700 pl-3 animate-fade-in">
                {q.explanation}
              </p>
            )}
            <div className="flex gap-2">
              {!revealed ? (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={selected === null}
                  className="btn-primary text-sm disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary text-sm"
                >
                  {current < questions.length - 1 ? "Next" : "See score"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No quiz for this degree.</p>
        )}
      </div>
    </AppShell>
  );
}
