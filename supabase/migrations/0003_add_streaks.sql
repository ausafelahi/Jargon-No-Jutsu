-- Streak System: tracks daily activity per user.
-- Client-side reads only; all writes go through the service-role client
-- (server-side recordDailyActivity call) so users can't inflate their own streak.

create table if not exists public.user_streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

create policy "user_streaks_owner_select" on public.user_streaks
  for select using (auth.uid() = user_id);

-- No insert/update policy for authenticated users on purpose — streak state
-- only changes via the service-role client (recordDailyActivity), never directly
-- from the browser, so a user can't just POST a fake streak value.
