<p align="center">
  <img src="src/assets/shilpsetu-mark.png" alt="ShilpSetu logo" width="96" height="96" />
</p>

<h1 align="center">ShilpSetu AI</h1>

<p align="center">
  <strong>From craft to commerce in 60 seconds.</strong><br/>
  A mobile-first, voice-first commerce app that helps Indian artisans turn a photo and a voice note
  into a finished, priced, buyer-ready product listing — in their own language.
</p>

<p align="center">
  <a href="https://shilpsetu.lovable.app">Live App</a>
</p>

---

## What it does

**For artisans**
- Snap a product photo — AI cleans the background and builds a studio-quality image
- Speak about the craft in Hindi, Marathi, Tamil, Kannada, Telugu, or English — AI transcribes and understands it
- AI writes the full listing: title, story, materials, keywords
- AI price advisor suggests a fair range based on materials, time, and effort
- Publish once — the listing appears instantly on every buyer's phone
- Manage catalog: edit, mark out of stock, or unlist products

**For buyers & organisations**
- Explore a live marketplace feed with search and filters (craft, location, max price)
- View rich product pages with the artisan's story
- Send inquiries and bulk-order requests directly to the artisan

**AI Bargain Coach** (the hero feature)
- Buyer makes the first offer on their own — no AI interference
- The artisan's AI coach then suggests a fair counter-offer with three plain-language reasons and a ready-to-send reply
- Once the artisan responds, the buyer's coach unlocks to help them close the deal
- Full offer history, accept / counter / decline flow

**Accounts & languages**
- Demo accounts with role switching (artisan / buyer / organisation) — no sign-up friction
- Full UI in 6 languages: English, हिन्दी, मराठी, தமிழ், తెలుగు, ಕನ್ನಡ
- Installable as an Android/iOS home-screen app (PWA)

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TypeScript, TanStack Start (SSR) & TanStack Router |
| Styling | Tailwind CSS v4 with semantic design tokens, shadcn/ui + Radix primitives |
| Backend | Supabase (Postgres + Realtime) via Lovable Cloud, with localStorage offline fallback |
| AI | Lovable AI Gateway — GPT-class model for listings, pricing & negotiation; Gemini for image cleanup & multilingual voice transcription |
| State | TanStack Query + a custom app store with realtime sync |
| Testing | Playwright (mobile viewport), tsgo typechecks |
| Distribution | PWA (installable), deployed to the edge |

## Design language

Editorial folk-craft aesthetic: deep forest green, terracotta, warm ivory, and charcoal;
saffron accents reserved for AI moments. Bricolage Grotesque display type with Karla body text
and Noto Sans fallbacks for Indian scripts. Floating pill navigation, safe-area aware,
built mobile-first inside a phone canvas on desktop.

## Run locally

Requires Node.js 20+ (or Bun).

```sh
git clone <this-repository-url>
cd shilpsetu
npm install
npm run dev
```

Then open http://localhost:5173.

## Project structure

```
src/
  routes/        # one file per screen (splash, capture, voice, listing, market, negotiate, ...)
  routes/api/    # server endpoints (photo enhancement)
  lib/           # store, i18n, AI functions, validation, realtime sync, share utils
  components/    # shadcn/ui + ShilpSetu UI primitives
public/          # PWA manifest, icons, favicon
supabase/        # database migrations
```

---

Built with care for India's artisans. 🧡
