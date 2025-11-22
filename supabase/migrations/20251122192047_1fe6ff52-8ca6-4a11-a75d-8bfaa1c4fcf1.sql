alter table public.project_intakes
  add column if not exists discount_offered boolean default false,
  add column if not exists discount_amount integer default 0;