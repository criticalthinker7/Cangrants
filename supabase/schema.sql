-- CanGrants starter Supabase schema.
-- Run this in Supabase SQL Editor before importing the grant catalog.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default 'CanGrants Member',
  province text,
  discipline text,
  career text,
  city text,
  country text not null default 'Canada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grants (
  id integer primary key,
  name text not null,
  org text not null,
  open_date date,
  close_date date,
  is_rolling boolean not null default false,
  url text not null,
  disciplines text[] not null default '{}',
  location text not null default 'Canada',
  amount text not null default 'Varies',
  tags text[] not null default '{}',
  eligibility text not null default '',
  description text not null default '',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_grants (
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id integer not null references public.grants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, grant_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id integer not null references public.grants(id) on delete cascade,
  status text not null default 'Not Started'
    check (status in ('Not Started', 'In Progress', 'Submitted', 'Awarded', 'Declined')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, grant_id)
);

create table if not exists public.wishlist_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text not null,
  country text not null default 'Canada',
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  source text,
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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists grants_set_updated_at on public.grants;
create trigger grants_set_updated_at
before update on public.grants
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    name,
    province,
    discipline,
    career,
    city,
    country
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'CanGrants Member'),
    new.raw_user_meta_data->>'province',
    new.raw_user_meta_data->>'discipline',
    new.raw_user_meta_data->>'career',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'country', 'Canada')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    province = excluded.province,
    discipline = excluded.discipline,
    career = excluded.career,
    city = excluded.city,
    country = excluded.country,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.grants enable row level security;
alter table public.saved_grants enable row level security;
alter table public.applications enable row level security;
alter table public.wishlist_submissions enable row level security;
alter table public.newsletter_subscriptions enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Anyone can read active grant catalog" on public.grants;
create policy "Anyone can read active grant catalog"
on public.grants for select
using (true);

drop policy if exists "Users can manage their saved grants" on public.saved_grants;
create policy "Users can manage their saved grants"
on public.saved_grants for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their applications" on public.applications;
create policy "Users can manage their applications"
on public.applications for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Anyone can join wishlist" on public.wishlist_submissions;
create policy "Anyone can join wishlist"
on public.wishlist_submissions for insert
with check (true);

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscriptions;
create policy "Anyone can subscribe to newsletter"
on public.newsletter_subscriptions for insert
with check (true);
