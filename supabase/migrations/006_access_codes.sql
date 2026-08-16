create table if not exists public.access_code_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code_count integer not null check (code_count between 1 and 50),
  coins_per_code integer not null default 100 check (coins_per_code = 100),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.access_code_batches(id) on delete cascade,
  code_hash text not null unique,
  code_hint text not null,
  coins integer not null default 100 check (coins = 100),
  status text not null default 'active' check (status in ('active', 'redeemed', 'revoked')),
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.credit_transactions
  add column if not exists access_code_id uuid references public.access_codes(id) on delete set null;

alter table public.payments alter column provider set default 'manual';
alter table public.subscriptions alter column provider set default 'manual';

alter table public.access_code_batches enable row level security;
alter table public.access_codes enable row level security;

drop policy if exists "access_code_batches_admin_all" on public.access_code_batches;
create policy "access_code_batches_admin_all"
on public.access_code_batches
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "access_codes_admin_all" on public.access_codes;
create policy "access_codes_admin_all"
on public.access_codes
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create index if not exists access_code_batches_created_idx
  on public.access_code_batches (created_at desc);

create index if not exists access_codes_batch_status_idx
  on public.access_codes (batch_id, status, created_at desc);

create index if not exists access_codes_redeemed_by_idx
  on public.access_codes (redeemed_by, redeemed_at desc)
  where redeemed_by is not null;

create or replace function public.create_access_code_batch(
  p_name text,
  p_code_hashes text[],
  p_code_hints text[],
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_batch_id uuid;
  v_count integer;
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then
    raise exception 'Admin access required.';
  end if;

  v_count := coalesce(array_length(p_code_hashes, 1), 0);

  if v_count < 1 or v_count > 50 then
    raise exception 'A batch must contain between 1 and 50 codes.';
  end if;

  if coalesce(array_length(p_code_hints, 1), 0) <> v_count then
    raise exception 'Every code must have a matching display hint.';
  end if;

  if length(trim(p_name)) < 2 or length(trim(p_name)) > 80 then
    raise exception 'Batch name must contain between 2 and 80 characters.';
  end if;

  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'The expiry date must be in the future.';
  end if;

  insert into public.access_code_batches (
    name, code_count, coins_per_code, expires_at, created_by
  )
  values (
    trim(p_name), v_count, 100, p_expires_at, auth.uid()
  )
  returning id into v_batch_id;

  insert into public.access_codes (batch_id, code_hash, code_hint, coins)
  select v_batch_id, hashes.value, hints.value, 100
  from unnest(p_code_hashes) with ordinality as hashes(value, position)
  join unnest(p_code_hints) with ordinality as hints(value, position)
    using (position);

  return v_batch_id;
end;
$$;

create or replace function public.revoke_access_code(p_code_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then
    raise exception 'Admin access required.';
  end if;

  update public.access_codes
  set status = 'revoked'
  where id = p_code_id and status = 'active';

  return found;
end;
$$;

create or replace function public.redeem_access_code(p_code text)
returns table (
  ok boolean,
  message text,
  coins_awarded integer,
  new_balance integer
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_normalized_code text;
  v_code public.access_codes%rowtype;
  v_expires_at timestamptz;
  v_balance integer;
begin
  if v_user_id is null then
    return query select false, 'Sign in before redeeming a purchase code.', 0, 0;
    return;
  end if;

  v_normalized_code := regexp_replace(upper(coalesce(p_code, '')), '[^A-Z0-9]', '', 'g');

  if length(v_normalized_code) <> 12 or left(v_normalized_code, 2) <> 'GU' then
    return query select false, 'Enter a valid GetUpdated code in the format GU-482913-K7P2.', 0, 0;
    return;
  end if;

  select access_codes.*
  into v_code
  from public.access_codes
  where code_hash = encode(digest(v_normalized_code, 'sha256'), 'hex')
  for update;

  if not found then
    return query select false, 'This purchase code is not recognized.', 0, 0;
    return;
  end if;

  if v_code.status = 'redeemed' then
    return query select false, 'This purchase code has already been redeemed.', 0, 0;
    return;
  end if;

  if v_code.status = 'revoked' then
    return query select false, 'This purchase code is no longer active.', 0, 0;
    return;
  end if;

  select batches.expires_at into v_expires_at
  from public.access_code_batches as batches
  where batches.id = v_code.batch_id;

  if v_expires_at is not null and v_expires_at <= now() then
    return query select false, 'This purchase code has expired.', 0, 0;
    return;
  end if;

  insert into public.wallets (user_id, credit_balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select wallets.credit_balance into v_balance
  from public.wallets as wallets
  where wallets.user_id = v_user_id
  for update;

  if v_balance <> 0 then
    return query select false, 'Use your remaining coins first. This code stays active until your balance reaches zero.', 0, v_balance;
    return;
  end if;

  update public.access_codes
  set status = 'redeemed', redeemed_by = v_user_id, redeemed_at = now()
  where id = v_code.id;

  update public.wallets
  set credit_balance = 100
  where user_id = v_user_id;

  insert into public.credit_transactions (
    user_id, amount, type, access_code_id, note
  )
  values (
    v_user_id, 100, 'topup', v_code.id,
    'GetUpdated purchase code redeemed (100 coins)'
  );

  return query select true, 'Code approved. 100 coins were added to your wallet.', 100, 100;
end;
$$;

revoke all on function public.create_access_code_batch(text, text[], text[], timestamptz) from public;
revoke all on function public.revoke_access_code(uuid) from public;
revoke all on function public.redeem_access_code(text) from public;

grant execute on function public.create_access_code_batch(text, text[], text[], timestamptz) to authenticated;
grant execute on function public.revoke_access_code(uuid) to authenticated;
grant execute on function public.redeem_access_code(text) to authenticated;
