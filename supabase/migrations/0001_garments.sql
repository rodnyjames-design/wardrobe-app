-- Garments: a single item in a user's wardrobe.
-- Each row is owned by one user (auth.users.id). RLS enforces that ownership.

create table public.garments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  category      text not null check (
    category in ('tops','bottoms','dresses','outerwear','footwear','accessories')
  ),
  color         text not null check (char_length(color) between 1 and 60),
  brand         text check (brand is null or char_length(brand) <= 80),
  notes         text check (notes is null or char_length(notes) <= 2000),
  photo_path    text, -- storage path inside the garment-photos bucket, e.g. "<user_id>/<garment_id>.jpg"
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Useful indexes: list a user's wardrobe newest-first; filter by category.
create index garments_user_id_created_at_idx on public.garments (user_id, created_at desc);
create index garments_user_id_category_idx   on public.garments (user_id, category);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger garments_set_updated_at
  before update on public.garments
  for each row execute function public.set_updated_at();

-- Row Level Security: each user can only see and mutate their own garments.
alter table public.garments enable row level security;

create policy "Users can read their own garments"
  on public.garments for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own garments"
  on public.garments for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own garments"
  on public.garments for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own garments"
  on public.garments for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Expose the table via the Data API. We disabled "automatically expose new tables"
-- during project setup so each table opts in explicitly here.
grant select, insert, update, delete on public.garments to authenticated;
