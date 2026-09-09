import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Btn, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { LANGUAGES, useShilp, type LangCode } from "@/lib/shilp-store";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose your language — SHILPSETU AI" },
      {
        name: "description",
        content: "Use SHILPSETU AI in Hindi, English, Kannada, Tamil or Telugu.",
      },
      { property: "og:title", content: "Choose your language" },
      { property: "og:description", content: "Apni bhasha chuniye." },
    ],
  }),
  component: LanguageScreen,
});

function LanguageScreen() {
  const { language, set } = useShilp();
  const t = useT();
  const navigate = useNavigate();

  const pick = (code: LangCode) => set({ language: code });

  return (
    <Screen>
      <TopBar title={t("lang.step")} />
      <Title sub={t("lang.sub")}>{t("lang.title")}</Title>

      <div className="space-y-3 px-5">
        {LANGUAGES.map((l, i) => {
          const active = language === l.code;
          return (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              style={{ animation: `rise-in .4s ${0.05 * i}s both` }}
              className={`press flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left ${
                active
                  ? "border-forest bg-forest text-ivory"
                  : "border-charcoal/12 bg-white"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-xl font-extrabold">{l.native}</span>
                <span className="block text-xs opacity-60">{l.label}</span>
              </span>
              {active ? (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-terracotta text-white">
                  <Check size={18} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto px-5 pt-6 pb-8">
        <Btn
          disabled={!language}
          onClick={() => navigate({ to: "/role" })}
          className={!language ? "opacity-40" : ""}
        >
          {t("common.continue")}
        </Btn>
      </div>
    </Screen>
  );
}
