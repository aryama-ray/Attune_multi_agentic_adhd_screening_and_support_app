# Attune — Fullstack Implementation Playbook

> **Two-person team guide.** Work is split by **feature**, not by layer. Each person owns their feature end-to-end: backend testing/fixes + frontend build + integration. Both team members are Python-primary; TypeScript/React instructions are detailed and copy-paste friendly.

---

## Architecture

```
┌──────────────────────────────────────────┐
│  Next.js Frontend (localhost:3000)        │
│  Landing │ Screening │ Plan │ Dashboard   │
└────────────────┬─────────────────────────┘
                 │ axios → localhost:8000
┌────────────────▼─────────────────────────┐
│  FastAPI Backend (localhost:8000)          │
│  3 CrewAI Agents + Supabase (PostgreSQL) │
└──────────────────────────────────────────┘
```

**Backend:** Python, FastAPI, CrewAI, Supabase — **DONE** (on `backend` branch)
**Frontend:** Next.js 16, React 19, Tailwind v4, TypeScript — **TO BUILD**

---

## How to Run (both people, every session)

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:3000
```

Verify backend: `curl http://localhost:8000/` → `{"status":"ok"}`

---

## Team Assignment Summary

| Phase | Person A (You) | Person B (Teammate) |
|-------|---------------|---------------------|
| **Phase 1** | Build frontend foundation (16 files) | Set up Supabase + test all backend endpoints |
| **Phase 2** | Build Screening + Dashboard features | Build Planner + Intervention features |
| **Phase 3** | Integration testing (together) | Integration testing (together) |

---

## File Ownership Map (zero overlap = zero merge conflicts in Phase 2)

```
frontend/src/
├── app/
│   ├── globals.css              ← Phase 1 (Person A)
│   ├── layout.tsx               ← Phase 1 (Person A)
│   ├── page.tsx                 ← Phase 1 (Person A)
│   ├── screening/page.tsx       ← Person A
│   ├── plan/page.tsx            ← Person B
│   └── dashboard/page.tsx       ← Person A
├── components/
│   ├── ui/*                     ← Phase 1 (Person A)
│   ├── layout/*                 ← Phase 1 (Person A)
│   ├── auth/*                   ← Phase 1 (Person A)
│   ├── screening/*              ← Person A (4 files)
│   ├── plan/*                   ← Person B (5 files)
│   └── dashboard/*              ← Person A (3 files)
├── hooks/
│   ├── useUser.ts               ← Phase 1 (Person A)
│   ├── useScreeningChat.ts      ← Person A
│   ├── useDailyPlan.ts          ← Person B
│   └── useDashboard.ts          ← Person A
├── lib/
│   ├── api.ts                   ← Phase 1 (Person A)
│   └── constants.ts             ← Phase 1 (Person A)
└── types/
    └── index.ts                 ← Phase 1 (Person A)

backend/                          ← Already built
├── app/routes/screening.py      ← Person A tests/fixes
├── app/routes/profile.py        ← Person A tests/fixes
├── app/routes/dashboard.py      ← Person A tests/fixes
├── app/routes/plan.py           ← Person B tests/fixes
├── app/routes/auth.py           ← Both test
└── ...
```

---

## TypeScript/React Quick Reference (for Python devs)

| Python | TypeScript/React Equivalent |
|--------|---------------------------|
| `x = 5` | `const [x, setX] = useState(5)` — calling `setX(10)` re-renders |
| `if __name__` | `useEffect(() => { ... }, [])` — runs once on mount |
| `@app.route` | Next.js file-based routing: `app/screening/page.tsx` = `/screening` |
| `class MyModel(BaseModel):` | `export interface MyModel { ... }` |
| `import os; os.getenv()` | `process.env.NEXT_PUBLIC_API_URL` (client-side must prefix `NEXT_PUBLIC_`) |
| `async def` | `async function` or `const fn = async () => {}` |
| `try/except` | `try { } catch (error) { }` |
| `f"string {var}"` | `` `string ${var}` `` (backtick template literals) |
| `dict` | `Record<string, any>` or defined `interface` |
| `list[str]` | `string[]` |
| `None` | `null` |

**Critical React rule:** Add `"use client"` at the top of any file using `useState`, `useEffect`, `useContext`, or event handlers. Next.js defaults to server components.

---

# PHASE 1 — FOUNDATION

> **Person A** builds all shared frontend files. **Person B** sets up Supabase and tests backend endpoints.

---

## Person B: Backend & Supabase Setup

### Task B1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com), create a free project
2. Note down: Project URL, anon key, service role key
3. Open SQL Editor in Supabase Dashboard

### Task B2: Run Database Schema

Copy the contents of `backend/supabase/schema.sql` into the Supabase SQL Editor and click "Run".

This creates 7 tables: `users`, `asrs_responses`, `cognitive_profiles`, `daily_plans`, `checkins`, `interventions`, `hypothesis_cards`.

### Task B3: Configure Backend Environment

