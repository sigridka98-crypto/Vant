alter table public.scam_cards
  add column if not exists is_new_alert boolean not null default false,
  add column if not exists is_trending_alert boolean not null default false,
  add column if not exists is_most_reported boolean not null default false,
  add column if not exists alert_summary text not null default '';

create index if not exists scam_cards_alerts_idx
  on public.scam_cards (is_published, is_new_alert, is_trending_alert, is_most_reported);
