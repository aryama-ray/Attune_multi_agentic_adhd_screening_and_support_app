// ── Auth ──
export interface User {
  userId: string;
  name: string;
  isGuest: boolean;
  hasProfile: boolean;
}

// ── ASRS Screening ──
export interface ASRSAnswer {
  questionIndex: number;
  questionText: string;
  score: number; // 0-4
}

export interface RadarDimension {
  key: string;       // e.g. "attention_regulation"
  label: string;     // e.g. "Attention Regulation"
  value: number;     // 0-100
  insight: string;   // empowering 1-sentence insight
}

export interface ScreeningResponse {
  profileId: string;
  dimensions: RadarDimension[];   // always 6 items
  profileTags: string[];          // always 3 items, e.g. ["Deep-Diver", "Momentum-Builder", "Intensity-Engine"]
  summary: string;                // 2-3 sentence empowering narrative
  asrsTotalScore: number;         // 0-24
  isPositiveScreen: boolean;      // true if >= 14
}

// ── Cognitive Profile ──
export interface ProfileResponse {
  dimensions: RadarDimension[];
  profileTags: string[];
  summary: string;
}

// ── Daily Plan ──
export interface PlanTask {
  index: number;
  title: string;
  description: string;
  duration_minutes: number;
  time_slot: string;              // e.g. "9:00 AM"
  category: string;               // "deep_work" | "admin" | "creative" | "physical" | "social" | "communication" | "planning" | "learning" | "review"
  rationale: string;              // references cognitive profile
  priority: string;               // "high" | "medium" | "low"
  status: string;                 // "pending" | "completed" | "skipped"
}

export interface PlanResponse {
  planId: string;
  tasks: PlanTask[];
  overallRationale: string;
}

// ── Intervention ──
export interface InterventionResponse {
  interventionId: string;
  acknowledgment: string;         // emotional, 1-2 sentences — displayed FIRST with typewriter effect
  restructuredTasks: PlanTask[];  // full replacement array
  agentReasoning: string;
  followupHint?: string;
}

// ── Dashboard ──
export interface TrendDataPoint {
  date: string;                   // ISO date string
  dayNumber: number;              // 1-14
  moodScore: number;              // 1-10
  completionRate: number;         // 0-100 (percentage)
  brainState: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface HypothesisCard {
  id: string;
  patternDetected: string;
  prediction: string;             // predictive framing: "If Alex has two consecutive days..."
  confidence: string;             // "high" | "medium" | "low"
  status: string;                 // "testing" | "confirmed" | "rejected"
  supportingEvidence: Array<{ day: number; detail: string }>;
  createdAt: string;
}

export interface AgentAnnotation {
  dayNumber: number;              // which day on the trend chart (1-14)
  text: string;
  type: string;                   // "hypothesis" | "intervention"
}

export interface DashboardResponse {
  trendData: TrendDataPoint[];
  momentumScore: number;          // 0-100
  momentumDelta: number;          // positive = improving, negative = declining
  hypothesisCards: HypothesisCard[];
  agentAnnotations: AgentAnnotation[];
}

// ── Brain State (for UI) ──
export type BrainState = "foggy" | "focused" | "wired";
