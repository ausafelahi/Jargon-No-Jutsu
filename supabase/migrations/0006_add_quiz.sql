-- Quiz System: one multiple-choice question per concept.

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  concept text not null unique,
  question text not null,
  options jsonb not null, -- array of exactly 4 strings
  correct_index smallint not null check (correct_index >= 0 and correct_index <= 3),
  explanation text not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_questions_created_at_idx on public.quiz_questions (created_at desc);

alter table public.quiz_questions enable row level security;

create policy "quiz_questions_public_read" on public.quiz_questions
  for select using (true);

-- No insert policy for authenticated users — same pattern as lessons and
-- theory_articles, writes only happen via the service-role client.

-- Tracks which questions a signed-in user has answered and whether they got
-- it right, so a quiz doesn't just silently re-show without feedback.
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_index smallint not null,
  was_correct boolean not null,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts_owner_select" on public.quiz_attempts
  for select using (auth.uid() = user_id);

create policy "quiz_attempts_owner_insert" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

create policy "quiz_attempts_owner_update" on public.quiz_attempts
  for update using (auth.uid() = user_id);