Create `backend/.env` (copy from `.env.example`):
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
```

### Task B4: Install and Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Task B5: Test All 6 Endpoints

Test each endpoint and document the response. Fix any issues.

**1. Guest login (creates Alex + seeds 14-day data):**
```bash
curl -X POST http://localhost:8000/api/auth/guest -H "Content-Type: application/json"
```
Expected: `{ "userId": "00000000-...-000000000001", "name": "Alex", "isGuest": true, "hasProfile": true }`

**2. Fetch profile:**
```bash
curl http://localhost:8000/api/profile/00000000-0000-0000-0000-000000000001
```
Expected: `{ "dimensions": [...6 items...], "profileTags": ["Deep-Diver", ...], "summary": "..." }`

**3. Fetch dashboard:**
```bash
curl http://localhost:8000/api/dashboard/00000000-0000-0000-0000-000000000001
```
Expected: `{ "trendData": [...14 items...], "momentumScore": ~71, "momentumDelta": ~23, "hypothesisCards": [...2 items...], "agentAnnotations": [...] }`

**4. Generate plan (requires Anthropic API key):**
```bash
curl -X POST http://localhost:8000/api/plan/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "00000000-0000-0000-0000-000000000001", "brainState": "focused"}'
```
Expected: `{ "planId": "...", "tasks": [...], "overallRationale": "..." }` (takes 3-10s)

**5. Trigger intervention:**
```bash
curl -X POST http://localhost:8000/api/plan/intervene \
  -H "Content-Type: application/json" \
  -d '{"userId": "00000000-0000-0000-0000-000000000001", "planId": "PLAN_ID_FROM_STEP_4", "stuckTaskIndex": 0, "userMessage": "I cannot focus"}'
```
Expected: `{ "interventionId": "...", "acknowledgment": "...", "restructuredTasks": [...], "agentReasoning": "..." }`

**6. Evaluate screening:**
```bash
curl -X POST http://localhost:8000/api/screening/evaluate \
  -H "Content-Type: application/json" \
  -d '{"userId": "00000000-0000-0000-0000-000000000001", "answers": [{"questionIndex": 0, "questionText": "...", "score": 3}, {"questionIndex": 1, "questionText": "...", "score": 2}, {"questionIndex": 2, "questionText": "...", "score": 3}, {"questionIndex": 3, "questionText": "...", "score": 4}, {"questionIndex": 4, "questionText": "...", "score": 2}, {"questionIndex": 5, "questionText": "...", "score": 1}]}'
```
Expected: `{ "profileId": "...", "dimensions": [...], "profileTags": [...], "summary": "...", "asrsTotalScore": 15, "isPositiveScreen": true }`

### Task B6: Document Field Name Mapping

Check if backend returns snake_case (`brain_state`) or camelCase (`brainState`). Document any mismatches so Person A can handle them in `api.ts`. Common issues:
- `user_id` vs `userId`
- `has_profile` vs `hasProfile`
- `is_guest` vs `isGuest`
- `plan_id` vs `planId`
- `stuck_task_index` vs `stuckTaskIndex`
- `duration_minutes` vs `durationMinutes`
- `time_slot` vs `timeSlot`

If snake_case, add `alias_generator` to backend Pydantic models in `app/models.py`:
```python
from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

class GuestLoginResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    # ... fields
```

Or transform in frontend `api.ts` after receiving response.

---

## Person A: Frontend Foundation

### Task A1: Environment File

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Task A2: Design System — `src/app/globals.css`

Replace the entire default file. This is the Attune design system with Tailwind v4 theme tokens.

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

### Task A3: TypeScript Interfaces — `src/types/index.ts`

These mirror the backend Pydantic models exactly. Copy-paste this file.

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
  key: string;
  label: string;
  value: number;     // 0-100
  insight: string;
}

export interface ScreeningResponse {
  profileId: string;
  dimensions: RadarDimension[];
  profileTags: string[];
  summary: string;
  asrsTotalScore: number;
  isPositiveScreen: boolean;
}

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
  time_slot: string;
  category: string;
  rationale: string;
  priority: string;
  status: string;
}

export interface PlanResponse {
  planId: string;
  tasks: PlanTask[];
  overallRationale: string;
}

// ── Intervention ──
export interface InterventionResponse {
  interventionId: string;
  acknowledgment: string;
  restructuredTasks: PlanTask[];
  agentReasoning: string;
  followupHint?: string;
}

// ── Dashboard ──
export interface TrendDataPoint {
  date: string;
  dayNumber: number;
  moodScore: number;
  completionRate: number;
  brainState: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface HypothesisCard {
  id: string;
  patternDetected: string;
  prediction: string;
  confidence: string;
  status: string;
  supportingEvidence: Array<{ day: number; detail: string }>;
  createdAt: string;
}

export interface AgentAnnotation {
  dayNumber: number;
  text: string;
  type: string;
}

export interface DashboardResponse {
  trendData: TrendDataPoint[];
  momentumScore: number;
  momentumDelta: number;
  hypothesisCards: HypothesisCard[];
  agentAnnotations: AgentAnnotation[];
}

export type BrainState = "foggy" | "focused" | "wired";
```

