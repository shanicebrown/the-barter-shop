-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V10: Storage Fix
-- ══════════════════════════════════════════════

-- Create buckets (run in Supabase Dashboard > Storage or SQL Editor)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('verifications', 'verifications', false) on conflict (id) do nothing;

-- Avatar policies
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;

create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = 'avatars');
create policy "Users can update their own avatar" on storage.objects for update using (bucket_id = 'avatars');

-- Verification policies
drop policy if exists "Users can upload verification docs" on storage.objects;
drop policy if exists "Users can view own verification docs" on storage.objects;

create policy "Users can upload verification docs" on storage.objects for insert with check (bucket_id = 'verifications');
create policy "Users can view own verification docs" on storage.objects for select using (bucket_id = 'verifications');

-- Ensure verifications table has unique constraint
alter table public.verifications drop constraint if exists verifications_user_type_unique;
alter table public.verifications add constraint verifications_user_type_unique unique (user_id, verification_type);

-- Ensure RLS policies exist
drop policy if exists "Users can view own verifications" on public.verifications;
drop policy if exists "Users can insert own verifications" on public.verifications;
drop policy if exists "Users can update own verifications" on public.verifications;

create policy "Users can view own verifications" on public.verifications for select using (auth.uid() = user_id);
create policy "Users can insert own verifications" on public.verifications for insert with check (auth.uid() = user_id);
create policy "Users can update own verifications" on public.verifications for update using (auth.uid() = user_id);

-- Skills columns on profiles
alter table public.profiles add column if not exists skills_offered text[] default '{}';
alter table public.profiles add column if not exists skills_wanted text[] default '{}';
