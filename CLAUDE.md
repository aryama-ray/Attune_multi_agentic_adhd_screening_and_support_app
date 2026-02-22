# Attune — Frontend Implementation Playbook

> **This file is for Member A (Frontend/Next.js).** Backend is complete. This is your complete build guide — every file, every component, every prop, every hook, every CSS class.

---

## Current State

**What exists:**
- Next.js 16 + React 19 + Tailwind v4 project scaffolded in `frontend/`
- Dependencies installed: `recharts@3.7`, `axios@1.13`, `lucide-react@0.575`
- Default template files only — `page.tsx`, `layout.tsx`, `globals.css` are all default Next.js boilerplate
- `tsconfig.json` has `@/*` → `./src/*` path alias
- Tailwind v4 uses CSS-based `@theme inline` (no `tailwind.config.ts`)
- PostCSS configured with `@tailwindcss/postcss`

**What you need to build:**
- 3 screens (Screening, Planner, Dashboard)
- ~20 components
- 4 hooks
- 1 API client
- 1 types file
- 1 constants file
- Custom design system in `globals.css`

**Backend base URL:** `NEXT_PUBLIC_API_URL` env var (default `http://localhost:8000`)

---

## Environment Setup

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Build Order (follow this sequence)

1. **Foundation** — `globals.css`, `layout.tsx`, `types/index.ts`, `lib/constants.ts`, `lib/api.ts`, `hooks/useUser.ts`
2. **UI Components** — Button, Card, Badge, ChatBubble, LoadingSpinner
3. **Layout** — Navbar, PageContainer, GuestLoginButton
4. **Landing Page** — `app/page.tsx`
5. **Screen 1** — `hooks/useScreeningChat.ts`, ScreeningChat, AnswerSelector, CognitiveRadarChart, ProfileTagsReveal, `app/screening/page.tsx`
6. **Screen 2** — `hooks/useDailyPlan.ts`, BrainStateSelector, TaskCard, DailyPlanView, StuckButton, InterventionPanel, `app/plan/page.tsx`
7. **Screen 3** — `hooks/useDashboard.ts`, MomentumScore, TrendChart, HypothesisCard, `app/dashboard/page.tsx`

---

## File Tree (final state)

```
frontend/src/
├── app/
│   ├── globals.css               # Attune design system + Tailwind v4 theme
│   ├── layout.tsx                # Root layout: fonts, UserProvider, Navbar
│   ├── page.tsx                  # Landing page: hero + CTAs
│   ├── screening/
│   │   └── page.tsx              # Screen 1: ASRS chat + radar
│   ├── plan/
│   │   └── page.tsx              # Screen 2: brain state + planner + intervention
│   └── dashboard/
│       └── page.tsx              # Screen 3: trends + hypotheses
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ChatBubble.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── PageContainer.tsx
│   ├── auth/
│   │   └── GuestLoginButton.tsx
│   ├── screening/
│   │   ├── ScreeningChat.tsx
│   │   ├── AnswerSelector.tsx
│   │   ├── CognitiveRadarChart.tsx
│   │   └── ProfileTagsReveal.tsx
│   ├── plan/
│   │   ├── BrainStateSelector.tsx
│   │   ├── TaskCard.tsx
│   │   ├── DailyPlanView.tsx
│   │   ├── StuckButton.tsx
│   │   └── InterventionPanel.tsx
│   └── dashboard/
│       ├── MomentumScore.tsx
│       ├── TrendChart.tsx
│       └── HypothesisCard.tsx
├── hooks/
│   ├── useUser.ts
│   ├── useScreeningChat.ts
│   ├── useDailyPlan.ts
│   └── useDashboard.ts
├── lib/
│   ├── api.ts
│   └── constants.ts
└── types/
    └── index.ts
```

---

## Step 1 — Foundation

### 1A. `src/app/globals.css` — Attune Design System

Replace the entire file. Tailwind v4 uses `@theme inline` instead of `tailwind.config.ts`.

```css
@import "tailwindcss";

:root {
  --bg: #faf9f6;
  --bg-card: #ffffff;
  --ink: #18160f;
  --ink-muted: #6b6560;
  --ink-faint: #a8a29e;
  --border: #e7e5e0;
  --border-focus: #1d6344;

  /* Brand colors */
  --green: #1d6344;
  --green-light: #e8f5ee;
  --green-dark: #145234;
  --red: #b83b10;
  --red-light: #fef2ed;
  --amber: #a05f10;
  --amber-light: #fef8ec;
  --blue: #1a40bf;
  --blue-light: #eef1fc;
  --violet: #5c2fa0;
  --violet-light: #f3eefb;

  /* Brain state colors */
  --foggy: #8b95a5;
  --foggy-light: #f0f2f5;
  --focused: #1d6344;
  --focused-light: #e8f5ee;
  --wired: #b83b10;
  --wired-light: #fef2ed;

  /* Category colors (for task cards) */
  --cat-deep-work: #1a40bf;
  --cat-admin: #6b6560;
  --cat-creative: #5c2fa0;
  --cat-physical: #1d6344;
  --cat-social: #a05f10;
  --cat-communication: #a05f10;
  --cat-planning: #5c2fa0;
  --cat-learning: #1a40bf;
  --cat-review: #6b6560;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(24, 22, 15, 0.05);
  --shadow-md: 0 4px 12px rgba(24, 22, 15, 0.08);
  --shadow-lg: 0 8px 24px rgba(24, 22, 15, 0.12);

  /* Radar chart colors */
  --radar-fill: rgba(29, 99, 68, 0.2);
  --radar-stroke: #1d6344;
}

@theme inline {
  --color-bg: var(--bg);
  --color-bg-card: var(--bg-card);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-ink-faint: var(--ink-faint);
  --color-border: var(--border);
  --color-green: var(--green);
  --color-green-light: var(--green-light);
  --color-green-dark: var(--green-dark);
  --color-red: var(--red);
  --color-red-light: var(--red-light);
  --color-amber: var(--amber);
  --color-amber-light: var(--amber-light);
  --color-blue: var(--blue);
  --color-blue-light: var(--blue-light);
  --color-violet: var(--violet);
  --color-violet-light: var(--violet-light);
  --color-foggy: var(--foggy);
  --color-focused: var(--focused);
  --color-wired: var(--wired);
  --font-sans: var(--font-ibm-plex-sans);
  --font-serif: var(--font-playfair-display);
  --font-mono: var(--font-ibm-plex-mono);
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans), system-ui, sans-serif;
}

/* Typewriter animation (for intervention acknowledgment) */
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  50% { border-color: transparent; }
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--green);
  animation: typewriter 1.5s steps(60) forwards, blink-caret 0.75s step-end infinite;
}

/* Pulse animation for StuckButton */
@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184, 59, 16, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(184, 59, 16, 0); }
}

.pulse-red {
  animation: pulse-red 2s ease-in-out infinite;
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Stagger delay utilities */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
.delay-600 { animation-delay: 600ms; }
.delay-700 { animation-delay: 700ms; }
.delay-800 { animation-delay: 800ms; }
.delay-1000 { animation-delay: 1000ms; }
.delay-1500 { animation-delay: 1500ms; }

/* Count-up number animation */
@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

.count-up {
  animation: countUp 0.6s ease-out forwards;
}
```

