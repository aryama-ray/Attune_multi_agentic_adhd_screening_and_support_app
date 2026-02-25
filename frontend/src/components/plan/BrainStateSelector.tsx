"use client";

import { Cloud, Crosshair, Zap } from "lucide-react";
import type { BrainState } from "@/types";
import { BRAIN_STATES } from "@/lib/constants";

const ICONS: Record<BrainState, React.ComponentType<{ size?: number }>> = {
  foggy: Cloud,
  focused: Crosshair,
  wired: Zap,
};

interface BrainStateSelectorProps {
  selected: BrainState | null;
  onSelect: (state: BrainState) => void;
  disabled?: boolean;
}

export default function BrainStateSelector({
  selected,
  onSelect,
  disabled = false,
}: BrainStateSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {(Object.keys(BRAIN_STATES) as BrainState[]).map((key) => {
        const state = BRAIN_STATES[key];
        const Icon = ICONS[key];
        const isSelected = selected === key;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={[
              "flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all",
              "cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected
                ? "shadow-sm"
                : "border-border bg-surface hover:border-muted-foreground",
            ].join(" ")}
            style={
              isSelected
                ? { borderColor: state.color, backgroundColor: state.lightColor }
                : undefined
            }
          >
            <Icon size={28} />
            <span className="text-sm font-semibold">{state.label}</span>
            <span className="text-xs text-muted-foreground">{state.description}</span>
          </button>
        );
      })}
    </div>
  );
}
