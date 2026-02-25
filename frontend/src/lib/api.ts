import axios from "axios";
import type { PlanResponse, InterventionResponse, BrainState } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Auth ──

export interface GuestLoginData {
  userId: string;
  name: string;
  isGuest: boolean;
  hasProfile: boolean;
}

export async function createGuestSession(): Promise<GuestLoginData> {
  const { data } = await api.post<GuestLoginData>("/api/auth/guest");
  return data;
}

// ── Plan ──

export async function generatePlan(
  userId: string,
  brainState: BrainState,
  tasks?: string[],
): Promise<PlanResponse> {
  const { data } = await api.post<PlanResponse>("/api/plan/generate", {
    userId,
    brainState,
    tasks,
  });
  return data;
}

export async function triggerIntervention(
  userId: string,
  planId: string,
  stuckTaskIndex: number,
  userMessage?: string,
): Promise<InterventionResponse> {
  const { data } = await api.post<InterventionResponse>("/api/plan/intervene", {
    userId,
    planId,
    stuckTaskIndex,
    userMessage,
  });
  return data;
}

export default api;
