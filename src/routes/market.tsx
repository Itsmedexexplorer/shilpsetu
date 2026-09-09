import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
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
          "Search handmade products by craft, price and place, then contact the maker directly.",
      },
      { property: "og:title", content: "Explore handmade crafts" },
      {
        property: "og:description",
        content: "Every listing comes straight from the artisan who made it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketScreen,
});

type Sort = "new" | "low" | "high";

function MarketScreen() {
  const { marketProducts, profile } = useShilp();
  const t = useT();
  const [q, setQ] = useState("");
  const [craft, setCraft] = useState("");
  const [place, setPlace] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("new");
  const [openFilters, setOpenFilters] = useState(false);

  const crafts = useMemo(
    () =>
      Array.from(
        new Set(
          marketProducts
            .map((p) => (p.craft || p.category || "").trim())
            .filter(Boolean),
        ),
      ).slice(0, 12),
    [marketProducts],
  );

  const places = useMemo(
    () =>
      Array.from(
        new Set(
          marketProducts.map((p) => (p.seller?.location || "").trim()).filter(Boolean),
        ),
      ).slice(0, 12),
    [marketProducts],
  );

  const ceiling = useMemo(
    () =>
      marketProducts.reduce((max, p) => Math.max(max, Number(p.price) || 0), 0) || 0,
    [marketProducts],
  );

  const term = q.trim().toLowerCase();
  const list = useMemo(() => {
    const out = marketProducts.filter((p) => {
      const hay = [
        p.title,
        p.craft,
        p.category,
        p.material,
        p.seller?.name,
        p.seller?.location,
        ...(p.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (term && !hay.includes(term)) return false;
      if (craft && (p.craft || p.category || "").trim() !== craft) return false;
      if (place && (p.seller?.location || "").trim() !== place) return false;
      if (maxPrice !== null && (Number(p.price) || 0) > maxPrice) return false;
      return true;
    });
    if (sort === "low") out.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") out.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "new") out.sort((a, b) => b.createdAt - a.createdAt);
    return out;
  }, [marketProducts, term, craft, place, maxPrice, sort]);

  const activeCount =
    (craft ? 1 : 0) + (place ? 1 : 0) + (maxPrice !== null ? 1 : 0) + (sort !== "new" ? 1 : 0);

  const clear = () => {
    setCraft("");
    setPlace("");
    setMaxPrice(null);
    setSort("new");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <header className="craft-texture bg-forest-deep px-5 pt-8 pb-12 text-ivory">
        <Motif className="mb-4" />
        <h1 className="text-[2rem] leading-tight font-extrabold text-balance">
          {t("market.title")}
        </h1>
        <p className="mt-2 text-sm text-ivory/70">
          {profile.name ? `${t("home.greet")}, ${profile.name}. ` : ""}
          {t("market.sub")}
        </p>
      </header>

      <div className="-mt-7 px-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-[0_18px_40px_-24px_rgba(0,0,0,.5)]">
          <label className="flex min-w-0 items-center gap-3">
            <Search size={18} className="shrink-0 opacity-50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("market.search")}
              className="min-w-0 flex-1 bg-transparent py-2 text-base font-semibold outline-none"
            />
          </label>
          <button
            onClick={() => setOpenFilters((v) => !v)}
            aria-label={t("market.filters")}
            className={`press relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
              openFilters || activeCount ? "bg-forest text-ivory" : "bg-sand text-forest"
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeCount ? (
              <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-terracotta text-[0.62rem] font-extrabold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {openFilters ? (
        <div className="animate-rise mt-3 space-y-4 px-5">
          <div className="rounded-3xl bg-white p-4 ring-1 ring-charcoal/8">
            <FilterRow title={t("market.byCraft")}>
              <Chip active={!craft} onClick={() => setCraft("")}>
                {t("catalog.all")}
              </Chip>
              {crafts.map((c) => (
                <Chip key={c} active={craft === c} onClick={() => setCraft(c)}>
                  {c}
                </Chip>
              ))}
              {crafts.length === 0 ? (
                <span className="text-xs opacity-55">{t("market.noFacets")}</span>
              ) : null}
            </FilterRow>

            <FilterRow title={t("market.byPlace")}>
              <Chip active={!place} onClick={() => setPlace("")}>
                {t("catalog.all")}
              </Chip>
              {places.map((c) => (
                <Chip key={c} active={place === c} onClick={() => setPlace(c)}>
                  {c}
                </Chip>
              ))}
              {places.length === 0 ? (
                <span className="text-xs opacity-55">{t("market.noFacets")}</span>
              ) : null}
            </FilterRow>

            <FilterRow title={t("market.byPrice")}>
              <Chip active={maxPrice === null} onClick={() => setMaxPrice(null)}>
                {t("market.anyPrice")}
              </Chip>
              {[500, 1500, 3000, 10000]
                .filter((v) => ceiling === 0 || v < ceiling * 2)
                .map((v) => (
                  <Chip key={v} active={maxPrice === v} onClick={() => setMaxPrice(v)}>
                    {t("market.under")} {rupees(v)}
                  </Chip>
                ))}
            </FilterRow>

            <FilterRow title={t("market.sort")}>
              {(
                [
                  ["new", t("market.sortNew")],
                  ["low", t("market.sortLow")],
                  ["high", t("market.sortHigh")],
                ] as [Sort, string][]
              ).map(([k, label]) => (
                <Chip key={k} active={sort === k} onClick={() => setSort(k)}>
                  {label}
                </Chip>
              ))}
            </FilterRow>

            {activeCount ? (
              <button
                onClick={clear}
                className="press mt-3 inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-extrabold text-terracotta"
              >
                <X size={13} /> {t("market.clear")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-4 px-5 text-xs font-bold tracking-wide uppercase opacity-50">
        {list.length} {list.length === 1 ? t("market.result") : t("market.results")}
      </p>

      <div className="mt-3 space-y-4 px-5 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {list.length === 0 ? (
          <Empty
            title={
              marketProducts.length ? t("market.noMatchTitle") : t("market.emptyTitle")
            }
            body={marketProducts.length ? t("market.noMatchBody") : t("market.emptyBody")}
          />
        ) : (
          list.map((p, i) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              style={{ animation: `rise-in .4s ${Math.min(i, 6) * 0.05}s both` }}
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
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="truncate text-lg font-extrabold">{p.title}</p>
                  <p className="shrink-0 font-extrabold text-terracotta">
                    {rupees(p.price)}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {p.seller?.avatar ? (
                    <img
                      src={p.seller.avatar}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand text-xs font-extrabold text-forest">
                      {(p.seller?.name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <p className="flex min-w-0 items-center gap-1.5 truncate text-sm opacity-65">
                    <MapPin size={13} className="shrink-0" />
                    {p.seller?.name || t("market.anArtisan")}
                    {p.seller?.location ? ` · ${p.seller.location}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function FilterRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-[0.65rem] font-extrabold tracking-[0.14em] uppercase opacity-50">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`press max-w-full truncate rounded-full px-3 py-1.5 text-xs font-bold ${
        active ? "bg-forest text-ivory" : "bg-sand text-charcoal/70"
      }`}
    >
      {children}
    </button>
  );
}
