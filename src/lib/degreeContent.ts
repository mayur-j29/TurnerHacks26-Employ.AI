import { DegreeProfile, matchDegreeProfile } from "@/lib/degreeProfile";

export interface KnowledgeTopic {
  title: string;
  points: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium";
  description: string;
  starterCode: string;
  hints: string[];
  tests: { name: string; code: string }[];
}

const CS_QUESTIONS = [
  "Walk me through a system you designed. What trade-offs did you make?",
  "Tell me about a bug you debugged under time pressure. How did you isolate the root cause?",
  "Describe how you would scale a service from 1k to 1M daily active users.",
  "Explain a project where you improved performance. What did you measure before and after?",
  "How do you handle disagreements on technical direction with teammates?",
  "Why do you want to study computer science at this program?",
  "Explain a technical concept you learned recently to a non-technical person.",
  "Describe a time you had to learn something new quickly for a deadline.",
];

const FINANCE_QUESTIONS = [
  "Walk me through a DCF you built. What assumptions mattered most?",
  "Tell me about a time your analysis changed a business decision.",
  "How do you sanity-check a financial model before presenting it?",
  "Describe a market you covered and the key drivers you tracked weekly.",
  "Explain a mistake in an analysis and how you corrected it.",
];

const MARKETING_QUESTIONS = [
  "Describe a campaign you launched. How did you define success metrics?",
  "Tell me about a channel that underperformed and how you pivoted.",
  "How do you prioritize experiments when budget is limited?",
  "Walk me through positioning work for a product launch.",
  "Share an example where customer insights changed your messaging.",
];

const NURSING_QUESTIONS = [
  "Describe a high-acuity situation and how you prioritized patient safety.",
  "Tell me about educating a patient or family through a difficult conversation.",
  "How do you handle handoff communication to prevent errors?",
  "Give an example of advocating for a patient when the care plan was unclear.",
  "Describe how you managed multiple patients during a staffing shortage.",
];

const ROLE_QUESTIONS: Record<string, string[]> = {
  "Software Engineer": [
    "Implement a feature end-to-end: how did you scope, build, test, and ship?",
    "Tell me about the most complex API or data model you owned.",
  ],
  "Full Stack Developer": [
    "How do you balance frontend UX with backend reliability in one delivery?",
  ],
  "Financial Analyst": [
    "Build a three-statement view for me using a company you follow.",
  ],
  "Registered Nurse": [
    "Describe your triage process during a sudden influx of patients.",
  ],
};

export const QUESTIONS_BY_PROFILE: Record<DegreeProfile, string[]> = {
  "computer-science": CS_QUESTIONS,
  finance: FINANCE_QUESTIONS,
  marketing: MARKETING_QUESTIONS,
  nursing: NURSING_QUESTIONS,
  general: [
    "Tell me about yourself and why this field interests you.",
    "Describe a project or experience you're proud of.",
    "How do you handle feedback or a setback?",
    "Where do you see your career in three years?",
    "What skills from your degree apply directly to this role?",
    "Why do you want to attend this university or program?",
    "Describe a time you worked on a team when opinions differed.",
    "What would you contribute to our community beyond academics?",
  ],
};

