import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/artisan-hero.jpg";
import { Btn, Motif } from "@/components/shilp/ui";
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
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);

  const start = () => {
    if (ready && language && role) navigate({ to: "/home" });
    else navigate({ to: "/onboarding" });
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-forest-deep text-ivory">
      <img
        src={heroImg}
        alt="Artisan shaping clay on a potter's wheel"
        width={1024}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/85 via-forest-deep/70 to-forest-deep" />

      <div
        className={`relative flex flex-1 flex-col px-6 pt-16 pb-8 transition-all duration-700 ${show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <Motif className="mb-8 animate-pulse" />
        <h1 className="text-[3.4rem] leading-[0.92] font-extrabold">
          SHILPSETU
          <br />
          <span className="text-terracotta">AI</span>
        </h1>
        <p className="mt-5 max-w-[18rem] text-lg text-ivory/80">
          From Craft to Commerce in 60 Seconds.
        </p>

        <div className="mt-10 space-y-3">
          {["Same hands.", "Bigger markets."].map((t, i) => (
            <p
              key={t}
              className="font-display text-2xl font-extrabold text-saffron"
              style={{ animation: `rise-in .6s ${0.3 + i * 0.15}s both` }}
            >
              {t}
            </p>
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-12">
          <Btn onClick={start}>Get Started</Btn>
          <Link to="/language" className="block text-center">
            <span className="text-sm text-ivory/60 underline underline-offset-4">
              Change language
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
