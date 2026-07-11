# Sana Archicons — Chatbot, adviesformulier & admin-panel

*Opgeleverd op 11 juli 2026. Bewaar dit bestand als naslag.*

---

## Wat er live staat

**Website:** https://sana-archicons.vercel.app

| Onderdeel | Waar |
|---|---|
| Adviesaanvraag-formulier (NL/EN) | https://sana-archicons.vercel.app/nl/consult |
| Chatpagina (AI-assistent) | https://sana-archicons.vercel.app/nl/assistant |
| Chatbot-widget | knop rechtsonder op elke pagina |
| Admin-panel (beheer) | https://sana-archicons.vercel.app/admin |

De chatbot antwoordt automatisch in de taal van de bezoeker: **Nederlands, Engels of Farsi**.

## Inloggen op het admin-panel

- Adres: **https://sana-archicons.vercel.app/admin**
- Wachtwoord: **SanaAdmin2026!**
  (te wijzigen via de variabele `ADMIN_PASSWORD` in `.env.local` én in Vercel → Settings → Environment Variables)
- Rechtsboven kun je de taal van het panel kiezen: **Nederlands · فارسی · English**

### Tabbladen in het panel
| Tab | Wat je er doet |
|---|---|
| **Dashboard** | Statistieken: gesprekken, unieke gebruikers, conversie naar aanvraag, tevredenheid, tokenkosten per AI-model |
| **Aanvragen** | Alle adviesaanvragen bekijken, status bijhouden (nieuw → contact gehad → afspraak gepland → klant geworden / afgevallen), zoeken en exporteren naar CSV |
| **Kennisbank** | Kennis toevoegen waar de bot uit antwoordt: plak tekst, een web-adres of upload bestanden (PDF, Word-tekst, md, txt…). Ook testzoeken. |
| **Modellen** | Het AI-model kiezen (via OpenRouter) en instellingen zoals temperature en aantal bronnen |
| **Gesprekken** | Alle chatgesprekken teruglezen, inclusief welke bronnen de bot gebruikte |
| **Feedback** | Antwoorden met 👎 en vragen waar de bot geen bron voor had — goede kandidaten om aan de kennisbank toe te voegen |

## Techniek (voor later naslag)

- **Code:** GitHub → `hamidsoleimani2022-sudo/Sana-Archicons`
- **Hosting:** Vercel, project `sana-archicons` (team hamid-s-projectwebsite)
- **Database:** Supabase, project **"Website Sana Archicons"** (`nvnpxvxscukkwqxhrztq`)
  - Tabellen: `leads` (aanvragen), `documents`/`chunks` (kennisbank), `conversations`/`messages` (gesprekken), `feedback`, `model_config`, `embedding_config`, `prompt_versions`
- **AI-modellen:** antwoorden via OpenRouter (standaard Gemini 3.5 Flash), embeddings via Cohere (meertalig)
- **Alle sleutels** staan lokaal in `.env.local` en op Vercel bij Environment Variables

### Handige commando's (vanuit de projectmap)
```
node node_modules/next/dist/bin/next dev -p 3100    # lokaal draaien → http://localhost:3100
node scripts/ingest-kb.mjs                           # alle knowledge-base/*.md opnieuw indexeren
node node_modules/next/dist/bin/next build           # productie-build testen
```

### Kennisbank bijwerken
1. Makkelijkst: via het admin-panel → tabblad **Kennisbank** (tekst plakken of bestand uploaden)
2. Of: een `.md`-bestand toevoegen in de map `knowledge-base/` en `node scripts/ingest-kb.mjs` draaien

### Als er iets mis lijkt
- Chatbot geeft "service niet geconfigureerd" → controleer de environment variables op Vercel
- Nieuwe deploy maar oude site zichtbaar → in de terminal: `npx vercel alias set <deployment-url> sana-archicons.vercel.app`
- Aanvragen komen niet binnen → check in Supabase-dashboard of het project actief is (gratis projecten pauzeren na ±1 week zonder gebruik!)

> ⚠️ **Belangrijk:** het gratis Supabase-plan pauzeert een project na een periode zonder activiteit. Krijg je een melding of doet de bot het niet meer, ga dan naar het Supabase-dashboard en klik op "Restore project".
