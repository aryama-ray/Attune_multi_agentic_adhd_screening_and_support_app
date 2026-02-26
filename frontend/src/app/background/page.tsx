"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import type { Gender, AgeRange, Ethnicity, UserBackground } from "@/types";

// ─── Pill (single-select) ─────────────────────────────────────────────────────

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-border bg-surface text-foreground hover:border-primary/60 hover:bg-primary/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ─── TogglePill (multi-select) ────────────────────────────────────────────────

function TogglePill({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-border bg-surface text-foreground hover:border-primary/60 hover:bg-primary/5",
      ].join(" ")}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

// ─── Yes / No ─────────────────────────────────────────────────────────────────

function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-3">
      <Pill label="Yes" selected={value === true} onClick={() => onChange(true)} />
      <Pill label="No" selected={value === false} onClick={() => onChange(false)} />
    </div>
  );
}

// ─── ScaleSelector ────────────────────────────────────────────────────────────
// 5-point labeled scale — industry pattern from clinical instruments (PHQ-9 etc.)
// and consumer wellbeing apps (Bearable, Finch, Headspace).

interface ScaleOption {
  value: number;
  label: string;
  emoji: string;
}

function ScaleSelector({
  options,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  options: ScaleOption[];
  value: number | null;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 sm:gap-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          // Gradient: 1=muted, 2=warning-ish, 3=neutral, 4=accent-ish, 5=primary
          const activeColors = [
            "border-red-400 bg-red-400",
            "border-orange-400 bg-orange-400",
            "border-yellow-400 bg-yellow-400",
            "border-teal-500 bg-teal-500",
            "border-primary bg-primary",
          ];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              className={[
                "flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition-all",
                selected
                  ? `${activeColors[opt.value - 1]} text-white shadow-md scale-105`
                  : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-primary/5",
              ].join(" ")}
            >
              <span className="text-xl leading-none">{opt.emoji}</span>
              <span className="text-[10px] font-semibold leading-tight text-center px-1 hidden sm:block">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* End labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      {/* Selected label shown on mobile */}
      {value !== null && (
        <p className="text-center text-sm font-medium text-primary sm:hidden">
          {options.find((o) => o.value === value)?.label}
        </p>
      )}
    </div>
  );
}

const FOCUS_OPTIONS: ScaleOption[] = [
  { value: 1, emoji: "🌀", label: "Very scattered" },
  { value: 2, emoji: "😶‍🌫️", label: "Mostly drifting" },
  { value: 3, emoji: "🙂", label: "Getting there" },
  { value: 4, emoji: "🎯", label: "Fairly focused" },
  { value: 5, emoji: "⚡", label: "Laser sharp" },
];

const CALM_OPTIONS: ScaleOption[] = [
  { value: 1, emoji: "😰", label: "Very anxious" },
  { value: 2, emoji: "😬", label: "A bit tense" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "😌", label: "Mostly calm" },
  { value: 5, emoji: "🧘", label: "Deeply calm" },
];

// ─── Question wrapper ─────────────────────────────────────────────────────────

