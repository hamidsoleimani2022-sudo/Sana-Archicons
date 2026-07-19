-- ───────────────────────────────────────────────────────────────
-- Sana Archicons — CRM-schema
-- Voer dit bestand uit in de SQL Editor van het Supabase-project
-- (dezelfde database als schema.sql en chatbot-schema.sql).
-- Bevat: bedrijven, contacten, pijplijnfasen, deals en activiteiten.
-- Klassieke CRM-flow: aanvraag (lead) → conversie → contact/bedrijf/deal.
-- RLS staat aan; toegang loopt uitsluitend via de server (service-role),
-- net als bij de overige tabellen.
-- ───────────────────────────────────────────────────────────────

-- ── Bedrijven ───────────────────────────────────────────────────
create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  industry   text,
  website    text,
  city       text,
  size_label text,                                 -- bijv. "1-10", "11-50"
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Contacten ───────────────────────────────────────────────────
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  full_name  text not null,
  phone      text,
  email      text,
  position   text,                                 -- functie binnen het bedrijf
  source     text not null default 'manual',       -- website | chatbot | manual
  lead_id    uuid references public.leads(id) on delete set null,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_company_idx on public.contacts (company_id);
create index if not exists contacts_lead_idx    on public.contacts (lead_id);
create index if not exists contacts_created_idx on public.contacts (created_at desc);

-- ── Pijplijnfasen (config-driven; labels per taal zitten in de app) ──
create table if not exists public.pipeline_stages (
  key      text primary key,
  position int  not null,
  is_won   boolean not null default false,
  is_lost  boolean not null default false
);
insert into public.pipeline_stages (key, position, is_won, is_lost) values
  ('new',         1, false, false),
  ('qualifying',  2, false, false),
  ('meeting',     3, false, false),
  ('proposal',    4, false, false),
  ('negotiation', 5, false, false),
  ('won',         6, true,  false),
  ('lost',        7, false, true)
on conflict (key) do nothing;

-- ── Deals ───────────────────────────────────────────────────────
create table if not exists public.deals (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  contact_id       uuid not null references public.contacts(id) on delete cascade,
  company_id       uuid references public.companies(id) on delete set null,
  stage_key        text not null default 'new' references public.pipeline_stages(key),
  status           text not null default 'open',   -- open | won | lost (volgt de fase)
  amount_eur       numeric(12,2) not null default 0,
  expected_close   date,
  stage_entered_at timestamptz not null default now(), -- voor "dagen in fase"
  won_at           timestamptz,
  lost_at          timestamptz,
  lost_reason      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists deals_contact_idx on public.deals (contact_id);
create index if not exists deals_company_idx on public.deals (company_id);
create index if not exists deals_stage_idx   on public.deals (stage_key);

-- ── Activiteiten / taken ────────────────────────────────────────
create table if not exists public.activities (
  id         uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id    uuid references public.deals(id) on delete cascade,
  type       text not null default 'task',         -- call | meeting | note | task
  title      text not null,
  body       text,
  due_at     timestamptz,                          -- deadline (optioneel)
  done_at    timestamptz,                          -- null = nog open
  created_at timestamptz not null default now()
);
create index if not exists activities_due_idx     on public.activities (due_at);
create index if not exists activities_contact_idx on public.activities (contact_id);
create index if not exists activities_deal_idx    on public.activities (deal_id);

-- ── Row Level Security ──────────────────────────────────────────
-- Alle CRM-tabellen zijn alleen via de server (service-role) benaderbaar.
alter table public.companies       enable row level security;
alter table public.contacts        enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals           enable row level security;
alter table public.activities      enable row level security;
