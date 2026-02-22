# Attune — AI Executive Function Co-Pilot for ADHD

**Attune** is a multi-agent AI system that screens for ADHD using the Harvard ASRS-6 scale, builds adaptive daily plans based on cognitive profiles, and autonomously intervenes when users get stuck — replacing the self-management that ADHD makes hardest.

> Built for the AI Agents Hackathon 2026

---

## The Problem

366 million adults worldwide have ADHD. Every existing productivity app (Tiimo, Inflow, Focusmate) requires users to **self-manage** — the exact executive function skill that ADHD impairs. No product acts *on behalf* of the user.

**Attune flips this:** three AI agents work together to screen, plan, and intervene autonomously.

---

## What It Does

| Screen | What Happens | Agent |
|--------|-------------|-------|
| **ASRS Screening** | 6-question validated chat → animated cognitive radar chart → empowering profile tags | Screening Agent |
| **Daily Planner** | Select brain state (Foggy/Focused/Wired) → AI generates task plan with per-task rationale → "I'm Stuck" triggers live restructuring | Planning Agent + Intervention Agent |
| **Dashboard** | 14-day mood + completion trends → momentum score → predictive hypothesis cards | Aggregation from seed data |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND (Vercel)                    │
│                                                                     │
│  Screen 1: ASRS Chat    Screen 2: Planner     Screen 3: Dashboard  │
│  ┌───────────────┐     ┌──────────────────┐   ┌─────────────────┐  │
│  │ 6 Questions   │     │ Brain State      │   │ Momentum: 71    │  │
│  │ Radar Reveal  │────>│ Task Plan        │   │ 14-day trends   │  │
│  │ Profile Tags  │     │ "I'm Stuck"      │   │ Hypothesis cards│  │
│  └───────────────┘     │ Live Restructure │   └─────────────────┘  │
│                        └──────────────────┘                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ REST API (CORS)
┌────────────────────────────────▼────────────────────────────────────┐
│                   PYTHON FASTAPI BACKEND (Railway)                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  CrewAI MULTI-AGENT SYSTEM                   │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │   │
│  │  │  SCREENING   │  │  PLANNING    │  │  INTERVENTION     │ │   │
│  │  │  AGENT       │  │  AGENT       │  │  AGENT            │ │   │
│  │  │              │  │              │  │                    │ │   │
│  │  │ Role: ADHD   │  │ Role: Exec   │  │ Role: Crisis      │ │   │
│  │  │ Cognitive    │  │ Function     │  │ Response &         │ │   │
│  │  │ Portrait     │  │ Planner      │  │ Restructure       │ │   │
│  │  │ Specialist   │  │              │  │                    │ │   │
│  │  │              │  │              │  │                    │ │   │
│  │  │ Tools:       │  │ Tools:       │  │ Tools:            │ │   │
│  │  │ - score_asrs │  │ - get_profile│  │ - get_plan        │ │   │
│  │  │ - save_prof  │  │ - save_plan  │  │ - get_profile     │ │   │
│  │  └──────────────┘  └──────────────┘  │ - save_interv     │ │   │
│  │                                       └───────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Routes: /auth/guest  /screening/evaluate  /plan/generate           │
│          /plan/intervene  /profile/{id}  /dashboard/{id}            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   SUPABASE (PostgreSQL)  │
                    │   7 tables + RLS         │
                    └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind v4 | Fast iteration, App Router, Vercel deploy |
| **Backend** | Python, FastAPI | Async, auto-docs, clean API design |
| **Multi-Agent Framework** | CrewAI 1.9.x | Agents with roles, tools, delegation, memory |
| **LLM** | Claude Sonnet (`claude-sonnet-4-20250514`) | Fast structured JSON (2-4s), strong reasoning |
| **Database** | Supabase (PostgreSQL) | Auth, real-time, RLS, free tier |
| **Charts** | Recharts | Radar + line charts, native React |
| **Frontend Deploy** | Vercel | One-click from GitHub |
| **Backend Deploy** | Railway | Python hosting, free tier |

---

## Multi-Agent Pipeline

### Agent 1: Screening Agent
```
Role:      "ADHD Cognitive Portrait Specialist"
Input:     6 ASRS-6 answers (Harvard validated, 5-point Likert scale)
Process:   score_asrs tool → dimension mapping → empowering profile generation
Output:    6-axis radar profile + 3 identity tags + narrative summary
Key rule:  Empowering language only — "Deep-Diver" not "Hyperfocuser",
           "Momentum-Builder" not "Hyperactive"
```

### Agent 2: Planning Agent
```
Role:      "Executive Function Planning Strategist"
Input:     Cognitive profile + brain state (Foggy/Focused/Wired)
Process:   Brain-state strategy selection → task scheduling → rationale generation
Output:    Ordered task list with per-task rationale referencing cognitive dimensions
Key rule:  Every task placement must reference a specific cognitive dimension
           Foggy = max 4 tasks, easy first | Focused = optimal scheduling |
           Wired = front-load hard, short blocks
```

### Agent 3: Intervention Agent
```
Role:      "ADHD Crisis Response & Plan Restructuring Specialist"
Input:     Current plan + stuck task + user message + cognitive profile
Process:   Emotional acknowledgment → plan restructuring → save intervention
Output:    1-2 sentence acknowledgment + restructured task list + reasoning
Key rule:  Acknowledge → Validate → Act (never skip acknowledgment)
           Name the feeling, normalize as brain-based, then restructure
```

