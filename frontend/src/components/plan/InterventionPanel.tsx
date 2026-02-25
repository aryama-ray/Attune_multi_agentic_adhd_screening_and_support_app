"use client";

import { useState, useEffect } from "react";
import type { InterventionResponse } from "@/types";
import TaskCard from "@/components/plan/TaskCard";
import Button from "@/components/ui/Button";

interface InterventionPanelProps {
  intervention: InterventionResponse;
  onClose: () => void;
}

export default function InterventionPanel({ intervention, onClose }: InterventionPanelProps) {
  // Typewriter for acknowledgment
  const [visibleText, setVisibleText] = useState("");
  const [typewriterDone, setTypewriterDone] = useState(false);

  useEffect(() => {
    const fullText = intervention.acknowledgment;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(timer);
        setTypewriterDone(true);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [intervention.acknowledgment]);

  // Staggered reveal for restructured plan (2s after mount)
  const [showPlan, setShowPlan] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowPlan(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Collapsible reasoning
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-surface p-8 shadow-lg">
        {/* Heading */}
        <h2 className="mb-4 font-serif text-xl font-semibold text-primary">
          Attune hears you
        </h2>

        {/* Typewriter acknowledgment */}
        <p className={[
          "text-foreground leading-relaxed",
          !typewriterDone ? "typewriter-caret" : "",
        ].join(" ")}>
          {visibleText}
        </p>

        {/* Restructured plan */}
        {showPlan && (
          <div className="mt-6 opacity-0 fade-in" style={{ animationFillMode: "forwards" }}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Restructured Plan
            </h3>
            <div className="flex flex-col gap-3">
              {intervention.restructuredTasks.map((task, i) => (
                <TaskCard key={task.index} task={task} index={i} isNew />
              ))}
            </div>
          </div>
        )}

        {/* Agent reasoning (collapsible) */}
        {showPlan && (
          <div className="mt-4">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {showReasoning ? "Hide reasoning" : "Why these changes?"}
            </button>
            {showReasoning && (
              <p className="mt-2 text-sm italic text-faint-foreground">
                {intervention.agentReasoning}
              </p>
            )}
          </div>
        )}

        {/* Followup hint */}
        {intervention.followupHint && showPlan && (
          <p className="mt-3 text-xs text-faint-foreground">
            {intervention.followupHint}
          </p>
        )}

        {/* Close button */}
        {showPlan && (
          <div className="mt-6">
            <Button variant="primary" size="lg" onClick={onClose} className="w-full">
              Got it, let&apos;s go
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
