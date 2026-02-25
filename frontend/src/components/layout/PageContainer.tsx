import { type HTMLAttributes, type ReactNode } from "react";

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function PageContainer({
  className = "",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={["mx-auto max-w-5xl px-6 py-8", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
