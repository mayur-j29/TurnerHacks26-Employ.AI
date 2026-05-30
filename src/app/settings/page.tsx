"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { DegreeCombobox } from "@/components/DegreeCombobox";
import { GeminiKeySettings } from "@/components/GeminiKeySettings";
import { useUser } from "@/context/UserContext";
import { PreparedFor } from "@/types";

const PREPARED_FOR: PreparedFor[] = [
  "University",
  "Job",
  "Internship",
  "Placement",
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    degree,
    preparingFor,
    isAuthenticated,
    setDegree,
    setPreparingFor,
  } = useUser();
  const [mounted, setMounted] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(degree ?? "");
  const [selectedPrep, setSelectedPrep] = useState<PreparedFor | null>(
    preparingFor
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (degree) setSelectedDegree(degree);
    if (preparingFor) setSelectedPrep(preparingFor);
  }, [degree, preparingFor]);

  const handleSave = () => {
    if (!selectedPrep || !selectedDegree.trim()) return;
    setPreparingFor(selectedPrep);
    setDegree(selectedDegree.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted) return <PageLoader />;

  return (
    <AppShell title="Settings" subtitle="Profile and AI analysis">
      <div className="space-y-6 max-w-lg">
        <section className="card p-6 space-y-4">
          <div>
            <h2 className="section-title">Preparing for</h2>
            <p className="section-desc">Changes what content and tools you see.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PREPARED_FOR.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedPrep(option)}
                className={`px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                  selectedPrep === option
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <div>
            <h2 className="section-title">Degree or field</h2>
            <p className="section-desc">Drives interview questions, quiz, and knowledge topics.</p>
          </div>
          <DegreeCombobox value={selectedDegree} onChange={setSelectedDegree} />
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedPrep || !selectedDegree.trim()}
          className="btn-primary disabled:opacity-40"
        >
          {saved ? "Saved" : "Save profile"}
        </button>

        <GeminiKeySettings />
      </div>
    </AppShell>
  );
}
