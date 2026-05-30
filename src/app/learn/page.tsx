"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { useUser } from "@/context/UserContext";
import { getKnowledgeForDegree } from "@/lib/degreeContent";

export default function LearnPage() {
  const router = useRouter();
  const { degree, isAuthenticated } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
    if (mounted && !degree) router.replace("/");
  }, [mounted, isAuthenticated, degree, router]);

  const topics = degree ? getKnowledgeForDegree(degree) : [];

  if (!mounted || !degree) return <PageLoader />;

  return (
    <AppShell title="Learn" subtitle={degree}>
      <div className="space-y-4 max-w-2xl">
        {topics.map((topic, i) => (
          <section
            key={topic.title}
            className="card p-5 animate-fade-in-up opacity-0"
            style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "forwards" }}
          >
            <h2 className="section-title text-cyan-400/90 mb-3">{topic.title}</h2>
            <ul className="space-y-2">
              {topic.points.map((point) => (
                <li
                  key={point}
                  className="text-sm text-zinc-400 flex gap-2 leading-relaxed"
                >
                  <span className="text-zinc-600 shrink-0">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}

      </div>
    </AppShell>
  );
}
