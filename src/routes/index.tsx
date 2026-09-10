import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import markImg from "@/assets/shilpsetu-mark.png";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShilpSetu — Sell Your Craft Online" },
      {
        name: "description",
        content:
          "ShilpSetu helps Indian artisans list their crafts and reach buyers in minutes.",
      },
      { property: "og:title", content: "ShilpSetu" },
      {
        property: "og:description",
        content: "Sell your craft online. Simple, fast, in your language.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://shilpsetu.lovable.app/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://shilpsetu.lovable.app/" }],
  }),
  component: Splash,
});

function Splash() {
  const { ready, language, role } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const returning = ready && !!language && !!role;

  return (
    <div className="bg-forest-deep text-ivory flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-7 pt-[max(2rem,env(safe-area-inset-top))] text-center">
        <img
          src={markImg}
          alt="ShilpSetu logo"
          width={112}
          height={112}
          className="animate-rise h-24 w-24 rounded-3xl object-contain"
        />

        <h1
          className="mt-6 text-[clamp(2.4rem,12vw,3rem)] leading-none font-extrabold tracking-tight"
          style={{ animation: "rise-in .5s .1s both" }}
        >
          ShilpSetu
        </h1>

        <p
          className="text-ivory/70 mt-3 max-w-[17rem] text-[0.95rem] leading-snug"
          style={{ animation: "rise-in .5s .2s both" }}
        >
          {t("app.tagline")}
        </p>
      </div>

      <div className="px-7 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate({ to: returning ? "/home" : "/onboarding" })}
          className="press bg-terracotta w-full rounded-2xl py-4 text-lg font-extrabold text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]"
          style={{ animation: "rise-in .5s .3s both" }}
        >
          {returning ? t("splash.continue") : t("splash.start")}
        </button>

        <div className="flex items-center justify-center gap-4 py-3">
          <Link to="/language">
            <span className="text-ivory/70 text-sm font-semibold underline underline-offset-4">
              {t("splash.language")}
            </span>
          </Link>
          <span className="text-ivory/30">·</span>
          <Link to="/accounts">
            <span className="text-saffron text-sm font-semibold underline underline-offset-4">
              {t("splash.demo")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
