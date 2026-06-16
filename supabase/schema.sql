-- WordRoom — Supabase схемасы
-- Supabase Dashboard → SQL Editor ішінде осы скриптті толық орындаңыз.

-- UUID генерациясы үшін
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- cabinets
-- ─────────────────────────────────────────────
create table if not exists public.cabinets (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text unique not null,
  owner_id   uuid references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- cabinet_members
-- ─────────────────────────────────────────────
create table if not exists public.cabinet_members (
  id         uuid primary key default gen_random_uuid(),
  cabinet_id uuid references public.cabinets(id) on delete cascade,
  user_id    uuid references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cabinet_id, user_id)
);

-- ─────────────────────────────────────────────
-- topics
-- ─────────────────────────────────────────────
create table if not exists public.topics (
  id          uuid primary key default gen_random_uuid(),
  cabinet_id  uuid references public.cabinets(id) on delete cascade,
  title       text not null,
  description text,
  status      text not null default 'draft',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- words
-- ─────────────────────────────────────────────
create table if not exists public.words (
  id               uuid primary key default gen_random_uuid(),
  topic_id         uuid references public.topics(id) on delete cascade,
  word             text not null,
  translation      text not null,
  meaning          text,
  example_sentence text,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- practice_results
-- ─────────────────────────────────────────────
create table if not exists public.practice_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete cascade,
  topic_id      uuid references public.topics(id) on delete cascade,
  mode          text not null,
  correct_count integer not null default 0,
  wrong_count   integer not null default 0,
  completed_at  timestamptz not null default now()
);

-- Индекстер
create index if not exists idx_cabinet_members_user on public.cabinet_members(user_id);
create index if not exists idx_cabinet_members_cabinet on public.cabinet_members(cabinet_id);
create index if not exists idx_topics_cabinet on public.topics(cabinet_id);
create index if not exists idx_words_topic on public.words(topic_id);
create index if not exists idx_practice_results_topic on public.practice_results(topic_id);

-- ─────────────────────────────────────────────
-- Row Level Security
-- Барлық дерекқор әрекеттері Next.js API routes ішіндегі service role
-- кілті арқылы жүреді (ол RLS-ті айналып өтеді). RLS қосылған, бірақ
-- ашық policy жоқ — сондықтан anon/public кілт деректерге қол жеткізе алмайды.
-- ─────────────────────────────────────────────
alter table public.users            enable row level security;
alter table public.cabinets         enable row level security;
alter table public.cabinet_members  enable row level security;
alter table public.topics           enable row level security;
alter table public.words            enable row level security;
alter table public.practice_results enable row level security;
