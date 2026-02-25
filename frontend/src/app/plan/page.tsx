"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import PageContainer from "@/components/layout/PageContainer";
import BrainStateSelector from "@/components/plan/BrainStateSelector";
import DailyPlanView from "@/components/plan/DailyPlanView";
import StuckButton from "@/components/plan/StuckButton";
import InterventionPanel from "@/components/plan/InterventionPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

export default function PlanPage() {
  const { user } = useUser();
  const router = useRouter();
  const {
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
  } = useDailyPlan();

  useEffect(() => {
    if (user === null) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  return (
    <PageContainer>
      <h1 className="mb-6 font-serif text-3xl font-bold text-foreground">
        Your Daily Plan
      </h1>

      {/* Brain state selector */}
      <div className="mb-8">
        <p className="mb-3 text-sm text-muted-foreground">
          How is your brain feeling right now?
        </p>
        <BrainStateSelector
          selected={brainState}
          onSelect={setBrainState}
          disabled={isGenerating}
        />
      </div>

      {/* Generate button */}
      {brainState && !plan && !isGenerating && (
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={generateDailyPlan}
            isLoading={isGenerating}
          >
            Generate My Plan
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="py-12">
          <LoadingSpinner size={32} label="AI agents are crafting your plan..." />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 rounded-lg border border-error bg-error/5 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Plan view */}
      {plan && !isGenerating && (
        <DailyPlanView plan={plan} onStuck={triggerStuck} />
      )}

      {/* Stuck button (floating) */}
      {plan && !isGenerating && (
        <StuckButton
          tasks={plan.tasks}
          onStuck={triggerStuck}
          disabled={isIntervening}
        />
      )}

      {/* Intervention overlay */}
      {intervention && (
        <InterventionPanel
          intervention={intervention}
          onClose={clearIntervention}
        />
      )}

      {/* Intervening loading */}
      {isIntervening && !intervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-xl bg-surface p-8 shadow-lg">
            <LoadingSpinner size={32} label="Attune is thinking..." />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
