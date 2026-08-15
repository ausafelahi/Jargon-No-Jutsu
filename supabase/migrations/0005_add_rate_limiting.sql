-- Rate limiting, implemented in Postgres rather than Redis/Upstash — the PRD
-- rules out paid services, and Supabase is already the only backend this app has.
-- Fixed-window counter per key (e.g. "search:203.0.113.4"), reset once the window
-- elapses. The check-and-increment happens atomically in a single UPSERT so
-- concurrent requests can't race past the limit.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

-- No RLS policies granted to anon/authenticated on purpose — this table is only
-- ever touched via the security-definer function below, never queried directly.
alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_now timestamptz := now();
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set count = case
          when public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
            then 1
          else public.rate_limits.count + 1
        end,
        window_start = case
          when public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
            then v_now
          else public.rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;
