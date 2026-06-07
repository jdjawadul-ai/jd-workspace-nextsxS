-- JD Workspace Supabase schema
-- Run this in the Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text not null,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text not null,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_newsletters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source text,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_youtube (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text,
  stats text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workspace_memories enable row level security;
alter table public.workspace_leads enable row level security;
alter table public.workspace_clients enable row level security;
alter table public.workspace_research enable row level security;
alter table public.workspace_newsletters enable row level security;
alter table public.workspace_books enable row level security;
alter table public.workspace_youtube enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = user_id);

create policy "memories select own" on public.workspace_memories for select using (auth.uid() = user_id);
create policy "memories insert own" on public.workspace_memories for insert with check (auth.uid() = user_id);
create policy "memories update own" on public.workspace_memories for update using (auth.uid() = user_id);
create policy "memories delete own" on public.workspace_memories for delete using (auth.uid() = user_id);

create policy "leads select own" on public.workspace_leads for select using (auth.uid() = user_id);
create policy "leads insert own" on public.workspace_leads for insert with check (auth.uid() = user_id);
create policy "leads update own" on public.workspace_leads for update using (auth.uid() = user_id);
create policy "leads delete own" on public.workspace_leads for delete using (auth.uid() = user_id);

create policy "clients select own" on public.workspace_clients for select using (auth.uid() = user_id);
create policy "clients insert own" on public.workspace_clients for insert with check (auth.uid() = user_id);
create policy "clients update own" on public.workspace_clients for update using (auth.uid() = user_id);
create policy "clients delete own" on public.workspace_clients for delete using (auth.uid() = user_id);

create policy "research select own" on public.workspace_research for select using (auth.uid() = user_id);
create policy "research insert own" on public.workspace_research for insert with check (auth.uid() = user_id);
create policy "research update own" on public.workspace_research for update using (auth.uid() = user_id);
create policy "research delete own" on public.workspace_research for delete using (auth.uid() = user_id);

create policy "newsletters select own" on public.workspace_newsletters for select using (auth.uid() = user_id);
create policy "newsletters insert own" on public.workspace_newsletters for insert with check (auth.uid() = user_id);
create policy "newsletters update own" on public.workspace_newsletters for update using (auth.uid() = user_id);
create policy "newsletters delete own" on public.workspace_newsletters for delete using (auth.uid() = user_id);

create policy "books select own" on public.workspace_books for select using (auth.uid() = user_id);
create policy "books insert own" on public.workspace_books for insert with check (auth.uid() = user_id);
create policy "books update own" on public.workspace_books for update using (auth.uid() = user_id);
create policy "books delete own" on public.workspace_books for delete using (auth.uid() = user_id);

create policy "youtube select own" on public.workspace_youtube for select using (auth.uid() = user_id);
create policy "youtube insert own" on public.workspace_youtube for insert with check (auth.uid() = user_id);
create policy "youtube update own" on public.workspace_youtube for update using (auth.uid() = user_id);
create policy "youtube delete own" on public.workspace_youtube for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
