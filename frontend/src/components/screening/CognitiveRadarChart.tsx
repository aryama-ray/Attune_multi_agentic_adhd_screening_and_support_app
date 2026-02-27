"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import type { ScreeningResult } from "@/hooks/useScreeningChat";

interface CognitiveRadarChartProps {
  dimensions: ScreeningResult["dimensions"];
}

export default function CognitiveRadarChart({ dimensions }: CognitiveRadarChartProps) {
  const allPoints = Object.entries(dimensions).map(([dimension, score]) => ({
    dimension,
    score,
  }));

  // Stagger reveal: add one data point every 200ms
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= allPoints.length) return;
    const t = setTimeout(
      () => setVisibleCount((n) => n + 1),
      visibleCount === 0 ? 300 : 200
    );
    return () => clearTimeout(t);
  }, [visibleCount, allPoints.length]);

  // Fill missing dimensions with 0 so radar axes stay stable
  const data = allPoints.map((p, i) => ({
    dimension: p.dimension,
    score: i < visibleCount ? p.score : 0,
  }));

  return (
    <Card padding="lg" className="w-full">
      <h2 className="mb-6 text-center font-serif text-xl font-semibold text-foreground">
        Your Cognitive Profile
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} margin={{ top: 10, right: 36, bottom: 10, left: 36 }}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.22}
            isAnimationActive
            animationDuration={300}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}
