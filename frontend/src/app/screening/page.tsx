"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScreeningChat from "@/components/screening/ScreeningChat";
import CognitiveRadarChart from "@/components/screening/CognitiveRadarChart";
import ProfileTagsReveal from "@/components/screening/ProfileTagsReveal";
import TimePerceptionTest from "@/components/screening/TimePerceptionTest";
import ReactionTimeTest from "@/components/screening/ReactionTimeTest";
import { useScreeningChat } from "@/hooks/useScreeningChat";
import { saveTestResult } from "@/lib/api";
import { saveLocalTestResult } from "@/lib/cognitiveTestStore";
import type { TodayFeeling, TimePerceptionMetrics, ReactionTimeMetrics } from "@/types";

// ─── Assessment step types ────────────────────────────────────────────────────

type AssessmentStep = "asrs" | "transition" | "time_perception" | "reaction_time" | "complete";

const STEP_LABELS: { id: AssessmentStep; label: string; icon: string }[] = [
  { id: "asrs",            label: "Attention Profile", icon: "🧠" },
  { id: "time_perception", label: "Time Awareness",    icon: "⏱️" },
  { id: "reaction_time",   label: "Reaction Speed",    icon: "⚡" },
];

function StepIndicator({
  current,
  asrsDone,
}: {
  current: AssessmentStep;
  asrsDone: boolean;
}) {
  const stepOrder: AssessmentStep[] = ["asrs", "time_perception", "reaction_time"];
  const currentIdx = stepOrder.indexOf(current === "transition" ? "time_perception" : current);

  return (
    <div className="flex items-center justify-center gap-0 mb-8 select-none">
      {STEP_LABELS.map((step, i) => {
        const stepIdx = stepOrder.indexOf(step.id);
        const isDone =
          step.id === "asrs"
            ? asrsDone && current !== "asrs"
            : stepIdx < currentIdx || current === "complete";
        const isActive = stepIdx === currentIdx && current !== "complete";

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                  isDone
                    ? "bg-accent border-accent text-white"
                    : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <p
                className={[
                  "text-[10px] font-medium text-center w-20",
                  isActive ? "text-primary" : isDone ? "text-accent" : "text-faint-foreground",
                ].join(" ")}
              >
                {step.label}
              </p>
            </div>
            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className={[
                  "h-0.5 w-10 mb-5 mx-1 rounded-full",
                  stepIdx < currentIdx || (stepIdx === 0 && asrsDone && current !== "asrs")
                    ? "bg-accent"
                    : "bg-border",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Transition banner ────────────────────────────────────────────────────────

function TransitionBanner({ nextLabel, onContinue }: { nextLabel: string; onContinue: () => void }) {
  useEffect(() => {
    const id = setTimeout(onContinue, 2000);
    return () => clearTimeout(id);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="text-4xl animate-bounce">✓</div>
      <h2 className="font-serif text-2xl font-bold text-foreground">Nice work!</h2>
      <p className="text-muted-foreground text-sm">Moving on to the {nextLabel} test…</p>
      <div className="w-40 h-1 rounded-full bg-muted overflow-hidden mt-2">
        <div
          className="h-full bg-primary rounded-full"
          style={{ animation: "progress-fill 2s linear forwards" }}
        />
      </div>
      <style>{`@keyframes progress-fill { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}

// ─── Scale options ────────────────────────────────────────────────────────────

const SCALES = {
  focus: {
    label: "How focused do you feel?",
    low: "Very scattered",
    high: "Laser sharp",
    options: [
      { value: 1, emoji: "🌀", label: "Very scattered" },
      { value: 2, emoji: "😶‍🌫️", label: "Mostly drifting" },
      { value: 3, emoji: "🙂", label: "Getting there" },
      { value: 4, emoji: "🎯", label: "Fairly focused" },
      { value: 5, emoji: "⚡", label: "Laser sharp" },
    ],
  },
  energy: {
    label: "How's your energy level?",
    low: "Depleted",
    high: "Buzzing",
    options: [
      { value: 1, emoji: "🪫", label: "Depleted" },
      { value: 2, emoji: "😴", label: "Low" },
      { value: 3, emoji: "🙂", label: "Steady" },
      { value: 4, emoji: "⚡", label: "Energised" },
      { value: 5, emoji: "🚀", label: "Buzzing" },
    ],
  },
  mood: {
    label: "How's your mood?",
    low: "Very low",
    high: "Great",
    options: [
      { value: 1, emoji: "😔", label: "Very low" },
      { value: 2, emoji: "😕", label: "Low" },
      { value: 3, emoji: "😐", label: "Neutral" },
      { value: 4, emoji: "🙂", label: "Good" },
      { value: 5, emoji: "😄", label: "Great" },
    ],
  },
  calm: {
    label: "How calm do you feel?",
    low: "Very anxious",
    high: "Deeply calm",
    options: [
      { value: 1, emoji: "😰", label: "Very anxious" },
      { value: 2, emoji: "😬", label: "A bit tense" },
      { value: 3, emoji: "😐", label: "Neutral" },
      { value: 4, emoji: "😌", label: "Mostly calm" },
      { value: 5, emoji: "🧘", label: "Deeply calm" },
    ],
  },
} as const;

// ─── Scale row ────────────────────────────────────────────────────────────────

const ACTIVE_COLORS = [
  "border-red-400 bg-red-400",
  "border-orange-400 bg-orange-400",
  "border-yellow-400 bg-yellow-400",
  "border-teal-500 bg-teal-500",
  "border-primary bg-primary",
];

function ScaleRow({
  options,
  value,
  onChange,
}: {
  options: readonly { value: number; emoji: string; label: string }[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={[
            "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-2.5 transition-all",
            value === opt.value
              ? `${ACTIVE_COLORS[opt.value - 1]} text-white scale-105 shadow-md`
              : "border-border bg-surface hover:border-primary/40 hover:bg-primary/5",
          ].join(" ")}
        >
          <span className="text-lg">{opt.emoji}</span>
          <span className="hidden text-[10px] font-semibold sm:block leading-tight text-center px-0.5">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Yes / No pill ────────────────────────────────────────────────────────────

function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={[
            "rounded-full border px-4 py-2 text-sm font-medium transition-all",
            value === v
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-border bg-surface text-foreground hover:border-primary/60 hover:bg-primary/5",
          ].join(" ")}
        >
          {v ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// ─── How Are You Feeling — check-in form ─────────────────────────────────────

function CheckInForm({ onDone }: { onDone: () => void }) {
  const { updateTodayFeeling } = useUser();

  const [focusLevel,  setFocusLevel]  = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [moodLevel,   setMoodLevel]   = useState<number | null>(null);
  const [calmLevel,   setCalmLevel]   = useState<number | null>(null);
  const [wellRested,  setWellRested]  = useState<boolean | null>(null);
  const [hadCaffeine, setHadCaffeine] = useState<boolean | null>(null);
  const [hadAlcohol,  setHadAlcohol]  = useState<boolean | null>(null);

  const isValid =
    focusLevel  !== null &&
    energyLevel !== null &&
    moodLevel   !== null &&
    calmLevel   !== null &&
    wellRested  !== null &&
    hadCaffeine !== null &&
    hadAlcohol  !== null;

  function handleSubmit() {
    if (!isValid) return;
    const feeling: TodayFeeling = {
      focusLevel:  focusLevel!,
      energyLevel: energyLevel!,
      moodLevel:   moodLevel!,
      calmLevel:   calmLevel!,
      wellRested:  wellRested!,
      hadCaffeine: hadCaffeine!,
      hadAlcohol:  hadAlcohol!,
    };
    updateTodayFeeling(feeling);
    onDone();
  }

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          How are you feeling?
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          A quick check-in before the assessment — be honest, there are no right answers.
        </p>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-7 rounded-2xl border border-border bg-surface p-6">
        {/* Four scale questions */}
        {(["focus", "energy", "mood", "calm"] as const).map((key) => {
          const scale = SCALES[key];
          const values = { focus: focusLevel, energy: energyLevel, mood: moodLevel, calm: calmLevel };
          const setters = { focus: setFocusLevel, energy: setEnergyLevel, mood: setMoodLevel, calm: setCalmLevel };
          return (
            <div key={key} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">{scale.label}</p>
              <ScaleRow options={scale.options} value={values[key]} onChange={setters[key]} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{scale.low}</span>
                <span>{scale.high}</span>
              </div>
            </div>
          );
        })}

        {/* Binary questions */}
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-foreground">😴 Are you well rested?</span>
            <YesNo value={wellRested} onChange={setWellRested} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-foreground">☕ Had caffeine today?</span>
            <YesNo value={hadCaffeine} onChange={setHadCaffeine} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-foreground">🍺 Had any alcohol today?</span>
            <YesNo value={hadAlcohol} onChange={setHadAlcohol} />
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!isValid} size="lg">
        Continue to Assessment
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScreeningPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Check-in is shown for every user on every visit to /screening
  const [checkinDone, setCheckinDone] = useState(false);

  // Multi-step assessment flow
  const [assessmentStep, setAssessmentStep] = useState<AssessmentStep>("asrs");

  const {
    phase,
    currentIndex,
    answers,
    result,
    error,
    totalQuestions,
    currentQuestion,
    startScreening,
    submitAnswer,
  } = useScreeningChat();

  // Advance from ASRS complete → Time Perception
  useEffect(() => {
    if (phase === "complete" && assessmentStep === "asrs") {
      setAssessmentStep("transition");
    }
  }, [phase, assessmentStep]);

  const handleTimePerceptionComplete = useCallback(
    (metrics: TimePerceptionMetrics, score: number) => {
      const interpretation =
        score >= 80
          ? `Excellent time awareness. Your internal clock is well-calibrated.${metrics.bias === "overestimator" ? " You tend to overestimate durations." : metrics.bias === "underestimator" ? " You tend to underestimate durations — tasks may feel shorter than they are." : ""}`
          : score >= 60
          ? `Good time awareness with minor drift.${metrics.bias !== "accurate" ? (metrics.bias === "overestimator" ? " Slight tendency to overestimate." : " Slight tendency to underestimate.") : ""} Using timers for longer tasks helps.`
          : score >= 40
          ? `Moderate time perception variability.${metrics.bias !== "accurate" ? (metrics.bias === "underestimator" ? " Tasks may feel shorter than they are." : " Tasks may feel longer than they are.") : ""} External timers are especially useful.`
          : `High time perception variability — a common trait in people with attention differences.${metrics.bias !== "accurate" ? (metrics.bias === "underestimator" ? " Tasks tend to feel shorter than they are." : " Tasks tend to feel longer than they are.") : ""} External timers can be a powerful tool.`;

      const payload = {
        userId: user?.id ?? "guest",
        testType: "time_perception" as const,
        score,
        rawData: { trials: metrics.trials },
        metrics: {
          meanErrorMs: metrics.meanErrorMs,
          meanErrorPct: metrics.meanErrorPct,
          stdDevMs: metrics.stdDevMs,
          bias: metrics.bias,
        },
        label: "Time Awareness Test",
        interpretation,
      };

      // Persist locally (always works)
      saveLocalTestResult(user?.id ?? "guest", payload);
      // Best-effort backend save
      saveTestResult(payload).catch(() => {});

      setAssessmentStep("reaction_time");
    },
    [user],
  );

  const handleReactionTimeComplete = useCallback(
    (metrics: ReactionTimeMetrics, score: number) => {
      const interpretation =
        score >= 80
          ? `Fast and consistent reactions (avg ${metrics.meanRtMs}ms). Your attention system responds reliably to stimuli.`
          : score >= 60
          ? `Good reaction speed (avg ${metrics.meanRtMs}ms) with some variability — typical of a focused attention state.`
          : score >= 40
          ? `Moderate reaction variability (avg ${metrics.meanRtMs}ms). Attention fluctuations are common and manageable with structure.`
          : `Higher reaction time variability (avg ${metrics.meanRtMs}ms) — often linked to attention differences. This is very manageable with the right strategies.`;

      const payload = {
        userId: user?.id ?? "guest",
        testType: "reaction_time" as const,
        score,
        rawData: { trials: metrics.trials },
        metrics: {
          meanRtMs: metrics.meanRtMs,
          medianRtMs: metrics.medianRtMs,
          stdDevMs: metrics.stdDevMs,
          consistency: metrics.consistency,
          falseStarts: metrics.falseStarts,
        },
        label: "Reaction Time Test",
        interpretation,
      };

      saveLocalTestResult(user?.id ?? "guest", payload);
      saveTestResult(payload).catch(() => {});

      setAssessmentStep("complete");
    },
    [user],
  );

  // ── Auth guard — must be logged in and have completed onboarding ──────────
  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }
    if (!user.hasConsented) { router.replace("/consent"); return; }
    if (!user.hasBackground) { router.replace("/background"); return; }
  }, [isLoading, user, router]);

  // ── Loading: wait for user session ───────────────────────────────────────
  if (isLoading || !user || !user.hasConsented || !user.hasBackground) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // ── Check-in — shown before every assessment ──────────────────────────────
  if (!checkinDone) {
    return (
      <PageContainer className="max-w-2xl">
        <CheckInForm onDone={() => setCheckinDone(true)} />
      </PageContainer>
    );
  }

  // ── Step indicator visibility: show during any active test step ──────────
  const showStepIndicator =
    checkinDone &&
    (assessmentStep !== "asrs" ||
      phase === "questioning" ||
      phase === "evaluating" ||
      phase === "complete");

  return (
    <PageContainer className="max-w-2xl">
      {/* ── Step indicator ────────────────────────────────────────────────── */}
      {showStepIndicator && (
        <StepIndicator
          current={assessmentStep}
          asrsDone={phase === "complete" || assessmentStep !== "asrs"}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STEP 1 — ASRS questionnaire
          (all asrs phases rendered only while assessmentStep === 'asrs'
           or during the transition)
          ═════════════════════════════════════════════════════════════════ */}
      {assessmentStep === "asrs" && (
        <>
          {/* ── Idle: intro ────────────────────────────────────────────── */}
          {phase === "idle" && (
            <div className="flex flex-col items-center gap-6 py-16 text-center">
              <h1 className="font-serif text-4xl font-bold text-foreground">
                Attention Screening
              </h1>
              <p className="max-w-md leading-relaxed text-muted-foreground">
                A 3-part assessment covering attention profile, time awareness, and
                reaction speed. The whole thing takes about 8–10 minutes.
              </p>
              <p className="text-sm text-faint-foreground">
                There are no right or wrong answers. Be honest — this is just for you.
              </p>
              <Button onClick={startScreening} size="lg">
                Begin Assessment
              </Button>
            </div>
          )}

          {/* ── Questioning / Evaluating ─────────────────────────────── */}
          {(phase === "questioning" || phase === "evaluating") && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h1 className="font-serif text-xl font-semibold text-foreground">
                  Attention Profile
                </h1>
                <span className="font-mono text-sm text-muted-foreground">
                  {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
                </span>
              </div>

              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(Math.min(currentIndex + 1, totalQuestions) / totalQuestions) * 100}%`,
                  }}
                />
              </div>

              <ScreeningChat
                answers={answers}
                currentQuestion={currentQuestion}
                isEvaluating={phase === "evaluating"}
                onAnswer={submitAnswer}
              />

              {phase === "evaluating" && (
                <div className="py-4">
                  <LoadingSpinner label="Analysing your responses…" size={20} />
                </div>
              )}

              {error && (
                <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TRANSITION banner between ASRS and Time Perception
          ═════════════════════════════════════════════════════════════════ */}
      {assessmentStep === "transition" && (
        <TransitionBanner
          nextLabel="Time Awareness"
          onContinue={() => setAssessmentStep("time_perception")}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STEP 2 — Time Perception Test
          ═════════════════════════════════════════════════════════════════ */}
      {assessmentStep === "time_perception" && (
        <TimePerceptionTest onComplete={handleTimePerceptionComplete} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STEP 3 — Reaction Time Test
          ═════════════════════════════════════════════════════════════════ */}
      {assessmentStep === "reaction_time" && (
        <ReactionTimeTest onComplete={handleReactionTimeComplete} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          COMPLETE — show radar chart + profile tags from ASRS, then dashboard
          ═════════════════════════════════════════════════════════════════ */}
      {assessmentStep === "complete" && result && (
        <div className="flex flex-col gap-10 py-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Assessment Complete
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              All three tests done. Here&apos;s your attention profile.
            </p>
          </div>
          <CognitiveRadarChart dimensions={result.dimensions} />
          <ProfileTagsReveal
            tags={result.tags}
            summary={result.summary}
            onContinue={() => router.push("/plan")}
          />
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              View your full dashboard →
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
