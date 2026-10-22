-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.slicky_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  receipt_token_hash text not null,
  customer_name text not null,
  email text not null,
  notes text not null default '',
  items jsonb not null,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table public.slicky_orders enable row level security;
-- Intentionally create NO anon/authenticated policies. All access is through Edge Functions.
revoke all on public.slicky_orders from anon, authenticated;
grant usage on schema public to service_role;
grant all on public.slicky_orders to service_role;
