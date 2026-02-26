"use client";

import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScreeningChat from "@/components/screening/ScreeningChat";
import CognitiveRadarChart from "@/components/screening/CognitiveRadarChart";
import ProfileTagsReveal from "@/components/screening/ProfileTagsReveal";
import { useScreeningChat } from "@/hooks/useScreeningChat";

export default function ScreeningPage() {
  const router = useRouter();
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

  return (
    <PageContainer className="max-w-2xl">
      {/* ── Idle: intro ──────────────────────────────────────────────────── */}
      {phase === "idle" && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Attention Screening
          </h1>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            This short check-in — {totalQuestions} questions — helps us understand
            how you experience focus, organisation, and energy. It takes about
            3 minutes.
          </p>
          <p className="text-sm text-faint-foreground">
            There are no right or wrong answers. Be honest — this is just for you.
          </p>
          <Button onClick={startScreening} size="lg">
            Begin Screening
          </Button>
        </div>
      )}

      {/* ── Questioning / Evaluating: chat ───────────────────────────────── */}
      {(phase === "questioning" || phase === "evaluating") && (
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h1 className="font-serif text-xl font-semibold text-foreground">
              Screening
            </h1>
            <span className="font-mono text-sm text-muted-foreground">
              {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${(Math.min(currentIndex + 1, totalQuestions) / totalQuestions) * 100}%`,
              }}
            />
          </div>

          {/* Chat */}
          <div className="flex-1">
            <ScreeningChat
              answers={answers}
              currentQuestion={currentQuestion}
              isEvaluating={phase === "evaluating"}
              onAnswer={submitAnswer}
            />
          </div>

          {/* Evaluating indicator */}
          {phase === "evaluating" && (
            <div className="py-4">
              <LoadingSpinner label="Analysing your responses…" size={20} />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      )}

      {/* ── Complete: results ─────────────────────────────────────────────── */}
      {phase === "complete" && result && (
        <div className="flex flex-col gap-10 py-8">
          <h1 className="text-center font-serif text-3xl font-bold text-foreground">
            Screening Complete
          </h1>

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
              View your dashboard →
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
