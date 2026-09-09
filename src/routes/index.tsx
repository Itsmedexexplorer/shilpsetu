import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, IndianRupee, Mic, Sparkles } from "lucide-react";
import heroImg from "@/assets/artisan-hero.jpg";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHILPSETU AI — From Craft to Commerce in 60 Seconds" },
      {
        name: "description",
        content:
          "SHILPSETU AI turns a photo and a voice note into a buyer-ready listing for Indian artisans.",
      },
      { property: "og:title", content: "SHILPSETU AI" },
      {
        property: "og:description",
        content: "From Craft to Commerce in 60 Seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { ready, language, role } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const returning = ready && !!language && !!role;

  const steps = [
    { Icon: Camera, label: t("splash.step1") },
    { Icon: Mic, label: t("splash.step2") },
    { Icon: IndianRupee, label: t("splash.step3") },
  ];

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-forest-deep text-ivory">
      {/* full-bleed craft photograph */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Indian artisan shaping clay on a potter's wheel"
          width={1024}
          height={1280}
          className="animate-zoom h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/55 via-forest-deep/80 to-forest-deep" />
      </div>

      <div className="relative flex flex-1 flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <span className="animate-rise inline-flex w-fit items-center gap-1.5 rounded-full bg-ivory/15 px-3 py-1.5 text-[0.7rem] font-extrabold text-ivory backdrop-blur-sm">
          <Sparkles size={13} className="text-saffron" /> {t("splash.badge")}
        </span>

        <div className="motif-band mt-6 h-1 w-16 rounded-full" />

        <h1 className="mt-4 text-[clamp(2.6rem,13vw,3.4rem)] leading-[0.92] font-extrabold tracking-tight">
          SHILPSETU
          <span className="ml-2 inline-block rounded-xl bg-terracotta px-2 text-white">
            AI
          </span>
        </h1>

        <p className="mt-3 max-w-[18rem] text-[0.98rem] leading-snug text-ivory/75">
          {t("app.tagline")}
        </p>

        <p className="font-display mt-5 text-[clamp(1.35rem,6.5vw,1.75rem)] leading-tight font-extrabold">
          {t("app.line1")}{" "}
          <span className="text-saffron">{t("app.line2")}</span>
        </p>

        <div className="mt-auto pt-8">
          <div className="grid grid-cols-3 gap-2">
            {steps.map(({ Icon, label }, i) => (
              <div
                key={label}
                className="rounded-2xl bg-ivory/10 p-2.5 ring-1 ring-ivory/15 backdrop-blur-sm"
                style={{ animation: `rise-in .5s ${0.2 + i * 0.1}s both` }}
              >
                <Icon size={16} className="text-saffron" />
                <p className="mt-1.5 text-[0.68rem] leading-tight font-bold text-ivory/85">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate({ to: returning ? "/home" : "/onboarding" })}
            className="press mt-4 w-full rounded-2xl bg-terracotta py-4 text-lg font-extrabold text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]"
          >
            {returning ? t("splash.continue") : t("splash.start")}
          </button>

          <div className="flex items-center justify-center gap-4 py-2.5">
            <Link to="/language">
              <span className="text-sm font-semibold text-ivory/70 underline underline-offset-4">
                {t("splash.language")}
              </span>
            </Link>
            <span className="text-ivory/30">·</span>
            <Link to="/accounts">
              <span className="text-sm font-semibold text-saffron underline underline-offset-4">
                {t("splash.demo")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
