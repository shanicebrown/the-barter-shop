-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V3: Agreements
-- ══════════════════════════════════════════════

create table if not exists public.barter_agreements (
  id uuid primary key default gen_random_uuid(),
  barter_id uuid references public.barters(id),
  agreement_text text not null,
  barter_reference text unique not null,
  party_a_id uuid references public.profiles(id),
  party_b_id uuid references public.profiles(id),
  party_a_name text,
  party_b_name text,
  party_a_offering text,
  party_b_offering text,
  party_a_value numeric,
  party_b_value numeric,
  delivery_date date,
  party_a_signed boolean default false,
  party_b_signed boolean default false,
  party_a_signed_at timestamptz,
  party_b_signed_at timestamptz,
  party_a_signature text,
  party_b_signature text,
  status text default 'pending_signatures'
    check (status in (
      'pending_signatures',
      'awaiting_counterparty',
      'fully_executed',
      'cancelled'
    )),
  created_at timestamptz default now()
);

alter table public.barter_agreements enable row level security;

create policy "Parties can view own agreements"
  on public.barter_agreements for select
  using (auth.uid() = party_a_id or auth.uid() = party_b_id);

create policy "Parties can update own agreements"
  on public.barter_agreements for update
  using (auth.uid() = party_a_id or auth.uid() = party_b_id);

create policy "System can insert agreements"
  on public.barter_agreements for insert
  with check (true);

-- Indexes
create index if not exists idx_agreements_barter on public.barter_agreements(barter_id);
create index if not exists idx_agreements_party_a on public.barter_agreements(party_a_id);
create index if not exists idx_agreements_party_b on public.barter_agreements(party_b_id);
create index if not exists idx_agreements_status on public.barter_agreements(status);
