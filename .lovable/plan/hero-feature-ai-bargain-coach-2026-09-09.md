# Hero feature: AI Bargain Coach

A voice-first negotiation helper that sits between a buyer's offer and the artisan's reply. Both sides speak in their own language; the AI suggests a fair counter-offer with plain-language reasons, and the agreed price is recorded on the inquiry.

## The experience

**Buyer side (on a listing)**
- A new "Make an offer" action next to Contact artisan.
- The buyer types or speaks their offer and reason ("₹900, I want 3 pieces").
- Before sending, the coach shows a short reality check: whether the offer is fair for this craft, materials and effort, and a suggested realistic number.
- Sending creates the inquiry as today, now carrying the offer amount.

**Artisan side (Orders tab)**
- Each inquiry with an offer shows an offer card: asking price, buyer's offer, the gap.
- One tap on "Coach me" gives a recommended counter-price plus three short reasons in the artisan's chosen language, and a ready-to-send reply the artisan can edit.
- The artisan can speak their reply; it is transcribed and refined by the coach.
- Accept / Counter / Decline buttons. Accepting records the final agreed price and marks the inquiry accordingly.

**Negotiation thread**
- Each inquiry gains a simple back-and-forth list of offers, so both sides see the history and the final agreed price.

## Where the AI is real

- Voice in and out of the negotiation uses the existing real transcription path, keeping Hindi, Kannada, Tamil and Telugu working.
- The counter-offer and its reasons come from a real AI call that receives the product, the artisan's own cost inputs, days of work, the listed price and the buyer's offer, and returns a recommended price, a floor price and three plain reasons in the chosen language.
- Failures are shown honestly with retry, and the negotiation still works manually without the coach.

## Technical notes

- New server function `negotiate` in `src/lib/ai.functions.ts` calling the Lovable AI Gateway with strict JSON output: `{ counterPrice, floorPrice, verdict, reasons[], replyText }`. Reuses the existing gateway pattern and the `LANG_NAME` map; gateway errors surfaced to the UI, never swallowed.
- Store changes in `src/lib/shilp-store.tsx`: `Inquiry` gains `offerPrice`, `agreedPrice`, and `offers: { by: "buyer" | "artisan"; price: string; note: string; at: number }[]`; status extends with `negotiating` and `accepted`. Old stored inquiries are normalised on load so existing data keeps working.
- New route `src/routes/negotiate.$id.tsx` for the negotiation thread, linked from Orders (artisan) and from the inquiry success screen (buyer).
- Offer capture added to `src/routes/inquiry.$id.tsx`; offer summary and Coach action added to `src/routes/orders.tsx`; "Make an offer" entry added to `src/routes/product.$id.tsx`.
- Reuses existing voice recording logic from the voice screen, extracted into a small shared hook.
- New translation keys for all five languages in `src/lib/i18n.tsx`.
- Visual language stays as-is: forest/terracotta/ivory, floating nav, existing animation utilities; the offer gap gets a simple animated bar.

## Not included

No payments, escrow, shipping or binding contracts. The agreed price is a record both sides can see, not a transaction.
