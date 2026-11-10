-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V11: Trial + Onboarding
-- ══════════════════════════════════════════════

alter table public.profiles
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists is_in_trial boolean default true,
  add column if not exists onboarding_complete boolean default false;
