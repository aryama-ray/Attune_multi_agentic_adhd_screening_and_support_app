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