### Task A4: Constants — `src/lib/constants.ts`

```ts
import type { BrainState } from "@/types";

export const ASRS_QUESTIONS = [
  "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
  "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
  "How often do you have problems remembering appointments or obligations?",
  "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
  "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
  "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
] as const;

export const ANSWER_OPTIONS = [
  { label: "Never", score: 0 },
  { label: "Rarely", score: 1 },
  { label: "Sometimes", score: 2 },
  { label: "Often", score: 3 },
  { label: "Very Often", score: 4 },
] as const;

export const RADAR_DIMENSIONS = [
  { key: "attention_regulation", label: "Attention Regulation" },
  { key: "time_perception", label: "Time Perception" },
  { key: "emotional_intensity", label: "Emotional Intensity" },
  { key: "working_memory", label: "Working Memory" },
  { key: "task_initiation", label: "Task Initiation" },
  { key: "hyperfocus_capacity", label: "Hyperfocus Capacity" },
] as const;

export const BRAIN_STATES: Record<BrainState, {
  label: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
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

### Task A5: API Client — `src/lib/api.ts`

```ts
import axios from "axios";
import type {
  User, ASRSAnswer, ScreeningResponse, ProfileResponse,
  PlanResponse, InterventionResponse, DashboardResponse, BrainState,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export async function createGuestSession(): Promise<User> {
  const { data } = await api.post<User>("/api/auth/guest");
  return data;
}

export async function evaluateScreening(userId: string, answers: ASRSAnswer[]): Promise<ScreeningResponse> {
  const { data } = await api.post<ScreeningResponse>("/api/screening/evaluate", { userId, answers });
  return data;
}

export async function fetchProfile(userId: string): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>(`/api/profile/${userId}`);
  return data;
}

export async function generatePlan(userId: string, brainState: BrainState, tasks?: string[]): Promise<PlanResponse> {
  const { data } = await api.post<PlanResponse>("/api/plan/generate", { userId, brainState, tasks });
  return data;
}

export async function triggerIntervention(userId: string, planId: string, stuckTaskIndex: number, userMessage?: string): Promise<InterventionResponse> {
  const { data } = await api.post<InterventionResponse>("/api/plan/intervene", { userId, planId, stuckTaskIndex, userMessage });
  return data;
}

export async function fetchDashboard(userId: string): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>(`/api/dashboard/${userId}`);
  return data;
}
```

### Task A6: Auth Hook — `src/hooks/useUser.ts`

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
  user: null, isLoading: true, loginAsGuest: async () => {}, logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("attune_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("attune_user"); }
    }
    setIsLoading(false);
  }, []);

  const loginAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await createGuestSession();
      setUser(userData);
      localStorage.setItem("attune_user", JSON.stringify(userData));
    } finally { setIsLoading(false); }
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

export function useUser() { return useContext(UserContext); }
```

### Task A7: UI Components — `src/components/ui/Button.tsx`

Props: `variant` (primary/secondary/ghost/danger), `size` (sm/md/lg), `isLoading` (boolean).

| Variant | Tailwind Classes |
|---------|-----------------|
| `primary` | `bg-green text-white hover:bg-green-dark` |
| `secondary` | `bg-bg-card text-ink border border-border hover:border-green` |
| `ghost` | `bg-transparent text-ink-muted hover:bg-green-light hover:text-green` |
| `danger` | `bg-red text-white hover:opacity-90` |

Sizes: `sm`=`px-3 py-1.5 text-sm`, `md`=`px-4 py-2 text-base`, `lg`=`px-6 py-3 text-lg`.
Base: `rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed`.
When `isLoading`, show `<Loader2 className="animate-spin" />` from lucide-react and disable.

### Task A8: UI Components — `src/components/ui/Card.tsx`

Props: `children`, `className?`, `padding` (sm/md/lg).
Base: `bg-bg-card rounded-xl border border-border shadow-[var(--shadow-sm)]`.
Padding: `sm`=`p-4`, `md`=`p-6`, `lg`=`p-8`. Default: `md`.

### Task A9: UI Components — `src/components/ui/Badge.tsx`

