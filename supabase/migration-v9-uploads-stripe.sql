-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V9: Uploads + Stripe
-- ══════════════════════════════════════════════

-- Storage buckets (run in Supabase Dashboard > Storage)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('verifications', 'verifications', false);

-- Stripe subscription columns
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_id text,
  add column if not exists subscription_status text default 'free'
    check (subscription_status in ('free', 'active', 'past_due', 'cancelled')),
  add column if not exists subscription_tier text default 'freemium'
    check (subscription_tier in ('freemium', 'verified_pro', 'business')),
  add column if not exists subscription_expires_at timestamptz;

-- Index
create index if not exists idx_profiles_stripe on public.profiles(stripe_customer_id);
