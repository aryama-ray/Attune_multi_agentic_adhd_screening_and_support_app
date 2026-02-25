"use client";

import type { PlanResponse } from "@/types";
import TaskCard from "@/components/plan/TaskCard";
import Badge from "@/components/ui/Badge";

interface DailyPlanViewProps {
  plan: PlanResponse;
  onStuck: (taskIndex: number) => void;
}

export default function DailyPlanView({ plan, onStuck }: DailyPlanViewProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Badge color="accent">{today}</Badge>
        </div>
        <p className="text-sm italic text-muted-foreground">{plan.overallRationale}</p>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-4">
        {plan.tasks.map((task, i) => (
          <TaskCard
            key={task.index}
            task={task}
            index={i}
            onStuck={onStuck}
          />
        ))}
      </div>
    </div>
  );
}
