import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/shilp/BottomNav";
import { Empty, Motif, StatusChip } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "My Catalog — SHILPSETU AI" },
      {
        name: "description",
        content: "Your own digital storefront: published listings and drafts in one place.",
      },
      { property: "og:title", content: "My Catalog" },
      { property: "og:description", content: "Every craft you have listed so far." },
    ],
  }),
  component: CatalogScreen,
});

const filters = ["All", "Published", "Drafts", "Out of stock"] as const;
const filterKey = {
  All: "catalog.all",
  Published: "catalog.published",
  Drafts: "catalog.drafts",
  "Out of stock": "catalog.soldout",
} as const;

function CatalogScreen() {
  const { myProducts: products, resetDraft } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const list = products.filter((p) =>
    filter === "All"
      ? true
      : filter === "Published"
        ? p.status === "published"
        : filter === "Out of stock"
          ? p.status === "soldout"
          : p.status === "draft",
  );

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-ivory">
      <header className="px-5 pt-6">
        <Motif className="mb-3" />
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="truncate text-[1.7rem] leading-tight font-extrabold">
            {t("catalog.title")}
          </h1>
          <p className="shrink-0 text-xs font-semibold opacity-55">
            {products.length}{" "}
            {products.length === 1 ? t("catalog.product") : t("catalog.products")}
          </p>
        </div>

        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${
                filter === f ? "bg-forest text-ivory" : "bg-sand text-charcoal/70"
              }`}
            >
              {t(filterKey[f])}
            </button>
          ))}
        </div>
      </header>


      <div className="mt-4 space-y-4 px-5 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {list.length === 0 ? (
          <Empty
            title={t("catalog.emptyTitle")}
            body={t("catalog.emptyBody")}
          />
        ) : (
          list.map((p, i) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              style={{ animation: `rise-in .4s ${0.05 * i}s both` }}
              className="press block overflow-hidden rounded-3xl bg-white ring-1 ring-charcoal/8"
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
              <div className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-extrabold">{p.title}</p>
                  <p className="font-bold text-terracotta">{rupees(p.price)}</p>
                </div>
                <StatusChip status={p.status} />
              </div>
            </Link>
          ))
        )}
      </div>

      <button
        onClick={() => {
          resetDraft();
          navigate({ to: "/capture" });
        }}
        className="press fixed right-6 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-full bg-terracotta px-6 font-extrabold text-white shadow-[0_16px_36px_-12px_rgba(0,0,0,.6)] lg:absolute"
      >
        <Plus size={20} /> {t("catalog.addNew")}
      </button>

      <BottomNav />
    </div>
  );
}
