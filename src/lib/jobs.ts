import { matchDegreeProfile } from "@/lib/degreeProfile";

export interface RoleTemplate {
  id: string;
  title: string;
  description: string;
  linkedInUrl: string;
}

/** Opens LinkedIn job search for a role type — not a specific employer listing. */
export function buildLinkedInRoleSearchUrl(
  roleTitle: string,
  degree?: string
): string {
  const keywords = encodeURIComponent(
    degree ? `${roleTitle} ${degree}` : roleTitle
  );
  return `https://www.linkedin.com/jobs/search/?keywords=${keywords}&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON`;
}

const CS_ROLES: RoleTemplate[] = [
  {
    id: "cs-1",
    title: "Software Engineer",
    description: "Build and ship product features; common path for CS grads.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Software Engineer", "Computer Science"),
  },
  {
    id: "cs-2",
    title: "Full Stack Developer",
    description: "End-to-end web applications; frontend + backend.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Full Stack Developer"),
  },
  {
    id: "cs-3",
    title: "Backend Engineer",
    description: "APIs, databases, and infrastructure at scale.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Backend Engineer"),
  },
];

const FINANCE_ROLES: RoleTemplate[] = [
  {
    id: "fin-1",
    title: "Financial Analyst",
    description: "Modeling, reporting, and investment analysis.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Financial Analyst", "Finance"),
  },
  {
    id: "fin-2",
    title: "Investment Banking Analyst",
    description: "Deal execution and financial modeling.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Investment Banking Analyst"),
  },
  {
    id: "fin-3",
    title: "Quantitative Analyst",
    description: "Data-driven trading and risk models.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Quantitative Analyst"),
  },
];

const MARKETING_ROLES: RoleTemplate[] = [
  {
    id: "mkt-1",
    title: "Product Marketing Manager",
    description: "Positioning, launches, and go-to-market.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Product Marketing Manager"),
  },
  {
    id: "mkt-2",
    title: "Growth Marketing Manager",
    description: "Acquisition, experimentation, and funnel optimization.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Growth Marketing Manager"),
  },
  {
    id: "mkt-3",
    title: "Brand Strategist",
    description: "Messaging, creative direction, and brand equity.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Brand Strategist"),
  },
];

const NURSING_ROLES: RoleTemplate[] = [
  {
    id: "nrs-1",
    title: "Registered Nurse",
    description: "Direct patient care across hospital units.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Registered Nurse"),
  },
  {
    id: "nrs-2",
    title: "Nurse Practitioner",
    description: "Advanced assessment and treatment roles.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Nurse Practitioner"),
  },
  {
    id: "nrs-3",
    title: "Clinical Nurse Specialist",
    description: "Specialized unit expertise and care standards.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Clinical Nurse Specialist"),
  },
];

const GENERAL_ROLES: RoleTemplate[] = [
  {
    id: "gen-1",
    title: "Entry-level analyst",
    description: "Research, reporting, and cross-functional projects.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Entry level analyst"),
  },
  {
    id: "gen-2",
    title: "Associate / coordinator",
    description: "Operations and program support roles.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Associate coordinator"),
  },
  {
    id: "gen-3",
    title: "Graduate trainee",
    description: "Rotational programs for new graduates.",
    linkedInUrl: buildLinkedInRoleSearchUrl("Graduate trainee program"),
  },
];

export function getRolesForDegree(degree: string): RoleTemplate[] {
  const profile = matchDegreeProfile(degree);
  switch (profile) {
    case "computer-science":
      return CS_ROLES.map((r) => ({
        ...r,
        linkedInUrl: buildLinkedInRoleSearchUrl(r.title, degree),
      }));
    case "finance":
      return FINANCE_ROLES.map((r) => ({
        ...r,
        linkedInUrl: buildLinkedInRoleSearchUrl(r.title, degree),
      }));
    case "marketing":
      return MARKETING_ROLES.map((r) => ({
        ...r,
        linkedInUrl: buildLinkedInRoleSearchUrl(r.title, degree),
      }));
    case "nursing":
      return NURSING_ROLES.map((r) => ({
        ...r,
        linkedInUrl: buildLinkedInRoleSearchUrl(r.title, degree),
      }));
    default:
      return GENERAL_ROLES.map((r) => ({
        ...r,
        linkedInUrl: buildLinkedInRoleSearchUrl(r.title, degree),
      }));
  }
}
