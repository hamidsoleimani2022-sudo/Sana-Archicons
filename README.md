# Hamid Soleimani — AI Consultant

Personal brand website. Bilingual (Dutch / English), built on the brand guide
(dark navy + emerald, tech aesthetic). Online booking for paid consults,
user accounts, and a foundation for webinars & blog.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Turbopack**
- **Tailwind CSS v4** — brand theme in `src/app/globals.css`
- **next-intl** — Dutch (`nl`, default) + English (`en`)
- **Supabase** — Postgres, Auth (email + Google + LinkedIn), Storage
- **framer-motion** — animations
- Deploy on **Vercel**

## Project layout

```
src/
  app/[locale]/        # localized pages (home, about, services, booking, login, register, dashboard, webinars, blog)
  app/auth/            # OAuth callback + signout route handlers
  components/          # navbar, footer, sections, booking flow, auth forms
  i18n/                # next-intl routing/navigation/request config
  lib/supabase/        # browser + server + proxy clients (no-op until keys are set)
  messages/            # nl.json / en.json content
  proxy.ts             # next-intl + Supabase session (Next 16 "proxy" convention)
supabase/schema.sql    # database schema + RLS policies + signup trigger
```

## Setup

1. **Install & run**
   ```bash
   npm install
   npm run dev          # http://localhost:3000  → redirects to /nl
   ```

2. **Connect Supabase**
   - Create a project at https://supabase.com
   - Copy `.env.local.example` → `.env.local` and fill in:
     ```
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     ```
   - In the Supabase **SQL editor**, run `supabase/schema.sql`.

3. **Enable login providers** (Supabase → Authentication → Providers)
   - **Email** (on by default)
   - **Google** — add OAuth client ID/secret
   - **LinkedIn (OIDC)** — add client ID/secret
   - Redirect URL: `https://YOUR-DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback` for dev)

4. **Payment** (later) — booking records are created with `payment_status = 'unpaid'`.
   Wire up Mollie or Stripe in the booking flow / a `/api/checkout` route, then
   flip the status on the webhook.

## Deploy (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
4. Deploy, then point your domain at it.

> The site runs fine **before** Supabase is connected: auth/booking show a
> friendly "not configured yet" state instead of crashing.
