"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type { ReactionTimeMetrics, ReactionTrialResult } from "@/types";

// ── Constants ────────────────────────────────────────────────────────────────

const PRACTICE_COUNT = 3;
const SCORED_COUNT   = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

function median(vals: number[]) {
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function stdDev(vals: number[]) {
  if (vals.length < 2) return 0;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
}

function computeMetrics(scored: number[], all: ReactionTrialResult[]): ReactionTimeMetrics {
  const falseStarts = all.filter((t) => t.isFalseStart).length;
  if (!scored.length)
    return { meanRtMs: 999, medianRtMs: 999, stdDevMs: 0, consistency: 0, falseStarts, trials: all };
  const meanRtMs   = Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
  const medianRtMs = Math.round(median(scored));
  const std        = Math.round(stdDev(scored));
  const cv         = meanRtMs > 0 ? std / meanRtMs : 1;
  const consistency = Math.max(0, Math.min(100, Math.round(100 - cv * 200)));
  return { meanRtMs, medianRtMs, stdDevMs: std, consistency, falseStarts, trials: all };
}

function computeScore(m: ReactionTimeMetrics) {
  // speedScore: 100 at 150ms, 0 at 750ms (600ms range for web-based test)
  const speedScore = Math.max(0, Math.min(100, Math.round(100 - (m.meanRtMs - 150) / 6)));
  return Math.round(speedScore * 0.5 + m.consistency * 0.5);
}

// Category thresholds — calibrated for web-based testing.
// Typical human visual RT: 150–350ms. Browser adds ~16ms overhead.
function rtCategory(ms: number): { label: string; color: string; bg: string } {
  if (ms < 300) return { label: "Excellent", color: "#3f8265", bg: "#3f826520" };
  if (ms < 450) return { label: "Good",      color: "#3f8265", bg: "#3f826520" };
  if (ms < 650) return { label: "Average",   color: "#8b7355", bg: "#8b735520" };
  return          { label: "Slow",      color: "#8b4a4a", bg: "#8b4a4a20" };
}

// ── Types ────────────────────────────────────────────────────────────────────

type Phase = "intro" | "waiting" | "active" | "false_start" | "round_result"
           | "scored_brief" | "results" | "done";
type Stage = "practice" | "scored";

interface Props {
  onComplete: (metrics: ReactionTimeMetrics, score: number) => void;
}

// ── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  scoredRts,
  allTrials,
  onContinue,
}: {
  scoredRts: number[];
  allTrials: ReactionTrialResult[];
  onContinue: (m: ReactionTimeMetrics, score: number) => void;
}) {
  const metrics = computeMetrics(scoredRts, allTrials);
  const score   = computeScore(metrics);
  const best    = Math.min(...scoredRts);
  const worst   = Math.max(...scoredRts);
  const scale   = Math.max(worst, 600); // bar chart ceiling

  const fastCount = scoredRts.filter((r) => r < 450).length;
  const avgCount  = scoredRts.filter((r) => r >= 450 && r < 650).length;
  const slowCount = scoredRts.filter((r) => r >= 650).length;

  // Interpretation
  let interp = "";
  if (metrics.meanRtMs < 300)
    interp = "Excellent reaction speed. Your attention system responds quickly and reliably to new stimuli.";
  else if (metrics.meanRtMs < 450)
    interp = "Good reaction speed — well within the typical range. Your responses were reliable across rounds.";
  else if (metrics.meanRtMs < 650)
    interp = "Average reaction speed with some variability. This is common when attention fluctuates during a task.";
  else
    interp = "Higher reaction times often reflect attention fluctuations — very manageable with the right structure and strategies.";

  if (metrics.consistency >= 75)
    interp += " Your times were highly consistent across all 10 rounds.";
  else if (metrics.consistency >= 50)
    interp += " Your consistency was reasonable across rounds.";
  else
    interp += " Your times varied noticeably between rounds, which can reflect attention shifts during the test.";

  return (
    <div className="max-w-lg mx-auto py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-foreground">Reaction Time Results</h2>
        <p className="text-sm text-muted-foreground mt-1">10 scored rounds</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Average",     value: `${metrics.meanRtMs}ms` },
          { label: "Best round",  value: `${best}ms` },
          { label: "Consistency", value: `${metrics.consistency}/100` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="font-serif text-xl font-bold text-primary">{value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart — each row = one scored round */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Round-by-round</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-5 border-t-2 border-dashed border-foreground/40" />
            avg ({metrics.meanRtMs}ms)
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {scoredRts.map((rt, i) => {
            const cat    = rtCategory(rt);
            const barPct = Math.min((rt / scale) * 100, 100);
            const avgPct = Math.min((metrics.meanRtMs / scale) * 100, 100);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-right text-[11px] text-faint-foreground">{i + 1}</span>

                <div className="relative flex-1 h-5 overflow-hidden rounded bg-muted">
                  {/* Bar */}
                  <div
                    className="absolute left-0 top-0 h-full rounded transition-all"
                    style={{ width: `${barPct}%`, backgroundColor: cat.color, opacity: 0.85 }}
                  />
                  {/* Average reference line */}
                  <div
                    className="absolute top-0 h-full w-px"
                    style={{ left: `${avgPct}%`, backgroundColor: "rgba(58,82,104,0.4)" }}
                  />
                </div>

                <span
                  className="w-16 shrink-0 text-right text-[11px] font-mono font-semibold"
                  style={{ color: cat.color }}
                >
                  {rt}ms
                </span>
                <span
                  className="w-16 shrink-0 text-[10px]"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Speed zone legend */}
        <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground border-t border-border pt-3">
          <span style={{ color: "#3f8265" }}>● &lt;450ms Fast</span>
          <span style={{ color: "#8b7355" }}>● 450–650ms Average</span>
          <span style={{ color: "#8b4a4a" }}>● &gt;650ms Slow</span>
        </div>
      </div>

      {/* Distribution pills */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { count: fastCount, label: "Fast",    sub: "< 450ms",   color: "#3f8265" },
          { count: avgCount,  label: "Average", sub: "450–650ms", color: "#8b7355" },
          { count: slowCount, label: "Slow",    sub: "> 650ms",   color: "#8b4a4a" },
        ].map(({ count, label, sub, color }) => (
          <div key={label} className="rounded-xl border border-border bg-surface py-3">
            <p className="font-serif text-2xl font-bold" style={{ color }}>{count}</p>
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[10px] text-faint-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-faint-foreground mb-2">
          What this means
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{interp}</p>
      </div>

      <button
        onClick={() => onContinue(metrics, score)}
        className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Continue →
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ReactionTimeTest({ onComplete }: Props) {
  const [phase, setPhase]       = useState<Phase>("intro");
  const [stage, setStage]       = useState<Stage>("practice");
  const [roundIndex, setRoundIndex] = useState(0);
  const [lastRt, setLastRt]     = useState<number | null>(null);
  const [scoredRts, setScoredRts]   = useState<number[]>([]);
  const [allTrials, setAllTrials]   = useState<ReactionTrialResult[]>([]);
  const [falseFlash, setFalseFlash] = useState(false);

  // Refs — updated synchronously so timeout callbacks see fresh values
  const stimulusAt   = useRef<number | null>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted      = useRef(true);
  const stageRef     = useRef<Stage>("practice");
  const roundRef     = useRef(0);
  const scoredRef    = useRef<number[]>([]);
  const trialsRef    = useRef<ReactionTrialResult[]>([]);

  useEffect(() => { stageRef.current  = stage;      }, [stage]);
  useEffect(() => { roundRef.current  = roundIndex;  }, [roundIndex]);
  useEffect(() => { scoredRef.current = scoredRts;   }, [scoredRts]);
  useEffect(() => { trialsRef.current = allTrials;   }, [allTrials]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Stamp stimulusAt after React commits the green circle, before browser paint ──
  // useLayoutEffect fires synchronously after DOM commit, before the next paint.
  // This ensures stimulusAt aligns with the frame the user actually sees green.
  useLayoutEffect(() => {
    if (phase !== "active") return;
    stimulusAt.current = Date.now();

    // Start lapse timeout from here — same temporal anchor as stimulusAt
    const lapseTimer = setTimeout(() => {
      if (!mounted.current || !stimulusAt.current) return;
      recordReaction(2500);
    }, 3000);
    timerRef.current = lapseTimer;

    return () => clearTimeout(lapseTimer);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core trial logic ───────────────────────────────────────────────────────

  const beginWaiting = useCallback(() => {
    if (!mounted.current) return;
    stimulusAt.current = null;
    setPhase("waiting");

    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => {
      if (!mounted.current) return;
      // Just trigger the phase change — stimulusAt is stamped in useLayoutEffect
      // after React commits the green circle to the DOM (before browser paint).
      setPhase("active");
    }, delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function recordReaction(rt: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    stimulusAt.current = null;

    const curStage = stageRef.current;
    const curRound = roundRef.current;

    const trial: ReactionTrialResult = {
      trialIndex: curStage === "practice" ? curRound : PRACTICE_COUNT + curRound,
      reactionTimeMs: rt,
      isFalseStart: false,
    };

    const newAll = [...trialsRef.current, trial];
    setAllTrials(newAll);
    trialsRef.current = newAll;

    let newScored = scoredRef.current;
    if (curStage === "scored") {
      newScored = [...scoredRef.current, rt];
      setScoredRts(newScored);
      scoredRef.current = newScored;
    }

    setLastRt(rt);
    setPhase("round_result");

    timerRef.current = setTimeout(() => {
      if (!mounted.current) return;
      advance(curStage, curRound, newScored, newAll);
    }, 1400);
  }

  function advance(
    curStage: Stage,
    curRound: number,
    curScored: number[],
    curAll: ReactionTrialResult[],
  ) {
    const next = curRound + 1;

    if (curStage === "practice") {
      if (next >= PRACTICE_COUNT) {
        setPhase("scored_brief");
        setStage("scored");
        stageRef.current = "scored";
        setRoundIndex(0);
        roundRef.current = 0;
      } else {
        setRoundIndex(next);
        roundRef.current = next;
        beginWaiting();
      }
    } else {
      if (next >= SCORED_COUNT) {
        setPhase("results");
      } else {
        setRoundIndex(next);
        roundRef.current = next;
        beginWaiting();
      }
    }
  }

  // ── Input handler — onPointerDown for accurate timing ─────────────────────
  // onPointerDown fires at hardware-press time, 50-150ms earlier than onClick.
  // pressTime captured as FIRST operation — before any conditionals — for max accuracy.

  function handlePointerDown(e: React.PointerEvent) {
    const pressTime = Date.now(); // ← capture immediately, before any other work
    e.preventDefault(); // prevents ghost onClick on touch

    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);

      const trial: ReactionTrialResult = {
        trialIndex: stage === "practice" ? roundIndex : PRACTICE_COUNT + roundIndex,
        reactionTimeMs: 0,
        isFalseStart: true,
      };
      const newAll = [...trialsRef.current, trial];
      setAllTrials(newAll);
      trialsRef.current = newAll;

      setFalseFlash(true);
      setPhase("false_start");
      timerRef.current = setTimeout(() => {
        if (!mounted.current) return;
        setFalseFlash(false);
        beginWaiting();
      }, 1200);

    } else if (phase === "active" && stimulusAt.current) {
      // pressTime was captured at the very top of this handler
      const rt = pressTime - stimulusAt.current;
      recordReaction(rt);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const isPractice  = stage === "practice";
  const totalRounds = isPractice ? PRACTICE_COUNT : SCORED_COUNT;
  const displayNum  = roundIndex + 1;
  const avgSoFar    = scoredRts.length
    ? Math.round(scoredRts.reduce((a, b) => a + b, 0) / scoredRts.length)
    : null;

  // ── Screens ────────────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center max-w-lg mx-auto">
        <span className="text-4xl">⚡</span>
        <h2 className="font-serif text-2xl font-bold text-foreground">Reaction Time Test</h2>

        <div className="w-full rounded-xl border border-border bg-surface p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">1</span>
            <div>
              <p className="text-sm font-semibold text-foreground">3 Practice rounds</p>
              <p className="text-xs text-muted-foreground">Get comfortable with the rhythm. Not scored.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
            <div>
              <p className="text-sm font-semibold text-foreground">10 Scored rounds</p>
              <p className="text-xs text-muted-foreground">Speed + consistency across all 10 taps are measured.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 px-5 py-3 text-sm text-muted-foreground text-left w-full">
          A circle appears after a random delay.{" "}
          <strong className="text-foreground">Tap it the instant it turns green.</strong>{" "}
          Tapping too early resets the round.
        </div>

        <button
          onClick={() => { setStage("practice"); setRoundIndex(0); beginWaiting(); }}
          className="rounded-xl bg-primary px-10 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Start practice rounds
        </button>
      </div>
    );
  }

  if (phase === "scored_brief") {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center max-w-lg mx-auto">
        <span className="text-3xl">✓</span>
        <span className="rounded-full bg-accent/10 px-4 py-1 text-xs font-semibold text-accent uppercase tracking-widest">
          Practice complete
        </span>
        <h2 className="font-serif text-2xl font-bold text-foreground">Now the real 10 rounds</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          These are scored. Your speed and consistency across all 10 taps will be measured.
        </p>
        <button
          onClick={() => {
            stageRef.current = "scored";
            roundRef.current = 0;
            setStage("scored");
            setRoundIndex(0);
            beginWaiting();
          }}
          className="rounded-xl bg-primary px-10 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Start — Round 1 of 10
        </button>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <ResultsScreen
        scoredRts={scoredRts}
        allTrials={allTrials}
        onContinue={(metrics, score) => {
          setPhase("done");
          onComplete(metrics, score);
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-4xl">✓</span>
        <p className="text-muted-foreground">Saving results…</p>
      </div>
    );
  }

  // ── Active trial UI ────────────────────────────────────────────────────────

  const circleStyle =
    phase === "active"       ? { bg: "bg-accent border-accent",      text: "text-white",          label: "TAP!" }
    : phase === "false_start" ? { bg: "bg-error border-error",        text: "text-white",          label: "Too early!" }
    : phase === "round_result"? { bg: "bg-accent/10 border-accent",   text: "text-accent",         label: "✓" }
    :                           { bg: "bg-muted border-border",        text: "text-muted-foreground", label: "Wait…" };

  const lastCat = lastRt !== null ? rtCategory(lastRt) : null;

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center max-w-lg mx-auto select-none">

      {/* Stage badge + progress */}
      <div className="w-full flex flex-col items-center gap-1.5">
        {isPractice ? (
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Practice {displayNum} of {totalRounds} — not scored
          </span>
        ) : (
          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary uppercase tracking-widest">
            Round {displayNum} of {totalRounds}
          </span>
        )}
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isPractice ? "bg-muted-foreground" : "bg-primary"}`}
            style={{ width: `${(roundIndex / totalRounds) * 100}%` }}
          />
        </div>
      </div>

      {/* Instruction */}
      <p className="text-sm text-muted-foreground h-5">
        {phase === "waiting"      && "Watch the circle — tap the instant it turns green"}
        {phase === "active"       && "Tap now!"}
        {phase === "false_start"  && "Wait for green before tapping"}
        {phase === "round_result" && ""}
      </p>

      {/* Circle */}
      {phase === "round_result" ? (
        /* Result bubble — not a tap target */
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="w-36 h-36 rounded-full border-4 border-accent bg-accent/10 flex flex-col items-center justify-center gap-0.5"
          >
            <span className="font-serif text-3xl font-bold" style={{ color: lastCat?.color }}>
              {lastRt}
              <span className="text-base font-normal">ms</span>
            </span>
            {lastCat && (
              <span className="text-xs font-semibold" style={{ color: lastCat.color }}>
                {lastCat.label}
              </span>
            )}
          </div>
          {!isPractice && avgSoFar && (
            <p className="text-xs text-muted-foreground">
              Running avg: <span className="font-semibold text-foreground">{avgSoFar}ms</span>
            </p>
          )}
          <p className="text-xs text-faint-foreground">Next round in a moment…</p>
        </div>
      ) : (
        /* Tap target — uses onPointerDown for accurate timing.
           NO transition-colors: color must switch instantly so stimulusAt timestamp
           aligns with the exact frame the user sees green, not 75ms later. */
        <button
          type="button"
          onPointerDown={handlePointerDown}
          className={`w-36 h-36 rounded-full border-4 flex items-center justify-center focus:outline-none touch-none ${circleStyle.bg}`}
          style={{ cursor: phase === "waiting" || phase === "active" ? "pointer" : "default" }}
        >
          <span className={`text-lg font-bold ${circleStyle.text}`}>{circleStyle.label}</span>
        </button>
      )}

      {/* False start message */}
      {falseFlash && (
        <p className="text-sm font-medium text-error">✕ Too early — round restarting</p>
      )}

      {/* Scored history chips */}
      {!isPractice && scoredRts.length > 0 && phase !== "round_result" && (
        <div className="flex gap-1.5 flex-wrap justify-center">
          {scoredRts.map((rt, i) => {
            const cat = rtCategory(rt);
            return (
              <span
                key={i}
                className="rounded-full border px-2.5 py-0.5 text-xs font-mono"
                style={{ borderColor: cat.color, color: cat.color, background: cat.bg }}
              >
                {rt}ms
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
