import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Btn, ErrorNote, Field, Screen, Title, TopBar } from "@/components/shilp/ui";
import { rupees, useShilp } from "@/lib/shilp-store";
import { useState } from "react";

export const Route = createFileRoute("/costs")({
  head: () => ({
    meta: [
      { title: "Know your real cost — SHILPSETU AI" },
      {
        name: "description",
        content: "Add material, labour and packaging costs to get a fair price.",
      },
      { property: "og:title", content: "Know your real cost" },
      { property: "og:description", content: "Simple numbers, no financial jargon." },
    ],
  }),
  component: CostsScreen,
});

function CostsScreen() {
  const { draft, patchDraft } = useShilp();
  const navigate = useNavigate();
  const [warn, setWarn] = useState(false);
  const c = draft.costs;
  const total = (Number(c.material) || 0) + (Number(c.labour) || 0) + (Number(c.other) || 0);

  const setCost = (k: keyof typeof c, v: string) =>
    patchDraft({ costs: { ...c, [k]: v.replace(/[^0-9]/g, "") } });

  const go = () => {
    if (total <= 0) return setWarn(true);
    navigate({ to: "/price" });
  };

  return (
    <Screen>
      <TopBar title="Pricing Details" step="6 / 8" />
      <Title sub="Tell us what one piece costs you. Nothing is shared with buyers.">
        Know your real cost.
      </Title>

      <div className="space-y-4 px-5">
        <Field
          label="Material cost"
          inputMode="numeric"
          placeholder="₹"
          value={c.material}
          onChange={(e) => setCost("material", e.target.value)}
        />
        <Field
          label="Labour (your time)"
          inputMode="numeric"
          placeholder="₹"
          value={c.labour}
          onChange={(e) => setCost("labour", e.target.value)}
        />
        <Field
          label="Packaging / other"
          inputMode="numeric"
          placeholder="₹"
          value={c.other}
          onChange={(e) => setCost("other", e.target.value)}
        />
        <Field
          label="Production time (optional)"
          placeholder="e.g. 3 days"
          maxLength={40}
          value={c.days}
          onChange={(e) => patchDraft({ costs: { ...c, days: e.target.value } })}
        />

        <div className="craft-texture rounded-3xl bg-forest p-6 text-ivory">
          <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-70">
            Total cost
          </p>
          <p className="mt-1 font-display text-[3rem] leading-none font-extrabold">
            {rupees(total)}
          </p>
          <p className="mt-3 text-sm opacity-75">
            We'll use this to suggest a fair selling price.
          </p>
        </div>

        {warn ? (
          <ErrorNote
            message="Add at least one cost so we can suggest a price."
            onRetry={() => setWarn(false)}
          />
        ) : null}
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn onClick={go}>Continue</Btn>
      </div>
    </Screen>
  );
}
