-- ============================================================
-- FamilyOS India — Database Schema
-- Neon Postgres (serverless)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id        TEXT UNIQUE,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE,
  phone           TEXT UNIQUE,
  avatar_url      TEXT,
  preferred_lang  TEXT NOT NULL DEFAULT 'en', -- en, hi, ta, te, bn, mr, gu
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Idempotent migration for existing databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- ============================================================
-- FAMILIES
-- ============================================================
CREATE TABLE IF NOT EXISTS families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,           -- e.g. "Patel Parivar"
  avatar_url  TEXT,
  city        TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FAMILY MEMBERS (user ↔ family mapping)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member',  -- admin, member, child, elder
  relationship TEXT,                             -- e.g. "Dadaji", "Badi Bahu", "Bhaiya"
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- ============================================================
-- SAATH MEIN — Family Calendar Events
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  event_type   TEXT NOT NULL DEFAULT 'general',  -- general, festival, medical, exam, emi, birthday, trip
  start_time   TIMESTAMPTZ NOT NULL,
  end_time     TIMESTAMPTZ,
  all_day      BOOLEAN NOT NULL DEFAULT false,
  location     TEXT,
  notify_all   BOOLEAN NOT NULL DEFAULT true,
  reminder_min INTEGER DEFAULT 60,               -- remind N minutes before
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- GHAR KA HISAAB — Family Expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  paid_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  amount       NUMERIC(12, 2) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'INR',
  category     TEXT NOT NULL DEFAULT 'general',  -- grocery, medical, school, utilities, emi, festival, travel, other
  payment_mode TEXT DEFAULT 'upi',               -- upi, cash, card, bank_transfer
  note         TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_splits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     NUMERIC(12, 2) NOT NULL,   -- their share
  settled    BOOLEAN NOT NULL DEFAULT false,
  settled_at TIMESTAMPTZ,
  UNIQUE(expense_id, user_id)
);

-- ============================================================
-- YAADEIN — Family Memory Vault
-- ============================================================
CREATE TABLE IF NOT EXISTS memories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  uploaded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  title        TEXT,
  description  TEXT,
  media_url    TEXT NOT NULL,            -- Vercel Blob / Supabase Storage URL
  media_type   TEXT NOT NULL DEFAULT 'photo',  -- photo, video, audio
  taken_at     DATE,
  tags         TEXT[],                   -- ["Diwali", "2024", "Goa"]
  visible_to   UUID[],                   -- null = all family, else specific user IDs
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- BULLETIN — Family Noticeboard
-- ============================================================
CREATE TABLE IF NOT EXISTS bulletin_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  post_type   TEXT NOT NULL DEFAULT 'announcement',  -- announcement, task, poll, grocery, reminder, alert
  title       TEXT NOT NULL,
  body        TEXT,
  pinned      BOOLEAN NOT NULL DEFAULT false,
  due_date    DATE,
  assigned_to UUID[],   -- user IDs
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SEHAT — Family Health Vault
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  record_type   TEXT NOT NULL DEFAULT 'general',  -- prescription, report, vaccination, allergy, surgery, chronic
  title         TEXT NOT NULL,
  doctor_name   TEXT,
  hospital      TEXT,
  document_url  TEXT,   -- stored file URL
  notes         TEXT,
  record_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  dosage       TEXT,
  frequency    TEXT NOT NULL DEFAULT 'daily',  -- daily, twice_daily, weekly, as_needed
  times        TEXT[],    -- ["08:00", "20:00"]
  start_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date     DATE,
  notes        TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PADHAI PORTAL — Kids Education Hub
-- ============================================================
CREATE TABLE IF NOT EXISTS education_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  record_type  TEXT NOT NULL DEFAULT 'exam',  -- exam, assignment, fee, result, timetable, note
  title        TEXT NOT NULL,
  subject      TEXT,
  score        NUMERIC(5, 2),
  max_score    NUMERIC(5, 2),
  board        TEXT,   -- CBSE, ICSE, SSC, IGCSE, etc.
  grade        TEXT,   -- Class 10, Class 12, etc.
  due_date     DATE,
  document_url TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- KAGAZ — Family Documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  owner_id      UUID REFERENCES users(id) ON DELETE SET NULL,  -- which family member
  doc_type      TEXT NOT NULL DEFAULT 'other',  -- aadhaar, pan, passport, property, insurance, vehicle, will, medical, other
  title         TEXT NOT NULL,
  document_url  TEXT NOT NULL,
  expiry_date   DATE,
  notes         TEXT,
  visible_to    UUID[],    -- null = admins only
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SAPNE — Family Goals
-- ============================================================
CREATE TABLE IF NOT EXISTS family_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,           -- "Goa Trip", "Daughter's Wedding"
  description     TEXT,
  target_amount   NUMERIC(12, 2) NOT NULL,
  current_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  target_date     DATE,
  status          TEXT NOT NULL DEFAULT 'active',  -- active, completed, paused
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goal_contributions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     UUID NOT NULL REFERENCES family_goals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  note        TEXT,
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INVITE TOKENS — Family invite links
-- ============================================================
CREATE TABLE IF NOT EXISTS invite_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_family_members_family   ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user     ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_family         ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_start          ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_expenses_family         ON expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date           ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense  ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user     ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_family         ON memories(family_id);
CREATE INDEX IF NOT EXISTS idx_bulletin_family         ON bulletin_posts(family_id);
CREATE INDEX IF NOT EXISTS idx_health_member           ON health_records(member_id);
CREATE INDEX IF NOT EXISTS idx_medications_member      ON medications(member_id);
CREATE INDEX IF NOT EXISTS idx_education_student       ON education_records(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_family        ON documents(family_id);
CREATE INDEX IF NOT EXISTS idx_goals_family            ON family_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token     ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_family    ON invite_tokens(family_id);
