-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V15
-- Barter Bucks ledger, founding members, in-app purchase entitlements,
-- and server-only protection for money/trust columns.
-- Run in Supabase Dashboard → SQL Editor AFTER v2–v14. Safe to re-run.
-- ══════════════════════════════════════════════

-- ── 1. Subscription + founding columns on profiles ─────────────────────
alter table public.profiles add column if not exists subscription_store text
  check (subscription_store in ('app_store', 'play_store', 'promotional'));
alter table public.profiles add column if not exists founding_member_tier text
  check (founding_member_tier in ('verified_pro', 'business'));
alter table public.profiles add column if not exists founding_member_until timestamptz;

-- Old Stripe-era values: trial and paid tiers are now store-managed.
alter table public.profiles drop constraint if exists profiles_subscription_status_check;
alter table public.profiles add constraint profiles_subscription_status_check
  check (subscription_status in ('free', 'trial', 'active', 'past_due', 'cancelled', 'expired'));

-- ── 2. Barter Bucks ledger ─────────────────────────────────────────────
-- Two buckets, shown to members as one balance:
--   earned    (profiles.barter_bucks)           — activity rewards; perks AND trades
--   purchased (profiles.barter_bucks_purchased) — bought with USD via Stripe; trades ONLY.
-- Store rules: digital perks must be bought through Apple/Google IAP, while payment
-- for real-world services between members must NOT go through IAP. Keeping purchased
-- Barter Bucks out of perks keeps both rules satisfied.
alter table public.profiles add column if not exists barter_bucks_purchased integer not null default 0;

create table if not exists public.bb_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount <> 0),
  bucket text not null default 'earned' check (bucket in ('earned', 'purchased')),
  kind text not null check (kind in ('earn', 'spend', 'transfer_in', 'transfer_out', 'penalty', 'adjustment', 'purchase')),
  reason text not null,
  label text not null,
  ref_id uuid,
  balance_after integer not null, -- total (earned + purchased) after this row
  created_at timestamptz not null default now()
);
create index if not exists idx_bb_tx_user on public.bb_transactions(user_id, created_at desc);
-- One posting per (user, reason, reference, bucket): makes every award idempotent.
create unique index if not exists uq_bb_tx_award on public.bb_transactions(user_id, reason, ref_id, bucket)
  where ref_id is not null;

alter table public.bb_transactions enable row level security;
drop policy if exists "Users can view own BB transactions" on public.bb_transactions;
create policy "Users can view own BB transactions" on public.bb_transactions
  for select using (auth.uid() = user_id);
-- No insert/update/delete policies: only the functions below write here.

-- Core posting function. Internal only (not callable from the app).
drop function if exists public.bb_post(uuid, integer, text, text, text, uuid);
create or replace function public.bb_post(
  p_user uuid, p_amount integer, p_kind text, p_reason text, p_label text,
  p_ref uuid default null, p_bucket text default 'earned'
) returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  new_total integer;
begin
  -- Idempotent: a posting already made for this reference is skipped.
  if p_ref is not null and exists (
    select 1 from public.bb_transactions
     where user_id = p_user and reason = p_reason and ref_id = p_ref and bucket = p_bucket
  ) then
    return false;
  end if;

  if p_bucket = 'purchased' then
    update public.profiles
       set barter_bucks_purchased = barter_bucks_purchased + p_amount
     where id = p_user and barter_bucks_purchased + p_amount >= 0
    returning coalesce(barter_bucks, 0) + barter_bucks_purchased into new_total;
  else
    update public.profiles
       set barter_bucks = coalesce(barter_bucks, 0) + p_amount
     where id = p_user and coalesce(barter_bucks, 0) + p_amount >= 0
    returning coalesce(barter_bucks, 0) + barter_bucks_purchased into new_total;
  end if;

  if new_total is null then
    if p_amount < 0 then
      raise exception 'Not enough Barter Bucks' using errcode = 'P0001';
    end if;
    raise exception 'Profile not found';
  end if;

  insert into public.bb_transactions (user_id, amount, bucket, kind, reason, label, ref_id, balance_after)
  values (p_user, p_amount, p_bucket, p_kind, p_reason, p_label, p_ref, new_total);

  if p_amount > 0 and p_kind in ('earn', 'transfer_in') then
    insert into public.notifications (user_id, title, message, type, related_id)
    values (p_user, 'You earned ' || p_amount || ' Barter Bucks', p_label, 'barter_bucks_earned', p_ref);
  end if;
  return true;
