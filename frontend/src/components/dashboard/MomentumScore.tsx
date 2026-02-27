"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "@/components/ui/Card";

interface MomentumScoreProps {
  score: number;
  delta: number;
}

export default function MomentumScore({ score, delta }: MomentumScoreProps) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef<number | null>(null);

  // Count-up animation: 0 → score over ~1 s
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [score]);

  const isUp = delta >= 0;

  return (
    <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-faint-foreground">
        Momentum Score
      </p>

      <span className="font-serif text-7xl font-bold text-foreground tabular-nums">
        {displayed}
      </span>

      <div
        className={[
          "flex items-center gap-1.5 text-sm font-medium",
          isUp ? "text-accent-600" : "text-error",
        ].join(" ")}
      >
        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>
          {isUp ? "+" : ""}
          {delta} vs last week
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Based on mood check-ins and task completion
      </p>
    </Card>
  );
}
