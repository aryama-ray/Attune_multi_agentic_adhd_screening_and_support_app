// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  hasProfile: boolean;
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

// ─── Brain State ─────────────────────────────────────────────────────────────

export type BrainState = "foggy" | "focused" | "wired";

// ─── Daily Plan (matches backend Task model) ─────────────────────────────────

export interface PlanTask {
  index: number;
  title: string;
  description: string;
  duration_minutes: number;
  time_slot: string;
  category: string;
  rationale: string;
  priority: string;
  status: string;
}

export interface PlanResponse {
  planId: string;
  tasks: PlanTask[];
  overallRationale: string;
}

// ─── Intervention ────────────────────────────────────────────────────────────

export interface InterventionResponse {
  interventionId: string;
  acknowledgment: string;
  restructuredTasks: PlanTask[];
  agentReasoning: string;
  followupHint?: string;
}
