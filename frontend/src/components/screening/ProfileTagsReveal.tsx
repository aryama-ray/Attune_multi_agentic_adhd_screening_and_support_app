"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { ScreeningResult } from "@/hooks/useScreeningChat";

interface ProfileTagsRevealProps {
  tags: ScreeningResult["tags"];
  summary: ScreeningResult["summary"];
  onContinue: () => void;
}

export default function ProfileTagsReveal({
  tags,
  summary,
  onContinue,
}: ProfileTagsRevealProps) {
  const summaryDelay = tags.length * 150 + 200;

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      {/* Tags */}
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-faint-foreground">
          Your profile
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <Badge color="accent" className="px-3 py-1 text-sm">
                {tag}
              </Badge>
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <p
        className="max-w-md leading-relaxed text-muted-foreground animate-fade-up"
        style={{ animationDelay: `${summaryDelay}ms` }}
      >
        {summary}
      </p>

      {/* CTA */}
      <div
        className="animate-fade-up"
        style={{ animationDelay: `${summaryDelay + 200}ms` }}
      >
        <Button onClick={onContinue} size="lg">
          Continue to My Plan
        </Button>
      </div>
    </div>
  );
}