### 1B. `src/app/layout.tsx` — Root Layout

```tsx
import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Attune — AI Executive Function Co-Pilot",
  description: "Multi-agent AI system for ADHD screening and adaptive daily planning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}>
        {/* UserProvider wraps everything — see Step 1F */}
        {children}
      </body>
    </html>
  );
}
```

**Note:** After building `useUser.ts` and `Navbar.tsx`, come back and wrap `{children}` with `<UserProvider>` and add `<Navbar />` above `{children}`.

### 1C. `src/types/index.ts` — All TypeScript Interfaces

These mirror the backend Pydantic models exactly.

```ts
// ── Auth ──
export interface User {
  userId: string;
  name: string;
  isGuest: boolean;
  hasProfile: boolean;
}

// ── ASRS Screening ──
export interface ASRSAnswer {
  questionIndex: number;
  questionText: string;
  score: number; // 0-4
}

export interface RadarDimension {
  key: string;       // e.g. "attention_regulation"
  label: string;     // e.g. "Attention Regulation"
  value: number;     // 0-100
  insight: string;   // empowering 1-sentence insight
}

export interface ScreeningResponse {
  profileId: string;
  dimensions: RadarDimension[];   // always 6 items
  profileTags: string[];          // always 3 items, e.g. ["Deep-Diver", "Momentum-Builder", "Intensity-Engine"]
  summary: string;                // 2-3 sentence empowering narrative
  asrsTotalScore: number;         // 0-24
  isPositiveScreen: boolean;      // true if >= 14
}

// ── Cognitive Profile ──
export interface ProfileResponse {
  dimensions: RadarDimension[];
  profileTags: string[];
  summary: string;
}

// ── Daily Plan ──
export interface PlanTask {
  index: number;
  title: string;
  description: string;
  duration_minutes: number;
  time_slot: string;              // e.g. "9:00 AM"
  category: string;               // "deep_work" | "admin" | "creative" | "physical" | "social" | "communication" | "planning" | "learning" | "review"
  rationale: string;              // references cognitive profile
  priority: string;               // "high" | "medium" | "low"
  status: string;                 // "pending" | "completed" | "skipped"
}

export interface PlanResponse {
  planId: string;
  tasks: PlanTask[];
  overallRationale: string;
}

// ── Intervention ──
export interface InterventionResponse {
  interventionId: string;
  acknowledgment: string;         // emotional, 1-2 sentences — displayed FIRST with typewriter effect
  restructuredTasks: PlanTask[];  // full replacement array
  agentReasoning: string;
  followupHint?: string;
}

// ── Dashboard ──
export interface TrendDataPoint {
  date: string;                   // ISO date string
  dayNumber: number;              // 1-14
  moodScore: number;              // 1-10
  completionRate: number;         // 0-100 (percentage)
  brainState: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface HypothesisCard {
  id: string;
  patternDetected: string;
  prediction: string;             // predictive framing: "If Alex has two consecutive days..."
  confidence: string;             // "high" | "medium" | "low"
  status: string;                 // "testing" | "confirmed" | "rejected"
  supportingEvidence: Array<{ day: number; detail: string }>;
  createdAt: string;
}

export interface AgentAnnotation {
  dayNumber: number;              // which day on the trend chart (1-14)
  text: string;
  type: string;                   // "hypothesis" | "intervention"
}

export interface DashboardResponse {
  trendData: TrendDataPoint[];
  momentumScore: number;          // 0-100
  momentumDelta: number;          // positive = improving, negative = declining
  hypothesisCards: HypothesisCard[];
  agentAnnotations: AgentAnnotation[];
}

// ── Brain State (for UI) ──
export type BrainState = "foggy" | "focused" | "wired";
```

### 1D. `src/lib/constants.ts` — ASRS Questions + UI Constants

