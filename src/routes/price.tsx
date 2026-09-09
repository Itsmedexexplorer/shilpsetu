import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Btn, Screen, Title, TopBar } from "@/components/shilp/ui";
import { advisePrice } from "@/lib/ai-demo";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/price")({
  head: () => ({
    meta: [
      { title: "Find your fair price — SHILPSETU AI" },
      {
        name: "description",
        content: "An explainable price range based on your costs, time and skill.",
      },
      { property: "og:title", content: "Find your fair price" },
      { property: "og:description", content: "Not a random number — here is the why." },
    ],
  }),
  component: PriceScreen,
});

function PriceScreen() {
  const { draft, patchDraft } = useShilp();
  const navigate = useNavigate();
  const c = draft.costs;
  const total =
    (Number(c.material) || 0) + (Number(c.labour) || 0) + (Number(c.other) || 0);
  const a = advisePrice(total);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 250);
    return () => clearTimeout(t);
  }, []);

  const reasons = [
    `Similar products sell around ${rupees(a.low - 50)}–${rupees(a.high + 50)}`,
    "Your time and skill are counted, not just materials",
    "Competitive for online buyers and bulk B2B orders",
  ];

  return (
    <Screen>
      <TopBar title="Price Advisor" step="7 / 8" />
      <Title sub="A starting point you can change any time.">Find your fair price.</Title>

      <div className="px-5">
        <div
          className={`craft-texture rounded-3xl bg-forest-deep p-6 text-ivory transition-all duration-700 ${
            reveal ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-70">
            Recommended range
          </p>
          <p className="mt-1 text-xl font-bold opacity-85">
            {rupees(a.low)} – {rupees(a.high)}
          </p>

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-[3.6rem] leading-none font-extrabold text-saffron">
              {rupees(a.target)}
            </p>
            <span className="pb-2 text-sm font-bold opacity-70">suggested</span>
          </div>

          <div className="relative mt-6 h-2 rounded-full bg-white/15">
            <div
              className="absolute inset-y-0 rounded-full bg-terracotta transition-all duration-1000"
              style={{
                left: "8%",
                width: reveal ? "70%" : "0%",
              }}
            />
            <span
              className="absolute -top-1 h-4 w-4 rounded-full bg-saffron ring-4 ring-forest-deep transition-all duration-1000"
              style={{ left: reveal ? "56%" : "8%" }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs opacity-70">Your total cost</p>
              <p className="mt-1 text-xl font-extrabold">{rupees(a.total)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs opacity-70">Estimated profit</p>
              <p className="mt-1 text-xl font-extrabold text-sage">{rupees(a.profit)}</p>
            </div>
          </div>
        </div>

        <h2 className="mt-7 text-xl font-extrabold">Why this price?</h2>
        <ul className="mt-3 space-y-3">
          {reasons.map((r, i) => (
            <li
              key={r}
              className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-charcoal/8"
              style={{ animation: `rise-in .5s ${0.15 * i}s both` }}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest text-xs font-black text-ivory">
                {i + 1}
              </span>
              <span className="text-sm font-semibold">{r}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs opacity-55">
          Estimated price, not a guaranteed market price.
        </p>
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn
          onClick={() => {
            patchDraft({ price: String(a.target) });
            navigate({ to: "/review" });
          }}
        >
          Looks Good
        </Btn>
      </div>
    </Screen>
  );
}
