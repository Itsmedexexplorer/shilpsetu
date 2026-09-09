import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Btn, Field, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Your details — SHILPSETU AI" },
      {
        name: "description",
        content: "Add your name, age and location so buyers know who made the craft.",
      },
      { property: "og:title", content: "Tell us about you" },
      {
        property: "og:description",
        content: "Your name and place appear on every listing you make.",
      },
    ],
  }),
  component: SetupScreen,
});

function SetupScreen() {
  const { profile, setProfile, role } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const valid = profile.name.trim().length > 1;

  return (
    <Screen>
      <TopBar title={t("setup.step")} />
      <Title sub={t("setup.sub")}>{t("setup.title")}</Title>

      <div className="space-y-4 px-5">
        <Field
          label={t("setup.name")}
          placeholder={t("setup.namePh")}
          value={profile.name}
          onChange={(e) => setProfile({ name: e.target.value })}
        />
        <Field
          label={t("setup.age")}
          placeholder={t("setup.agePh")}
          inputMode="numeric"
          value={profile.age}
          onChange={(e) => setProfile({ age: e.target.value })}
        />
        <Field
          label={t("setup.location")}
          placeholder={t("setup.locationPh")}
          value={profile.location}
          onChange={(e) => setProfile({ location: e.target.value })}
        />
        {role !== "buyer" ? (
          <Field
            label={t("setup.craft")}
            placeholder={t("setup.craftPh")}
            value={profile.craft}
            onChange={(e) => setProfile({ craft: e.target.value })}
          />
        ) : null}
        <p className="text-xs opacity-55">{t("setup.note")}</p>
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn
          disabled={!valid}
          className={valid ? "" : "opacity-40"}
          onClick={() =>
            navigate({ to: role === "artisan" ? "/home" : "/market" })
          }
        >
          {t("common.continue")}
        </Btn>
      </div>
    </Screen>
  );
}
