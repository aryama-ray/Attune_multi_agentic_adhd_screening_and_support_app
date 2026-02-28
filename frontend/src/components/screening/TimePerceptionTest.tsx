"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TimePerceptionMetrics, TimeTrialResult } from "@/types";

// ── Scoring helpers ──────────────────────────────────────────────────────────

const TARGETS_MS = [3000, 5000, 10000, 15000, 20000];

function shuffleTargets(arr: number[]): number[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function computeMetrics(trials: TimeTrialResult[]): TimePerceptionMetrics {
  const errors = trials.map((t) => t.errorMs);
  const errorPcts = trials.map((t) => t.errorPct);
  const meanErrorMs = errors.reduce((a, b) => a + b, 0) / errors.length;
  const meanErrorPct = errorPcts.reduce((a, b) => a + b, 0) / errorPcts.length;
  const meanDiff = trials.reduce((s, t) => s + (t.actualMs - t.targetMs), 0) / trials.length;
  const bias: TimePerceptionMetrics["bias"] =
    meanDiff > 500 ? "overestimator" : meanDiff < -500 ? "underestimator" : "accurate";
  return { meanErrorMs, meanErrorPct, stdDevMs: stdDev(errors), bias, trials };
}

function computeScore(meanErrorPct: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - meanErrorPct * 2)));
}

function interpretScore(score: number, bias: TimePerceptionMetrics["bias"]): string {
  const biasNote =
    bias === "overestimator"
      ? " You tend to overestimate durations."
      : bias === "underestimator"
      ? " You tend to underestimate durations — tasks may feel shorter than they are."
      : "";

  if (score >= 80)
    return `Excellent time awareness. Your internal clock is well-calibrated.${biasNote}`;
  if (score >= 60)
    return `Good time awareness with minor drift.${biasNote} Using timers for longer tasks can help.`;
  if (score >= 40)
    return `Moderate time perception variability.${biasNote} External timers and alarms are especially useful.`;
  return `High time perception variability — a common trait in people with attention differences.${biasNote} External timers can be a powerful tool.`;
}

// ── Component ────────────────────────────────────────────────────────────────

type Phase = "intro" | "ready" | "measuring" | "trial_result" | "done";

interface Props {
  onComplete: (metrics: TimePerceptionMetrics, score: number) => void;
}

