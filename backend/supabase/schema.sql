-- =============================================================
-- ATTUNE DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----- USERS -----
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL DEFAULT 'User',
  is_guest BOOLEAN NOT NULL DEFAULT false,
  cognitive_profile_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_guest ON users(is_guest);

-- ----- ASRS RESPONSES -----
CREATE TABLE asrs_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL CHECK (question_index BETWEEN 0 AND 5),
  question_text TEXT NOT NULL,
  answer_label TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asrs_user ON asrs_responses(user_id);

-- ----- COGNITIVE PROFILES -----
CREATE TABLE cognitive_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dimensions JSONB NOT NULL,
  profile_tags TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT,
  asrs_total_score INTEGER,
  is_positive_screen BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cognitive_user ON cognitive_profiles(user_id);

-- ----- DAILY PLANS -----
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brain_state TEXT NOT NULL CHECK (brain_state IN ('foggy', 'focused', 'wired')),
  tasks JSONB NOT NULL,
  overall_rationale TEXT,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plans_user ON daily_plans(user_id);
CREATE INDEX idx_plans_date ON daily_plans(user_id, plan_date);

-- ----- CHECKINS -----
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES daily_plans(id) ON DELETE SET NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  agent_response TEXT,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_date ON checkins(user_id, checkin_date);

-- ----- INTERVENTIONS -----
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('stuck_button', 'voice_input', 'auto_detect')),
  stuck_task_index INTEGER,
  user_message TEXT,
  emotional_acknowledgment TEXT NOT NULL,
  original_tasks JSONB NOT NULL,
  restructured_tasks JSONB NOT NULL,
  agent_reasoning TEXT NOT NULL,
  followup_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interventions_user ON interventions(user_id);
CREATE INDEX idx_interventions_plan ON interventions(plan_id);

-- ----- HYPOTHESIS CARDS -----
CREATE TABLE hypothesis_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_detected TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  supporting_evidence JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'disproved', 'evolving')),
  agent_annotation TEXT,
  annotation_day INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hypothesis_user ON hypothesis_cards(user_id);

-- ----- ROW LEVEL SECURITY -----
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE asrs_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hypothesis_cards ENABLE ROW LEVEL SECURITY;

-- Hackathon: allow all access (lock down in production)
CREATE POLICY "Allow all access" ON users FOR ALL USING (true);
CREATE POLICY "Allow all access" ON asrs_responses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON cognitive_profiles FOR ALL USING (true);
CREATE POLICY "Allow all access" ON daily_plans FOR ALL USING (true);
CREATE POLICY "Allow all access" ON checkins FOR ALL USING (true);
CREATE POLICY "Allow all access" ON interventions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON hypothesis_cards FOR ALL USING (true);