### Crew Orchestration
Each API endpoint creates and kicks off its own sequential `Crew`. CrewAI's blocking `kickoff()` is wrapped in `asyncio.to_thread()` to keep FastAPI async. Agents share custom tools but run in isolated crew contexts.

---

## Database Schema (7 Tables)

| Table | Purpose |
|-------|---------|
| `users` | User accounts (guest + auth) |
| `asrs_responses` | Individual ASRS-6 question answers |
| `cognitive_profiles` | Radar dimensions, tags, summary (JSONB) |
| `daily_plans` | Brain state, task arrays, rationale (JSONB) |
| `checkins` | Daily mood, energy, completion metrics |
| `interventions` | Stuck triggers, acknowledgments, restructured plans |
| `hypothesis_cards` | Agent-detected patterns with predictive framing |

Full schema: [`backend/supabase/schema.sql`](backend/supabase/schema.sql)

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/guest` | POST | Create/retrieve guest "Alex" account with seeded 14-day history |
| `/api/screening/evaluate` | POST | Submit 6 ASRS answers → CrewAI screening agent → cognitive profile |
| `/api/profile/{userId}` | GET | Fetch stored cognitive profile |
| `/api/plan/generate` | POST | Brain state + profile → CrewAI planning agent → adaptive task plan |
| `/api/plan/intervene` | POST | Stuck trigger → CrewAI intervention agent → acknowledgment + restructure |
| `/api/dashboard/{userId}` | GET | 14-day trends, momentum score, hypothesis cards |

---

## Project Structure

```
attune/
├── frontend/                     # Next.js 16 + React 19 + Tailwind v4
│   ├── src/
│   │   ├── app/                  # Pages: landing, screening, plan, dashboard
│   │   ├── components/           # UI, layout, screening, plan, dashboard
│   │   ├── hooks/                # useUser, useScreeningChat, useDailyPlan, useDashboard
│   │   ├── lib/                  # API client (axios), constants (ASRS questions)
│   │   └── types/                # TypeScript interfaces matching backend models
│   └── package.json
│
├── backend/                      # Python FastAPI + CrewAI
│   ├── main.py                   # FastAPI app, CORS, route registration
│   ├── app/
│   │   ├── config.py             # Env vars via pydantic-settings
│   │   ├── database.py           # Supabase client singleton
│   │   ├── models.py             # Pydantic request/response models
│   │   ├── routes/               # auth, screening, profile, plan, dashboard
│   │   ├── agents/               # 3 CrewAI agents + custom tools
│   │   │   ├── screening_agent.py
│   │   │   ├── planning_agent.py
│   │   │   ├── intervention_agent.py
│   │   │   └── tools/            # scoring_tools, db_tools
│   │   └── services/             # seed_service (Alex 14-day data), momentum_service
│   ├── supabase/
│   │   └── schema.sql            # 7-table DDL
│   └── requirements.txt
│
├── CLAUDE.md                     # Granular frontend implementation playbook
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- Supabase project (free tier)
- Anthropic API key (Claude Sonnet)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your keys:
#   ANTHROPIC_API_KEY=sk-ant-...
#   SUPABASE_URL=https://xxx.supabase.co
#   SUPABASE_KEY=eyJ...
#   SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Run schema in Supabase SQL editor
# Copy contents of supabase/schema.sql → Supabase Dashboard → SQL Editor → Run

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quick Demo

1. Click "Continue as Guest" — creates Alex with 14 days of seeded data
2. Visit Dashboard to see trends, momentum score, and hypothesis cards
3. Run Screening to answer 6 ASRS questions and see your radar chart
4. Generate a Plan with brain state selection
5. Click "I'm Stuck" to trigger the intervention agent

---

## Demo Account: Alex

The guest login creates a pre-seeded demo user with 14 days of realistic history:

| Metric | Week 1 | Week 2 |
|--------|--------|--------|
| Mood | 3-6 (dip day 4) | 6-8 (upward) |
| Task completion | 50-65% | 70-85% |
| Interventions | Day 4 (crisis) | Day 11 (afternoon crash) |
| Momentum | Started at ~48 | Now at ~71 |

**Cognitive Profile:** Attention: 42, Time: 35, Emotional: 78, Memory: 51, Initiation: 30, Hyperfocus: 88
**Tags:** Deep-Diver, Momentum-Builder, Intensity-Engine

---

## Key Design Decisions

1. **CrewAI over raw LLM calls** — Proper agent framework with roles, tools, and delegation. Satisfies hackathon multi-agent criteria.
2. **Sonnet over Opus** — 2-4s response time vs 10-15s. Critical for live demo pacing.
3. **Separate crews per endpoint** — Simpler than a mega-crew. Each API route creates and kicks off its own crew.
4. **Deterministic seed data** — Hardcoded Python dicts, not AI-generated. Zero failure points in demo.
5. **Guest auth via localStorage** — No Supabase auth sessions. Just store UUID in browser.
6. **Empowering language throughout** — "Cognitive portrait" not "diagnosis". "Deep-Diver" not "Hyperfocuser". Brain-based framing, not deficit framing.

---

## Team

| Member | Role | Focus |
|--------|------|-------|
| **Member A** | Frontend | Next.js, React, Tailwind, Recharts, UI/UX |
| **Member B** | Backend | FastAPI, CrewAI, Claude API, Supabase, Agent Design |

---

## License

Built for the AI Agents Hackathon 2026. MIT License.