export default function TimePerceptionTest({ onComplete }: Props) {
  // Shuffle targets once on mount
  const targets = useRef<number[]>(shuffleTargets(TARGETS_MS));

  const [phase, setPhase] = useState<Phase>("intro");
  const [trialIndex, setTrialIndex] = useState(0);
  const [trials, setTrials] = useState<TimeTrialResult[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const [lastTrial, setLastTrial] = useState<TimeTrialResult | null>(null);

  // Prevent state updates after unmount
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const currentTarget = targets.current[trialIndex];

  function startTrial() {
    setPhase("ready");
  }

  function handleStart() {
    startTimeRef.current = Date.now();
    setPhase("measuring");
  }

  function handleStop() {
    if (!startTimeRef.current) return;
    const actual = Date.now() - startTimeRef.current;
    const target = currentTarget;
    const errorMs = Math.abs(actual - target);
    const errorPct = (errorMs / target) * 100;
    const trial: TimeTrialResult = {
      trialIndex,
      targetMs: target,
      actualMs: actual,
      errorMs,
      errorPct,
    };
    const newTrials = [...trials, trial];
    setTrials(newTrials);
    setLastTrial(trial);
    setPhase("trial_result");
  }

  const finishAll = useCallback((finalTrials: TimeTrialResult[]) => {
    const metrics = computeMetrics(finalTrials);
    const score = computeScore(metrics.meanErrorPct);
    onComplete(metrics, score);
  }, [onComplete]);

  function nextTrial() {
    const newIndex = trialIndex + 1;
    if (newIndex >= targets.current.length) {
      // Last trial done — compute and report
      finishAll(trials);
      setPhase("done");
    } else {
      setTrialIndex(newIndex);
      setPhase("ready");
    }
  }

  // ── Pulse animation CSS ──────────────────────────────────────────────────
  const pulse = `
    @keyframes tp-pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.08); opacity: 1; }
    }
  `;

  const progressDots = targets.current.map((_, i) => (
    <span
      key={i}
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        i < trials.length
          ? "bg-accent"
          : i === trialIndex && phase !== "intro"
          ? "bg-primary"
          : "bg-border"
      }`}
    />
  ));

  // ── Render ───────────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center max-w-lg mx-auto">
        <div className="text-4xl">⏱️</div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Time Awareness Test</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We&apos;ll give you a target duration. Press <strong>Start</strong>, wait what you think is
          that long, then press <strong>Stop</strong>. There are 5 rounds — go with your gut feeling.
          Don&apos;t count seconds!
        </p>
        <button
          onClick={startTrial}
          className="mt-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Begin
        </button>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center max-w-lg mx-auto">
        <div className="flex gap-2">{progressDots}</div>
        <p className="text-xs font-medium uppercase tracking-widest text-faint-foreground">
          Round {trialIndex + 1} of 5
        </p>
        <h2 className="font-serif text-4xl font-bold text-primary">
          {currentTarget / 1000} seconds
        </h2>
        <p className="text-sm text-muted-foreground">
          Press <strong>Start</strong> then <strong>Stop</strong> when you think that time has passed.
        </p>
        <button
          onClick={handleStart}
          className="rounded-xl bg-primary px-10 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Start
        </button>
      </div>
    );
  }

  if (phase === "measuring") {
    return (
      <div className="flex flex-col items-center gap-8 py-10 text-center max-w-lg mx-auto">
        <style>{pulse}</style>
        <div className="flex gap-2">{progressDots}</div>
        <p className="text-xs font-medium uppercase tracking-widest text-faint-foreground">
          Round {trialIndex + 1} of 5 — timer running
        </p>
        {/* Animated pulse circle */}
        <div
          style={{ animation: "tp-pulse 1.4s ease-in-out infinite" }}
          className="w-32 h-32 rounded-full border-4 border-primary bg-primary/10 flex items-center justify-center"
        >
          <span className="text-3xl">⏳</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Press <strong>Stop</strong> when you think the time is up.
        </p>
        <button
          onClick={handleStop}
          className="rounded-xl bg-error px-10 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Stop
        </button>
      </div>
    );
  }

  if (phase === "trial_result" && lastTrial) {
    const isLast = trialIndex === targets.current.length - 1;
    const pct = Math.round(lastTrial.errorPct);
    const color = pct <= 15 ? "text-accent" : pct <= 35 ? "text-warning" : "text-error";
    const actual = (lastTrial.actualMs / 1000).toFixed(1);
    const target = (lastTrial.targetMs / 1000).toFixed(0);
    const diff = lastTrial.actualMs - lastTrial.targetMs;
    const diffLabel = diff > 0 ? `+${(diff / 1000).toFixed(1)}s` : `${(diff / 1000).toFixed(1)}s`;

    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center max-w-lg mx-auto">
        <div className="flex gap-2">{progressDots}</div>
        <div className="rounded-2xl border border-border bg-surface p-8 w-full">
          <p className="text-xs font-medium uppercase tracking-widest text-faint-foreground mb-4">
            Round {trialIndex + 1} result
          </p>
          <div className="flex justify-around gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="font-serif text-3xl font-bold text-foreground">{target}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your estimate</p>
              <p className="font-serif text-3xl font-bold text-foreground">{actual}s</p>
            </div>
          </div>
          <p className={`mt-4 text-sm font-semibold ${color}`}>
            {diffLabel} ({pct}% off)
          </p>
        </div>
        <button
          onClick={nextTrial}
          className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          {isLast ? "See Results" : "Next Round →"}
        </button>
      </div>
    );
  }

  // "done" phase — parent handles transition
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="text-4xl">✓</div>
      <p className="text-muted-foreground">Processing results…</p>
    </div>
  );
}
