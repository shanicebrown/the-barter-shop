-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V7: Location
-- ══════════════════════════════════════════════

alter table public.profiles
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists location_updated_at timestamptz,
  add column if not exists location_city text,
  add column if not exists location_state text;

create index if not exists profiles_location_idx on public.profiles (latitude, longitude);
