import axios from "axios";
import type {
  User,
  ASRSAnswer,
  ScreeningResponse,
  ProfileResponse,
  PlanResponse,
  InterventionResponse,
  DashboardResponse,
  BrainState,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30s — CrewAI calls can take a few seconds
});

// ── Auth ──
export async function createGuestSession(): Promise<User> {
  const { data } = await api.post<User>("/api/auth/guest");
  return data;
}

// ── Screening ──
export async function evaluateScreening(
  userId: string,
  answers: ASRSAnswer[]
): Promise<ScreeningResponse> {
  const { data } = await api.post<ScreeningResponse>("/api/screening/evaluate", {
    userId,
    answers,
  });
  return data;
}

// ── Profile ──
export async function fetchProfile(userId: string): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>(`/api/profile/${userId}`);
  return data;
}

// ── Plan ──
export async function generatePlan(
  userId: string,
  brainState: BrainState,
  tasks?: string[]
): Promise<PlanResponse> {
  const { data } = await api.post<PlanResponse>("/api/plan/generate", {
    userId,
    brainState,
    tasks,
  });
  return data;
}

// ── Intervention ──
export async function triggerIntervention(
  userId: string,
  planId: string,
  stuckTaskIndex: number,
  userMessage?: string
): Promise<InterventionResponse> {
  const { data } = await api.post<InterventionResponse>("/api/plan/intervene", {
    userId,
    planId,
    stuckTaskIndex,
    userMessage,
  });
  return data;
}

// ── Dashboard ──
export async function fetchDashboard(userId: string): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>(`/api/dashboard/${userId}`);
  return data;
}
