import Link from "next/link";
import GuestLoginButton from "@/components/auth/GuestLoginButton";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Quick Screening",
    description:
      "A short, low-pressure check-in to understand how you experience attention, focus, and your day.",
  },
  {
    step: "02",
    title: "Your Daily Plan",
    description:
      "A gentle, structured schedule built around your rhythm — one clear step at a time.",
  },
  {
    step: "03",
    title: "Guided Adjustments",
    description:
      "Talk to Attune whenever things feel off. It listens and quietly recalibrates your plan.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
        <h1 className="mb-5 font-serif text-5xl font-bold leading-tight text-foreground sm:text-6xl">
          {APP_NAME}
        </h1>

        <p className="mb-4 text-xl font-medium text-primary">
          {APP_TAGLINE}
        </p>

        <p className="mx-auto mb-12 max-w-lg leading-relaxed text-muted-foreground">
          {APP_DESCRIPTION}
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-md bg-primary px-7 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Sign Up
          </Link>
          <GuestLoginButton />
        </div>

        <p className="mt-4 text-xs text-faint-foreground">
          No account needed to explore — guest progress is saved locally.
        </p>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-12 text-center font-serif text-2xl font-bold text-foreground">
            How it works
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div
                key={step}
                className="rounded-xl border border-border bg-surface px-7 py-8"
              >
                <span className="mb-4 block font-mono text-xs font-medium text-faint-foreground">
                  {step}
                </span>
                <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
