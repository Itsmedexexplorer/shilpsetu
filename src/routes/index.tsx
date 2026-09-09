import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, IndianRupee, Mic, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/artisan-hero.jpg";
import { Btn } from "@/components/shilp/ui";
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
    ],
  }),
  component: Splash,
});

function Splash() {
  const { ready, language, role } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(id);
  }, []);

  const returning = ready && !!language && !!role;

  const steps = [
    { Icon: Camera, label: t("splash.step1") },
    { Icon: Mic, label: t("splash.step2") },
    { Icon: IndianRupee, label: t("splash.step3") },
  ];

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-ivory text-charcoal">
      {/* warm arch of colour behind the wordmark */}
      <div className="pointer-events-none absolute -top-28 -right-24 h-72 w-72 rounded-full bg-terracotta/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-forest/15 blur-2xl" />

      <div
        className={`relative flex flex-1 flex-col px-6 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-all duration-700 ${
          show ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1.5 text-xs font-extrabold text-forest">
          <Sparkles size={14} /> {t("splash.badge")}
        </span>

        <h1 className="mt-6 text-[3rem] leading-[0.94] font-extrabold tracking-tight">
          SHILPSETU
          <span className="ml-2 inline-block rounded-xl bg-terracotta px-2 text-white">
            AI
          </span>
        </h1>
        <p className="mt-4 max-w-[19rem] text-[1.05rem] opacity-70">
          {t("app.tagline")}
        </p>

        {/* tilted craft card */}
        <div className="relative mt-8 h-[38vh] min-h-[190px]">
          <div className="absolute inset-x-6 top-4 h-full rotate-[-6deg] rounded-[2rem] bg-sand" />
          <div className="absolute inset-x-2 top-0 h-full rotate-[3deg] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]">
            <img
              src={heroImg}
              alt="Indian artisan shaping clay on a potter's wheel"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4">
              <p className="font-display text-2xl leading-tight font-extrabold text-ivory">
                {t("app.line1")}
                <br />
                <span className="text-saffron">{t("app.line2")}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-2">
          {steps.map(({ Icon, label }, i) => (
            <div
              key={label}
              className="rounded-2xl bg-white p-3 ring-1 ring-charcoal/8"
              style={{ animation: `rise-in .5s ${0.25 + i * 0.12}s both` }}
            >
              <Icon size={18} className="text-terracotta" />
              <p className="mt-2 text-[0.72rem] leading-tight font-bold">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-2 pt-8">
          <Btn onClick={() => navigate({ to: returning ? "/home" : "/onboarding" })}>
            {returning ? t("splash.continue") : t("splash.start")}
          </Btn>
          <Link to="/language" className="block py-2 text-center">
            <span className="text-sm font-semibold text-forest underline underline-offset-4">
              {t("splash.language")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
