import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, ShoppingBag, Sparkles } from "lucide-react";
import { Btn, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useShilp, type Role } from "@/lib/shilp-store";

export const Route = createFileRoute("/role")({
  head: () => ({
    meta: [
      { title: "Who are you? — SHILPSETU AI" },
      {
        name: "description",
        content: "Continue as an artisan, a buyer, or an organization.",
      },
      { property: "og:title", content: "Aap kaun hain?" },
      { property: "og:description", content: "Pick how you want to use SHILPSETU AI." },
    ],
  }),
  component: RoleScreen,
});

const roles: { id: Role; title: string; sub: string; Icon: typeof Sparkles }[] = [
  { id: "artisan", title: "Artisan", sub: "I create handmade products", Icon: Sparkles },
  { id: "buyer", title: "Buyer", sub: "I want to explore products", Icon: ShoppingBag },
  { id: "org", title: "Organization", sub: "I work with artisans", Icon: Building2 },
];

function RoleScreen() {
  const { role, set } = useShilp();
  const navigate = useNavigate();

  return (
    <Screen>
      <TopBar title="Step 2 of 3" />
      <Title sub="Ye tay karta hai ki aapko kya dikhega.">Aap kaun hain?</Title>

      <div className="space-y-4 px-5">
        {roles.map(({ id, title, sub, Icon }, i) => {
          const active = role === id;
          return (
            <button
              key={id}
              onClick={() => set({ role: id })}
              style={{ animation: `rise-in .4s ${0.06 * i}s both` }}
              className={`press flex w-full items-center gap-4 rounded-3xl border-2 p-5 text-left ${
                active
                  ? "border-terracotta bg-terracotta/10"
                  : "border-charcoal/12 bg-white"
              }`}
            >
              <span
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                  active ? "bg-terracotta text-white" : "bg-sand text-forest"
                }`}
              >
                <Icon size={24} />
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-extrabold">{title}</span>
                <span className="block text-sm opacity-65">{sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 px-5 text-xs opacity-55">
        Buyers and organizations see the public catalog. Artisans get the full
        creation studio.
      </p>

      <div className="mt-auto px-5 pt-6 pb-8">
        <Btn
          disabled={!role}
          className={!role ? "opacity-40" : ""}
          onClick={() => navigate({ to: "/home" })}
        >
          Continue
        </Btn>
      </div>
    </Screen>
  );
}
