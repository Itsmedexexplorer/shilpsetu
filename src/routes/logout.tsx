import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Btn, Motif, Screen, TopBar } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/logout")({
  head: () => ({
    meta: [
      { title: "Log out — SHILPSETU AI" },
      {
        name: "description",
        content: "Sign out of SHILPSETU AI and clear this device's saved craft data.",
      },
      { property: "og:title", content: "Log out of SHILPSETU AI" },
      { property: "og:description", content: "Sign out safely from this device." },
    ],
  }),
  component: LogoutScreen,
});

function LogoutScreen() {
  const { signOut, artisanName } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const confirm = () => {
    signOut();
    setDone(true);
  };

  return (
    <Screen className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {!done ? <TopBar /> : null}

      <div className="animate-rise flex flex-1 flex-col justify-center py-10">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-terracotta/12 text-terracotta">
          <LogOut size={28} />
        </div>
        <Motif className="mt-6" />
        <h1 className="mt-4 text-[2.1rem] leading-tight font-extrabold">
          {done ? t("logout.done") : t("logout.title")}
        </h1>
        <p className="mt-3 max-w-[20rem] text-[0.98rem] opacity-70">
          {done ? t("logout.doneBody") : t("logout.body")}
        </p>
        {!done ? (
          <p className="mt-4 text-sm font-bold text-forest">{artisanName} ji</p>
        ) : null}
      </div>

      <div className="space-y-2 pb-8">
        {done ? (
          <Btn variant="forest" onClick={() => navigate({ to: "/" })}>
            {t("logout.back")}
          </Btn>
        ) : (
          <>
            <Btn onClick={confirm}>{t("logout.confirm")}</Btn>
            <Btn variant="outline" onClick={() => navigate({ to: "/profile" })}>
              {t("logout.stay")}
            </Btn>
          </>
        )}
      </div>
    </Screen>
  );
}
