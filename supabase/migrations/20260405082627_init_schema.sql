-- ============================================================
-- EngRocket — Initial Schema Migration
-- Telegram Mini App for English Learning (0 → A2 in 60 days)
-- Generated: 2026-04-05
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. USERS TABLE (synced from Telegram)
--    telegram_id is the natural primary key
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  telegram_id   BIGINT PRIMARY KEY,
  username      TEXT DEFAULT '',
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT DEFAULT '',
  language_code TEXT DEFAULT 'en',
  current_day   INTEGER NOT NULL DEFAULT 1,
  streak        INTEGER NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Telegram users enrolled in the 60-day English course';
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID — natural primary key';
COMMENT ON COLUMN users.current_day IS 'Current lesson day (1–60)';
COMMENT ON COLUMN users.streak IS 'Consecutive days the user completed all skills';

-- ─────────────────────────────────────────────────────────────
-- 2. PROGRESS TABLE (per-day, per-skill tracking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id     BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 60),
  vocab_done      BOOLEAN NOT NULL DEFAULT FALSE,
  listening_done  BOOLEAN NOT NULL DEFAULT FALSE,
  speaking_done   BOOLEAN NOT NULL DEFAULT FALSE,
  writing_done    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(telegram_id, day_number)
);

COMMENT ON TABLE progress IS 'Tracks which skills the user has finished for each day';

CREATE INDEX idx_progress_telegram_day ON progress(telegram_id, day_number);

-- ─────────────────────────────────────────────────────────────
-- 3. DAILY LESSONS (60-day curriculum content)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_lessons (
  id              SERIAL PRIMARY KEY,
  day             INTEGER UNIQUE NOT NULL CHECK (day >= 1 AND day <= 60),
  topic           TEXT NOT NULL,
  vocabulary      JSONB NOT NULL DEFAULT '[]',
  listening_text  TEXT NOT NULL DEFAULT '',
  writing_prompt  TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE daily_lessons IS 'Static curriculum — one row per day (1-60)';

CREATE INDEX idx_daily_lessons_day ON daily_lessons(day);

-- ─────────────────────────────────────────────────────────────
-- 4. SPEAKING ATTEMPTS (Whisper transcription logs)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS speaking_attempts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id     BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL,
  expected_text   TEXT NOT NULL DEFAULT '',
  transcription   TEXT NOT NULL DEFAULT '',
  score           INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  feedback        TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_speaking_attempts_user ON speaking_attempts(telegram_id, day_number);

-- ─────────────────────────────────────────────────────────────
-- 5. WRITING ATTEMPTS (GPT grammar-check logs)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS writing_attempts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id     BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL,
  original_text   TEXT NOT NULL DEFAULT '',
  corrected_text  TEXT NOT NULL DEFAULT '',
  feedback        TEXT DEFAULT '',
  score           INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_writing_attempts_user ON writing_attempts(telegram_id, day_number);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_attempts ENABLE ROW LEVEL SECURITY;

-- The backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- These permissive policies allow the service role full access.
-- Tighten these when adding direct client-side Supabase access.

CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on progress"
  ON progress FOR ALL
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

-- daily_lessons is public read-only curriculum data — no RLS needed

-- ============================================================
-- HELPER: auto-update `updated_at` on progress rows
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
