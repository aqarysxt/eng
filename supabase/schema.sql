-- ============================================================
-- EngRocket — Supabase Schema
-- Telegram Mini App for English Learning (0 → A2 in 60 days)
-- ============================================================

-- 1. Users table (synced from Telegram)
CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id   BIGINT UNIQUE NOT NULL,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT DEFAULT '',
  username      TEXT DEFAULT '',
  language_code TEXT DEFAULT 'en',
  current_day   INTEGER NOT NULL DEFAULT 1,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- 2. Daily lessons (60-day curriculum)
CREATE TABLE IF NOT EXISTS daily_lessons (
  id              SERIAL PRIMARY KEY,
  day             INTEGER UNIQUE NOT NULL CHECK (day >= 1 AND day <= 60),
  topic           TEXT NOT NULL,
  vocabulary      JSONB NOT NULL DEFAULT '[]',
  listening_text  TEXT NOT NULL DEFAULT '',
  writing_prompt  TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_lessons_day ON daily_lessons(day);

-- 3. User progress (per-day, per-skill tracking)
CREATE TABLE IF NOT EXISTS user_progress (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day             INTEGER NOT NULL CHECK (day >= 1 AND day <= 60),
  vocab_done      BOOLEAN NOT NULL DEFAULT FALSE,
  listening_done  BOOLEAN NOT NULL DEFAULT FALSE,
  speaking_done   BOOLEAN NOT NULL DEFAULT FALSE,
  writing_done    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, day)
);

CREATE INDEX idx_user_progress_user_day ON user_progress(user_id, day);

-- 4. Speaking attempts (Whisper transcription logs)
CREATE TABLE IF NOT EXISTS speaking_attempts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day             INTEGER NOT NULL,
  expected_text   TEXT NOT NULL DEFAULT '',
  transcription   TEXT NOT NULL DEFAULT '',
  score           INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  feedback        TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_speaking_attempts_user ON speaking_attempts(user_id, day);

-- 5. Writing attempts (GPT grammar check logs)
CREATE TABLE IF NOT EXISTS writing_attempts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day             INTEGER NOT NULL,
  original_text   TEXT NOT NULL DEFAULT '',
  corrected_text  TEXT NOT NULL DEFAULT '',
  feedback        TEXT DEFAULT '',
  score           INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_writing_attempts_user ON writing_attempts(user_id, day);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_attempts ENABLE ROW LEVEL SECURITY;

-- Note: The backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- These policies are for direct Supabase client access (if ever used from frontend).
-- For now they are permissive; tighten when adding direct client access.

CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on user_progress"
  ON user_progress FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on speaking_attempts"
  ON speaking_attempts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on writing_attempts"
  ON writing_attempts FOR ALL
  USING (true)
  WITH CHECK (true);

-- daily_lessons is read-only content, no RLS needed
-- (it's public curriculum data)
