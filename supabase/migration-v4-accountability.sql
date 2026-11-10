-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V4: Accountability
-- ══════════════════════════════════════════════

-- Add accountability columns to profiles
alter table public.profiles
  add column if not exists unsigned_barters_count integer default 0,
  add column if not exists incomplete_barters_count integer default 0,
  add column if not exists completion_rate numeric default 100,
  add column if not exists reliability_score numeric default 100,
  add column if not exists warning_level text default 'good'
    check (warning_level in ('good', 'warning', 'flagged', 'suspended')),
  add column if not exists flags_count integer default 0;

-- Add signing window and expiry to agreements
alter table public.barter_agreements
  add column if not exists signing_deadline timestamptz,
  add column if not exists expired boolean default false;

-- Add delivery_date and locked flag to barters
alter table public.barters
  add column if not exists delivery_date date,
  add column if not exists chat_unlocked boolean default false,
  add column if not exists agreement_id uuid references public.barter_agreements(id);

-- Penalty log table
create table if not exists public.penalty_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  penalty_type text not null check (penalty_type in (
    'unsigned_barter', 'incomplete_barter', 'flag', 'suspension', 'tier_demotion'
  )),
  barter_id uuid references public.barters(id),
  bb_deducted integer default 0,
  description text,
  created_at timestamptz default now()
);

alter table public.penalty_log enable row level security;

create policy "Users can view own penalties"
  on public.penalty_log for select using (auth.uid() = user_id);

create policy "System can insert penalties"
  on public.penalty_log for insert with check (true);

-- Indexes
create index if not exists idx_penalty_user on public.penalty_log(user_id);
create index if not exists idx_agreements_deadline on public.barter_agreements(signing_deadline);
