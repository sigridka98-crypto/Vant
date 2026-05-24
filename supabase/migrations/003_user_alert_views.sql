create table if not exists public.user_alert_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.scam_cards(id) on delete cascade,
  seen_at timestamptz not null default now(),
  unique (user_id, card_id)
);

alter table public.user_alert_views enable row level security;

create policy "user_alert_views_select_own"
on public.user_alert_views
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists user_alert_views_user_card_idx
  on public.user_alert_views (user_id, card_id, seen_at desc);
