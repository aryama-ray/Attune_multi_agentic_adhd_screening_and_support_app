import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
}

export default function LoadingSpinner({
  label,
  size = 24,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="animate-spin" size={size} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
