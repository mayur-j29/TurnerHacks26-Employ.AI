export interface SessionReport {
  id?: string;
  roleTitle: string;
  company: string;
  question: string;
  recordedAt: string;
  durationSeconds: number;
  transcript: string;
  wordsPerMinute: number;
  fillerWordCount: number;
  star: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  lightingScore: number;
  lightingNote: string;
  feedbackSummary: string;
  fillerWords?: string[];
  analyzedByAi?: boolean;
}
