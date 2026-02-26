"use client";

import { useState, useEffect, useCallback } from "react";
import { readTrend } from "@/lib/trendStore";
import type { DashboardData } from "@/types";

export interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(userId: string | null): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    if (!userId) return;
    setIsLoading(true);

    const trend = readTrend(userId);

    if (trend.length === 0) {
      // No data yet — return null so the page shows the empty state
      setData(null);
      setIsLoading(false);
      return;
    }

    // Momentum score = average moodScore scaled to 0–100
    const scores = trend.map((t) => t.moodScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const momentumScore = Math.round(avg * 10);

    // Delta: compare last half vs first half of available data
    let momentumDelta = 0;
    if (trend.length >= 2) {
      const half = Math.floor(trend.length / 2);
      const recent = trend.slice(half);
      const earlier = trend.slice(0, half);
      const recentAvg = recent.reduce((a, b) => a + b.moodScore, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b.moodScore, 0) / earlier.length;
      momentumDelta = Math.round((recentAvg - earlierAvg) * 10);
    }

    setData({
      momentumScore,
      momentumDelta,
      trend,
      annotations: [],   // populated by agent in future
      hypotheses: [],    // populated as patterns emerge
    });

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refresh: fetchDashboard };
}
