// Type definitions for Employ.AI platform

export type PreparedFor = "University" | "Job" | "Internship" | "Placement";

/** User-entered field of study — not limited to a fixed enum. */
export type Degree = string;

export interface UserContextType {
  isAuthenticated: boolean;
  email: string | null;
  preparingFor: PreparedFor | null;
  degree: Degree | null;
  tutorialCompleted: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setEmail: (value: string | null) => void;
  setPreparingFor: (value: PreparedFor | null) => void;
  setDegree: (value: Degree | null) => void;
  setTutorialCompleted: (value: boolean) => void;
  login: (email: string) => { needsOnboarding: boolean };
  logout: () => void;
}

