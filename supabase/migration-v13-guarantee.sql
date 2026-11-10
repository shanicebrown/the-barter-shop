-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V13: Guarantee
-- ══════════════════════════════════════════════

alter table public.profiles
  add column if not exists guarantee_activated_at timestamptz,
  add column if not exists guarantee_matched_at timestamptz,
  add column if not exists guarantee_fulfilled boolean default false,
  add column if not exists guarantee_extended boolean default false;
