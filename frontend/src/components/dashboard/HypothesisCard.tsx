import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Hypothesis, ConfidenceLevel, HypothesisStatus } from "@/types";

interface HypothesisCardProps {
  hypothesis: Hypothesis;
}

const confidenceDot: Record<ConfidenceLevel, string> = {
  high:   "bg-accent-500",
  medium: "bg-primary-400",
  low:    "bg-faint-foreground",
};

const confidenceLabel: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const statusColor: Record<HypothesisStatus, "accent" | "primary" | "error"> = {
  confirmed: "accent",
  testing:   "primary",
  rejected:  "error",
};

export default function HypothesisCard({ hypothesis }: HypothesisCardProps) {
  const { statement, confidence, status, evidence } = hypothesis;

  return (
    <Card padding="md" className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={[
              "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
              confidenceDot[confidence],
            ].join(" ")}
            title={confidenceLabel[confidence]}
          />
          <p className="text-sm font-medium text-foreground leading-snug">
            {statement}
          </p>
        </div>
        <Badge color={statusColor[status]} className="shrink-0 capitalize">
          {status}
        </Badge>
      </div>

      {/* Evidence list */}
      {evidence.length > 0 && (
        <ul className="flex flex-col gap-1 border-t border-border pt-3">
          {evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-border" />
              {e}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