Props: `children`, `color` (green/red/amber/blue/violet/gray).
Render as `<span>`. Base: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`.
Colors: green=`bg-green-light text-green`, red=`bg-red-light text-red`, amber=`bg-amber-light text-amber`, blue=`bg-blue-light text-blue`, violet=`bg-violet-light text-violet`, gray=`bg-[#f0f0ed] text-ink-muted`.

### Task A10: UI Components — `src/components/ui/ChatBubble.tsx`

Props: `children`, `variant` (agent/user), `isTyping?`.
Layout: `max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed`.
Agent: `self-start bg-green-light text-ink rounded-bl-sm`.
User: `self-end bg-bg-card text-ink border border-border rounded-br-sm`.
When `isTyping`: show 3 animated dots instead of children.

### Task A11: UI Components — `src/components/ui/LoadingSpinner.tsx`

Props: `size` (sm/md/lg), `label?`.
Use lucide-react `<Loader2 className="animate-spin" />`. Sizes: sm=`w-4 h-4`, md=`w-8 h-8`, lg=`w-12 h-12`. Color: `text-green`.
If `label`, show below in `text-ink-muted text-sm`.

### Task A12: Layout — `src/components/layout/Navbar.tsx`

No props — reads from `useUser()` context.
Container: `sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border`.
Inner: `max-w-5xl mx-auto px-6 h-14 flex items-center justify-between`.
Left: "attune" logo in `font-serif text-xl font-semibold text-green`.
Center: 3 links ("Screening" → `/screening`, "Plan" → `/plan`, "Dashboard" → `/dashboard`). Active: `text-green font-medium`. Inactive: `text-ink-muted hover:text-ink`. Use `usePathname()` from `next/navigation`.
Right: If user, show pill `bg-green-light text-green px-3 py-1 rounded-full text-sm font-medium` with user name.

### Task A13: Layout — `src/components/layout/PageContainer.tsx`

Props: `children`, `className?`.
Wrapper: `max-w-5xl mx-auto px-6 py-8`. Merge className.

### Task A14: Auth — `src/components/auth/GuestLoginButton.tsx`

No props — uses `useUser()` context.
Renders `<Button variant="primary" size="lg">` text "Continue as Alex (Guest)".
On click: `loginAsGuest()`. While loading, show spinner.
After login: redirect to `/screening` if `!hasProfile`, or `/plan` if `hasProfile`. Use `useRouter()` from `next/navigation`.

### Task A15: Root Layout — `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { UserProvider } from "@/hooks/useUser";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair-display", subsets: ["latin"], weight: ["400", "600", "700"],
});
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"],
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono", subsets: ["latin"], weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Attune — AI Executive Function Co-Pilot",
  description: "Multi-agent AI system for ADHD screening and adaptive daily planning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}>
        <UserProvider>
          <Navbar />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
