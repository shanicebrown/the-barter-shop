-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V14: Launch fixes
-- Run once in Supabase Dashboard → SQL Editor. Safe to re-run.
-- ══════════════════════════════════════════════

-- 1. Business details collected at sign-up (previously discarded)
alter table public.profiles add column if not exists business_address text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists years_in_business integer;

-- 2. Profile trigger: keep username + account type chosen at sign-up.
--    Username is skipped (left null) if already taken so sign-up never fails.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  wanted_username text := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  wanted_type text := new.raw_user_meta_data ->> 'user_type';
begin
  if wanted_username is not null
     and exists (select 1 from public.profiles where username = wanted_username) then
    wanted_username := null;
  end if;
  if wanted_type is null or wanted_type not in ('individual', 'business', 'verified_pro') then
    wanted_type := 'individual';
  end if;

  insert into public.profiles (id, full_name, username, user_type, avatar_url, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    wanted_username,
    wanted_type,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    now()
  );
  return new;
end;
$$;

-- 3. Let account deletion succeed. These references had no ON DELETE rule,
--    so deleting a user with agreements, reports, or penalties failed.
--    Records are kept (other party's legal/safety history) with the user nulled.
alter table public.barter_agreements drop constraint if exists barter_agreements_party_a_id_fkey;
alter table public.barter_agreements add constraint barter_agreements_party_a_id_fkey
  foreign key (party_a_id) references public.profiles(id) on delete set null;
alter table public.barter_agreements drop constraint if exists barter_agreements_party_b_id_fkey;
alter table public.barter_agreements add constraint barter_agreements_party_b_id_fkey
  foreign key (party_b_id) references public.profiles(id) on delete set null;
alter table public.barter_agreements drop constraint if exists barter_agreements_barter_id_fkey;
alter table public.barter_agreements add constraint barter_agreements_barter_id_fkey
  foreign key (barter_id) references public.barters(id) on delete set null;

alter table public.barters drop constraint if exists barters_agreement_id_fkey;
alter table public.barters add constraint barters_agreement_id_fkey
  foreign key (agreement_id) references public.barter_agreements(id) on delete set null;

alter table public.penalty_log drop constraint if exists penalty_log_barter_id_fkey;
alter table public.penalty_log add constraint penalty_log_barter_id_fkey
  foreign key (barter_id) references public.barters(id) on delete set null;

alter table public.reports drop constraint if exists reports_reporter_id_fkey;
alter table public.reports add constraint reports_reporter_id_fkey
  foreign key (reporter_id) references public.profiles(id) on delete set null;
alter table public.reports drop constraint if exists reports_reported_user_id_fkey;
alter table public.reports add constraint reports_reported_user_id_fkey
  foreign key (reported_user_id) references public.profiles(id) on delete set null;

-- 4. In-app account deletion (required by Apple App Store Guideline 5.1.1(v)
--    and Google Play). Deletes the caller's auth user; profile and owned rows cascade.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- 5. Storage: files live under <user_id>/... — restrict writes to the owner's
--    folder, and make verification documents (IDs, licenses) private to the owner.
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can upload their own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update their own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload verification docs" on storage.objects;
drop policy if exists "Users can view own verification docs" on storage.objects;
drop policy if exists "Users can update own verification docs" on storage.objects;
drop policy if exists "Users can delete own verification docs" on storage.objects;
create policy "Users can upload verification docs" on storage.objects for insert to authenticated
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view own verification docs" on storage.objects for select to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own verification docs" on storage.objects for update to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own verification docs" on storage.objects for delete to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);
