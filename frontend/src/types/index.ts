// ─── User Background ─────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";
export type AgeRange = "18-25" | "26-35" | "36-45" | "46-55" | "56-65" | "65+";
export type Ethnicity =
  | "white"
  | "black"
  | "two-or-more"
  | "south-asian"
  | "hispanic-latino"
  | "asian"
  | "pacific-islander"
  | "prefer-not-to-say";

export interface UserBackground {
  gender: Gender;
  ageRange: AgeRange;
  ethnicity: Ethnicity;
  diagnosedADHD: boolean;
  diagnosedASD: boolean;
  diagnosedDepressionAnxiety: boolean;
  takesMedication: boolean | null; // null = not applicable (no depression/anxiety)
  todayFeeling: {
    focusLevel: number;   // 1–5
    calmLevel: number;    // 1–5
    wellRested: boolean;
    hadCaffeine: boolean;
    hadAlcohol: boolean;
  };
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  hasConsented: boolean;
  hasBackground: boolean;
  hasProfile: boolean;
  background?: UserBackground;
  createdAt: string;
}

// ─── Chat / AI ───────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

// ─── Screening ───────────────────────────────────────────────────────────────

export interface ScreeningQuestion {
  id: string;
  text: string;
  type: "text" | "scale" | "choice";
  options?: string[];
}

export interface ScreeningResponse {
  questionId: string;
  answer: string | number;
}

// ─── Goals & Plans ───────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
}

export interface Plan {
  id: string;
  userId: string;
  goals: Goal[];
  recommendations: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;         // ISO date string, used as x-axis label
  moodScore: number;    // 1–10
  completionRate: number; // 0–100
}

export interface AgentAnnotation {
  date: string;
  label: string;
  type: "intervention" | "pattern";
}

export type ConfidenceLevel = "high" | "medium" | "low";
export type HypothesisStatus = "testing" | "confirmed" | "rejected";

export interface Hypothesis {
  id: string;
  statement: string;
  confidence: ConfidenceLevel;
  status: HypothesisStatus;
  evidence: string[];
}

export interface DashboardData {
  momentumScore: number;     // 0–100
  momentumDelta: number;     // signed delta vs previous period
  trend: TrendPoint[];
  annotations: AgentAnnotation[];
  hypotheses: Hypothesis[];
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  detail: string;
  status: number;
}
