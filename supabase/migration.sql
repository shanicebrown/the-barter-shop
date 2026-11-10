-- ══════════════════════════════════════════════
-- The Barter Shop — Database Schema
-- ══════════════════════════════════════════════

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  user_type text default 'individual' check (user_type in ('individual', 'business', 'verified_pro')),
  bio text,
  location text,
  rating numeric default 0,
  barter_count integer default 0,
  barter_bucks integer default 0,
  tier text default 'seedling' check (tier in ('seedling', 'trader', 'pro', 'expert', 'legend')),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 2. SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  barter_type text default 'full' check (barter_type in ('full', 'partial', 'cash')),
  value numeric default 0,
  looking_for text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.services enable row level security;

create policy "Services are viewable by everyone"
  on public.services for select using (true);

create policy "Users can create own services"
  on public.services for insert with check (auth.uid() = user_id);

create policy "Users can update own services"
  on public.services for update using (auth.uid() = user_id);

create policy "Users can delete own services"
  on public.services for delete using (auth.uid() = user_id);

-- 3. BARTERS
create table if not exists public.barters (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  requester_service_id uuid references public.services(id) on delete set null,
  provider_service_id uuid references public.services(id) on delete set null,
  barter_type text check (barter_type in ('full', 'partial', 'cash')),
  cash_amount numeric default 0,
  status text default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  created_at timestamp with time zone default now()
);

alter table public.barters enable row level security;

create policy "Users can view own barters"
  on public.barters for select using (
    auth.uid() = requester_id or auth.uid() = provider_id
  );

create policy "Users can create barters"
  on public.barters for insert with check (auth.uid() = requester_id);

create policy "Barter participants can update"
  on public.barters for update using (
    auth.uid() = requester_id or auth.uid() = provider_id
  );

-- 4. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  barter_id uuid references public.barters(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "Users can send messages"
  on public.messages for insert with check (auth.uid() = sender_id);

create policy "Receiver can mark messages read"
  on public.messages for update using (auth.uid() = receiver_id);

-- 5. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  barter_id uuid references public.barters(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Users can create reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- 6. LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid references public.profiles(id) on delete cascade not null,
  liked_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique (liker_id, liked_id)
);

alter table public.likes enable row level security;

create policy "Users can view own likes"
  on public.likes for select using (
    auth.uid() = liker_id or auth.uid() = liked_id
  );

create policy "Users can create likes"
  on public.likes for insert with check (auth.uid() = liker_id);

create policy "Users can delete own likes"
  on public.likes for delete using (auth.uid() = liker_id);

-- ══════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ══════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    now()
  );
  return new;
end;
$$;

-- Drop existing trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ══════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ══════════════════════════════════════════════
create index if not exists idx_services_user_id on public.services(user_id);
create index if not exists idx_services_category on public.services(category);
create index if not exists idx_barters_requester on public.barters(requester_id);
create index if not exists idx_barters_provider on public.barters(provider_id);
create index if not exists idx_barters_status on public.barters(status);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_barter on public.messages(barter_id);
create index if not exists idx_reviews_reviewee on public.reviews(reviewee_id);
create index if not exists idx_likes_liker on public.likes(liker_id);
create index if not exists idx_likes_liked on public.likes(liked_id);
