import { type HTMLAttributes, type ReactNode } from "react";

type Color =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
  children: ReactNode;
}

const colorClasses: Record<Color, string> = {
  primary:   "bg-primary-100 text-primary-800",
  secondary: "bg-secondary-100 text-secondary-800",
  accent:    "bg-accent-100 text-accent-800",
  success:   "bg-secondary-100 text-secondary-800",
  warning:   "bg-accent-100 text-accent-800",
  error:     "bg-red-100 text-red-800",
  neutral:   "bg-muted text-muted-foreground",
};

export default function Badge({
  color = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[color],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
