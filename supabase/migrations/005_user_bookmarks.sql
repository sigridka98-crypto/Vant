create table if not exists public.user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.scam_cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, card_id)
);

alter table public.user_bookmarks enable row level security;

create policy "user_bookmarks_select_own"
on public.user_bookmarks
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_bookmarks_insert_own"
on public.user_bookmarks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_bookmarks_delete_own"
on public.user_bookmarks
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists user_bookmarks_user_created_idx
  on public.user_bookmarks (user_id, created_at desc);
