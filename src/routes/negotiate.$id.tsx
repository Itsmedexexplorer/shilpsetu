import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Handshake, Loader2, Mic, Sparkles, Square } from "lucide-react";
import { useState } from "react";
import {
  AiBadge,
  AreaField,
  Btn,
  ErrorNote,
  Field,
  Screen,
  Title,
  TopBar,
} from "@/components/shilp/ui";
import { negotiate, type CoachResult } from "@/lib/ai.functions";
import { useT } from "@/lib/i18n";
import { rupees, useShilp } from "@/lib/shilp-store";
import { useVoiceNote } from "@/lib/use-voice-note";

export const Route = createFileRoute("/negotiate/$id")({
  head: () => ({
    meta: [
      { title: "AI Bargain Coach — SHILPSETU AI" },
      {
        name: "description",
        content:
          "Agree a fair price with plain-language help: a suggested counter-offer, the reasons behind it, and a ready reply.",
      },
      { property: "og:title", content: "AI Bargain Coach" },
      {
        property: "og:description",
        content: "A fair counter-offer, explained in your own language.",
      },
    ],
  }),
  component: NegotiateScreen,
});

function NegotiateScreen() {
  const { id } = Route.useParams();
  const { inquiries, products, role, language, draft, addOffer, acceptOffer } =
    useShilp();
  const t = useT();
  const navigate = useNavigate();
  const runCoach = useServerFn(negotiate);

  const inquiry = inquiries.find((i) => i.id === id);
  const product = products.find((p) => p.id === inquiry?.productId);
  const isArtisan = role === "artisan";

  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");
  const [coach, setCoach] = useState<CoachResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voice = useVoiceNote(language, (text) =>
    setNote((n) => (n ? `${n} ${text}` : text)),
  );

  if (!inquiry) {
    return (
      <Screen>
        <TopBar title={t("coach.title")} />
        <Title sub={t("coach.missingBody")}>{t("coach.missingTitle")}</Title>
        <div className="px-5">
          <Link to="/orders" className="font-bold text-terracotta">
            {t("coach.backToOrders")}
          </Link>
        </div>
      </Screen>
    );
  }

  const mySide: "artisan" | "buyer" = isArtisan ? "artisan" : "buyer";
  const offers = inquiry.offers ?? [];
  const lastOffer = offers.length ? offers[offers.length - 1] : undefined;
  const otherHasOffered = offers.some((o) => o.by !== mySide);
  const waitingForReply = !!lastOffer && lastOffer.by === mySide;
  // The buyer names their own first price; the coach only unlocks once the
  // other side has put a price on the table and it is your turn to reply.
  const coachUnlocked = otherHasOffered && !waitingForReply;

  const listed = inquiry.productPrice || product?.price || "0";
  const current = inquiry.offerPrice || listed;
  const gap = Math.max(0, Number(listed) - Number(current));
  const gapPct = Number(listed) > 0 ? Math.min(100, (gap / Number(listed)) * 100) : 0;

  const ask = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await runCoach({
        data: {
          title: inquiry.productTitle,
          craft: product?.craft ?? "",
          material: product?.material ?? "",
          listedPrice: String(listed),
          buyerOffer: String(current),
          quantity: inquiry.quantity || "1",
          note,
          costMaterial: isArtisan ? draft.costs.material : "",
          costLabour: isArtisan ? draft.costs.labour : "",
          costOther: isArtisan ? draft.costs.other : "",
          days: isArtisan ? draft.costs.days : "",
          language: language ?? "en",
          side: isArtisan ? "artisan" : "buyer",
        },
      });
      setCoach(res);
      setPrice(res.counterPrice);
      if (res.replyText) setNote(res.replyText);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("coach.failed"));
    } finally {
      setBusy(false);
    }
  };

  const sendOffer = () => {
    const clean = price.replace(/[^\d]/g, "");
    if (!clean) return;
    addOffer(inquiry.id, {
      by: isArtisan ? "artisan" : "buyer",
      price: clean,
      note: note.trim(),
    });
    setPrice("");
    setNote("");
    setCoach(null);
  };

  const settle = () => {
    acceptOffer(inquiry.id, String(current));
    navigate({ to: "/orders" });
  };

  return (
    <Screen>
      <TopBar title={t("coach.title")} />

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-charcoal/8">
          {inquiry.productImage ? (
            <img
              src={inquiry.productImage}
              alt=""
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <span className="h-16 w-16 shrink-0 rounded-2xl bg-sand" />
          )}
          <div className="min-w-0">
            <p className="truncate font-extrabold">{inquiry.productTitle}</p>
            <p className="truncate text-sm opacity-65">
              {isArtisan ? inquiry.buyer : inquiry.sellerName || t("market.anArtisan")} ·{" "}
              {t("orders.qty")} {inquiry.quantity}
            </p>
          </div>
        </div>
      </div>

      <Title sub={t("coach.sub")} className="pb-3">
        {t("coach.heading")}
      </Title>

      <div className="px-5">
        <div className="rounded-3xl bg-forest p-5 text-ivory">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase opacity-60">
                {t("coach.asking")}
              </p>
              <p className="text-2xl font-extrabold">{rupees(listed)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs tracking-[0.15em] uppercase opacity-60">
                {inquiry.agreedPrice ? t("coach.agreed") : t("coach.onTable")}
              </p>
              <p className="text-2xl font-extrabold text-saffron">{rupees(current)}</p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ivory/15">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-700"
              style={{ width: `${100 - gapPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs opacity-70">
            {gap > 0
              ? `${t("coach.gap")} ${rupees(gap)}`
              : t("coach.noGap")}
          </p>
        </div>
      </div>

      {inquiry.offers?.length ? (
        <div className="mt-5 space-y-2 px-5">
          {inquiry.offers.map((o, idx) => (
            <div
              key={`${o.at}-${idx}`}
              className={`animate-rise max-w-[85%] rounded-2xl p-3 text-sm ${
                o.by === "buyer"
                  ? "bg-sand"
                  : "ml-auto bg-forest/10 ring-1 ring-forest/15"
              }`}
            >
              <p className="text-xs font-bold opacity-60">
                {o.by === "buyer" ? t("coach.buyerSaid") : t("coach.artisanSaid")}
              </p>
              <p className="text-base font-extrabold">{rupees(o.price)}</p>
              {o.note ? <p className="mt-1 opacity-75">{o.note}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 space-y-4 px-5 pb-8">
        {error ? (
          <ErrorNote message={error} onRetry={ask} onSkip={() => setError(null)} />
        ) : null}

        {coach ? (
          <div className="animate-rise rounded-3xl bg-saffron/15 p-5 ring-1 ring-saffron/40">
            <AiBadge>{t("coach.badge")}</AiBadge>
            <p className="mt-3 text-lg font-extrabold">{coach.verdict}</p>
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-2xl bg-white p-3">
                <p className="text-xs font-bold opacity-60">{t("coach.suggested")}</p>
                <p className="text-xl font-extrabold text-terracotta">
                  {rupees(coach.counterPrice)}
                </p>
              </div>
              <div className="flex-1 rounded-2xl bg-white p-3">
                <p className="text-xs font-bold opacity-60">{t("coach.floor")}</p>
                <p className="text-xl font-extrabold">{rupees(coach.floorPrice)}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {coach.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-sm">
                  <span className="text-terracotta">•</span>
                  <span className="opacity-80">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : coachUnlocked ? (
          <Btn
            variant="forest"
            onClick={ask}
            disabled={busy}
            icon={
              busy ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )
            }
          >
            {busy ? t("coach.thinking") : t("coach.cta")}
          </Btn>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-charcoal/15 bg-white p-4">
            <p className="text-sm font-extrabold">✦ {t("coach.title")}</p>
            <p className="mt-1 text-xs opacity-70">
              {waitingForReply ? t("coach.waitingBody") : t("coach.firstMoveBody")}
            </p>
          </div>
        )}

        <Field
          label={t("coach.yourPrice")}
          inputMode="numeric"
          placeholder={String(current)}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div>
          <AreaField
            label={t("coach.yourMessage")}
            value={note}
            onChange={setNote}
            rows={4}
          />
          <button
            onClick={voice.recording ? voice.stop : voice.start}
            disabled={voice.busy}
            className={`press mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
              voice.recording ? "bg-terracotta text-white" : "bg-sand text-charcoal"
            }`}
          >
            {voice.busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : voice.recording ? (
              <Square size={16} fill="currentColor" />
            ) : (
              <Mic size={16} />
            )}
            {voice.busy
              ? t("coach.listeningBusy")
              : voice.recording
                ? t("coach.stop")
                : t("coach.speak")}
          </button>
          {voice.error ? (
            <p className="mt-2 text-sm font-semibold text-destructive">{voice.error}</p>
          ) : null}
        </div>

        <Btn
          onClick={sendOffer}
          disabled={!price.replace(/[^\d]/g, "")}
          className={price.replace(/[^\d]/g, "") ? "" : "opacity-40"}
          icon={<Handshake size={20} />}
        >
          {t("coach.send")}
        </Btn>

        {inquiry.status !== "accepted" ? (
          <Btn variant="outline" onClick={settle} icon={<Check size={20} />}>
            {t("coach.accept")} {rupees(current)}
          </Btn>
        ) : (
          <p className="rounded-2xl bg-forest/10 p-4 text-center text-sm font-bold text-forest">
            {t("coach.settled")} {rupees(inquiry.agreedPrice || current)}
          </p>
        )}

        <p className="text-xs opacity-55">{t("coach.disclaimer")}</p>
      </div>
    </Screen>
  );
}