export function getInterviewQuestion(
  degree: string,
  roleTitle: string
): string {
  const rolePool = ROLE_QUESTIONS[roleTitle];
  const pool = rolePool?.length
    ? rolePool
    : QUESTIONS_BY_PROFILE[matchDegreeProfile(degree)];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export const KNOWLEDGE_BY_PROFILE: Record<DegreeProfile, KnowledgeTopic[]> = {
  "computer-science": [
    {
      title: "Data structures & algorithms",
      points: [
        "Arrays, hash maps, trees, graphs — time/space complexity",
        "BFS/DFS, binary search, two pointers, sliding window",
        "Big-O reasoning for interview explanations",
      ],
    },
    {
      title: "Systems & backend",
      points: [
        "REST vs gRPC, caching (Redis), load balancing basics",
        "SQL vs NoSQL trade-offs, indexing, transactions",
        "Logging, monitoring, and incident response vocabulary",
      ],
    },
    {
      title: "Behavioral (tech)",
      points: [
        "STAR stories with measurable impact (latency, uptime, revenue)",
        "Ownership, conflict resolution, mentoring junior engineers",
      ],
    },
    {
      title: "University & admissions interviews",
      points: [
        "Why this program, research interests, and faculty fit",
        "Explain a project simply — focus on problem, approach, outcome",
        "Ethics in CS: privacy, bias in ML, responsible AI vocabulary",
      ],
    },
    {
      title: "OOP & software design",
      points: [
        "Encapsulation, inheritance, polymorphism — when each helps",
        "Design patterns: singleton, factory, observer (know when not to overuse)",
        "Testing: unit vs integration, TDD basics, mocking dependencies",
      ],
    },
  ],
  finance: [
    {
      title: "Accounting & statements",
      points: [
        "Income statement, balance sheet, cash flow linkages",
        "Working capital, EBITDA adjustments, non-recurring items",
      ],
    },
    {
      title: "Valuation & modeling",
      points: [
        "DCF steps: FCF, WACC, terminal value sensitivities",
        "Comps: EV/EBITDA, P/E, precedent transactions",
        "Three-statement model integrity checks",
      ],
    },
    {
      title: "Markets & judgment",
      points: [
        "Macro indicators relevant to your coverage universe",
        "Articulating investment thesis and key risks clearly",
      ],
    },
    {
      title: "Interview technicals",
      points: [
        "Walk through a 3-statement model in 5 minutes",
        "Accretion/dilution basics for M&A discussions",
        "Credit analysis: leverage ratios, covenants, liquidity",
      ],
    },
  ],
  marketing: [
    {
      title: "Growth & analytics",
      points: [
        "Funnel metrics: CAC, LTV, conversion, retention cohorts",
        "A/B testing design and statistical significance basics",
      ],
    },
    {
      title: "Positioning & GTM",
      points: [
        "ICP, messaging pillars, competitive differentiation",
        "Launch planning across paid, owned, and earned channels",
      ],
    },
    {
      title: "Brand & content",
      points: [
        "Brand voice, creative briefs, channel-native content formats",
        "Measuring brand lift vs performance campaigns",
      ],
    },
    {
      title: "Digital & product marketing",
      points: [
        "SEO/SEM fundamentals, attribution models (first vs last touch)",
        "Product-led growth loops, onboarding, activation metrics",
        "Stakeholder management with sales and product teams",
      ],
    },
  ],
  nursing: [
    {
      title: "Clinical fundamentals",
      points: [
        "Assessment frameworks (ABCs, SBAR handoffs)",
        "Common protocols: sepsis, stroke, chest pain pathways",
        "Medication safety: rights of administration, interactions",
      ],
    },
    {
      title: "Patient communication",
      points: [
        "Teach-back method, empathy under stress, family updates",
        "Documentation standards and legal considerations",
      ],
    },
    {
      title: "Professional practice",
      points: [
        "Scope of practice, delegation, interdisciplinary collaboration",
        "Evidence-based practice and continuing education",
      ],
    },
    {
      title: "Interview scenarios",
      points: [
        "Prioritization when multiple patients need attention",
        "Conflict with a provider — professional advocacy language",
        "Why nursing / why this unit — tie to values and experience",
      ],
    },
  ],
  general: [
    {
      title: "Core interview skills",
      points: [
        "STAR method for behavioral answers",
        "Research the role and organization before interviewing",
        "Prepare 2–3 stories that show impact and learning",
      ],
    },
    {
      title: "Field-specific depth",
      points: [
        "Connect coursework, projects, and internships to the job",
        "Know vocabulary and tools common in your discipline",
        "Be ready to discuss trends or ethics in your field",
      ],
    },
    {
      title: "Professional presence",
      points: [
        "Clear structure, steady pace, and concise conclusions",
        "Questions to ask the interviewer about team and growth",
      ],
    },
    {
      title: "University admissions",
      points: [
        "Why this school/program — specific courses, faculty, culture",
        "Connect extracurriculars and coursework to your goals",
        "Handle 'tell me about a weakness' with growth mindset",
      ],
    },
  ],
};

export function getKnowledgeForDegree(degree: string): KnowledgeTopic[] {
  return KNOWLEDGE_BY_PROFILE[matchDegreeProfile(degree)];
}

export const QUIZ_BY_PROFILE: Record<DegreeProfile, QuizQuestion[]> = {
  "computer-science": [
    {
      id: "cs-q1",
      prompt: "Worst-case time complexity of binary search on a sorted array?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)", "O(n²)"],
      correctIndex: 1,
      explanation: "Each step halves the search space → O(log n).",
    },
    {
      id: "cs-q2",
      prompt: "Which structure gives O(1) average lookup by key?",
      options: ["Array", "Linked list", "Hash map", "Binary tree", "Stack"],
      correctIndex: 2,
      explanation: "Hash maps provide average O(1) get/put with a good hash.",
    },
    {
      id: "cs-q3",
      prompt: "Primary purpose of an API rate limiter?",
      options: [
        "Encrypt payloads",
        "Protect backend from overload / abuse",
        "Replace authentication",
        "Compress responses",
        "Cache database queries",
      ],
      correctIndex: 1,
      explanation: "Rate limits cap traffic to keep services stable.",
    },
    {
      id: "cs-q4",
      prompt: "In a university CS interview, a strong project explanation should emphasize…",
      options: [
        "Only the programming language used",
        "Problem, your approach, trade-offs, and outcome",
        "Lines of code written",
        "Avoid mentioning limitations",
        "Memorized buzzwords only",
      ],
      correctIndex: 1,
      explanation: "Admissions panels want clear thinking, not jargon.",
    },
    {
      id: "cs-q5",
      prompt: "Which traversal visits a binary tree level by level?",
      options: ["In-order", "Pre-order", "Post-order", "Level-order (BFS)", "DFS only"],
      correctIndex: 3,
      explanation: "BFS with a queue processes each level before the next.",
    },
    {
      id: "cs-q6",
      prompt: "What does ACID stand for in databases?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Access, Cache, Index, Data",
        "Async, Concurrent, Integrated, Distributed",
        "Application, Client, Interface, Design",
        "Analysis, Code, Input, Debug",
      ],
      correctIndex: 0,
      explanation: "ACID properties guarantee reliable transactions.",
    },
    {
      id: "cs-q7",
      prompt: "Best approach when you don't know an answer in a technical interview?",
      options: [
        "Guess randomly and move on",
        "Think aloud, ask clarifying questions, try a simpler case",
        "Stay silent until time runs out",
        "Change the subject to hobbies",
        "Insist the question is unfair",
      ],
      correctIndex: 1,
      explanation: "Interviewers evaluate reasoning, not perfection.",
    },
    {
      id: "cs-q8",
      prompt: "TCP vs UDP — which is connection-oriented and reliable?",
      options: ["UDP", "TCP", "Both equally", "Neither", "HTTP only"],
      correctIndex: 1,
      explanation: "TCP establishes a connection and retransmits lost packets.",
    },
  ],
  finance: [
    {
      id: "fin-q1",
      prompt: "In a DCF, which cash flow stream is typically discounted?",
      options: [
        "Net income",
        "Unlevered free cash flow",
        "Revenue only",
        "CapEx",
        "Dividends per share",
      ],
      correctIndex: 1,
      explanation: "UFCF reflects cash available to all capital providers.",
    },
    {
      id: "fin-q2",
      prompt: "EV/EBITDA is primarily what type of multiple?",
      options: [
        "Equity value only",
        "Enterprise value",
        "Per-share book",
        "Debt-adjusted EPS",
        "Working capital ratio",
      ],
      correctIndex: 1,
      explanation: "EV multiples use enterprise value in the numerator.",
    },
    {
      id: "fin-q3",
      prompt: "If current assets < current liabilities, the company may face…",
      options: [
        "Liquidity pressure",
        "Guaranteed bankruptcy",
        "Higher P/E automatically",
        "Zero interest expense",
        "Mandatory dividend increase",
      ],
      correctIndex: 0,
      explanation: "Short-term obligations may exceed liquid resources.",
    },
    {
      id: "fin-q4",
      prompt: "WACC represents…",
      options: [
        "Weighted average cost of capital",
        "Working asset cash cycle",
        "Weekly average credit cost",
        "Wall-street approved credit card",
        "Wholesale asset coverage coefficient",
      ],
      correctIndex: 0,
      explanation: "WACC blends cost of equity and debt by weight.",
    },
    {
      id: "fin-q5",
      prompt: "Depreciation on the income statement…",
      options: [
        "Is a non-cash expense reducing taxable income",
        "Always equals CapEx",
        "Increases cash on hand directly",
        "Only applies to banks",
        "Is recorded as revenue",
      ],
      correctIndex: 0,
      explanation: "It allocates asset cost over time without a cash outflow.",
    },
    {
      id: "fin-q6",
      prompt: "In comps analysis, why might you use EV/EBITDA instead of P/E?",
      options: [
        "Capital structure differences matter less",
        "P/E always equals EV/EBITDA",
        "EBITDA ignores operating performance",
        "EV excludes debt",
        "P/E is illegal in M&A",
      ],
      correctIndex: 0,
      explanation: "EV-based multiples neutralize leverage differences.",
    },
  ],
  marketing: [
    {
      id: "mkt-q1",
      prompt: "LTV:CAC below 1 generally indicates…",
      options: [
        "Strong unit economics",
        "You lose money per acquired customer",
        "Brand awareness is high",
        "Retention is perfect",
        "Organic growth is guaranteed",
      ],
      correctIndex: 1,
      explanation: "Spending more to acquire than lifetime value returns.",
    },
    {
      id: "mkt-q2",
      prompt: "Best first step before running an A/B test?",
      options: [
        "Change five variables at once",
        "Define hypothesis and success metric",
        "Skip sample size planning",
        "Stop tracking after 1 hour",
        "Run only on weekends",
      ],
      correctIndex: 1,
      explanation: "Clear hypothesis + metric prevents noisy conclusions.",
    },
    {
      id: "mkt-q3",
      prompt: "ICP stands for…",
      options: [
        "Ideal Customer Profile",
        "Internal Campaign Protocol",
        "Integrated Content Plan",
        "Inbound Conversion Path",
        "Industry Cost Percentile",
      ],
      correctIndex: 0,
      explanation: "ICP defines who you target and why they buy.",
    },
    {
      id: "mkt-q4",
      prompt: "Which metric best tracks repeat engagement over time?",
      options: [
        "Cohort retention",
        "Page load time",
        "Server uptime",
        "Headcount growth",
        "Office square footage",
      ],
      correctIndex: 0,
      explanation: "Cohort retention shows if users come back after signup.",
    },
    {
      id: "mkt-q5",
      prompt: "Positioning answers which question?",
      options: [
        "Why should our target buyer choose us vs alternatives?",
        "What is our office address?",
        "How many employees do we have?",
        "What color is our logo?",
        "When was the company founded?",
      ],
      correctIndex: 0,
      explanation: "Positioning is differentiated value in the buyer's mind.",
    },
    {
      id: "mkt-q6",
      prompt: "Owned media includes…",
      options: [
        "Your website, email list, and app",
        "Paid search ads only",
        "TV commercials",
        "Influencer posts you don't control",
        "Billboards exclusively",
      ],
      correctIndex: 0,
      explanation: "Owned channels are assets you control directly.",
    },
  ],
  nursing: [
    {
      id: "nrs-q1",
      prompt: "SBAR stands for…",
      options: [
        "Situation, Background, Assessment, Recommendation",
        "Safety, Blood, Airway, Recovery",
        "Standard, Baseline, Action, Review",
        "Symptom, Billing, Admission, Release",
        "Support, Balance, Advocacy, Rest",
      ],
      correctIndex: 0,
      explanation: "SBAR structures concise clinical handoffs.",
    },
    {
      id: "nrs-q2",
      prompt: "First priority in primary assessment (ABCs)?",
      options: [
        "Airway",
        "Discharge paperwork",
        "Diet order",
        "Visitor policy",
        "Medication reconciliation only",
      ],
      correctIndex: 0,
      explanation: "Airway patency comes before breathing and circulation.",
    },
    {
      id: "nrs-q3",
      prompt: "The five rights of medication administration include…",
      options: [
        "Right patient, drug, dose, route, time",
        "Right room, bed, chart, pen, phone",
        "Right doctor, nurse, aide, tech, clerk",
        "Right insurance, copay, deductible, claim, code",
        "Right shift, break, lunch, charting, handoff",
      ],
      correctIndex: 0,
      explanation: "Verifying all five rights prevents medication errors.",
    },
    {
      id: "nrs-q4",
      prompt: "Teach-back method is used to…",
      options: [
        "Confirm patient understanding of instructions",
        "Speed up discharge",
        "Avoid documentation",
        "Replace informed consent",
        "Eliminate family involvement",
      ],
      correctIndex: 0,
      explanation: "Patients explain back what they heard to verify comprehension.",
    },
    {
      id: "nrs-q5",
      prompt: "Signs of clinical deterioration you should escalate early include…",
      options: [
        "Changing mental status, rising HR, dropping BP",
        "Stable vitals and alert patient",
        "Completed meal tray",
        "Updated visitor log",
        "Printed discharge instructions only",
      ],
      correctIndex: 0,
      explanation: "Early warning signs warrant rapid assessment and escalation.",
    },
    {
      id: "nrs-q6",
      prompt: "In a nursing school interview, 'why nursing?' should connect…",
      options: [
        "Personal motivation, empathy, and relevant experience",
        "Only salary expectations",
        "Avoidance of other careers",
        "Celebrity nurse stories alone",
        "Generic answers with no examples",
      ],
      correctIndex: 0,
      explanation: "Panels look for authentic motivation and fit.",
    },
  ],
  general: [
    {
      id: "gen-q1",
      prompt: "What does STAR stand for in behavioral interviews?",
      options: [
        "Situation, Task, Action, Result",
        "Skills, Training, Attitude, Resume",
        "Strategy, Team, Analysis, Report",
        "Study, Test, Apply, Review",
        "Schedule, Time, Agenda, Response",
      ],
      correctIndex: 0,
      explanation: "STAR structures a complete behavioral story.",
    },
    {
      id: "gen-q2",
      prompt: "Before an interview, you should…",
      options: [
        "Skip researching the organization",
        "Prepare specific examples from your experience",
        "Memorize one generic answer for every question",
        "Avoid asking the interviewer questions",
        "Arrive without knowing the role title",
      ],
      correctIndex: 1,
      explanation: "Concrete examples tailored to the role build credibility.",
    },
    {
      id: "gen-q3",
      prompt: "For a university admissions interview, research should include…",
      options: [
        "Specific programs, faculty, and why they fit your goals",
        "Only the school colors",
        "Ranking alone with no deeper reason",
        "What your friends think exclusively",
        "Nothing — wing it",
      ],
      correctIndex: 0,
      explanation: "Specific fit shows genuine interest and preparation.",
    },
    {
      id: "gen-q4",
      prompt: "A good weakness answer should…",
      options: [
        "Show self-awareness and steps you're taking to improve",
        "Claim you have no weaknesses",
        "Blame others for past failures",
        "Reveal something illegal or unethical",
        "Be unrelated to work or school",
      ],
      correctIndex: 0,
      explanation: "Growth mindset matters more than a 'perfect' flaw.",
    },
    {
      id: "gen-q5",
      prompt: "When answering 'tell me about yourself' in 2 minutes, prioritize…",
      options: [
        "Present → past → future tied to this opportunity",
        "Your entire life story from birth",
        "Only hobbies unrelated to the field",
        "Criticism of past employers or teachers",
        "Reading your resume line by line",
      ],
      correctIndex: 0,
      explanation: "A tight arc keeps the answer relevant and memorable.",
    },
    {
      id: "gen-q6",
      prompt: "Strong questions to ask the interviewer often focus on…",
      options: [
        "Team culture, expectations, and growth paths",
        "Salary in the first 30 seconds always",
        "How soon you can take vacation",
        "Trick questions to stump them",
        "Nothing — silence is better",
      ],
      correctIndex: 0,
      explanation: "Thoughtful questions show engagement and judgment.",
    },
  ],
};

