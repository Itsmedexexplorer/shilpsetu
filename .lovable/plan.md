# SHILPSETU AI — Artisan Commerce Prototype

A bold, mobile-first prototype that takes an artisan from photo + voice to a published, buyer-ready listing. Fully clickable end to end, running on realistic demo data so it never breaks on stage.

## What gets built

All 20 screens, connected as one flow:

```text
Splash -> Onboarding -> Language -> Role -> Home
Home -> Capture -> AI Image Studio -> Voice -> AI Processing
     -> Generated Listing -> Edit -> Costs -> Price Advisor
     -> Review -> Published -> Share/QR -> Buyer View -> Inquiry
Tabs: Home | Catalog | Orders | Profile
```

- **Splash / Onboarding / Language / Role** — deep green hero, big logo, oversized language and role tiles with strong selected states; language and role persist across the session.
- **Home** — "Namaste, Savitri ji", an oversized Add New Product block plus a 2x2 action grid (Catalog, Price Advisor, Learn & Support) and recent products with status chips.
- **Capture Product** — full dark camera screen with framing guides, shutter, gallery, flash, and Photo | Upload segmented control. Uses the real device camera when allowed, otherwise upload or a demo photo.
- **AI Image Studio** — draggable before/after slider with an animated processing checklist; original image always recoverable.
- **Voice Input** — huge mic button, live waveform, "Listening…", then an editable transcript. Real browser speech recognition where supported, with a demo transcript fallback so the flow never stalls.
- **AI Processing** — animated pipeline (Photo → Understand → Voice → Create → Price → Ready) in plain language, no technical jargon.
- **Generated Listing / Edit** — AI Generated badge, editable title, description, keywords, Hindi/English toggle, "Improve with AI" kept secondary, plus the "you're always in control" notice.
- **Costs / Price Advisor** — simple cost inputs with a live total, then a revealed price range, target price, profit, three plain-language reasons, and the estimate disclaimer.
- **Review / Published** — per-field edit actions, a clear "buyers will see this" note, then a restrained success moment with Share, Copy Link, QR (real generated QR), and View in Catalog.
- **Catalog / Buyer View / Inquiry / Profile / Orders** — filterable catalog, a distinctly premium public product page with artisan story, a short inquiry form with success state, and simple profile and inquiry-management screens.

Nothing is pre-priced or pre-titled for the user: values come from whatever they enter or speak, with the demo product available as an explicit shortcut.

## Look and feel

- Palette: deep forest green, terracotta, warm ivory/sand, charcoal, muted sage, warm yellow only for AI states. Dark green hero blocks against ivory surfaces, terracotta for primary actions, black for camera.
- Editorial typography: oversized headings, confident short labels, proper spacing for Devanagari and other Indian scripts.
- Colour-blocked sections, large imagery, hand-drawn accent lines and subtle folk motifs used as accents only; selective cards instead of endless white boxes.
- Motion: page transitions, button press feedback, waveform, processing pipeline, price reveal, publish celebration, skeletons — all subtle.
- Desktop shows the mobile app inside a designed phone canvas on a crafted backdrop, not a stretched layout.

## Error and empty states

AI failure, network failure, uncertain transcription, image-processing failure, missing pricing — each with Retry and Continue-with-saved-information, and entered data preserved throughout.

## Technical notes

- React + TypeScript + Tailwind v4 on the existing TanStack Start setup; one route per screen under `src/routes`, with a persisted flow store (draft product, language, role, catalog, inquiries) in `localStorage` so refreshes don't lose work.
- Design tokens added to `src/styles.css`; a small set of reusable primitives (screen shell, big CTA, section header, phone canvas, motifs) instead of default shadcn styling.
- Data shapes mirror future `profiles`, `products`, `product_costs`, `buyer_requests` tables so a real backend can drop in later. No backend, payments, cart or checkout in this build.
- Generated craft imagery for demo products and hero art; QR codes generated client-side.

## Not included

Real payments, shipping, cart, accounts/login, and a live AI backend. AI steps are simulated with realistic timing and content.
