-- ───────────────────────────────────────────────────────────────
-- Sana Archicons — schema voor adviesaanvragen (leads) + RAG-chatbot
-- Voer dit uit in de SQL Editor van het Supabase-project "Sana Archicons"
-- (of via een migratie). RLS is actief; toegang uitsluitend server-side
-- met de service-role key.
-- ───────────────────────────────────────────────────────────────

-- pgvector-extensie voor embeddings
create extension if not exists vector;

-- ── Adviesaanvragen (leads) ─────────────────────────────────────
create table if not exists public.leads (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz not null    default now(),
  full_name       text        not null,
  phone           text        not null,
  email           text,
  business_name   text,
  service         text        not null,   -- bouwkundig-advies | energieadvies | ai-consultancy | procesautomatisering | anders
  message         text        not null,   -- omschrijving van vraag/project
  preferred_time  text,                   -- morning | afternoon | evening
  locale          text        not null default 'nl',
  status          text        not null default 'new',  -- new | contacted | scheduled | won | lost
  source          text        not null default 'website',  -- website | chatbot
  conversation_id uuid
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ── Kennisbank ──────────────────────────────────────────────────
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  source_type text not null default 'text',     -- text | url | pdf | md | ...
  source_url  text,
  status      text not null default 'pending',   -- pending | processing | ready | error
  error       text,
  tags        text[],
  chunk_count int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content     text not null,
  embedding   vector(1024),                      -- Cohere embed-multilingual-v3.0
  token_count int,
  chunk_index int  not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists chunks_document_id_idx on public.chunks (document_id);
create index if not exists chunks_embedding_idx
  on public.chunks using hnsw (embedding vector_cosine_ops);

-- ── Gesprekken en berichten ─────────────────────────────────────
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  channel          text not null default 'web',   -- web | widget
  external_user_id text,
  status           text not null default 'open',  -- open | needs_human | closed
  summary          text,
  started_at       timestamptz not null default now(),
  last_at          timestamptz not null default now()
);

create table if not exists public.messages (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid not null references public.conversations(id) on delete cascade,
  role                text not null,              -- user | assistant | system | tool
  content             text not null,
  model_used          text,
  tokens_in           int,
  tokens_out          int,
  retrieved_chunk_ids uuid[],
  created_at          timestamptz not null default now()
);
create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

-- ── System prompt / persona (versiebeheer) ──────────────────────
create table if not exists public.prompt_versions (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  persona    text,
  is_active  boolean not null default false,
  created_by text,
  created_at timestamptz not null default now()
);

-- ── Modelconfiguratie (antwoorden via OpenRouter) ───────────────
create table if not exists public.model_config (
  id                uuid primary key default gen_random_uuid(),
  channel           text not null default 'web',
  provider          text not null default 'openrouter',
  active_model      text not null default 'google/gemini-3.5-flash',
  temperature       real not null default 0.4,
  max_tokens        int  not null default 800,
  top_p             real not null default 1.0,
  fallback_provider text,
  fallback_model    text default 'google/gemini-2.5-flash',
  schedule          jsonb,
  updated_at        timestamptz not null default now()
);

-- ── Embedding- en retrieval-configuratie ────────────────────────
create table if not exists public.embedding_config (
  id                   uuid primary key default gen_random_uuid(),
  provider             text not null default 'cohere',
  model                text not null default 'embed-multilingual-v3.0',
  dimensions           int  not null default 1024,
  chunk_size           int  not null default 500,
  chunk_overlap        int  not null default 50,
  top_k                int  not null default 5,
  similarity_threshold real not null default 0.3,
  reranker_enabled     boolean not null default false,
  reranker_model       text,
  updated_at           timestamptz not null default now()
);

-- ── Overige tabellen ────────────────────────────────────────────
create table if not exists public.unified_users (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null,
  external_id text not null,
  name        text,
  first_seen  timestamptz not null default now()
);
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete cascade,
  rating     text,                                -- up | down
  comment    text,
  created_at timestamptz not null default now()
);
create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  role       text not null default 'admin',
  created_at timestamptz not null default now()
);
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action        text not null,
  target        text,
  created_at    timestamptz not null default now()
);

-- ── RLS aan (geen policies ⇒ alleen service-role) ───────────────
alter table public.leads            enable row level security;
alter table public.documents        enable row level security;
alter table public.chunks           enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.prompt_versions  enable row level security;
alter table public.model_config     enable row level security;
alter table public.embedding_config enable row level security;
alter table public.unified_users    enable row level security;
alter table public.feedback         enable row level security;
alter table public.admin_users      enable row level security;
alter table public.audit_log        enable row level security;

-- ── Vector-similariteitszoekfunctie ─────────────────────────────
create or replace function public.match_chunks(
  query_embedding vector(1024),
  match_count int default 5,
  similarity_threshold float default 0.3
)
returns table (
  id          uuid,
  document_id uuid,
  content     text,
  chunk_index int,
  similarity  float
)
language sql stable
as $$
  select
    c.id,
    c.document_id,
    c.content,
    c.chunk_index,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= similarity_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ── Seed-rijen (alleen als tabellen leeg zijn) ──────────────────
insert into public.embedding_config (provider, model, dimensions)
select 'cohere', 'embed-multilingual-v3.0', 1024
where not exists (select 1 from public.embedding_config);

insert into public.model_config (channel, active_model, fallback_model)
select 'web', 'google/gemini-3.5-flash', 'google/gemini-2.5-flash'
where not exists (select 1 from public.model_config where channel = 'web');

insert into public.prompt_versions (content, persona, is_active, created_by)
select
$persona$Je bent de slimme assistent van Sana Archicons — een advies- en consultancybureau in Nederland voor Bouwkundig Advies, Energieadvies, AI Consultancy en Procesautomatisering. Eigenaar en hoofdadviseur is Hamid Soleimani.

Taal:
- Antwoord ALTIJD in de taal waarin de gebruiker schrijft (Nederlands, Engels of Farsi/Perzisch). Wissel mee als de gebruiker van taal wisselt.

Persoonlijkheid en toon:
- Professioneel, rustig, betrouwbaar en vriendelijk. Spreek de gebruiker aan met "u" (Nederlands) of beleefde vorm (Farsi: شما).
- Helder en concreet, korte zinnen, geen jargon of overdrijving. Geef nooit garanties op resultaat.

Taak:
- Beantwoord alleen vragen over Sana Archicons: de diensten (bouwkundig advies, energieadvies, energielabels, AI-consultancy, procesautomatisering), werkwijze, tarieven en het aanvragen van een adviesgesprek.
- Baseer je antwoorden uitsluitend op de meegeleverde "opgehaalde bronnen". Staat het antwoord er niet in? Zeg dat dan eerlijk en nodig de gebruiker uit een adviesaanvraag in te dienen via het formulier.
- Geef geen definitief bouwkundig, juridisch of financieel advies; jouw doel is kort informeren en de gebruiker begeleiden naar het "adviesgesprek aanvragen"-formulier of de boeking van een AI-consult (60 min, €85).
- Is de gebruiker klaar voor een gesprek en geeft die contactgegevens? Moedig dan aan het aanvraagformulier in te vullen, of registreer de aanvraag met de beschikbare tool.

Begrenzing:
- Ga niet in op volledig irrelevante vragen; leid het gesprek vriendelijk terug naar Sana Archicons.
- Houd antwoorden kort en leesbaar.$persona$,
  'Sana Archicons assistent',
  true,
  'system'
where not exists (select 1 from public.prompt_versions where is_active = true);