```

### Task A16: Landing Page — `src/app/page.tsx`

Replace default content entirely. Structure:
1. Hero: `max-w-2xl mx-auto text-center pt-24 pb-16`
   - `<Badge color="green">3 AI Agents</Badge>`
   - Headline: `font-serif text-5xl font-bold text-ink leading-tight` — "Your brain works differently. Your planner should too."
   - Subtitle: `text-ink-muted text-lg mt-4 max-w-lg mx-auto` — "Attune is a multi-agent AI executive function co-pilot. It screens, plans, and intervenes — so you don't have to self-manage the thing that makes self-management hard."
2. Stats: `flex justify-center gap-12 mt-12` — "366M" / "adults with ADHD globally", "$13B" / "lost productivity annually", "3" / "AI agents working for you". Numbers in `font-serif text-3xl font-bold text-green`.
3. CTAs: `flex justify-center gap-4 mt-12` — `<GuestLoginButton />` + `<Button variant="secondary" size="lg">` linking to `/screening` "Start Screening".

### Phase 1 Gate

Both people verify together:
- [ ] Backend returns data for all 6 endpoints
- [ ] Frontend landing page renders at localhost:3000
- [ ] "Continue as Guest" creates Alex in Supabase, shows name in Navbar
- [ ] Navigation links work (even if pages are empty)
- [ ] Merge Phase 1 branch, then create 2 feature branches

---

# PHASE 2 — PARALLEL FEATURE BUILD

> **Person A** builds Screening + Dashboard. **Person B** builds Planner + Intervention.
> Each person works on their own branch. Zero merge conflicts — all files are in separate directories.

---

## Person A: Feature 1 — ASRS Screening (`/screening`)

### Backend Endpoints Person A Owns

| Endpoint | What it does | Backend file to fix if broken |
|----------|-------------|------------------------------|
| `POST /api/screening/evaluate` | Sends 6 ASRS answers → CrewAI screening agent → returns cognitive profile | `app/routes/screening.py`, `app/agents/screening_agent.py` |
| `GET /api/profile/{userId}` | Returns stored cognitive profile | `app/routes/profile.py` |

### Task A-S1: Screening Hook — `src/hooks/useScreeningChat.ts`

State machine with 4 phases: `"idle"` → `"questioning"` → `"evaluating"` → `"complete"`.

```ts
interface UseScreeningChatReturn {
  phase: "idle" | "questioning" | "evaluating" | "complete";
  currentQuestionIndex: number;       // 0-5
  answers: ASRSAnswer[];
  profile: ScreeningResponse | null;
  isLoading: boolean;
  startScreening: () => void;
  submitAnswer: (score: number) => void;
  error: string | null;
}
```

Logic:
- `startScreening()`: phase → `"questioning"`, reset answers, index = 0
- `submitAnswer(score)`: push `{ questionIndex, questionText: ASRS_QUESTIONS[index], score }` to answers. If index < 5, increment with **500ms setTimeout delay** (chat UX feel). If index === 5 (last), phase → `"evaluating"`, call `evaluateScreening(userId, allAnswers)`, then set profile and phase → `"complete"`.
- Get `userId` from `useUser()` context.

### Task A-S2: Answer Selector — `src/components/screening/AnswerSelector.tsx`

Props: `onSelect: (score: number) => void`, `disabled?: boolean`.
Renders 5 buttons from `ANSWER_OPTIONS`. Layout: `flex gap-2 flex-wrap`.
Each button: `px-4 py-2 rounded-lg border border-border text-sm font-medium transition-all hover:border-green hover:bg-green-light hover:text-green`.

### Task A-S3: Screening Chat — `src/components/screening/ScreeningChat.tsx`

Props: `currentQuestionIndex`, `answers`, `phase`, `onAnswer`.
Container: `flex flex-col gap-3 overflow-y-auto max-h-[60vh] p-4`.
Rendering:
- Past questions: `<ChatBubble variant="agent">` question + `<ChatBubble variant="user">` answer label
- Current question: `<ChatBubble variant="agent">` + `<AnswerSelector>`
- Evaluating: `<ChatBubble variant="agent" isTyping />`
Auto-scroll: `useRef` on container, `useEffect` → `ref.current.scrollTop = ref.current.scrollHeight`.

### Task A-S4: Radar Chart — `src/components/screening/CognitiveRadarChart.tsx`

**Demo highlight. Staggered animation is critical.**

Props: `dimensions: RadarDimension[]`, `animate?: boolean`.
Import: `{ RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer }` from `"recharts"`.

Animation: `useState<number[]>([0,0,0,0,0,0])`. On mount/prop change, 200ms staggered `setTimeout` per dimension to set real value. Chart data:
```ts
const chartData = dimensions.map((d, i) => ({ dimension: d.label, value: animatedValues[i], fullMark: 100 }));
```
Recharts: `<RadarChart>` → `<PolarGrid stroke="var(--border)" />` → `<PolarAngleAxis>` → `<Radar dataKey="value" stroke="var(--radar-stroke)" fill="var(--radar-fill)" strokeWidth={2} />`.
Wrap in `<Card>` with title "Your Cognitive Portrait" in `font-serif text-2xl`.

### Task A-S5: Profile Tags Reveal — `src/components/screening/ProfileTagsReveal.tsx`

Props: `tags: string[]`, `summary: string`, `onContinue: () => void`.
3 `<Badge color="green">` tags in `flex gap-2 justify-center`, each with stagger: `opacity-0 fade-in delay-200/400/600`.
Summary: `text-ink-muted text-center max-w-lg mx-auto mt-4 fade-in delay-800`.
Button: `<Button variant="primary" size="lg" className="mt-6 fade-in delay-1000">` calls `onContinue`.

### Task A-S6: Screening Page — `src/app/screening/page.tsx`

```
<PageContainer>
  {phase === "idle" && (
    <div className="text-center max-w-xl mx-auto pt-12">
      <h1 className="font-serif text-3xl font-bold">Let's understand how your brain works</h1>
      <p className="text-ink-muted mt-4">6 quick questions from the WHO ASRS-6 scale...</p>
      <Button onClick={startScreening} className="mt-8">Begin Screening</Button>
    </div>
  )}
  {(phase === "questioning" || phase === "evaluating") && <ScreeningChat ... />}
  {phase === "complete" && profile && (
    <>
      <CognitiveRadarChart dimensions={profile.dimensions} />
      <ProfileTagsReveal tags={profile.profileTags} summary={profile.summary} onContinue={() => router.push("/plan")} />
    </>
  )}