export function getQuizForDegree(degree: string): QuizQuestion[] {
  return QUIZ_BY_PROFILE[matchDegreeProfile(degree)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionOptions(q: QuizQuestion): QuizQuestion {
  const tagged = q.options.map((opt, i) => ({
    opt,
    isCorrect: i === q.correctIndex,
  }));
  const shuffled = shuffleArray(tagged);
  return {
    ...q,
    options: shuffled.map((t) => t.opt),
    correctIndex: shuffled.findIndex((t) => t.isCorrect),
  };
}

/** Randomized quiz session — new order and shuffled options each call. */
export function buildQuizSession(degree: string, count = 6): QuizQuestion[] {
  const pool = getQuizForDegree(degree);
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map(shuffleQuestionOptions);
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\nExample: nums = [2,7,11,15], target = 9 → [0,1]",
    starterCode: `def two_sum(nums, target):
    # return [i, j]
    pass`,
    hints: ["Use a hash map of value → index.", "One pass is enough."],
    tests: [
      {
        name: "Basic case",
        code: `r = two_sum([2, 7, 11, 15], 9)
assert r == [0, 1] or r == [1, 0], str(r)`,
      },
      {
        name: "Second pair",
        code: `r = two_sum([3, 2, 4], 6)
assert r == [1, 2] or r == [2, 1], str(r)`,
      },
    ],
  },
  {
    id: "valid-parens",
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      'Given a string containing `()[]{}`, determine if it is valid.\n\nExample: "()[]{}" → true, "(]" → false',
    starterCode: `def is_valid(s):
    pass`,
    hints: ["Use a stack.", "Close brackets must match the top of stack."],
    tests: [
      { name: "Valid mix", code: `assert is_valid("()[]{}") == True` },
      { name: "Invalid close", code: `assert is_valid("(]") == False` },
      { name: "Nested", code: `assert is_valid("{[]}") == True` },
    ],
  },
  {
    id: "max-profit",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    description:
      "Given prices[i] as stock price on day i, return maximum profit from one buy and one sell.\n\nExample: [7,1,5,3,6,4] → 5",
    starterCode: `def max_profit(prices):
    pass`,
    hints: ["Track minimum price seen so far.", "Update profit at each day."],
    tests: [
      { name: "Example", code: `assert max_profit([7, 1, 5, 3, 6, 4]) == 5` },
      { name: "No profit", code: `assert max_profit([7, 6, 4, 3, 1]) == 0` },
    ],
  },
  {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    description:
      "Return `True` if any value appears at least twice in `nums`, else `False`.\n\nExample: [1,2,3,1] → True",
    starterCode: `def contains_duplicate(nums):
    pass`,
    hints: ["Use a set.", "Return early when you see a repeat."],
    tests: [
      { name: "Has duplicate", code: `assert contains_duplicate([1, 2, 3, 1]) == True` },
      { name: "All unique", code: `assert contains_duplicate([1, 2, 3, 4]) == False` },
    ],
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    description:
      "Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`.\n\nExample: s = \"anagram\", t = \"nagaram\" → True",
    starterCode: `def is_anagram(s, t):
    pass`,
    hints: ["Compare character counts.", "Sort both strings as a quick check."],
    tests: [
      { name: "Valid", code: `assert is_anagram("anagram", "nagaram") == True` },
      { name: "Invalid", code: `assert is_anagram("rat", "car") == False` },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    description:
      "Given sorted `nums` and `target`, return the index of `target` or -1.\n\nExample: nums = [-1,0,3,5,9,12], target = 9 → 4",
    starterCode: `def binary_search(nums, target):
    pass`,
    hints: ["Use left/right pointers.", "Mid = (left + right) // 2"],
    tests: [
      { name: "Found", code: `assert binary_search([-1, 0, 3, 5, 9, 12], 9) == 4` },
      { name: "Not found", code: `assert binary_search([-1, 0, 3, 5, 9, 12], 2) == -1` },
    ],
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    description:
      "You can climb 1 or 2 steps. Given `n` steps, return how many distinct ways to reach the top.\n\nExample: n = 3 → 3",
    starterCode: `def climb_stairs(n):
    pass`,
    hints: ["Fibonacci pattern.", "dp[i] = dp[i-1] + dp[i-2]"],
    tests: [
      { name: "Three steps", code: `assert climb_stairs(3) == 3` },
      { name: "Five steps", code: `assert climb_stairs(5) == 8` },
    ],
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    description:
      "Reverse a list of characters in-place and return it.\n\nExample: [\"h\",\"e\",\"l\",\"l\",\"o\"] → [\"o\",\"l\",\"l\",\"e\",\"h\"]",
    starterCode: `def reverse_string(s):
    # s is a list of characters
    pass`,
    hints: ["Two pointers from both ends.", "Swap in place."],
    tests: [
      {
        name: "Hello",
        code: `s = ["h","e","l","l","o"]
reverse_string(s)
assert s == ["o","l","l","e","h"]`,
      },
    ],
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating",
    difficulty: "Medium",
    description:
      "Given string `s`, return the length of the longest substring without repeating characters.\n\nExample: \"abcabcbb\" → 3 (\"abc\")",
    starterCode: `def length_of_longest_substring(s):
    pass`,
    hints: ["Sliding window with a set or map.", "Shrink window when you see a duplicate."],
    tests: [
      { name: "Repeating", code: `assert length_of_longest_substring("abcabcbb") == 3` },
      { name: "All unique", code: `assert length_of_longest_substring("abcdef") == 6` },
      { name: "Empty", code: `assert length_of_longest_substring("") == 0` },
    ],
  },
  {
    id: "merge-sorted",
    title: "Merge Sorted Array",
    difficulty: "Easy",
    description:
      "Merge two sorted lists `a` and `b` into one sorted list.\n\nExample: [1,3,5] + [2,4,6] → [1,2,3,4,5,6]",
    starterCode: `def merge_sorted(a, b):
    pass`,
    hints: ["Two pointers.", "Compare heads and append smaller."],
    tests: [
      {
        name: "Interleaved",
        code: `assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]`,
      },
      { name: "One empty", code: `assert merge_sorted([], [1, 2]) == [1, 2]` },
    ],
  },
];