function Question({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-serif text-2xl font-bold leading-snug text-foreground">
          {heading}
        </h2>
        {subheading && (
          <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BackgroundPage() {
  const { user, isLoading, saveBackground } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }
    if (!user.hasConsented) { router.replace("/consent"); return; }
    if (user.hasBackground) { router.replace("/screening"); }
  }, [isLoading, user, router]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  const [gender, setGender] = useState<Gender | null>(null);
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [ethnicity, setEthnicity] = useState<Ethnicity | null>(null);
  const [diagnosedADHD, setDiagnosedADHD] = useState<boolean | null>(null);
  const [diagnosedASD, setDiagnosedASD] = useState<boolean | null>(null);
  const [diagnosedDepAnx, setDiagnosedDepAnx] = useState<boolean | null>(null);
  const [takesMedication, setTakesMedication] = useState<boolean | null>(null);

  // Feeling state
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [calmLevel, setCalmLevel] = useState<number | null>(null);
  const [wellRested, setWellRested] = useState<boolean | null>(null);
  const [hadCaffeine, setHadCaffeine] = useState<boolean | null>(null);
  const [hadAlcohol, setHadAlcohol] = useState<boolean | null>(null);

  const hasMedStep = diagnosedDepAnx === true;
  const effectiveTotalSteps = hasMedStep ? 8 : 7;
  const feelingStep = hasMedStep ? 8 : 7;
  const isFeelingStep = step === feelingStep;
  const isMedStep = hasMedStep && step === 7;

  // ── Validation ──────────────────────────────────────────────────────────────
  function stepValid() {
    if (step === 1) return gender !== null;
    if (step === 2) return ageRange !== null;
    if (step === 3) return ethnicity !== null;
    if (step === 4) return diagnosedADHD !== null;
    if (step === 5) return diagnosedASD !== null;
    if (step === 6) return diagnosedDepAnx !== null;
    if (isMedStep) return takesMedication !== null;
    if (isFeelingStep) return (
      focusLevel !== null &&
      calmLevel !== null &&
      wellRested !== null &&
      hadCaffeine !== null &&
      hadAlcohol !== null
    );
    return true;
  }

  function handleNext() {
    if (!stepValid()) return;
    if (step === 6) {
      if (!diagnosedDepAnx) setTakesMedication(null);
      setStep(7);
      return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step === 1) return;
    if (step === 7 && !hasMedStep) { setStep(6); return; }
    setStep((s) => s - 1);
  }

  function handleSubmit() {
    if (
      !gender || !ageRange || !ethnicity ||
      focusLevel === null || calmLevel === null ||
      wellRested === null || hadCaffeine === null || hadAlcohol === null
    ) return;
    const bg: UserBackground = {
      gender,
      ageRange,
      ethnicity,
      diagnosedADHD: diagnosedADHD ?? false,
      diagnosedASD: diagnosedASD ?? false,
      diagnosedDepressionAnxiety: diagnosedDepAnx ?? false,
      takesMedication: diagnosedDepAnx ? (takesMedication ?? false) : null,
      todayFeeling: { focusLevel, calmLevel, wellRested, hadCaffeine, hadAlcohol },
    };
    saveBackground(bg);
    router.push("/screening");
  }

  if (isLoading || !user || !user.hasConsented || user.hasBackground) return null;

  const progress = Math.round((step / effectiveTotalSteps) * 100);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl flex-col px-4 py-10">
      {/* Progress */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-faint-foreground">
          Step {step} of {effectiveTotalSteps}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-1 flex-col gap-8">

        {step === 1 && (
          <Question heading="What is your gender?">
            <div className="flex flex-wrap gap-3">
              {([
                ["male", "Male"],
                ["female", "Female"],
                ["non-binary", "Non-binary / Two-spirit"],
                ["prefer-not-to-say", "Prefer not to say"],
              ] as [Gender, string][]).map(([val, label]) => (
                <Pill key={val} label={label} selected={gender === val} onClick={() => setGender(val)} />
              ))}
            </div>
          </Question>
        )}

        {step === 2 && (
          <Question heading="What is your age range?">
            <div className="flex flex-wrap gap-3">
              {(["18-25", "26-35", "36-45", "46-55", "56-65", "65+"] as AgeRange[]).map((val) => (
                <Pill key={val} label={val} selected={ageRange === val} onClick={() => setAgeRange(val)} />
              ))}
            </div>
          </Question>
        )}

        {step === 3 && (
          <Question heading="How would you describe your race or ethnicity?">
            <div className="flex flex-wrap gap-3">
              {([
                ["white", "White"],
                ["black", "Black or African American"],
                ["two-or-more", "Two or more races"],
                ["south-asian", "South Asian"],
                ["hispanic-latino", "Hispanic or Latino"],
                ["asian", "Asian"],
                ["pacific-islander", "Pacific Islander"],
                ["prefer-not-to-say", "Prefer not to say"],
              ] as [Ethnicity, string][]).map(([val, label]) => (
                <Pill key={val} label={label} selected={ethnicity === val} onClick={() => setEthnicity(val)} />
              ))}
            </div>
          </Question>
        )}

        {step === 4 && (
          <Question heading="Have you ever been diagnosed with ADHD?">
            <YesNo value={diagnosedADHD} onChange={setDiagnosedADHD} />
          </Question>
        )}

        {step === 5 && (
          <Question heading="Have you ever been diagnosed with Autism Spectrum Disorder (ASD)?">
            <YesNo value={diagnosedASD} onChange={setDiagnosedASD} />
          </Question>
        )}

        {step === 6 && (
          <Question heading="Have you been diagnosed with depression or anxiety?">
            <YesNo value={diagnosedDepAnx} onChange={setDiagnosedDepAnx} />
          </Question>
        )}

        {isMedStep && (
          <Question heading="Do you currently take medication for depression or anxiety?">
            <YesNo value={takesMedication} onChange={setTakesMedication} />
          </Question>
        )}

        {isFeelingStep && (
          <div className="flex flex-col gap-10">
            <Question
              heading="How are you feeling right now?"
              subheading="This helps us contextualise your assessment results for today."
            />

            {/* Focus scale */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">
                How focused do you feel?
              </p>
              <ScaleSelector
                options={FOCUS_OPTIONS}
                value={focusLevel}
                onChange={setFocusLevel}
                lowLabel="Very scattered"
                highLabel="Laser sharp"
              />
            </div>

            {/* Calm scale */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">
                How calm do you feel?
              </p>
              <ScaleSelector
                options={CALM_OPTIONS}
                value={calmLevel}
                onChange={setCalmLevel}
                lowLabel="Very anxious"
                highLabel="Deeply calm"
              />
            </div>

            {/* Contextual factors — explicit Yes/No */}
            <div className="flex flex-col gap-5">
              <p className="text-sm font-semibold text-foreground">
                A few more quick ones:
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">😴 Are you well rested?</span>
                  <YesNo value={wellRested} onChange={setWellRested} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">☕ Have you had caffeine today?</span>
                  <YesNo value={hadCaffeine} onChange={setHadCaffeine} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">🍺 Have you had any alcohol today?</span>
                  <YesNo value={hadAlcohol} onChange={setHadAlcohol} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline disabled:invisible"
        >
          Back
        </button>

        {isFeelingStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stepValid()}
            className={[
              "rounded-xl px-8 py-3 text-base font-semibold text-white shadow-sm transition-all",
              stepValid()
                ? "bg-primary hover:bg-primary-600 active:scale-[0.98]"
                : "cursor-not-allowed bg-primary/30",
            ].join(" ")}
          >
            Start My Assessment
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!stepValid()}
            className={[
              "rounded-xl px-8 py-3 text-base font-semibold text-white shadow-sm transition-all",
              stepValid()
                ? "bg-primary hover:bg-primary-600 active:scale-[0.98]"
                : "cursor-not-allowed bg-primary/30",
            ].join(" ")}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
