"use client";

import { ANSWER_OPTIONS } from "@/lib/screeningData";

interface AnswerSelectorProps {
  onSelect: (score: number) => void;
  disabled?: boolean;
}

export default function AnswerSelector({ onSelect, disabled }: AnswerSelectorProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-1">
      {ANSWER_OPTIONS.map((option) => (
        <button
          key={option.score}
          onClick={() => onSelect(option.score)}
          disabled={disabled}
          className={[
            "rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium",
            "text-muted-foreground transition-colors",
            "hover:border-primary hover:bg-primary hover:text-white",
            "disabled:pointer-events-none disabled:opacity-40",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
