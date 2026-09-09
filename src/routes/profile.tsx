import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Globe,
  Info,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Package,
} from "lucide-react";
import artisanImg from "@/assets/artisan-hero.jpg";
import { BottomNav } from "@/components/shilp/BottomNav";
import { Motif } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SHILPSETU AI" },
      {
        name: "description",
        content: "Your artisan identity, products, language settings and support.",
      },
      { property: "og:title", content: "My Profile" },
      { property: "og:description", content: "Your journey with SHILPSETU AI." },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const { artisanName, products } = useShilp();
  const t = useT();
  const navigate = useNavigate();

  const rows = [
    { Icon: Package, label: t("profile.products"), to: "/catalog" as const },
    { Icon: MessageSquare, label: t("profile.orders"), to: "/orders" as const },
    { Icon: Globe, label: t("profile.language"), to: "/language" as const },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <header className="craft-texture bg-forest-deep px-5 pt-8 pb-16 text-ivory">
        <Motif className="mb-4" />
        <h1 className="text-[2.2rem] font-extrabold">{t("profile.title")}</h1>
      </header>

      <div className="-mt-10 px-5">
        <div className="flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-charcoal/8">
          <img
            src={artisanImg}
            alt="Artisan portrait"
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold">{artisanName} Devi</p>
            <p className="text-sm opacity-65">Kutch, Gujarat</p>
            <p className="mt-1 text-xs font-bold text-terracotta">
              Pottery · {products.length} {t("profile.listed")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2 px-5">
        {rows.map(({ Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className="press flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-charcoal/8"
          >
            <Icon size={20} className="shrink-0 text-forest" />
            <span className="min-w-0 flex-1 truncate font-bold">{label}</span>
            <ChevronRight size={18} className="shrink-0 opacity-40" />
          </Link>
        ))}

        <button
          onClick={() => navigate({ to: "/onboarding" })}
          className="press flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-charcoal/8"
        >
          <LifeBuoy size={20} className="shrink-0 text-forest" />
          <span className="min-w-0 flex-1 truncate font-bold">{t("profile.help")}</span>
          <ChevronRight size={18} className="shrink-0 opacity-40" />
        </button>

        <Link
          to="/logout"
          className="press mt-2 flex items-center gap-3 rounded-2xl border-2 border-terracotta/30 bg-terracotta/8 p-4 text-terracotta"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate font-extrabold">
            {t("profile.logout")}
          </span>
          <ChevronRight size={18} className="shrink-0 opacity-50" />
        </Link>
      </div>

      <section className="mt-6 px-5 pb-32">
        <div className="rounded-3xl bg-sand p-5">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-forest" />
            <p className="font-extrabold">{t("profile.about")}</p>
          </div>
          <p className="mt-2 text-sm opacity-70">
            We are not building another marketplace. We are building the AI layer that
            makes an artisan marketplace-ready — photo, story and fair price in about a
            minute.
          </p>
          <p className="mt-3 font-display text-lg font-extrabold text-terracotta">
            Same hands. Bigger markets.
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
