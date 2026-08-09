-- Adds the character tier badge (e.g. "S TIER", "HOKAGE TIER") that the design
-- shows next to the character name. The original PRD schema didn't include this;
-- it's needed to stop every lesson from falling back to a default badge.

alter table public.lessons
  add column if not exists tier text;
