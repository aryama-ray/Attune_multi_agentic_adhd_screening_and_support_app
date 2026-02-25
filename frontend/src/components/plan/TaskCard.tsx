"use client";

import {
  Brain, ClipboardList, Palette, Activity, Users,
  MessageSquare, LayoutGrid, BookOpen, Search, CheckCircle2,
} from "lucide-react";
import type { PlanTask } from "@/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  deep_work: Brain,
  "deep-work": Brain,
  admin: ClipboardList,
  creative: Palette,
  physical: Activity,
  social: Users,
  communication: MessageSquare,
  planning: LayoutGrid,
  learning: BookOpen,
  review: Search,
};

function priorityBadgeColor(priority: string): "error" | "warning" | "neutral" {
  if (priority === "high") return "error";
  if (priority === "medium") return "warning";
  return "neutral";
}

interface TaskCardProps {
  task: PlanTask;
  index: number;
  onStuck?: (index: number) => void;
  isNew?: boolean;
}

export default function TaskCard({ task, index, isNew = false }: TaskCardProps) {
  const CategoryIcon = ICON_MAP[task.category] ?? ClipboardList;
  const borderColor = CATEGORY_COLORS[task.category] ?? "var(--color-border)";
  const isCompleted = task.status === "completed";

  return (
    <Card
      padding="md"
      className={[
        "border-l-4",
        isNew ? "opacity-0 fade-in" : "",
        isCompleted ? "opacity-60" : "",
      ].join(" ")}
      style={{ borderLeftColor: borderColor, animationDelay: isNew ? `${index * 100}ms` : undefined }}
    >
      {/* Row 1: Category icon + title + priority */}
      <div className="flex items-center gap-3">
        <CategoryIcon size={18} className="shrink-0 text-muted-foreground" />
        <span className={["flex-1 font-semibold text-foreground", isCompleted ? "line-through" : ""].join(" ")}>
          {isCompleted && <CheckCircle2 size={16} className="mr-1.5 inline text-accent" />}
          {task.title}
        </span>
        <Badge color={priorityBadgeColor(task.priority)}>{task.priority}</Badge>
      </div>

      {/* Row 2: Time slot + duration */}
      <p className="mt-1 text-sm text-muted-foreground">
        {task.time_slot} &middot; {task.duration_minutes} min
      </p>

      {/* Row 3: Description */}
      <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>

      {/* Row 4: Rationale */}
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-sm italic text-faint-foreground">{task.rationale}</p>
      </div>
    </Card>
  );
}
