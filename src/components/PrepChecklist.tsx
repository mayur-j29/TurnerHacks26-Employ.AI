import Link from "next/link";

export function PrepChecklist({
  practiceCount,
  quizDone,
}: {
  practiceCount: number;
  quizDone: boolean;
}) {
  const steps = [
    { label: "Review learn topics", href: "/learn", done: false },
    { label: "Pass the quiz", href: "/quiz", done: quizDone },
    { label: "Record a practice answer", href: "/practice", done: practiceCount > 0 },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const progress = (doneCount / steps.length) * 100;

  return (
    <section className="card p-5 page-enter stagger-1 opacity-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Prep checklist</h2>
        <span className="text-xs text-zinc-500 tabular-nums">
          {doneCount}/{steps.length}
        </span>
      </div>

      <div className="progress-track mb-4">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <ul className="space-y-1">
        {steps.map((step, i) => (
          <li
            key={step.href}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${0.08 + i * 0.06}s`, animationFillMode: "forwards" }}
          >
            <Link
              href={step.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                step.done
                  ? "text-zinc-500"
                  : "text-zinc-300 hover:bg-zinc-800/40 hover:translate-x-0.5"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 transition-all duration-300 ${
                  step.done
                    ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-400 scale-100"
                    : "border-zinc-600 scale-95"
                }`}
              >
                {step.done ? "✓" : ""}
              </span>
              <span className={step.done ? "line-through" : ""}>{step.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
