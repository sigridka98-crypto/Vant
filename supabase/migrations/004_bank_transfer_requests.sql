create table if not exists public.bank_transfer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null default '',
  email text not null,
  transfer_type text not null check (transfer_type in ('subscription', 'wallet_topup')),
  requested_plan text not null default '',
  amount_kobo integer not null check (amount_kobo >= 0),
  sender_name text not null default '',
  sender_bank text not null default '',
  transfer_reference text not null default '',
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.bank_transfer_requests enable row level security;

create policy "bank_transfer_requests_select_own"
on public.bank_transfer_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy "bank_transfer_requests_insert_own"
on public.bank_transfer_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "bank_transfer_requests_admin_all"
on public.bank_transfer_requests
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create index if not exists bank_transfer_requests_status_created_idx
  on public.bank_transfer_requests (status, created_at desc);
