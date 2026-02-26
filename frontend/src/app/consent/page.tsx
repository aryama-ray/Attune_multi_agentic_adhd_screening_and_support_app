"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, UserCheck } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Card from "@/components/ui/Card";

const POINTS = [
  {
    icon: UserCheck,
    heading: "You are 18 or older",
    body: "Attune is designed for adults. By continuing you confirm you are at least 18 years of age.",
  },
  {
    icon: AlertTriangle,
    heading: "This is not medical advice",
    body: "Attune is a self-assessment and productivity tool, not a clinical service. It does not diagnose, treat, or replace the care of a licensed medical or mental health professional.",
  },
  {
    icon: ShieldCheck,
    heading: "Your data stays on your device",
    body: "All information you share is stored locally in your browser. Nothing is sent to a third party without your explicit permission.",
  },
];

export default function ConsentPage() {
  const { user, isLoading, giveConsent } = useUser();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    // No user at all → back to home
    if (!user) { router.replace("/"); return; }
    // Already consented → skip ahead
    if (user.hasConsented) { router.replace(user.hasBackground ? "/screening" : "/background"); }
  }, [isLoading, user, router]);

  function handleAgree() {
    if (!checked) return;
    giveConsent();
    router.push("/background");
  }

  // Render nothing while redirecting
  if (isLoading || !user || user.hasConsented) return null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-faint-foreground">
            Before we begin
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Please read & agree
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We want to make sure Attune is right for you.
          </p>
        </div>

        {/* Consent points */}
        <div className="mb-6 flex flex-col gap-4">
          {POINTS.map(({ icon: Icon, heading, body }) => (
            <Card key={heading} padding="md" className="flex gap-4">
              <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-2">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-foreground">{heading}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Checkbox */}
        <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span className="text-sm text-foreground">
            I confirm I am 18 or older, and I understand that Attune is a
            self-assessment tool — not a medical diagnosis or treatment provided
            by a doctor.
          </span>
        </label>

        {/* I Agree button */}
        <button
          onClick={handleAgree}
          disabled={!checked}
          className={[
            "w-full rounded-xl py-4 text-lg font-semibold text-white transition-all",
            checked
              ? "bg-primary shadow-md hover:bg-primary-600 active:scale-[0.98]"
              : "cursor-not-allowed bg-primary/30",
          ].join(" ")}
        >
          I Agree — Let&apos;s Get Started
        </button>

        <p className="mt-4 text-center text-xs text-faint-foreground">
          You can withdraw from Attune at any time by clearing your browser data.
        </p>
      </div>
    </div>
  );
}
