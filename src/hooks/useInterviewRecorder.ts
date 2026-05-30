"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface RecordingResult {
  transcript: string;
  durationSeconds: number;
  avgLightingScore: number;
  audioBlob: Blob | null;
}

export type LightingStatus = "dark" | "good" | "bright";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function computeLighting(data: Uint8ClampedArray): {
  score: number;
  status: LightingStatus;
} {
  let sum = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avg = sum / n;

  if (avg < 55) {
    return {
      score: Math.max(12, Math.round((avg / 55) * 38)),
      status: "dark",
    };
  }
  if (avg > 195) {
    return {
      score: Math.max(35, Math.round(95 - ((avg - 195) / 60) * 55)),
      status: "bright",
    };
  }
  return {
    score: Math.round(55 + ((avg - 55) / 140) * 40),
    status: "good",
  };
}

function skinToneRatio(data: Uint8ClampedArray, w: number, h: number): number {
  let skin = 0;
  const x0 = Math.floor(w * 0.25);
  const x1 = Math.floor(w * 0.75);
  const y0 = Math.floor(h * 0.2);
  const y1 = Math.floor(h * 0.85);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
        skin++;
      }
    }
  }
  const region = (x1 - x0) * (y1 - y0);
  return region > 0 ? skin / region : 0;
}

async function attachStream(
  video: HTMLVideoElement,
  stream: MediaStream
): Promise<void> {
  if (video.srcObject !== stream) {
    video.srcObject = stream;
    video.muted = true;
    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) resolve();
      else video.onloadedmetadata = () => resolve();
    });
  }
  try {
    await video.play();
  } catch {
    /* ignore AbortError from overlapping play() calls */
  }
}

export function useInterviewRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptPartsRef = useRef<string[]>([]);
  const interimRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const lightingSamplesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const faceDetectorRef = useRef<{ detect: (src: ImageBitmapSource) => Promise<{ length: number }[]> } | null>(null);
  const cameraActiveRef = useRef(false);
  const isRecordingRef = useRef(false);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lightingScore, setLightingScore] = useState(0);
  const [lightingStatus, setLightingStatus] = useState<LightingStatus>("good");
  const [faceVisible, setFaceVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [hasRecorded, setHasRecorded] = useState(false);
  const [lastResult, setLastResult] = useState<RecordingResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const clearIntervals = () => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const stopMediaRecorder = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        const blob =
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: "audio/webm" })
            : null;
        resolve(blob && blob.size > 0 ? blob : null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        mediaRecorderRef.current = null;
        resolve(blob.size > 0 ? blob : null);
      };
      recorder.stop();
    });
  }, []);

  const stopTracks = useCallback(() => {
    clearIntervals();
    stopRecognition();
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cameraActiveRef.current = false;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, [stopRecognition]);

  useEffect(() => () => stopTracks(), [stopTracks]);

  const sampleFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, 160, 120);
    const imageData = ctx.getImageData(0, 0, 160, 120);

    const { score, status } = computeLighting(imageData.data);
    setLightingScore(score);
    setLightingStatus(status);
    if (isRecordingRef.current) lightingSamplesRef.current.push(score);

    let faceFound = false;
    if (faceDetectorRef.current) {
      try {
        const faces = await faceDetectorRef.current.detect(video);
        faceFound = faces.length > 0;
      } catch {
        faceFound = skinToneRatio(imageData.data, 160, 120) > 0.06;
      }
    } else {
      faceFound = skinToneRatio(imageData.data, 160, 120) > 0.06;
    }
    setFaceVisible(faceFound);
  }, []);

  const tickAudioLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(Math.min(1, avg / 100));
    rafRef.current = requestAnimationFrame(tickAudioLevel);
  }, []);

  const setupAudioMeter = useCallback(
    (stream: MediaStream) => {
      if (audioContextRef.current) return;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      tickAudioLevel();
    },
    [tickAudioLevel]
  );

  const ensureCamera = useCallback(async () => {
    if (cameraActiveRef.current && streamRef.current) return;

    setCameraError(null);

    if (typeof window !== "undefined" && "FaceDetector" in window) {
      try {
        faceDetectorRef.current = new (window as Window & {
          FaceDetector: new (opts?: { fastMode?: boolean }) => {
            detect: (src: ImageBitmapSource) => Promise<{ length: number }[]>;
          };
        }).FaceDetector({ fastMode: true });
      } catch {
        faceDetectorRef.current = null;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      cameraActiveRef.current = true;

      const video = videoRef.current;
      if (video) {
        await attachStream(video, stream);
        setCameraReady(true);
      }

      setupAudioMeter(stream);

      clearIntervals();
      intervalsRef.current.push(setInterval(() => void sampleFrame(), 450));
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message
          : "Allow camera and microphone access to practice."
      );
      stopTracks();
    }
  }, [sampleFrame, setupAudioMeter, stopTracks]);

  const startRecording = useCallback(async () => {
    setCameraError(null);
    transcriptPartsRef.current = [];
    interimRef.current = "";
    lightingSamplesRef.current = [];
    audioChunksRef.current = [];
    setLiveTranscript("");
    setLastResult(null);

    await ensureCamera();
    if (!streamRef.current) return;

    setupAudioMeter(streamRef.current);

    const stream = streamRef.current;
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch {
      /* recording continues with speech recognition only */
    }

    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            transcriptPartsRef.current.push(text.trim());
          } else {
            interim += text;
          }
        }
        interimRef.current = interim;
        setLiveTranscript(
          [...transcriptPartsRef.current, interim].filter(Boolean).join(" ")
        );
      };
      recognition.start();
      recognitionRef.current = recognition;
    }

    startTimeRef.current = Date.now();
    setElapsed(0);
    isRecordingRef.current = true;
    setIsRecording(true);

    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [ensureCamera, setupAudioMeter]);

  const stopRecording = useCallback(async (): Promise<RecordingResult> => {
    const durationSeconds = Math.max(
      1,
      Math.floor((Date.now() - startTimeRef.current) / 1000)
    );
    stopRecognition();
    isRecordingRef.current = false;
    setIsRecording(false);
    setAudioLevel(0);
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }

    const audioBlob = await stopMediaRecorder();

    const samples = lightingSamplesRef.current;
    const avgLightingScore =
      samples.length > 0
        ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
        : lightingScore;

    const transcript =
      [...transcriptPartsRef.current, interimRef.current].filter(Boolean).join(" ").trim() ||
      liveTranscript.trim();

    const result = { transcript, durationSeconds, avgLightingScore, audioBlob };
    setLastResult(result);
    setHasRecorded(true);
    return result;
  }, [lightingScore, liveTranscript, stopMediaRecorder, stopRecognition]);

  const warmupCamera = useCallback(async () => {
    await ensureCamera();
  }, [ensureCamera]);

  return {
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
    stopTracks,
  };
}
