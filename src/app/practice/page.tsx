"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/PageLoader";
import { useInterviewRecorder } from "@/hooks/useInterviewRecorder";
import { getInterviewQuestion } from "@/lib/degreeContent";
import { getRolesForDegree } from "@/lib/jobs";
import {
  analyzeStar,
  buildFeedbackSummary,
  computeWpm,
  countFillerWords,
  detectFillerWords,
  lightingFromScore,
  saveSession,
} from "@/lib/session";
import { blobToBase64 } from "@/lib/audioUtils";
import { getGeminiApiKey } from "@/lib/geminiKey";
import { SessionReport } from "@/types/session";
import { useUser } from "@/context/UserContext";

function RolePicker() {
  const { degree } = useUser();
  const jobs = degree ? getRolesForDegree(degree) : [];

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {jobs.map((job, i) => (
          <li
            key={job.id}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "forwards" }}
          >
            <Link
              href={`/practice?title=${encodeURIComponent(job.title)}`}
              className="card p-4 flex items-center justify-between hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors">
                  {job.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{job.description}</p>
              </div>
              <span className="text-zinc-600 group-hover:text-cyan-500 text-sm">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/practice?title=General%20interview"
        className="block text-center text-sm link-subtle"
      >
        General interview →
      </Link>
    </div>
  );
}

function PracticeSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { degree, email } = useUser();
  const roleTitle = searchParams.get("title") ?? "General interview";

  const [interviewQuestion, setInterviewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    videoRef,
    isRecording,
    audioLevel,
    lightingScore,
    lightingStatus,
    faceVisible,
    elapsed,
    cameraError,
    liveTranscript,
    hasRecorded,
    lastResult,
    cameraReady,
    startRecording,
    stopRecording,
    warmupCamera,
  } = useInterviewRecorder();

  useEffect(() => {
    if (degree) {
      setInterviewQuestion(getInterviewQuestion(degree, roleTitle));
    }
  }, [degree, roleTitle]);

  useEffect(() => {
    void warmupCamera();
  }, [warmupCamera]);

  const handleToggleRecord = async () => {
    setSubmitError("");
    if (isRecording) await stopRecording();
    else await startRecording();
  };

  const handleSubmit = async () => {
    const result = lastResult;
    if (!result || result.durationSeconds < 3) {
      setSubmitError("Record at least 3 seconds before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let transcript = result.transcript;
    let wpm = computeWpm(transcript, result.durationSeconds);
    let fillerWords = detectFillerWords(transcript);
    let fillers = fillerWords.length;
    let star = analyzeStar(transcript);
    let feedbackSummary = buildFeedbackSummary({
      wordsPerMinute: wpm,
      fillerWordCount: fillers,
      star,
      lightingScore: result.avgLightingScore,
      transcript,
    });
    let analyzedByAi = false;

    if (result.audioBlob) {
      try {
        const res = await fetch("/api/analyze-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: await blobToBase64(result.audioBlob),
            mimeType: result.audioBlob.type || "audio/webm",
            question: interviewQuestion,
            roleTitle,
            durationSeconds: result.durationSeconds,
            browserTranscript: result.transcript,
            degree,
            apiKey: getGeminiApiKey() ?? undefined,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          transcript?: string;
          fillerWordCount?: number;
          fillerWords?: string[];
          wordsPerMinute?: number;
          star?: SessionReport["star"];
          feedbackSummary?: string;
        };
        if (res.ok && data.ok) {
          transcript = data.transcript ?? transcript;
          fillerWords = data.fillerWords ?? fillerWords;
          fillers = data.fillerWordCount ?? fillerWords.length;
          wpm = data.wordsPerMinute ?? computeWpm(transcript, result.durationSeconds);
          star = data.star ?? star;
          feedbackSummary = data.feedbackSummary ?? feedbackSummary;
          analyzedByAi = true;
        } else if (!res.ok) {
          setSubmitError(data.error ?? "AI unavailable — using browser transcript.");
        }
      } catch {
        setSubmitError("AI unavailable — using browser transcript.");
      }
    } else {
      fillers = countFillerWords(transcript);
      fillerWords = detectFillerWords(transcript);
    }

    const report: SessionReport = {
      roleTitle,
      company: "",
      question: interviewQuestion,
      recordedAt: new Date().toISOString(),
      durationSeconds: result.durationSeconds,
      transcript,
      wordsPerMinute: wpm,
      fillerWordCount: fillers,
      fillerWords,
      analyzedByAi,
      star,
      lightingScore: result.avgLightingScore,
      lightingNote: lightingFromScore(result.avgLightingScore),
      feedbackSummary,
    };

    saveSession(report, email);
    router.push(report.id ? `/analytics?id=${report.id}` : "/analytics");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/practice" className="link-subtle text-xs">
        ← Choose another role
      </Link>

      <div className="card p-5">
        <p className="stat-label mb-2">Interview question</p>
        <p className="text-sm text-zinc-200 leading-relaxed">
          {interviewQuestion || "Loading question…"}
        </p>
      </div>

      <div className="card overflow-hidden animate-fade-in-up">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              Starting camera…
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-400">
              {cameraError}
            </div>
          )}
          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              REC {formatTime(elapsed)}
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs px-2 py-1 rounded-md ${
                lightingStatus === "good"
                  ? "text-zinc-200 bg-black/60"
                  : "text-amber-200 bg-amber-950/80"
              }`}
            >
              Light {lightingScore}%
              {lightingStatus === "dark" && " · dark"}
              {lightingStatus === "bright" && " · bright"}
            </span>
          </div>
          {cameraReady && !faceVisible && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none px-4">
              <p className="text-sm text-amber-200 bg-amber-950/90 border border-amber-800/50 px-3 py-2 rounded-lg">
                Make sure your face is visible
              </p>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-75"
                style={{
                  width: `${isRecording ? Math.max(4, audioLevel * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

        {liveTranscript && (
          <div className="card p-4 animate-fade-in">
          <p className="stat-label mb-2">Live transcript</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{liveTranscript}</p>
        </div>
      )}

      {hasRecorded && !isRecording && (
        <p className="text-sm text-zinc-500">
          Ready to submit ({lastResult?.durationSeconds}s recorded).
        </p>
      )}

      {submitError && (
        <p className="text-sm text-amber-400/90">{submitError}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleToggleRecord}
          disabled={!!cameraError}
          className={isRecording ? "btn-danger flex-1" : "btn-primary flex-1"}
        >
          {isRecording ? "Stop recording" : "Start recording"}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !hasRecorded || isRecording}
          className="btn-ghost flex-1"
        >
          {submitting ? "Analyzing…" : "Submit & view report"}
        </button>
      </div>
    </div>
  );
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, degree } = useUser();
  const [mounted, setMounted] = useState(false);
  const hasRole = Boolean(searchParams.get("title"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/");
    if (mounted && isAuthenticated && !degree) router.replace("/");
  }, [mounted, isAuthenticated, degree, router]);

  if (!mounted) return <PageLoader />;

  return (
    <AppShell
      title={hasRole ? searchParams.get("title") ?? "Practice" : "Practice"}
      subtitle={hasRole ? degree ?? undefined : "Pick a role to begin"}
    >
      {hasRole ? <PracticeSession /> : <RolePicker />}
    </AppShell>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PracticeContent />
    </Suspense>
  );
}
