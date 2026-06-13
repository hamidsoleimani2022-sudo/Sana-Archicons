-- =============================================================
-- Hamid Soleimani — AI Consultant website
-- Supabase schema: profiles, services, availability, bookings,
-- payments, webinars, registrations, blog posts.
-- Run this in the Supabase SQL editor (or via the CLI).
-- =============================================================

-- ---------- Enums ----------
do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type meeting_type as enum ('phone', 'in_person');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  locale text default 'nl',
  role app_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Services ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_nl text not null,
  title_en text not null,
  price_cents integer not null,
  currency text not null default 'EUR',
  duration_minutes integer not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read" on public.services
  for select using (true);

insert into public.services (slug, title_nl, title_en, price_cents)
values ('ai_consult', 'Persoonlijk AI-consult', 'Personal AI consult', 8500)
on conflict (slug) do nothing;

-- ---------- Availability (admin-managed open slots) ----------
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  is_booked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.availability enable row level security;

drop policy if exists "availability_public_read" on public.availability;
create policy "availability_public_read" on public.availability
  for select using (true);

-- ---------- Bookings ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service text not null default 'ai_consult',
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  price_cents integer not null default 8500,
  currency text not null default 'EUR',
  meeting_type meeting_type not null default 'phone',
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  status booking_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own" on public.bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own" on public.bookings
  for update using (auth.uid() = user_id);

-- ---------- Payments ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text,                 -- 'mollie' | 'stripe'
  provider_payment_id text,
  amount_cents integer not null,
  currency text not null default 'EUR',
  status payment_status not null default 'unpaid',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

-- ---------- Webinars ----------
create table if not exists public.webinars (
  id uuid primary key default gen_random_uuid(),
  title_nl text not null,
  title_en text not null,
  description_nl text,
  description_en text,
  starts_at timestamptz,
  price_cents integer not null default 0,
  capacity integer,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.webinars enable row level security;

drop policy if exists "webinars_public_read" on public.webinars;
create policy "webinars_public_read" on public.webinars
  for select using (published = true);

create table if not exists public.webinar_registrations (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.webinars(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_status payment_status not null default 'unpaid',
  created_at timestamptz not null default now(),
  unique (webinar_id, user_id)
);

alter table public.webinar_registrations enable row level security;

drop policy if exists "registrations_select_own" on public.webinar_registrations;
create policy "registrations_select_own" on public.webinar_registrations
  for select using (auth.uid() = user_id);

drop policy if exists "registrations_insert_own" on public.webinar_registrations;
create policy "registrations_insert_own" on public.webinar_registrations
  for insert with check (auth.uid() = user_id);

-- ---------- Blog posts ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_nl text not null,
  title_en text not null,
  excerpt_nl text,
  excerpt_en text,
  body_nl text,
  body_en text,
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
  for select using (published = true);