```ts
import type { BrainState } from "@/types";

// Harvard ASRS-6 screening questions (public domain, WHO)
export const ASRS_QUESTIONS = [
  "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
  "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
  "How often do you have problems remembering appointments or obligations?",
  "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
  "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
  "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
] as const;

// Likert scale: label → score (0-4)
export const ANSWER_OPTIONS = [
  { label: "Never", score: 0 },
  { label: "Rarely", score: 1 },
  { label: "Sometimes", score: 2 },
  { label: "Often", score: 3 },
  { label: "Very Often", score: 4 },
] as const;

// Radar chart dimension labels (must match backend dimension keys)
export const RADAR_DIMENSIONS = [
  { key: "attention_regulation", label: "Attention Regulation" },
  { key: "time_perception", label: "Time Perception" },
  { key: "emotional_intensity", label: "Emotional Intensity" },
  { key: "working_memory", label: "Working Memory" },
  { key: "task_initiation", label: "Task Initiation" },
  { key: "hyperfocus_capacity", label: "Hyperfocus Capacity" },
] as const;

// Brain state UI config
export const BRAIN_STATES: Record<BrainState, {
  label: string;
  description: string;
  icon: string;        // lucide-react icon name
  color: string;       // CSS variable name
  lightColor: string;  // CSS variable for background
}> = {
  foggy: {
    label: "Foggy",
    description: "Low energy, hard to focus",
    icon: "Cloud",
    color: "var(--foggy)",
    lightColor: "var(--foggy-light)",
  },
  focused: {
    label: "Focused",
    description: "Clear mind, ready to work",
    icon: "Crosshair",
    color: "var(--focused)",
    lightColor: "var(--focused-light)",
  },
  wired: {
    label: "Wired",
    description: "High energy, restless",
    icon: "Zap",
    color: "var(--wired)",
    lightColor: "var(--wired-light)",
  },
};

// Task category → color mapping (for TaskCard left border)
export const CATEGORY_COLORS: Record<string, string> = {
  deep_work: "var(--cat-deep-work)",
  "deep-work": "var(--cat-deep-work)",
  admin: "var(--cat-admin)",
  creative: "var(--cat-creative)",
  physical: "var(--cat-physical)",
  social: "var(--cat-social)",
  communication: "var(--cat-communication)",
  planning: "var(--cat-planning)",
  learning: "var(--cat-learning)",
  review: "var(--cat-review)",
};

// Category → lucide icon name mapping
export const CATEGORY_ICONS: Record<string, string> = {
  deep_work: "Brain",
  "deep-work": "Brain",
  admin: "ClipboardList",
  creative: "Palette",
  physical: "Activity",
  social: "Users",
  communication: "MessageSquare",
  planning: "LayoutGrid",
  learning: "BookOpen",
  review: "Search",
};
```

### 1E. `src/lib/api.ts` — Axios API Client

```ts
import axios from "axios";
import type {
  User,
  ASRSAnswer,
  ScreeningResponse,
  ProfileResponse,
  PlanResponse,
  InterventionResponse,
  DashboardResponse,
  BrainState,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30s — CrewAI calls can take a few seconds
});

// ── Auth ──
export async function createGuestSession(): Promise<User> {
  const { data } = await api.post<User>("/api/auth/guest");
  return data;
}

// ── Screening ──
export async function evaluateScreening(
  userId: string,
  answers: ASRSAnswer[]
): Promise<ScreeningResponse> {
  const { data } = await api.post<ScreeningResponse>("/api/screening/evaluate", {
    userId,
    answers,
  });
  return data;
}

// ── Profile ──
export async function fetchProfile(userId: string): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>(`/api/profile/${userId}`);
  return data;
}

// ── Plan ──
export async function generatePlan(
  userId: string,
  brainState: BrainState,
  tasks?: string[]
): Promise<PlanResponse> {
  const { data } = await api.post<PlanResponse>("/api/plan/generate", {
    userId,
    brainState,
    tasks,
  });
  return data;
}

// ── Intervention ──
export async function triggerIntervention(
  userId: string,
  planId: string,
  stuckTaskIndex: number,
  userMessage?: string
): Promise<InterventionResponse> {
  const { data } = await api.post<InterventionResponse>("/api/plan/intervene", {
    userId,
    planId,
    stuckTaskIndex,
    userMessage,
  });
  return data;
}

// ── Dashboard ──
export async function fetchDashboard(userId: string): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>(`/api/dashboard/${userId}`);
  return data;
}
```

### 1F. `src/hooks/useUser.ts` — Auth State + UserProvider

This manages the guest session. Stores `userId` in localStorage. Provides context to all screens.

```tsx
"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createGuestSession } from "@/lib/api";
import type { User } from "@/types";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  loginAsGuest: async () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check localStorage for existing session
  useEffect(() => {
    const stored = localStorage.getItem("attune_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("attune_user");
      }
    }
    setIsLoading(false);
  }, []);

  const loginAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await createGuestSession();
      setUser(userData);
      localStorage.setItem("attune_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("attune_user");
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
```

---

## Step 2 — UI Components

All in `src/components/ui/`. Use Tailwind classes referencing the `@theme inline` tokens from `globals.css`.

### 2A. `Button.tsx`

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}
```

| Variant | Styles |
|---------|--------|
| `primary` | `bg-green text-white hover:bg-green-dark` |
| `secondary` | `bg-bg-card text-ink border border-border hover:border-green` |
| `ghost` | `bg-transparent text-ink-muted hover:bg-green-light hover:text-green` |
| `danger` | `bg-red text-white hover:opacity-90` |

Sizes: `sm` = `px-3 py-1.5 text-sm`, `md` = `px-4 py-2 text-base`, `lg` = `px-6 py-3 text-lg`.

All variants: `rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed`.

When `isLoading`, show a spinning `<Loader2 />` icon from lucide-react and disable the button.

### 2B. `Card.tsx`

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}
```