</PageContainer>
```

### Task A-S7: Integration Test — Screening

1. Start backend + frontend
2. Navigate to `/screening`
3. Click "Begin Screening"
4. Answer all 6 questions
5. Verify: loading spinner appears during evaluation, radar chart animates with stagger, profile tags fade in
6. Click "Continue to Plan" → navigates to `/plan`

---

## Person A: Feature 2 — Dashboard (`/dashboard`)

### Backend Endpoint Person A Owns

| Endpoint | What it does | Backend file to fix if broken |
|----------|-------------|------------------------------|
| `GET /api/dashboard/{userId}` | Returns 14-day trends, momentum, hypotheses | `app/routes/dashboard.py`, `app/services/momentum_service.py` |

### Task A-D1: Dashboard Hook — `src/hooks/useDashboard.ts`

```ts
interface UseDashboardReturn {
  data: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```
On mount, call `fetchDashboard(userId)`. Store in `data`. `refresh()` re-fetches.

### Task A-D2: Momentum Score — `src/components/dashboard/MomentumScore.tsx`

Props: `score: number`, `delta: number`.
Layout: `<Card padding="lg">` centered.
Count-up: start from 0, animate to `score` over ~1s using `requestAnimationFrame` or `setInterval`. Display in `font-serif text-6xl font-bold text-green`.
Delta: `delta > 0` → `<TrendingUp />` from lucide in `text-green` + "+{delta}". `delta < 0` → `<TrendingDown />` in `text-red`.
Label: `text-ink-muted text-sm mt-2` — "14-day momentum".

### Task A-D3: Trend Chart — `src/components/dashboard/TrendChart.tsx`

Props: `data: TrendDataPoint[]`, `annotations: AgentAnnotation[]`.
Import: `{ LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot }` from `"recharts"`.

**Scale mood 1-10 → 0-100:** `data.map(d => ({ ...d, moodScaled: d.moodScore * 10 }))`.

Two lines: mood (green) + completion (blue). Annotation dots: red = intervention, violet = pattern.
Legend below: red dot + "Intervention triggered", violet dot + "Pattern detected".

### Task A-D4: Hypothesis Card — `src/components/dashboard/HypothesisCard.tsx`

Props: `card: HypothesisCard`.
Confidence dot: high=`bg-green`, medium=`bg-amber`, low=`bg-ink-faint`. Size: `w-3 h-3 rounded-full`.
Status badge: testing=blue, confirmed=green, rejected=red.
Pattern: `font-semibold text-base`. Prediction: `text-ink-muted text-sm mt-2`. Evidence: bulleted list `text-ink-faint text-xs`.

### Task A-D5: Dashboard Page — `src/app/dashboard/page.tsx`

Grid: `grid-cols-1 lg:grid-cols-3 gap-6`. Left 2/3: MomentumScore + TrendChart. Right 1/3: HypothesisCards.
If no user, redirect to landing. Show `<LoadingSpinner>` while loading.

### Task A-D6: Integration Test — Dashboard

1. Login as guest (Alex has seeded data)
2. Navigate to `/dashboard`
3. Verify: momentum counts up to ~71, delta shows +23, trend chart shows 14 days, 2 hypothesis cards render
4. Annotation dots appear at days 4 and 11

---

## Person B: Feature 3 — Daily Planner + Intervention (`/plan`)

### Backend Endpoints Person B Owns

| Endpoint | What it does | Backend file to fix if broken |
|----------|-------------|------------------------------|
| `POST /api/plan/generate` | Brain state + profile → CrewAI planning agent → task plan | `app/routes/plan.py`, `app/agents/planning_agent.py` |
| `POST /api/plan/intervene` | Stuck trigger → CrewAI intervention agent → acknowledgment + restructured plan | `app/routes/plan.py`, `app/agents/intervention_agent.py` |

### Task B-P1: Daily Plan Hook — `src/hooks/useDailyPlan.ts`

```ts
interface UseDailyPlanReturn {
  brainState: BrainState | null;
  setBrainState: (state: BrainState) => void;
  plan: PlanResponse | null;
  isGenerating: boolean;
  generateDailyPlan: () => Promise<void>;
  isIntervening: boolean;
  intervention: InterventionResponse | null;
  triggerStuck: (taskIndex: number, message?: string) => Promise<void>;
  clearIntervention: () => void;
  error: string | null;
}
```

Logic:
- `generateDailyPlan()`: calls `generatePlan(userId, brainState)`. Sets `plan`.
- `triggerStuck(taskIndex, message)`: calls `triggerIntervention(userId, plan.planId, taskIndex, message)`. Sets `intervention`. Then updates `plan.tasks` to `intervention.restructuredTasks`.
- `clearIntervention()`: sets `intervention` to null.
- Get `userId` from `useUser()`.

### Task B-P2: Brain State Selector — `src/components/plan/BrainStateSelector.tsx`

Props: `selected: BrainState | null`, `onSelect: (state: BrainState) => void`, `disabled?: boolean`.
Layout: `grid grid-cols-3 gap-4`.
Each button: `p-6 rounded-xl border-2 transition-all cursor-pointer text-center`.
Unselected: `border-border bg-bg-card`. Selected: `border-[color] bg-[lightColor]` from `BRAIN_STATES`.
Inside: lucide icon (`Cloud`/`Crosshair`/`Zap`) + label + description.

```tsx
import { Cloud, Crosshair, Zap } from "lucide-react";
const ICONS = { foggy: Cloud, focused: Crosshair, wired: Zap };
```

### Task B-P3: Task Card — `src/components/plan/TaskCard.tsx`

Props: `task: PlanTask`, `index: number`, `onStuck?: (index: number) => void`, `isNew?: boolean`.

Layout: `<Card>` with `border-l-4` inline style `borderLeftColor: CATEGORY_COLORS[task.category]`.
Row 1: Category icon (lucide) + title (`font-semibold`) + priority badge (high=red, medium=amber, low=gray).
Row 2: `text-ink-muted text-sm` — time_slot + " · " + duration_minutes + " min".
Row 3: Description `text-sm text-ink-muted`.
Row 4: Separator, then rationale in `text-sm italic text-ink-faint mt-2`.
If `task.status === "completed"`: green checkmark + strikethrough title.
If `isNew`: apply `fade-in` class.

### Task B-P4: Daily Plan View — `src/components/plan/DailyPlanView.tsx`

Props: `plan: PlanResponse`, `onStuck: (taskIndex: number) => void`.
Header: brain state badge + date + overall rationale `italic text-ink-muted`.
Task list: `flex flex-col gap-4`, map tasks to `<TaskCard>`.

### Task B-P5: Stuck Button — `src/components/plan/StuckButton.tsx`

Props: `onStuck: (taskIndex: number, message?: string) => void`, `taskCount: number`, `disabled?: boolean`.

**Two-stage interaction:**

Stage 1 (collapsed): `fixed bottom-6 right-6 z-40`. `bg-red text-white px-6 py-3 rounded-full font-semibold shadow-lg pulse-red`. Text: "I'm Stuck".

Stage 2 (expanded, on click): Panel above button:
- Task picker: radio buttons with task titles
- Textarea: placeholder "What's happening? (optional)"
- `<Button variant="danger">` "Get Help"
- `<Button variant="ghost">` "Cancel"
On submit: `onStuck(selectedTaskIndex, messageText)`. On cancel: collapse back to Stage 1.

### Task B-P6: Intervention Panel — `src/components/plan/InterventionPanel.tsx`

**Demo climax. Must feel emotionally impactful.**

Props: `intervention: InterventionResponse`, `onClose: () => void`.

Overlay: `fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center`.
Panel: `bg-bg-card rounded-2xl max-w-xl w-full mx-4 p-8 shadow-lg max-h-[80vh] overflow-y-auto`.

Render sequence:
1. **Acknowledgment** (typewriter): "Attune hears you" heading (`font-serif text-xl text-green`). Text reveals character by character using `setInterval(25ms)` storing visible substring in `useState`.
2. **Restructured Plan** (appears 2s later): `useState<boolean>(false)` + `setTimeout(2000)`. `fade-in` animation. Map `intervention.restructuredTasks` to `<TaskCard isNew />`.
3. **Agent Reasoning**: Collapsible "Why these changes?" section. `text-sm italic text-ink-muted`.
4. **Close**: `<Button variant="primary">` "Got it, let's go" → `onClose`.
5. **Followup hint**: If `intervention.followupHint`, show as `text-ink-faint text-xs`.

### Task B-P7: Plan Page — `src/app/plan/page.tsx`

```
<PageContainer>
  {!user → redirect to landing}
  {!user?.hasProfile → redirect to /screening}

