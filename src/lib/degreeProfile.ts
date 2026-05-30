export type DegreeProfile =
  | "computer-science"
  | "finance"
  | "marketing"
  | "nursing"
  | "general";

/** Suggestions only — users can enter any custom degree. */
export const SUGGESTED_DEGREES = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Finance",
  "Economics",
  "Accounting",
  "Marketing",
  "Business Administration",
  "Nursing",
  "Psychology",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Biology",
  "Political Science",
  "Communications",
  "Graphic Design",
  "Education",
  "Pre-Med",
  "International Relations",
  "Architecture",
];

export function matchDegreeProfile(degree: string): DegreeProfile {
  const d = degree.toLowerCase();
  if (
    /computer|software|data sci|information tech|\bcs\b|programming|developer/.test(
      d
    )
  ) {
    return "computer-science";
  }
  if (/finance|accounting|econom|banking|investment|actuar/.test(d)) {
    return "finance";
  }
  if (/market|brand|advertis|communications|growth|product marketing/.test(d)) {
    return "marketing";
  }
  if (/nurs|clinical|health sci|pre-med|medic|physician|patient care/.test(d)) {
    return "nursing";
  }
  return "general";
}

export function filterDegreeSuggestions(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUGGESTED_DEGREES.slice(0, 8);
  const matches = SUGGESTED_DEGREES.filter((d) =>
    d.toLowerCase().includes(q)
  );
  const exact = query.trim();
  if (exact && !matches.some((m) => m.toLowerCase() === q)) {
    return [exact, ...matches].slice(0, 8);
  }
  return matches.slice(0, 8);
}

export function isCodingDegree(degree: string | null): boolean {
  return degree != null && matchDegreeProfile(degree) === "computer-science";
}

/** Coding problems are for job/internship prep — not university admissions interviews. */
export function shouldShowCoding(
  degree: string | null,
  preparingFor: string | null
): boolean {
  if (!isCodingDegree(degree)) return false;
  if (preparingFor === "University") return false;
  return true;
}