Base: `bg-bg-card rounded-xl border border-border shadow-[var(--shadow-sm)]`. Padding: `sm`=`p-4`, `md`=`p-6`, `lg`=`p-8`.

### 2C. `Badge.tsx`

```tsx
interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "red" | "amber" | "blue" | "violet" | "gray";
}
```

Render as `<span>`. Styles: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`.

Color map (use Tailwind + CSS vars):
- `green` → `bg-green-light text-green`
- `red` → `bg-red-light text-red`
- `amber` → `bg-amber-light text-amber`
- `blue` → `bg-blue-light text-blue`
- `violet` → `bg-violet-light text-violet`
- `gray` → `bg-[#f0f0ed] text-ink-muted`

### 2D. `ChatBubble.tsx`

```tsx
interface ChatBubbleProps {
  children: React.ReactNode;
  variant: "agent" | "user";
  isTyping?: boolean;   // shows "..." animated dots
}
```

Layout: `max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed`.

| Variant | Alignment | Styles |
|---------|-----------|--------|
| `agent` | `self-start` (left) | `bg-green-light text-ink rounded-bl-sm` |
| `user` | `self-end` (right) | `bg-bg-card text-ink border border-border rounded-br-sm` |

When `isTyping`: show 3 dots with a pulsing animation inside the bubble instead of `children`.

### 2E. `LoadingSpinner.tsx`

```tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;       // optional text below spinner
}
```

Use lucide-react `<Loader2 />` with `animate-spin` class. Sizes: `sm`=`w-4 h-4`, `md`=`w-8 h-8`, `lg`=`w-12 h-12`. Color: `text-green`. If `label`, show it below in `text-ink-muted text-sm`.

---

## Step 3 — Layout Components

### 3A. `src/components/layout/Navbar.tsx`

```tsx
// No props needed — reads from useUser() context
```

Fixed top bar: `sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border`.

Inner container: `max-w-5xl mx-auto px-6 h-14 flex items-center justify-between`.

**Left:** Logo text "attune" in `font-serif text-xl font-semibold text-green` (uses Playfair Display).

**Center:** 3 nav links — "Screening", "Plan", "Dashboard". Each is a `<Link>` from `next/link`. Active state (match `pathname` via `usePathname()` from `next/navigation`): `text-green font-medium`. Inactive: `text-ink-muted hover:text-ink`.

**Right:** If `user` exists, show a pill: `bg-green-light text-green px-3 py-1 rounded-full text-sm font-medium` displaying user name (e.g. "Alex"). If no user, show nothing.

### 3B. `src/components/layout/PageContainer.tsx`

```tsx
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}
```

Wrapper: `max-w-5xl mx-auto px-6 py-8`. Merge `className` if provided.

### 3C. `src/components/auth/GuestLoginButton.tsx`

```tsx
// No props — uses useUser() context
```

Renders a `<Button variant="primary" size="lg">` that says "Continue as Alex (Guest)". On click, calls `loginAsGuest()` from `useUser()`. While loading, show spinner. After login, redirect to `/screening` if `!hasProfile`, or `/plan` if `hasProfile` — use `useRouter()` from `next/navigation`.

### 3D. Update `layout.tsx`

After building the above, update `layout.tsx` to wrap children:

```tsx
<body className={`${playfair.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}>
  <UserProvider>
    <Navbar />
    <main>{children}</main>
  </UserProvider>
</body>
```

---

## Step 4 — Landing Page (`src/app/page.tsx`)

Replace the default Next.js content entirely.

**Layout:** Full viewport height, centered content, `bg-bg`.

**Structure:**
1. **Hero section** — centered, `max-w-2xl mx-auto text-center pt-24 pb-16`
   - Small badge at top: `<Badge color="green">3 AI Agents</Badge>`
   - Headline: `font-serif text-5xl font-bold text-ink leading-tight` — "Your brain works differently. Your planner should too."
   - Subtitle: `text-ink-muted text-lg mt-4 max-w-lg mx-auto` — "Attune is a multi-agent AI executive function co-pilot. It screens, plans, and intervenes — so you don't have to self-manage the thing that makes self-management hard."

2. **Stats row** — `flex justify-center gap-12 mt-12`
   - Three stats, each: number in `font-serif text-3xl font-bold text-green` + label in `text-ink-muted text-sm`
   - "366M" / "adults with ADHD globally"
   - "$13B" / "lost productivity annually"
   - "3" / "AI agents working for you"

3. **CTAs** — `flex justify-center gap-4 mt-12`
   - `<GuestLoginButton />` (primary, large)
   - `<Button variant="secondary" size="lg">` linking to `/screening` — "Start Screening"

---

## Step 5 — Screen 1: ASRS Screening

### 5A. `src/hooks/useScreeningChat.ts`

State machine with 4 phases:

```ts
type ScreeningPhase = "idle" | "questioning" | "evaluating" | "complete";

interface UseScreeningChatReturn {
  phase: ScreeningPhase;
  currentQuestionIndex: number;       // 0-5
  answers: ASRSAnswer[];              // collected answers
  profile: ScreeningResponse | null;  // set after evaluation
  isLoading: boolean;
  startScreening: () => void;         // idle → questioning
  submitAnswer: (score: number) => void; // records answer, advances to next Q
  error: string | null;
}
```

**Logic:**
- `startScreening()`: sets phase to `"questioning"`, resets answers
- `submitAnswer(score)`: pushes `{ questionIndex, questionText, score }` to answers array. If `currentQuestionIndex < 5`, increment index (with 500ms `setTimeout` delay for chat UX feel). If `currentQuestionIndex === 5` (last question), set phase to `"evaluating"`, call `evaluateScreening(userId, answers)` from api.ts, then set `profile` and phase to `"complete"`.
- `userId` comes from `useUser()` context.

### 5B. `src/components/screening/AnswerSelector.tsx`

```tsx
interface AnswerSelectorProps {
  onSelect: (score: number) => void;
  disabled?: boolean;
}
```

Renders 5 horizontal buttons (one per `ANSWER_OPTIONS` from constants). Layout: `flex gap-2 flex-wrap`.

Each button: `px-4 py-2 rounded-lg border border-border text-sm font-medium transition-all hover:border-green hover:bg-green-light hover:text-green`. When `disabled`, lower opacity.

On click, calls `onSelect(score)`.

### 5C. `src/components/screening/ScreeningChat.tsx`

```tsx
interface ScreeningChatProps {
  currentQuestionIndex: number;
  answers: ASRSAnswer[];
  phase: "idle" | "questioning" | "evaluating" | "complete";
  onAnswer: (score: number) => void;
}
```

Renders a scrolling chat container: `flex flex-col gap-3 overflow-y-auto max-h-[60vh] p-4`.

**Rendering logic:**
- For each answered question (index < `currentQuestionIndex`): render `<ChatBubble variant="agent">` with the question text, followed by `<ChatBubble variant="user">` with the answer label (map score to `ANSWER_OPTIONS[score].label`).
- For the current question (index === `currentQuestionIndex` and phase === `"questioning"`): render `<ChatBubble variant="agent">` with question text, then `<AnswerSelector onSelect={onAnswer} />`.
- If phase === `"evaluating"`: render `<ChatBubble variant="agent" isTyping />` (typing indicator).

Auto-scroll to bottom on new messages (use `useRef` on container + `useEffect` scrolling `ref.current.scrollTop = ref.current.scrollHeight`).

### 5D. `src/components/screening/CognitiveRadarChart.tsx`

**This is the visual demo highlight. Staggered animation is critical.**

```tsx
interface CognitiveRadarChartProps {
  dimensions: RadarDimension[];   // 6 items from API
  animate?: boolean;               // default true
}
```

**Uses:** `import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";`

**Animation approach:**
1. Start with all values at 0
2. Use `useState<number[]>` initialized to `[0, 0, 0, 0, 0, 0]`
3. On mount (or when `dimensions` prop changes), use `setTimeout` with 200ms stagger per dimension:
   - At 0ms: set index 0 to real value
   - At 200ms: set index 1 to real value
   - At 400ms: set index 2 to real value
   - ...etc
4. Each update triggers a re-render of `<Radar>` with the new data

**Chart data format:**
```ts
const chartData = dimensions.map((d, i) => ({
  dimension: d.label,
  value: animatedValues[i],
  fullMark: 100,
}));
```

**Recharts JSX:**
```tsx
<ResponsiveContainer width="100%" height={400}>
  <RadarChart data={chartData}>
    <PolarGrid stroke="var(--border)" />
    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: "var(--ink-muted)" }} />
    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
    <Radar
      name="Profile"
      dataKey="value"
      stroke="var(--radar-stroke)"
      fill="var(--radar-fill)"
      strokeWidth={2}
      animationDuration={500}
    />
  </RadarChart>
</ResponsiveContainer>
```

Wrap in a `<Card>` with title "Your Cognitive Portrait" in `font-serif text-2xl`.

### 5E. `src/components/screening/ProfileTagsReveal.tsx`

```tsx
interface ProfileTagsRevealProps {
  tags: string[];         // 3 empowering tags
  summary: string;        // 2-3 sentence narrative
  onContinue: () => void; // navigates to /plan
}
```

Renders after radar chart animation completes. Use `opacity-0 fade-in` class with stagger delays.

- 3 `<Badge color="green">` tags in a `flex gap-2 justify-center` row, each with stagger: `delay-200`, `delay-400`, `delay-600`
- Summary text below in `text-ink-muted text-center max-w-lg mx-auto mt-4 fade-in delay-800`
- "Continue to Plan" button: `<Button variant="primary" size="lg" className="mt-6 fade-in delay-1000">` calls `onContinue`

### 5F. `src/app/screening/page.tsx`

Page layout:
```
<PageContainer>
  {phase === "idle" && <StartScreeningPrompt />}
  {(phase === "questioning" || phase === "evaluating") && <ScreeningChat ... />}
  {phase === "complete" && profile && (
    <>
      <CognitiveRadarChart dimensions={profile.dimensions} />
      <ProfileTagsReveal
        tags={profile.profileTags}
        summary={profile.summary}
        onContinue={() => router.push("/plan")}
      />
    </>
  )}
</PageContainer>
```

The "idle" state shows a hero-like intro: heading "Let's understand how your brain works" in `font-serif text-3xl`, subtext explaining the 6 ASRS questions, and a `<Button>` calling `startScreening()`.

---

## Step 6 — Screen 2: Daily Planner

### 6A. `src/hooks/useDailyPlan.ts`

```ts
interface UseDailyPlanReturn {
  brainState: BrainState | null;
  setBrainState: (state: BrainState) => void;
  plan: PlanResponse | null;
  isGenerating: boolean;
  generateDailyPlan: () => Promise<void>;

  // Intervention
  isIntervening: boolean;
  intervention: InterventionResponse | null;
  triggerStuck: (taskIndex: number, message?: string) => Promise<void>;
  clearIntervention: () => void;

  error: string | null;
}
```

**Logic:**
- `generateDailyPlan()`: calls `generatePlan(userId, brainState)` from api.ts. Sets `plan` on success.
- `triggerStuck(taskIndex, message)`: calls `triggerIntervention(userId, plan.planId, taskIndex, message)`. Sets `intervention` on success. After setting intervention, also update `plan.tasks` to the `intervention.restructuredTasks`.
- `clearIntervention()`: sets `intervention` to null.

### 6B. `src/components/plan/BrainStateSelector.tsx`

```tsx
interface BrainStateSelectorProps {
  selected: BrainState | null;
  onSelect: (state: BrainState) => void;
  disabled?: boolean;
}
```

Renders 3 large buttons in a `grid grid-cols-3 gap-4` layout.

Each button:
- `p-6 rounded-xl border-2 transition-all cursor-pointer text-center`
- Unselected: `border-border bg-bg-card hover:border-[color]` where color is the brain state color
- Selected: `border-[color] bg-[lightColor]` using colors from `BRAIN_STATES` constant

Inside each button:
- Icon from lucide-react (`Cloud`, `Crosshair`, `Zap`) at `w-8 h-8 mx-auto mb-2`
- Label in `font-semibold text-lg`
- Description in `text-ink-muted text-sm mt-1`

Import icons directly:
```tsx
import { Cloud, Crosshair, Zap } from "lucide-react";
const ICONS = { foggy: Cloud, focused: Crosshair, wired: Zap };
```

### 6C. `src/components/plan/TaskCard.tsx`

```tsx
interface TaskCardProps {
  task: PlanTask;
  index: number;
  onStuck?: (index: number) => void;  // optional — shows "stuck" button on hover
  isNew?: boolean;                      // if true, fade-in animation
}
```

Layout: `<Card>` with a colored left border (4px) based on task category.

```
┌─────────────────────────────────────┐
│ [color bar] [icon] Title       [pri]│
│             9:00 AM · 25 min        │
│             Description text...      │
│             ─────────                │
│             "Scheduled first —       │
│              your profile shows..."  │
└─────────────────────────────────────┘
```

- Left border: `border-l-4` with color from `CATEGORY_COLORS[task.category]` — apply via inline `style={{ borderLeftColor: CATEGORY_COLORS[task.category] || "var(--border)" }}`
- **Row 1:** Category icon (lucide, from `CATEGORY_ICONS`) + title in `font-semibold` + priority badge (`<Badge>`: high=red, medium=amber, low=gray)
- **Row 2:** `text-ink-muted text-sm` — time_slot + " · " + duration_minutes + " min"
- **Row 3:** Description in `text-sm text-ink-muted`
- **Row 4 (rationale):** Separator line, then rationale in `text-sm italic text-ink-faint mt-2`. This is the "why this plan" feature.
- If `task.status === "completed"`: show green checkmark icon + strikethrough on title

### 6D. `src/components/plan/DailyPlanView.tsx`

```tsx
interface DailyPlanViewProps {
  plan: PlanResponse;
  onStuck: (taskIndex: number) => void;
}
```

Layout:
- Header: Brain state badge + plan date + overall rationale in `italic text-ink-muted`
- Task list: `flex flex-col gap-4`, map `plan.tasks` to `<TaskCard>` components

### 6E. `src/components/plan/StuckButton.tsx`

```tsx
interface StuckButtonProps {
  onStuck: (taskIndex: number, message?: string) => void;
  taskCount: number;  // to show task picker
  disabled?: boolean;
}
```

**Behavior:** Two-stage interaction.

**Stage 1 (collapsed):** A floating button at bottom-right: `fixed bottom-6 right-6 z-40`. Red pill shape: `bg-red text-white px-6 py-3 rounded-full font-semibold shadow-lg pulse-red`. Text: "I'm Stuck".

**Stage 2 (expanded):** On click, expands to a small panel above the button:
- Task picker: "Which task?" — dropdown or radio buttons with task titles
- Text input: `<textarea>` placeholder "What's happening? (optional)"
- Submit button: `<Button variant="danger">` "Get Help"
- Cancel button: `<Button variant="ghost">` "Cancel"

On submit, calls `onStuck(selectedTaskIndex, messageText)`.

### 6F. `src/components/plan/InterventionPanel.tsx`

**This is the demo climax. Must feel emotionally impactful.**

```tsx
interface InterventionPanelProps {
  intervention: InterventionResponse;
  onClose: () => void;
}
```

Full-screen overlay: `fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center`.

Inner panel: `bg-bg-card rounded-2xl max-w-xl w-full mx-4 p-8 shadow-lg max-h-[80vh] overflow-y-auto`.

**Render sequence:**
1. **Acknowledgment** (appears first with typewriter effect):
   - Heading: "Attune hears you" in `font-serif text-xl text-green`
   - Text: `intervention.acknowledgment` — use a `useState` that reveals characters over 1.5s. Display characters one at a time using `setInterval` with ~25ms per character, storing the visible substring in state.

2. **Restructured Plan** (appears 2s after acknowledgment):
   - Use `useState<boolean>(false)` + `setTimeout(() => setShowPlan(true), 2000)`
   - When visible: `fade-in` animation
   - Heading: "Here's your adjusted plan" in `font-semibold text-lg`
   - Map `intervention.restructuredTasks` to `<TaskCard isNew />` components

3. **Agent Reasoning** (appears with plan):
   - Collapsible section: "Why these changes?" — shows `intervention.agentReasoning` in `text-sm italic text-ink-muted`

4. **Close button:** `<Button variant="primary">` "Got it, let's go" — calls `onClose`

5. **Optional followup hint:** If `intervention.followupHint` exists, show it as a small `text-ink-faint text-xs` note at the bottom.

### 6G. `src/app/plan/page.tsx`

Page flow:

```
<PageContainer>
  {!user && <redirect to landing>}
  {!user?.hasProfile && <redirect to /screening>}

  <h1 className="font-serif text-3xl font-bold">Your Daily Plan</h1>

  {/* Step 1: Select brain state */}
  <BrainStateSelector
    selected={brainState}
    onSelect={setBrainState}
    disabled={isGenerating}
  />

  {/* Step 2: Generate button */}
  {brainState && !plan && (
    <Button onClick={generateDailyPlan} isLoading={isGenerating}>
      Generate My Plan
    </Button>
  )}

  {/* Step 3: Show plan */}
  {plan && <DailyPlanView plan={plan} onStuck={openStuckPanel} />}

  {/* Floating stuck button */}
  {plan && <StuckButton onStuck={triggerStuck} taskCount={plan.tasks.length} />}

  {/* Intervention overlay */}
  {intervention && (
    <InterventionPanel intervention={intervention} onClose={clearIntervention} />
  )}

  {/* Loading state */}
  {isGenerating && <LoadingSpinner label="AI agents are crafting your plan..." />}
</PageContainer>
```

---

## Step 7 — Screen 3: Dashboard

### 7A. `src/hooks/useDashboard.ts`

```ts
interface UseDashboardReturn {
  data: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

On mount, calls `fetchDashboard(userId)`. Stores result in `data`. `refresh()` re-fetches.

### 7B. `src/components/dashboard/MomentumScore.tsx`

```tsx
interface MomentumScoreProps {
  score: number;     // e.g. 71
  delta: number;     // e.g. +23
}
```

Layout: `<Card padding="lg">` with centered content.

- Score number: `font-serif text-6xl font-bold text-green count-up`. Use a count-up animation: start from 0, increment to `score` over ~1s using `requestAnimationFrame` or `setInterval`.
- Delta arrow: if `delta > 0`, show `<TrendingUp />` from lucide in `text-green` with "+{delta}". If `delta < 0`, show `<TrendingDown />` in `text-red`.
- Label: `text-ink-muted text-sm mt-2` — "14-day momentum"

### 7C. `src/components/dashboard/TrendChart.tsx`

```tsx
interface TrendChartProps {
  data: TrendDataPoint[];
  annotations: AgentAnnotation[];
}
```

**Uses:** `import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";`

**Important:** Mood scores are 1-10 in the API but completion is 0-100. Scale mood to 0-100 for a shared Y-axis:
```ts
const chartData = data.map(d => ({ ...d, moodScaled: d.moodScore * 10 }));
```

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
    <XAxis dataKey="dayNumber" tick={{ fontSize: 12, fill: "var(--ink-muted)" }} />
    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--ink-muted)" }} />
    <Tooltip
      contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px" }}
    />
    <Line type="monotone" dataKey="moodScaled" name="Mood (scaled)" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} />
    <Line type="monotone" dataKey="completionRate" name="Completion %" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3 }} />

    {/* Agent annotation dots */}
    {annotations.map((a, i) => (
      <ReferenceDot
        key={i}
        x={a.dayNumber}
        y={chartData.find(d => d.dayNumber === a.dayNumber)?.moodScaled || 0}
        r={6}
        fill={a.type === "intervention" ? "var(--red)" : "var(--violet)"}
        stroke="white"
        strokeWidth={2}
      />
    ))}
  </LineChart>
