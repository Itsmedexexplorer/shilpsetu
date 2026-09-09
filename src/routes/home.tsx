import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Camera, IndianRupee, LayoutGrid, Plus } from "lucide-react";
import { BottomNav } from "@/components/shilp/BottomNav";
import { Empty, Motif, StatusChip } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Your craft studio — SHILPSETU AI" },
      {
        name: "description",
        content:
          "Add a new product, manage your catalog and check fair prices in one place.",
      },
      { property: "og:title", content: "Your craft studio" },
      {
        property: "og:description",
        content: "Turn your craft into opportunities today.",
      },
    ],
  }),
  component: HomeScreen,
});

function HomeScreen() {
  const { artisanName, products, resetDraft } = useShilp();
  const t = useT();
  const navigate = useNavigate();

  const startNew = () => {
    resetDraft();
    navigate({ to: "/capture" });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <header className="craft-texture bg-forest-deep px-5 pt-8 pb-10 text-ivory">
        <Motif className="mb-5" />
        <h1 className="text-[2.2rem] leading-tight font-extrabold">
          {t("home.greet")}, {artisanName} ji
        </h1>
        <p className="mt-2 text-ivory/70">{t("home.sub")}</p>
      </header>

      <div className="-mt-6 px-5">
        <button
          onClick={startNew}
          className="press relative w-full overflow-hidden rounded-3xl bg-terracotta p-6 text-left text-white shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)]"
        >
          <span className="absolute -right-8 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
          <span className="relative flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">
              <Plus size={28} />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl leading-tight font-extrabold">
                {t("home.add")}
              </span>
              <span className="block text-sm text-white/80">
                {t("home.addSub")}
              </span>
            </span>
          </span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Tile to="/catalog" Icon={LayoutGrid} label={t("home.catalog")} tone="forest" />
        <Tile to="/price" Icon={IndianRupee} label={t("home.price")} tone="sand" />
        <Tile to="/capture" Icon={Camera} label={t("home.capture")} tone="sand" />
        <Tile to="/profile" Icon={BookOpen} label={t("home.learn")} tone="forest" />
      </div>

      <section className="mt-8 px-5 pb-32">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-extrabold">{t("home.recent")}</h2>
          <Link to="/catalog" className="text-sm font-bold text-terracotta">
            {t("common.seeAll")}
          </Link>
        </div>

        {products.length === 0 ? (
          <Empty
            title={t("home.emptyTitle")}
            body={t("home.emptyBody")}
          />
        ) : (
          <div className="space-y-3">
            {products.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                to="/product/$id"
                params={{ id: p.id }}
                className="press flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-charcoal/8"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-sand" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.title}</p>
                  <p className="text-sm font-semibold text-terracotta">
                    {rupees(p.price)}
                  </p>
                </div>
                <StatusChip status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}

function Tile({
  to,
  Icon,
  label,
  tone,
}: {
  to: string;
  Icon: typeof Camera;
  label: string;
  tone: "forest" | "sand";
}) {
  return (
    <Link
      to={to}
      className={`press flex h-28 flex-col justify-between rounded-3xl p-4 ${
        tone === "forest" ? "bg-forest text-ivory" : "bg-sand text-charcoal"
      }`}
    >
      <Icon size={24} />
      <span className="text-base leading-tight font-extrabold">{label}</span>
    </Link>
  );
}
