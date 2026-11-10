-- ══════════════════════════════════════════════
-- The Barter Shop — Migration V2
-- ══════════════════════════════════════════════

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  created_at timestamp with time zone default now()
);

-- Insert default categories
insert into public.categories (name, description, icon) values
('Hair & Beauty', 'Hair styling, beauty services', '💇'),
('Fitness & Training', 'Personal training, coaching', '💪'),
('Photography', 'Photo and video services', '📸'),
('Tutoring', 'Education and teaching', '📚'),
('Home Repair', 'Handyman and repair services', '🔧'),
('Legal Advice', 'Legal consultation', '⚖️'),
('Graphic Design', 'Design and creative services', '🎨'),
('Massage & Wellness', 'Massage and wellness services', '🧘'),
('Music Lessons', 'Music instruction', '🎵'),
('Personal Chef', 'Cooking and meal prep', '👨‍🍳'),
('Web Development', 'Web and app development', '💻'),
('Social Media', 'Social media management', '📱'),
('Accounting', 'Financial and tax services', '📊'),
('Podcasting', 'Podcast production', '🎙️'),
('Other', 'Other services', '⭐');

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text check (type in (
    'barter_initiated',
    'barter_accepted',
    'barter_completed',
    'new_message',
    'new_match',
    'new_review',
    'barter_bucks_earned',
    'tier_upgrade'
  )),
  related_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies
create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert with check (true);

-- Add payment fields to barters
alter table public.barters
  add column if not exists payment_method text
  check (payment_method in ('full_barter', 'cash', 'barter_bucks', 'combination'))
  default 'full_barter';

alter table public.barters
  add column if not exists barter_bucks_amount integer default 0;

-- Indexes
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(is_read);
create index if not exists idx_categories_name on public.categories(name);