</ResponsiveContainer>
```

Below the chart, show a legend:
- Red dot = "Intervention triggered"
- Violet dot = "Pattern detected"

### 7D. `src/components/dashboard/HypothesisCard.tsx`

```tsx
interface HypothesisCardProps {
  card: HypothesisCard;  // from types
}
```

Layout: `<Card>` with:

```
┌─────────────────────────────────────────┐
│ [confidence dot] Pattern Detected  [badge]│
│                                           │
│ "Low-energy days consistently follow..." │
│                                           │
│ Prediction:                               │
│ "If Alex has two consecutive days..."     │
│                                           │
│ Evidence:                                 │
│ • Day 7: "Days 7-8 were high energy..."  │
│ • Day 11: "Days 9-10 were..."            │
└─────────────────────────────────────────┘
```

- **Confidence dot:** Colored circle — high=`bg-green`, medium=`bg-amber`, low=`bg-ink-faint`. Size: `w-3 h-3 rounded-full inline-block`.
- **Status badge:** `<Badge>` — "testing"=blue, "confirmed"=green, "rejected"=red
- **Pattern detected:** `font-semibold text-base`
- **Prediction:** `text-ink-muted text-sm mt-2` — this should feel predictive/forward-looking
- **Supporting evidence:** `mt-3` bulleted list, each item: `text-ink-faint text-xs` with "Day {day}: {detail}"

### 7E. `src/app/dashboard/page.tsx`

Page layout:

```
<PageContainer>
  {!user && <redirect to landing>}

  <h1 className="font-serif text-3xl font-bold">Your Dashboard</h1>

  {isLoading && <LoadingSpinner label="Loading your data..." />}

  {data && (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

      {/* Left column: 2/3 width */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <MomentumScore score={data.momentumScore} delta={data.momentumDelta} />
        <Card>
          <h2 className="font-semibold text-lg mb-4">14-Day Trends</h2>
          <TrendChart data={data.trendData} annotations={data.agentAnnotations} />
        </Card>
      </div>

      {/* Right column: 1/3 width */}
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">Agent Hypotheses</h2>
        {data.hypothesisCards.map(card => (
          <HypothesisCard key={card.id} card={card} />
        ))}
      </div>

    </div>
  )}
</PageContainer>
```

---

## API Contracts Quick Reference

```
POST /api/auth/guest
  Request:  {} (empty body)
  Response: { userId: string, name: string, isGuest: boolean, hasProfile: boolean }

POST /api/screening/evaluate
  Request:  { userId: string, answers: [{ questionIndex: number, questionText: string, score: number }] }
  Response: { profileId, dimensions: RadarDimension[], profileTags: string[], summary: string, asrsTotalScore: number, isPositiveScreen: boolean }

GET /api/profile/{userId}
  Response: { dimensions: RadarDimension[], profileTags: string[], summary: string }

POST /api/plan/generate
  Request:  { userId: string, brainState: "foggy"|"focused"|"wired", tasks?: string[] }
  Response: { planId: string, tasks: PlanTask[], overallRationale: string }

POST /api/plan/intervene
  Request:  { userId: string, planId: string, stuckTaskIndex: number, userMessage?: string }
  Response: { interventionId, acknowledgment: string, restructuredTasks: PlanTask[], agentReasoning: string, followupHint?: string }

GET /api/dashboard/{userId}
  Response: { trendData: TrendDataPoint[], momentumScore: number, momentumDelta: number, hypothesisCards: HypothesisCard[], agentAnnotations: AgentAnnotation[] }
```

**Timeouts:** CrewAI-powered endpoints (`/screening/evaluate`, `/plan/generate`, `/plan/intervene`) can take 3-10 seconds. The axios client has a 30s timeout. Always show loading states.

---

## Alex Seed Data (Demo Account)

When "Continue as Guest" is clicked, the backend creates/returns a user "Alex" with pre-seeded 14-day history. This means:

- **Guest login returns `hasProfile: true`** — so the frontend can skip screening and go straight to `/plan` or `/dashboard`
- **Dashboard will have real data** — 14 trend points, 2 hypothesis cards, momentum score ~71
- **Alex's profile:** Attention:42, Time:35, Emotional:78, Memory:51, Initiation:30, Hyperfocus:88. Tags: Deep-Diver, Momentum-Builder, Intensity-Engine

You can still run screening as Alex (it will create a new profile).

---

## Design Reference

| Element | Font | Weight |
|---------|------|--------|
| Page headings (h1) | Playfair Display (`font-serif`) | 700 (bold) |
| Section headings (h2) | IBM Plex Sans (`font-sans`) | 600 (semibold) |
| Body text | IBM Plex Sans | 400 (regular) |
| Code/data | IBM Plex Mono (`font-mono`) | 400 |
| Buttons | IBM Plex Sans | 500 (medium) |
| Badges | IBM Plex Sans | 500 (medium) |

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#faf9f6` | Page bg |
| Card bg | `#ffffff` | Cards, panels |
| Ink | `#18160f` | Primary text |
| Ink muted | `#6b6560` | Secondary text |
| Ink faint | `#a8a29e` | Tertiary text, rationale |
| Green | `#1d6344` | Primary brand, CTAs, agent bubbles |
| Red | `#b83b10` | Danger, stuck button, wired state |
| Amber | `#a05f10` | Warnings, medium priority |
| Blue | `#1a40bf` | Info, deep_work category, completion line |
| Violet | `#5c2fa0` | Creative category, pattern dots |

**No dark mode.** Light theme only. Remove the `prefers-color-scheme: dark` media query from globals.css.

---

## Key UX Details

1. **Screening chat auto-scrolls** to bottom after each answer
2. **Radar chart stagger** is 200ms per dimension = 1.2s total, then each dimension animates from 0 to value over 500ms
3. **Profile tags fade in** after radar finishes (use 2s delay)
4. **Plan generation** shows a `<LoadingSpinner>` with text "AI agents are crafting your plan..."
5. **Intervention acknowledgment** uses typewriter effect (25ms per character)
6. **Restructured plan** fades in 2s after acknowledgment starts
7. **Momentum score** counts up from 0 to final value over 1s
8. **All API waits** show `<LoadingSpinner>` — never leave the user staring at a blank screen
9. **Navigation guards:** Plan page redirects to `/screening` if no profile. Dashboard works for guest (seeded data).

---

## Stretch Goals (Day 4 only, if time permits)

### Voice Input on "I'm Stuck" Panel
- `src/components/plan/VoiceInput.tsx`
- Use `window.SpeechRecognition` or `window.webkitSpeechRecognition`
- Show a mic button with pulsing red dot while recording
- `onresult` event fills the textarea in StuckButton
- Chrome-only — add a feature check: `if (!("webkitSpeechRecognition" in window))`

### Follow-up Agent Message
- After intervention, poll the backend every 5s for 30s looking for `followupHint`
- Show as a new `<ChatBubble variant="agent">` that slides in below the intervention panel

---

## Deployment (Vercel)

1. Push to GitHub
2. Import `frontend/` directory in Vercel
3. Set root directory to `frontend`
4. Add env var: `NEXT_PUBLIC_API_URL` = Railway backend URL
5. Deploy

---

## Demo Flow (4 minutes)

1. **Landing page** (15s) — show hero, click "Continue as Guest"
2. **Dashboard** (45s) — show Alex's 14-day momentum (71), trend chart, 2 hypothesis cards
3. **Screening** (90s) — answer 6 ASRS questions, radar chart animates, profile tags reveal
4. **Planner** (60s) — select "Focused" brain state, generate plan, show tasks with rationale
5. **Intervention** (30s) — click "I'm Stuck", type "I can't start this task", acknowledgment typewriter, restructured plan fades in
6. **Back to dashboard** (15s) — show the system learning from interaction
