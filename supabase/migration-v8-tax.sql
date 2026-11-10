-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V8: Tax
-- ══════════════════════════════════════════════

-- Tax profiles for W-9 data
create table if not exists public.tax_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  legal_name text not null,
  business_name text,
  tax_id_encrypted text,
  tax_classification text check (tax_classification in (
    'individual', 'sole_proprietor', 'llc_single', 'llc_multi', 'c_corp', 's_corp', 'partnership', 'trust'
  )),
  address text,
  city text,
  state text,
  zip text,
  w9_completed boolean default false,
  w9_completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.tax_profiles enable row level security;
create policy "Users can view own tax profile" on public.tax_profiles for select using (auth.uid() = user_id);
create policy "Users can upsert own tax profile" on public.tax_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own tax profile" on public.tax_profiles for update using (auth.uid() = user_id);

-- Add tax tracking to barters
alter table public.barters
  add column if not exists party_a_service_value numeric default 0,
  add column if not exists party_b_service_value numeric default 0,
  add column if not exists barter_bucks_used integer default 0,
  add column if not exists completed_at timestamptz,
  add column if not exists tax_year integer;

-- Annual statements table
create table if not exists public.tax_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  tax_year integer not null,
  statement_id text unique not null,
  total_barters integer default 0,
  services_provided_value numeric default 0,
  services_received_value numeric default 0,
  net_barter_value numeric default 0,
  cash_received numeric default 0,
  cash_paid numeric default 0,
  barter_bucks_earned integer default 0,
  statement_text text,
  generated_at timestamptz default now(),
  unique (user_id, tax_year)
);

alter table public.tax_statements enable row level security;
create policy "Users can view own statements" on public.tax_statements for select using (auth.uid() = user_id);
create policy "System can insert statements" on public.tax_statements for insert with check (true);

-- Indexes
create index if not exists idx_tax_profiles_user on public.tax_profiles(user_id);
create index if not exists idx_tax_statements_user on public.tax_statements(user_id);
create index if not exists idx_barters_tax_year on public.barters(tax_year);
create index if not exists idx_barters_completed on public.barters(completed_at);
