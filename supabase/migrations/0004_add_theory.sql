-- Theory: long-form, non-anime technical breakdowns, one per concept.
-- Deliberately separate from `lessons` — different content shape (no character,
-- no career advice, much longer), and concepts get revisited across many lessons
-- but should only get ONE theory article each.

create table if not exists public.theory_articles (
  id uuid primary key default gen_random_uuid(),
  concept text not null unique,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists theory_articles_created_at_idx on public.theory_articles (created_at desc);

alter table public.theory_articles enable row level security;

create policy "theory_articles_public_read" on public.theory_articles
  for select using (true);

-- No insert policy for authenticated users — same pattern as `lessons`,
-- articles are only written by the service-role client during generation.
