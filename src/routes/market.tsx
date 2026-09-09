import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/shilp/BottomNav";
import { Empty, Motif } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Explore handmade crafts — SHILPSETU AI" },
      {
        name: "description",
        content:
          "Browse handmade products listed by artisans and contact the maker directly.",
      },
      { property: "og:title", content: "Explore handmade crafts" },
      {
        property: "og:description",
        content: "Every listing comes straight from the artisan who made it.",
      },
    ],
  }),
  component: MarketScreen,
});

function MarketScreen() {
  const { marketProducts, profile } = useShilp();
  const t = useT();
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();
  const list = marketProducts.filter((p) =>
    !term
      ? true
      : [p.title, p.craft, p.material, p.seller?.location, ...(p.keywords ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(term),
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <header className="craft-texture bg-forest-deep px-5 pt-8 pb-12 text-ivory">
        <Motif className="mb-4" />
        <h1 className="text-[2.1rem] leading-tight font-extrabold">
          {t("market.title")}
        </h1>
        <p className="mt-2 text-ivory/70">
          {profile.name ? `${t("home.greet")}, ${profile.name}. ` : ""}
          {t("market.sub")}
        </p>
      </header>

      <div className="-mt-7 px-5">
        <label className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_18px_40px_-24px_rgba(0,0,0,.5)]">
          <Search size={18} className="shrink-0 opacity-50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("market.search")}
            className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
          />
        </label>
      </div>

      <div className="mt-5 space-y-4 px-5 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {list.length === 0 ? (
          <Empty title={t("market.emptyTitle")} body={t("market.emptyBody")} />
        ) : (
          list.map((p, i) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              style={{ animation: `rise-in .4s ${0.05 * i}s both` }}
              className="lift press block overflow-hidden rounded-3xl bg-white ring-1 ring-charcoal/8"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="aspect-[16/10] w-full bg-sand" />
              )}
              <div className="p-4">
                <p className="truncate text-lg font-extrabold">{p.title}</p>
                <p className="font-bold text-terracotta">{rupees(p.price)}</p>
                <p className="mt-2 flex items-center gap-1.5 truncate text-sm opacity-65">
                  <MapPin size={14} className="shrink-0" />
                  {p.seller?.name || t("market.anArtisan")}
                  {p.seller?.location ? ` · ${p.seller.location}` : ""}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