  <h1 className="font-serif text-3xl font-bold">Your Daily Plan</h1>

  <BrainStateSelector selected={brainState} onSelect={setBrainState} disabled={isGenerating} />

  {brainState && !plan && (
    <Button onClick={generateDailyPlan} isLoading={isGenerating}>Generate My Plan</Button>
  )}

  {isGenerating && <LoadingSpinner label="AI agents are crafting your plan..." />}

  {plan && <DailyPlanView plan={plan} onStuck={triggerStuck} />}
  {plan && <StuckButton onStuck={triggerStuck} taskCount={plan.tasks.length} />}
  {intervention && <InterventionPanel intervention={intervention} onClose={clearIntervention} />}
</PageContainer>
```

### Task B-P8: Integration Test — Planner + Intervention

1. Login as guest (Alex has profile)
2. Navigate to `/plan`
3. Select "Focused" brain state → card highlights green
4. Click "Generate My Plan" → loading spinner → tasks appear with rationale
5. Click "I'm Stuck" → red pill expands to panel
6. Select a task, type "I can't focus on this", click "Get Help"
7. Verify: typewriter acknowledgment appears, restructured plan fades in 2s later
8. Click "Got it, let's go" → overlay closes, plan shows updated tasks

---

# PHASE 3 — INTEGRATION & POLISH

> **Both people together.** Merge feature branches and test the full demo flow.

### Task 1: Merge Branches

```bash
git checkout main
git merge feature/screening-dashboard
git merge feature/planner-intervention
# Resolve any conflicts (should be zero if file ownership was respected)
```

### Task 2: Full Demo Flow Test

Walk through the 4-minute demo script:

| Step | What to do | What to check |
|------|-----------|---------------|
| 1 | Open localhost:3000 | Landing page hero renders |
| 2 | Click "Continue as Guest" | Alex created, Navbar shows "Alex", redirects to /plan |
| 3 | Navigate to Dashboard | Momentum counts up to ~71, trend chart has 14 points, 2 hypothesis cards |
| 4 | Navigate to Screening | Idle state shows intro |
| 5 | Click "Begin Screening" | Chat begins, question 1 appears |
| 6 | Answer all 6 questions | Chat auto-scrolls, 500ms delay between questions |
| 7 | Wait for evaluation | Loading spinner / typing dots during CrewAI call |
| 8 | See results | Radar chart animates with 200ms stagger, tags fade in |
| 9 | Click "Continue to Plan" | Navigates to /plan |
| 10 | Select brain state | Card highlights with color |
| 11 | Click "Generate My Plan" | Loading spinner 3-10s, then tasks with rationale |
| 12 | Click "I'm Stuck" | Red pill expands |
| 13 | Select task + message + "Get Help" | Typewriter acknowledgment, plan fades in |
| 14 | Close intervention | Plan updated with restructured tasks |

### Task 3: Fix Common Issues

| Issue | How to fix |
|-------|-----------|
| CORS error in browser console | Check backend `main.py` has `allow_origins=["http://localhost:3000"]`, `allow_methods=["*"]`, `allow_headers=["*"]` |
| `userId` returns as `user_id` from backend | Add camelCase aliases to backend Pydantic models (see Phase 1 Task B6) |
| Radar chart doesn't render | Make sure `recharts` components are in a `"use client"` file |
| `useUser()` returns null on page load | Check that `layout.tsx` wraps with `<UserProvider>` |
| Plan page shows blank | Check if `hasProfile` is returned by guest endpoint |
| Intervention timeout | CrewAI can be slow. Check loading spinner shows. Increase axios timeout if needed. |

### Task 4: Polish Animations

- Radar stagger: exactly 200ms per dimension
- Profile tags: fade in after radar completes (~2s)
- Momentum count-up: 0 → value over 1s
- Typewriter: ~25ms per character
- Restructured plan: fades in 2s after acknowledgment starts

---

## API Contracts Quick Reference

```
POST /api/auth/guest
  Request:  {} (empty body)
  Response: { userId, name, isGuest, hasProfile }

POST /api/screening/evaluate
  Request:  { userId, answers: [{ questionIndex, questionText, score }] }
  Response: { profileId, dimensions[], profileTags[], summary, asrsTotalScore, isPositiveScreen }

GET /api/profile/{userId}
  Response: { dimensions[], profileTags[], summary }

POST /api/plan/generate
  Request:  { userId, brainState: "foggy"|"focused"|"wired", tasks?: string[] }
  Response: { planId, tasks[], overallRationale }

POST /api/plan/intervene
  Request:  { userId, planId, stuckTaskIndex, userMessage? }
  Response: { interventionId, acknowledgment, restructuredTasks[], agentReasoning, followupHint? }

GET /api/dashboard/{userId}
  Response: { trendData[], momentumScore, momentumDelta, hypothesisCards[], agentAnnotations[] }
```

**Timeouts:** CrewAI endpoints take 3-10s. Axios timeout is 30s. Always show loading spinners.

---

## Alex Seed Data (Demo Account)

Guest login creates Alex with pre-seeded 14-day history:
- `hasProfile: true` — can go straight to /plan or /dashboard
- **Profile:** Attention:42, Time:35, Emotional:78, Memory:51, Initiation:30, Hyperfocus:88
- **Tags:** Deep-Diver, Momentum-Builder, Intensity-Engine
- **Dashboard:** momentum ~71, delta ~+23, 14 trend points, 2 hypothesis cards
- **Interventions:** Days 4 and 11

---

## Design Reference

| Element | Font | Weight |
|---------|------|--------|
| Page headings (h1) | Playfair Display (`font-serif`) | 700 (bold) |
| Section headings (h2) | IBM Plex Sans (`font-sans`) | 600 (semibold) |
| Body text | IBM Plex Sans | 400 (regular) |
| Buttons | IBM Plex Sans | 500 (medium) |

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#faf9f6` | Page bg |
| Card bg | `#ffffff` | Cards |
| Green | `#1d6344` | Primary brand, CTAs |
| Red | `#b83b10` | Danger, stuck button |
| Amber | `#a05f10` | Warnings |
| Blue | `#1a40bf` | Deep work, completion line |
| Violet | `#5c2fa0` | Creative, patterns |

**No dark mode.** Light theme only.

---

## Git Strategy

```
main
 └── backend                          ← current (backend done)
      └── frontend-foundation         ← Phase 1 (merge when gate passes)
           ├── feature/screening-dashboard  ← Person A Phase 2
           └── feature/planner-intervention ← Person B Phase 2
```

---

## Deployment

**Backend (Railway):**
1. Push `backend/` to Railway
2. Set env vars: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`

**Frontend (Vercel):**
1. Import repo in Vercel, root = `frontend/`
2. Set env var: `NEXT_PUBLIC_API_URL` = Railway backend URL
3. Deploy

---

## Demo Flow (4 minutes)

| Time | Screen | Person who built it |
|------|--------|-------------------|
| 0:00-0:15 | Landing — hero, "Continue as Guest" | Phase 1 (Person A) |
| 0:15-1:00 | Dashboard — momentum 71, trends, hypotheses | Person A |
| 1:00-2:30 | Screening — 6 questions, radar chart, profile tags | Person A |
| 2:30-3:30 | Planner — brain state, generate plan, tasks with rationale | Person B |
| 3:30-4:00 | Intervention — "I'm Stuck", typewriter, restructured plan | Person B |