end;
$$;
revoke all on function public.bb_post(uuid, integer, text, text, text, uuid, text) from public, anon, authenticated;

-- ── 3. Earning rules (server-side triggers; matches the in-app guide) ──
-- Full barter completed: +2 each. Partial barter completed: +1 each.
create or replace function public.bb_on_barter_completed()
returns trigger language plpgsql security definer set search_path = '' as $$
declare amt integer;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    amt := case new.barter_type when 'full' then 2 when 'partial' then 1 else 0 end;
    if amt > 0 then
      perform public.bb_post(new.requester_id, amt, 'earn', 'barter_completed', 'Completed a barter', new.id);
      perform public.bb_post(new.provider_id, amt, 'earn', 'barter_completed', 'Completed a barter', new.id);
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_bb_barter_completed on public.barters;
create trigger trg_bb_barter_completed after update of status on public.barters
  for each row execute procedure public.bb_on_barter_completed();

-- 5-star review: +1 to the reviewee, only for a completed barter between the two.
create or replace function public.bb_on_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.rating = 5 and new.barter_id is not null and new.reviewer_id <> new.reviewee_id and exists (
    select 1 from public.barters b
     where b.id = new.barter_id and b.status = 'completed'
       and ((b.requester_id = new.reviewer_id and b.provider_id = new.reviewee_id)
         or (b.provider_id = new.reviewer_id and b.requester_id = new.reviewee_id))
  ) then
    perform public.bb_post(new.reviewee_id, 1, 'earn', 'five_star_review', 'Received a 5-star review', new.barter_id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_bb_review on public.reviews;
create trigger trg_bb_review after insert on public.reviews
  for each row execute procedure public.bb_on_review();

-- Verified (Pro or Business) and 100% profile: one-time awards.
create or replace function public.bb_on_profile_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 then return new; end if;
  if new.verification_status in ('verified_pro', 'verified_business')
     and old.verification_status is distinct from new.verification_status then
    perform public.bb_post(new.id, 5, 'earn', 'verified', 'Got verified', new.id);
  end if;
  if coalesce(new.full_name, '') <> '' and coalesce(new.bio, '') <> ''
     and coalesce(new.avatar_url, '') <> '' and coalesce(new.location_city, '') <> ''
     and coalesce(array_length(new.skills_offered, 1), 0) > 0 then
    perform public.bb_post(new.id, 2, 'earn', 'profile_complete', 'Completed your profile', new.id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_bb_profile on public.profiles;
create trigger trg_bb_profile after update on public.profiles
  for each row execute procedure public.bb_on_profile_change();

-- ── 4. Spending: perks ─────────────────────────────────────────────────
create table if not exists public.bb_perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  perk text not null check (perk in ('boost_listing', 'featured_barterer', 'premium_analytics', 'tier_promotion')),
  cost integer not null,
  expires_at timestamptz,
  uses_remaining integer,
  created_at timestamptz not null default now()
);
create index if not exists idx_bb_perks_user on public.bb_perk_redemptions(user_id, created_at desc);
alter table public.bb_perk_redemptions enable row level security;
drop policy if exists "Users can view own perks" on public.bb_perk_redemptions;
create policy "Users can view own perks" on public.bb_perk_redemptions
  for select using (auth.uid() = user_id);

create or replace function public.bb_redeem_perk(p_perk text)
returns public.bb_perk_redemptions
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cost integer;
  label text;
  dur interval;
  uses integer;
  row public.bb_perk_redemptions;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  case p_perk
    when 'boost_listing'     then cost := 2; label := 'Boosted a listing (24 hours)';  dur := interval '24 hours';
    when 'featured_barterer' then cost := 3; label := 'Featured Barterer (1 week)';     dur := interval '7 days';
    when 'premium_analytics' then cost := 1; label := 'Premium analytics (1 month)';    dur := interval '30 days';
    when 'tier_promotion'    then cost := 5; label := 'Tier promotion (1 trade)';       uses := 1;
    else raise exception 'Unknown perk %', p_perk;
  end case;

  -- Perks are digital, so only earned Barter Bucks can pay for them.
  if (select coalesce(barter_bucks, 0) from public.profiles where id = uid) < cost then
    if (select coalesce(barter_bucks, 0) + barter_bucks_purchased from public.profiles where id = uid) >= cost then
      raise exception 'Purchased Barter Bucks can only be used in trades' using errcode = 'P0001';
    end if;
    raise exception 'Not enough Barter Bucks' using errcode = 'P0001';
  end if;

  insert into public.bb_perk_redemptions (user_id, perk, cost, expires_at, uses_remaining)
  values (uid, p_perk, cost, case when dur is null then null else now() + dur end, uses)
  returning * into row;

  perform public.bb_post(uid, -cost, 'spend', 'perk:' || p_perk, label, row.id, 'earned');
  return row;
end; $$;
revoke all on function public.bb_redeem_perk(text) from public, anon;
grant execute on function public.bb_redeem_perk(text) to authenticated;

-- ── 5. Value-gap settlement inside a signed barter agreement ───────────
-- The only way Barter Bucks move between members: the payer covers the
-- amount written into the barter, after both parties have signed.
create or replace function public.bb_settle_gap(p_barter_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  b public.barters;
  from_purchased integer;
  from_earned integer;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into b from public.barters where id = p_barter_id for update;
  if b.id is null or b.requester_id <> uid then
    raise exception 'Only the requesting member can settle this barter';
  end if;
  if coalesce(b.barter_bucks_amount, 0) <= 0 then
    raise exception 'This barter has no Barter Bucks amount';
  end if;
  if not exists (
    select 1 from public.barter_agreements a
     where a.barter_id = b.id and a.party_a_signed and a.party_b_signed
  ) then
    raise exception 'Both parties must sign the barter agreement first';
  end if;
  if exists (select 1 from public.bb_transactions
              where user_id = uid and reason = 'gap_settlement' and ref_id = b.id) then
    return; -- already settled
  end if;

  -- Purchased Barter Bucks go first (they're only usable in trades), then earned.
  select barter_bucks_purchased, coalesce(barter_bucks, 0) into from_purchased, from_earned
    from public.profiles where id = uid for update;
  if from_purchased + from_earned < b.barter_bucks_amount then
    raise exception 'Not enough Barter Bucks' using errcode = 'P0001';
  end if;
  from_purchased := least(from_purchased, b.barter_bucks_amount);
  from_earned := b.barter_bucks_amount - from_purchased;

  -- The other member receives each portion into the matching bucket.
  if from_purchased > 0 then
    perform public.bb_post(uid, -from_purchased, 'transfer_out', 'gap_settlement',
                           'Covered a value difference in Barter Bucks', b.id, 'purchased');
    perform public.bb_post(b.provider_id, from_purchased, 'transfer_in', 'gap_settlement',
                           'Received Barter Bucks for a value difference', b.id, 'purchased');
  end if;
  if from_earned > 0 then
    perform public.bb_post(uid, -from_earned, 'transfer_out', 'gap_settlement',
                           'Covered a value difference in Barter Bucks', b.id, 'earned');
    perform public.bb_post(b.provider_id, from_earned, 'transfer_in', 'gap_settlement',
                           'Received Barter Bucks for a value difference', b.id, 'earned');
  end if;
end; $$;
revoke all on function public.bb_settle_gap(uuid) from public, anon;
grant execute on function public.bb_settle_gap(uuid) to authenticated;

-- Penalties are applied by server jobs / admins only (service role).
-- They come out of earned Barter Bucks only; purchased ones were paid for.
create or replace function public.bb_apply_penalty(p_user uuid, p_amount integer, p_label text, p_ref uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare bal integer;
begin
  select coalesce(barter_bucks, 0) into bal from public.profiles where id = p_user;
  if least(p_amount, bal) > 0 then
    perform public.bb_post(p_user, -least(p_amount, bal), 'penalty', 'penalty', p_label, p_ref, 'earned');
  end if;
end; $$;
revoke all on function public.bb_apply_penalty(uuid, integer, text, uuid) from public, anon, authenticated;

-- ── 5b. Buying Barter Bucks (Stripe; trade use only) ───────────────────
-- Rows are created by the `bb-checkout` Edge Function and settled by the
-- `stripe-webhook` Edge Function. The app can read its own rows only.
create table if not exists public.bb_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pack text not null check (pack in ('bb_5', 'bb_20', 'bb_50')),
  bb_amount integer not null check (bb_amount > 0),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  stripe_payment_intent text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists idx_bb_purchases_user on public.bb_purchases(user_id, created_at desc);
alter table public.bb_purchases enable row level security;
drop policy if exists "Users can view own BB purchases" on public.bb_purchases;
create policy "Users can view own BB purchases" on public.bb_purchases
  for select using (auth.uid() = user_id);

-- Credits a paid purchase exactly once. Service role (webhook) only.
create or replace function public.bb_credit_purchase(p_payment_intent text, p_amount_received integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare pur public.bb_purchases;
begin
  select * into pur from public.bb_purchases where stripe_payment_intent = p_payment_intent for update;
  if pur.id is null then raise exception 'Unknown payment %', p_payment_intent; end if;
  if pur.status = 'paid' then return false; end if;
  if pur.status <> 'pending' then raise exception 'Purchase % is %', pur.id, pur.status; end if;
  if p_amount_received <> pur.amount_cents then
    raise exception 'Amount mismatch for %: got %, expected %', pur.id, p_amount_received, pur.amount_cents;
  end if;

  update public.bb_purchases set status = 'paid', paid_at = now() where id = pur.id;
  perform public.bb_post(pur.user_id, pur.bb_amount, 'purchase', 'purchase',
                         'Bought ' || pur.bb_amount || ' Barter Bucks', pur.id, 'purchased');
  return true;
end; $$;
revoke all on function public.bb_credit_purchase(text, integer) from public, anon, authenticated;

create or replace function public.bb_fail_purchase(p_payment_intent text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.bb_purchases set status = 'failed'
   where stripe_payment_intent = p_payment_intent and status = 'pending';
end; $$;
revoke all on function public.bb_fail_purchase(text) from public, anon, authenticated;

-- Refund: reverse whatever of that purchase is still unspent.
create or replace function public.bb_refund_purchase(p_payment_intent text)
returns integer language plpgsql security definer set search_path = '' as $$
declare pur public.bb_purchases; available integer; reversed integer;
begin
  select * into pur from public.bb_purchases where stripe_payment_intent = p_payment_intent for update;
  if pur.id is null or pur.status <> 'paid' then return 0; end if;
  select barter_bucks_purchased into available from public.profiles where id = pur.user_id;
  reversed := least(pur.bb_amount, available);
  update public.bb_purchases set status = 'refunded' where id = pur.id;
  if reversed > 0 then
    perform public.bb_post(pur.user_id, -reversed, 'adjustment', 'refund',
                           'Refunded Barter Bucks purchase', pur.id, 'purchased');
  end if;
  return reversed;
end; $$;
revoke all on function public.bb_refund_purchase(text) from public, anon, authenticated;

-- ── 6. Founding members (free paid tier for 12 months) ─────────────────
-- Upload via Dashboard → Table Editor → founding_members → Import CSV
-- with columns: email, tier (verified_pro or business), note (optional).
create table if not exists public.founding_members (
  email text primary key,
  tier text not null default 'verified_pro' check (tier in ('verified_pro', 'business')),
  note text,
  added_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  activated_at timestamptz
);
alter table public.founding_members enable row level security;
-- No policies: managed from the dashboard (service role) only.

-- Activates a founding membership for a confirmed account. 12 months
-- run from activation, so members who join later still get a full year.
create or replace function public.activate_founding_member(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  u_email text;
  confirmed timestamptz;
  fm public.founding_members;
begin
  select lower(email), email_confirmed_at into u_email, confirmed from auth.users where id = p_user;
  if u_email is null or confirmed is null then return; end if;

  select * into fm from public.founding_members where lower(email) = u_email for update;
  if fm.email is null then return; end if;
  if fm.user_id is not null and fm.user_id <> p_user then return; end if;

  if fm.activated_at is null then
    update public.founding_members set user_id = p_user, activated_at = now() where email = fm.email
    returning * into fm;
  end if;

  update public.profiles
     set founding_member_tier = fm.tier,
         founding_member_until = fm.activated_at + interval '12 months'
   where id = p_user;
end; $$;
revoke all on function public.activate_founding_member(uuid) from public, anon, authenticated;

-- Normalize uploaded emails and activate members who already have accounts.
create or replace function public.founding_members_on_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  new.email := lower(trim(new.email));
  return new;
end; $$;
drop trigger if exists trg_founding_normalize on public.founding_members;
create trigger trg_founding_normalize before insert or update of email on public.founding_members
  for each row execute procedure public.founding_members_on_insert();

create or replace function public.founding_members_after_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = new.email and email_confirmed_at is not null;
  if uid is not null then perform public.activate_founding_member(uid); end if;
  return new;
end; $$;
drop trigger if exists trg_founding_activate_existing on public.founding_members;
create trigger trg_founding_activate_existing after insert on public.founding_members
  for each row execute procedure public.founding_members_after_insert();

-- When a new account confirms its email: 5 Barter Bucks welcome bonus (once,
-- earned bucket) and founding-member activation if they were invited.
-- Granted at confirmation rather than sign-up so throwaway sign-ups can't farm it.
create or replace function public.on_email_confirmed(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.profiles where id = p_user) then
    perform public.bb_post(p_user, 5, 'earn', 'welcome_bonus', 'Welcome to The Barter Shop!', p_user, 'earned');
  end if;
  perform public.activate_founding_member(p_user);
end; $$;
revoke all on function public.on_email_confirmed(uuid) from public, anon, authenticated;

create or replace function public.founding_on_email_confirmed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    perform public.on_email_confirmed(new.id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_founding_on_confirm on auth.users;
create trigger trg_founding_on_confirm after update of email_confirmed_at on auth.users
  for each row execute procedure public.founding_on_email_confirmed();
-- Accounts confirmed at creation (e.g. if email confirmation is ever turned off).
-- Name sorts after on_auth_user_created, so the profile row already exists.
drop trigger if exists trg_welcome_on_confirmed_insert on auth.users;
create trigger trg_welcome_on_confirmed_insert after insert on auth.users
  for each row execute procedure public.founding_on_email_confirmed();

-- ── 7. Entitlement: what the member actually has right now ─────────────
create or replace function public.tier_rank(t text) returns integer
language sql immutable as $$
  select case t when 'business' then 2 when 'verified_pro' then 1 else 0 end
$$;

create or replace function public.my_entitlement()
returns table (tier text, source text, expires_at timestamptz, is_founding_member boolean)
language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles;
  paid_tier text; paid_until timestamptz; paid_active boolean;
  founding_active boolean;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then return; end if;

  -- 'cancelled' = auto-renew turned off; access continues until the period ends.
  paid_active := p.subscription_status in ('trial', 'active', 'past_due', 'cancelled')
                 and (p.subscription_expires_at is null or p.subscription_expires_at > now());
  paid_tier := case when paid_active then p.subscription_tier else 'freemium' end;
  paid_until := case when paid_active then p.subscription_expires_at end;
  founding_active := p.founding_member_until is not null and p.founding_member_until > now();

  if founding_active and public.tier_rank(p.founding_member_tier) >= public.tier_rank(paid_tier) then
    return query select p.founding_member_tier, 'founding'::text, p.founding_member_until, true;
  elsif public.tier_rank(paid_tier) > 0 then
    return query select paid_tier, coalesce(p.subscription_store, 'store'), paid_until, founding_active;
  else
    return query select 'freemium'::text, 'free'::text, null::timestamptz, founding_active;
  end if;
end; $$;
revoke all on function public.my_entitlement() from public, anon;
grant execute on function public.my_entitlement() to authenticated;

-- Called by the RevenueCat webhook (Edge Function, service role) only.
create or replace function public.apply_store_subscription(
  p_user uuid, p_tier text, p_status text, p_expires_at timestamptz, p_store text, p_transaction_id text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_tier not in ('freemium', 'verified_pro', 'business') then raise exception 'Bad tier %', p_tier; end if;
  update public.profiles
     set subscription_tier = p_tier,
         subscription_status = p_status,
         subscription_expires_at = p_expires_at,
         subscription_store = p_store,
         subscription_id = coalesce(p_transaction_id, subscription_id)
   where id = p_user;
end; $$;
revoke all on function public.apply_store_subscription(uuid, text, text, timestamptz, text, text)
  from public, anon, authenticated;

-- ── 8. Money / trust columns are server-only ───────────────────────────
-- The app (roles anon/authenticated) may edit its own profile, but not
-- balances, subscriptions, founding status, or verification results.
create or replace function public.protect_profile_columns()
returns trigger language plpgsql as $$
begin
  if current_user in ('anon', 'authenticated') and (
       new.barter_bucks           is distinct from old.barter_bucks
    or new.barter_bucks_purchased is distinct from old.barter_bucks_purchased
    or new.subscription_tier      is distinct from old.subscription_tier
    or new.subscription_status    is distinct from old.subscription_status
    or new.subscription_expires_at is distinct from old.subscription_expires_at
    or new.subscription_id        is distinct from old.subscription_id
    or new.subscription_store     is distinct from old.subscription_store
    or new.stripe_customer_id     is distinct from old.stripe_customer_id
    or new.founding_member_tier   is distinct from old.founding_member_tier
    or new.founding_member_until  is distinct from old.founding_member_until
    or new.verification_status    is distinct from old.verification_status
    or new.vetting_score          is distinct from old.vetting_score
    or new.barter_value_cap       is distinct from old.barter_value_cap
    or new.rating                 is distinct from old.rating
    or new.barter_count           is distinct from old.barter_count
    or new.tier                   is distinct from old.tier
    or new.user_type              is distinct from old.user_type
  ) then
    raise exception 'These profile fields can only be changed by The Barter Shop'
      using errcode = '42501';
  end if;
  return new;
end; $$;
drop trigger if exists trg_protect_profile_columns on public.profiles;
create trigger trg_protect_profile_columns before update on public.profiles
  for each row execute procedure public.protect_profile_columns();

-- Profiles are created by the sign-up trigger, never directly by the app.
drop policy if exists "Users can insert own profile" on public.profiles;

-- ── 9. Live wallet updates in the app (Supabase Realtime) ──────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime' and tablename = 'bb_transactions') then
    alter publication supabase_realtime add table public.bb_transactions;
  end if;
end $$;
