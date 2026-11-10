-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V5: Safety
-- ══════════════════════════════════════════════

-- Reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id),
  reported_user_id uuid references public.profiles(id),
  reported_content_type text,
  reported_content_id uuid,
  reason text not null,
  details text,
  status text default 'pending'
    check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = reporter_id);

create policy "Users can create reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

-- Add community_standards_agreed to profiles
alter table public.profiles
  add column if not exists community_standards_agreed boolean default false,
  add column if not exists community_standards_agreed_at timestamptz;

-- Indexes
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_reports_reported on public.reports(reported_user_id);
create index if not exists idx_reports_status on public.reports(status);
