"use client";

import { useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { generatePlan, triggerIntervention } from "@/lib/api";
import type { BrainState, PlanResponse, InterventionResponse } from "@/types";

export interface UseDailyPlanReturn {
  brainState: BrainState | null;
  setBrainState: (state: BrainState) => void;
  plan: PlanResponse | null;
  isGenerating: boolean;
  generateDailyPlan: () => Promise<void>;
  isIntervening: boolean;
  intervention: InterventionResponse | null;
  triggerStuck: (taskIndex: number, message?: string) => Promise<void>;
  clearIntervention: () => void;
  error: string | null;
}

export function useDailyPlan(): UseDailyPlanReturn {
  const { user } = useUser();

  const [brainState, setBrainState] = useState<BrainState | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIntervening, setIsIntervening] = useState(false);
  const [intervention, setIntervention] = useState<InterventionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDailyPlan = useCallback(async () => {
    if (!user?.id || !brainState) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePlan(user.id, brainState);
      setPlan(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate plan";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, brainState]);

  const triggerStuck = useCallback(async (taskIndex: number, userMessage?: string) => {
    if (!user?.id || !plan?.planId) return;
    setIsIntervening(true);
    setError(null);
    try {
      const result = await triggerIntervention(user.id, plan.planId, taskIndex, userMessage);
      setIntervention(result);
      // Update the plan with restructured tasks
      setPlan(prev => prev ? { ...prev, tasks: result.restructuredTasks } : prev);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Intervention failed";
      setError(errMessage);
    } finally {
      setIsIntervening(false);
    }
  }, [user?.id, plan?.planId]);

  const clearIntervention = useCallback(() => {
    setIntervention(null);
  }, []);

  return {
    brainState,
    setBrainState,
    plan,
    isGenerating,
    generateDailyPlan,
    isIntervening,
    intervention,
    triggerStuck,
    clearIntervention,
    error,
  };
}
