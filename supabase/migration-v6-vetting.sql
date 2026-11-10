-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V6: Vetting
-- ══════════════════════════════════════════════

-- Verifications table
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  verification_type text check (verification_type in (
    'government_id', 'selfie_match', 'phone_number',
    'skill_credential', 'business_license', 'business_insurance',
    'business_registration', 'portfolio', 'reference'
  )),
  document_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by text,
  reviewed_at timestamptz,
  expires_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now()
);

alter table public.verifications enable row level security;
create policy "Users can view own verifications" on public.verifications for select using (auth.uid() = user_id);
create policy "Users can create verifications" on public.verifications for insert with check (auth.uid() = user_id);

-- Vetting applications table
create table if not exists public.vetting_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  tier_applying_for text check (tier_applying_for in ('verified_pro', 'business')),
  status text default 'submitted' check (status in ('submitted', 'in_review', 'approved', 'rejected', 'more_info_needed')),
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_notes text,
  rejection_reason text,
  resubmit_allowed boolean default true
);

alter table public.vetting_applications enable row level security;
create policy "Users can view own applications" on public.vetting_applications for select using (auth.uid() = user_id);
create policy "Users can create applications" on public.vetting_applications for insert with check (auth.uid() = user_id);

-- Add vetting columns to profiles
alter table public.profiles
  add column if not exists vetting_score integer default 0,
  add column if not exists verification_status text default 'unverified'
    check (verification_status in ('unverified', 'pending_review', 'verified_pro', 'verified_business', 'suspended')),
  add column if not exists barter_value_cap numeric default 500;

-- Indexes
create index if not exists idx_verifications_user on public.verifications(user_id);
create index if not exists idx_verifications_status on public.verifications(status);
create index if not exists idx_vetting_apps_user on public.vetting_applications(user_id);
create index if not exists idx_vetting_apps_status on public.vetting_applications(status);
