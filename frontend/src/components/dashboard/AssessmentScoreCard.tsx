"use client";

import { useEffect, useState } from "react";
import type { CognitiveTestResult } from "@/types";

// ── Score ring (animated SVG circle) ────────────────────────────────────────

const R = 36;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ScoreRing({
  test,
  label,
}: {
  test?: CognitiveTestResult;
  label: string;
}) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!test) return;
    const id = setTimeout(() => setAnimated(test.score), 150);
    return () => clearTimeout(id);
  }, [test]);

  const dashOffset = CIRCUMFERENCE * (1 - animated / 100);
  const score = test?.score ?? null;

  const scoreColor =
    score === null
      ? "#d9d3c7"
      : score >= 70
      ? "#3f8265"   // accent
      : score >= 40
      ? "#8b7355"   // warning
      : "#8b4a4a";  // error

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="44"
            cy="44"
            r={R}
            fill="none"
            stroke="#e7e5e0"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="44"
            cy="44"
            r={R}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        {/* Score label in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {score !== null ? (
            <span
              className="font-serif text-xl font-bold"
              style={{ color: scoreColor }}
            >
              {score}
            </span>
          ) : (
            <span className="text-sm text-faint-foreground">—</span>
          )}
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground leading-tight max-w-[80px]">
        {label}
      </p>
      {!test && (
        <span className="text-[10px] text-faint-foreground">Not taken</span>
      )}
    </div>
  );
}

// ── Main card ────────────────────────────────────────────────────────────────

const TEST_ORDER = ["asrs", "time_perception", "reaction_time"] as const;

const TEST_META: Record<
  string,
  { label: string; shortLabel: string; icon: string }
> = {
  asrs: {
    label: "Attention Profile",
    shortLabel: "Attention",
    icon: "🧠",
  },
  time_perception: {
    label: "Time Awareness",
    shortLabel: "Time",
    icon: "⏱️",
  },
  reaction_time: {
    label: "Reaction Speed",
    shortLabel: "Reaction",
    icon: "⚡",
  },
};

interface Props {
  tests: CognitiveTestResult[];
}

export default function AssessmentScoreCard({ tests }: Props) {
  const byType = Object.fromEntries(tests.map((t) => [t.testType, t]));
  const completedCount = TEST_ORDER.filter((t) => byType[t]).length;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-foreground text-base">
          Assessment Profile
        </h2>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{TEST_ORDER.length} completed
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        Score reflects attention-related traits across three cognitive measures.
      </p>

      {/* Score rings */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {TEST_ORDER.map((type) => (
          <ScoreRing
            key={type}
            test={byType[type]}
            label={TEST_META[type].shortLabel}
          />
        ))}
      </div>

      {/* Score key */}
      <div className="flex gap-4 text-[10px] text-muted-foreground mb-5">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-accent" /> 70–100 Strong
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-warning" /> 40–69 Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-error" /> 0–39 Variable
        </span>
      </div>

      {/* Interpretations */}
      {completedCount > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          {TEST_ORDER.map((type) => {
            const t = byType[type];
            if (!t) return null;
            return (
              <div key={type} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 shrink-0">{TEST_META[type].icon}</span>
                <div>
                  <span className="font-medium text-foreground">{TEST_META[type].label}: </span>
                  <span className="text-muted-foreground">{t.interpretation}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completedCount === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Complete the assessment in{" "}
          <a href="/screening" className="text-primary underline-offset-2 hover:underline">
            Screening
          </a>{" "}
          to see your profile.
        </p>
      )}
    </div>
  );
}
