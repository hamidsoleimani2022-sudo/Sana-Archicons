# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

**Dev server** — `npm run dev` calls `next dev` without a port, which may conflict. Always use:
```
node node_modules/next/dist/bin/next dev -p 3100
```
Node.js is installed user-scope (no admin) at `C:\Users\hamid\AppData\Local\Programs\nodejs` — it must be in PATH before running any Node command.

**Build & lint:**
```
node node_modules/next/dist/bin/next build   # production build
npx eslint src/                               # lint (no test suite exists)
```

**Smoke-test pages** (no browser MCP for this project — use PowerShell):
```powershell
Invoke-WebRequest "http://localhost:3100/nl" -UseBasicParsing
Invoke-WebRequest "http://localhost:3100/nl/contact" -UseBasicParsing
```

## Architecture

### Routing
All pages live under `src/app/[locale]/` and are served at `/nl/...` (default) or `/en/...`. The locale is injected by `next-intl`. There is **no** `middleware.ts` — Next 16 uses `src/proxy.ts` which exports `proxy` (not `middleware`). It chains the next-intl locale redirect with Supabase session refresh.

### Internationalisation
Two message files: `src/messages/nl.json` (Dutch, default) and `src/messages/en.json`. Every new string must appear in both files. Use `useTranslations("Namespace")` in client components and `getTranslations("Namespace")` in server components/pages.

### Supabase (currently disconnected)
`src/lib/supabase/config.ts` exports `isSupabaseConfigured` (false until `.env.local` has both keys). All auth and booking code checks this flag and shows a friendly "not configured" state — do not remove these guards. Three client helpers: `client.ts` (browser), `server.ts` (RSC/route handlers with cookie handling), `middleware.ts` (session refresh called from proxy).

### Styling
Tailwind v4 — **no `tailwind.config.ts`**. All brand tokens are defined in `src/app/globals.css` under `@theme {}`:
- Palette: `ink` (#050b14) · `navy` (#0a1828) · `emerald` (#2ecc71)
- Custom utilities: `.text-gradient`, `.glass`, `.glow-emerald`, `.tech-grid` — defined with `@utility` in globals.css, use these instead of repeating the inline styles.

### Logo
`public/logo-mark.png` is the real brand-guide emblem extracted from the PDF (circuit "S" + buildings + AI chip, transparent background). `src/components/logo.tsx` renders it via `<img>` (not `<Image>`). **Never replace this with a hand-drawn SVG** — the user has explicitly rejected that approach.

### lucide-react v1 quirk
The installed version has no `Linkedin` named export. Use the inline SVG already present in `src/components/footer.tsx` and `src/components/auth/oauth-buttons.tsx` as the pattern for any LinkedIn icon.

### Key business rules
- Company: **SANA ARCHICONS** — owner is **Hamid** (not "Hamed")
- Four services: Bouwkundig Advies · Energieadvies · AI Consultancy · Procesautomatisering
- AI consult booking: 60 min · €85 · phone or on-site — wired in `src/components/booking/booking-flow.tsx`
- Payment gateway (Mollie/Stripe) not yet connected — step 3 of the booking flow is a placeholder

## Pending setup
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, then run `supabase/schema.sql` in the Supabase dashboard and enable Google + LinkedIn OAuth providers.
- Replace phone/email placeholders on the contact page with real details.
- Add real photo to `public/` and wire it into `src/app/[locale]/about/page.tsx`.
- Deploy to Vercel and connect domain.
