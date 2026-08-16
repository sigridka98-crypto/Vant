create extension if not exists pgcrypto;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );

  insert into public.wallets (user_id, credit_balance)
  values (new.id, 0);

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.scam_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  safe_example text not null,
  quick_memory_rule text not null,
  category text not null,
  severity text not null default 'common' check (severity in ('common', 'trending', 'high_risk')),
  is_free boolean not null default false,
  credit_cost integer not null default 1 check (credit_cost >= 0),
  is_published boolean not null default false,
  current_version integer not null default 1 check (current_version >= 1),
  major_update_reunlock_cost integer check (major_update_reunlock_cost is null or major_update_reunlock_cost >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scam_card_steps (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.scam_cards(id) on delete cascade,
  step_type text not null check (step_type in ('how_it_works', 'red_flags', 'protection')),
  content text not null,
  sort_order integer not null default 0
);

create table if not exists public.user_card_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.scam_cards(id) on delete cascade,
  unlocked_version integer not null check (unlocked_version >= 1),
  unlock_type text not null check (unlock_type in ('free', 'credit', 'reunlock', 'subscription')),
  created_at timestamptz not null default now(),
  unique (user_id, card_id, unlocked_version)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'manual',
  reference text not null unique,
  amount integer not null check (amount >= 0),
  credits_awarded integer check (credits_awarded is null or credits_awarded >= 0),
  payment_kind text not null check (payment_kind in ('credit_topup', 'subscription')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('topup', 'unlock', 'reunlock', 'admin_adjustment')),
  card_id uuid references public.scam_cards(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'manual',
  provider_customer_code text,
  provider_subscription_code text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'past_due')),
  started_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.card_update_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.scam_cards(id) on delete cascade,
  old_version integer not null check (old_version >= 1),
  new_version integer not null check (new_version >= 1),
  update_type text not null check (update_type in ('minor', 'major')),
  change_summary text not null,
  reunlock_cost integer check (reunlock_cost is null or reunlock_cost >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_scam_cards_updated_at
before update on public.scam_cards
for each row
execute function public.set_updated_at();

create trigger set_wallets_updated_at
before update on public.wallets
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.scam_cards enable row level security;
alter table public.scam_card_steps enable row level security;
alter table public.user_card_unlocks enable row level security;
alter table public.payments enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.card_update_logs enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_read_all"
on public.profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "wallets_select_own"
on public.wallets
for select
to authenticated
using (auth.uid() = user_id);

create policy "scam_cards_select_published"
on public.scam_cards
for select
to authenticated, anon
using (is_published = true);

create policy "scam_cards_admin_all"
on public.scam_cards
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "scam_card_steps_select_free_published_only"
on public.scam_card_steps
for select
to authenticated, anon
using (
  exists (
    select 1
    from public.scam_cards
    where public.scam_cards.id = scam_card_steps.card_id
      and public.scam_cards.is_published = true
      and public.scam_cards.is_free = true
  )
);

create policy "scam_card_steps_admin_all"
on public.scam_card_steps
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "user_card_unlocks_select_own"
on public.user_card_unlocks
for select
to authenticated
using (auth.uid() = user_id);

create policy "payments_select_own"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

create policy "credit_transactions_select_own"
on public.credit_transactions
for select
to authenticated
using (auth.uid() = user_id);

create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "card_update_logs_select_published"
on public.card_update_logs
for select
to authenticated, anon
using (
  exists (
    select 1
    from public.scam_cards
    where public.scam_cards.id = card_update_logs.card_id
      and public.scam_cards.is_published = true
  )
);

create policy "card_update_logs_admin_all"
on public.card_update_logs
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create index if not exists scam_cards_published_idx on public.scam_cards (is_published, category);
create index if not exists scam_card_steps_card_id_idx on public.scam_card_steps (card_id, step_type, sort_order);
create index if not exists user_card_unlocks_user_id_idx on public.user_card_unlocks (user_id, card_id);
create index if not exists credit_transactions_user_id_idx on public.credit_transactions (user_id, created_at desc);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id, status);
