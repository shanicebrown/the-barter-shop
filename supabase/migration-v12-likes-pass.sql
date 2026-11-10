-- Add is_pass column to likes table
alter table public.likes add column if not exists is_pass boolean default false;
