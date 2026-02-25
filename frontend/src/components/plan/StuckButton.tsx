"use client";

import { useState } from "react";
import type { PlanTask } from "@/types";
import Button from "@/components/ui/Button";

interface StuckButtonProps {
  tasks: PlanTask[];
  onStuck: (taskIndex: number, message?: string) => void;
  disabled?: boolean;
}

export default function StuckButton({ tasks, onStuck, disabled = false }: StuckButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  function handleSubmit() {
    if (selectedIndex === null) return;
    onStuck(selectedIndex, message || undefined);
    setIsExpanded(false);
    setSelectedIndex(null);
    setMessage("");
  }

  function handleCancel() {
    setIsExpanded(false);
    setSelectedIndex(null);
    setMessage("");
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className={[
          "fixed bottom-6 right-6 z-40",
          "rounded-full bg-error px-6 py-3 font-semibold text-white shadow-lg",
          "transition-all hover:opacity-90 disabled:opacity-50",
          "pulse-red",
        ].join(" ")}
      >
        I&apos;m Stuck
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-lg">
        <h3 className="mb-3 font-semibold text-foreground">What are you stuck on?</h3>

        {/* Task picker */}
        <div className="mb-3 flex flex-col gap-2">
          {tasks
            .filter((t) => t.status !== "completed")
            .map((t) => (
              <label
                key={t.index}
                className={[
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  selectedIndex === t.index
                    ? "border-primary bg-primary-50 text-primary"
                    : "border-border text-foreground hover:bg-muted",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="stuck-task"
                  checked={selectedIndex === t.index}
                  onChange={() => setSelectedIndex(t.index)}
                  className="sr-only"
                />
                <span className="truncate">{t.title}</span>
              </label>
            ))}
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's happening? (optional)"
          rows={2}
          className="mb-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint-foreground focus:border-primary focus:outline-none"
        />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="flex-1"
          >
            Get Help
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
