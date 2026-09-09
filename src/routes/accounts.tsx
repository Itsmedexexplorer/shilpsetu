import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Btn, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { DEMO_ACCOUNTS, useShilp, type Role } from "@/lib/shilp-store";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Switch profile — SHILPSETU AI" },
      {
        name: "description",
        content:
          "Switch between your artisan, buyer and organization profiles, or try a ready-made demo profile.",
      },
      { property: "og:title", content: "Switch profile" },
      {
        property: "og:description",
        content: "One device, many profiles — artisan, buyer or organization.",
      },
    ],
  }),
  component: AccountsScreen,
});

const roleIcon: Record<Role, typeof Sparkles> = {
  artisan: Sparkles,
  buyer: ShoppingBag,
  org: Building2,
};

function homeFor(role: Role) {
  return role === "artisan" ? "/home" : "/market";
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return <span className="text-lg font-extrabold">{letters || "?"}</span>;
}

function AccountsScreen() {
  const { accounts, accountId, useAccount, startDemo, removeAccount } = useShilp();
  const t = useT();
  const navigate = useNavigate();

  const open = (role: Role) => navigate({ to: homeFor(role) });

  return (
    <Screen>
      <TopBar title={t("accounts.step")} />
      <Title sub={t("accounts.sub")}>{t("accounts.title")}</Title>

      <div className="space-y-3 px-5">
        {accounts.map((a, i) => {
          const Icon = roleIcon[a.role];
          const active = a.id === accountId;
          return (
            <div
              key={a.id}
              style={{ animation: `rise-in .4s ${0.05 * i}s both` }}
              className={`flex items-center gap-3 rounded-3xl border-2 p-4 ${
                active
                  ? "border-terracotta bg-terracotta/10"
                  : "border-charcoal/12 bg-white"
              }`}
            >
              <button
                onClick={() => {
                  useAccount(a.id);
                  open(a.role);
                }}
                className="press flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand text-forest">
                  {a.profile.avatar ? (
                    <img
                      src={a.profile.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Initials name={a.profile.name} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-extrabold">
                    {a.profile.name || t("profile.noName")}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm opacity-65">
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">
                      {t(`role.${a.role}`)}
                      {a.profile.location ? ` · ${a.profile.location}` : ""}
                      {a.demo ? ` · ${t("accounts.demoTag")}` : ""}
                    </span>
                  </span>
                </span>
              </button>
              {active ? (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-terracotta text-white">
                  <Check size={16} />
                </span>
              ) : (
                <button
                  aria-label={t("accounts.remove")}
                  onClick={() => removeAccount(a.id)}
                  className="press grid h-8 w-8 shrink-0 place-items-center rounded-full bg-charcoal/6 text-charcoal/50"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          );
        })}

        {accounts.length === 0 ? (
          <p className="rounded-3xl bg-sand p-5 text-sm opacity-70">
            {t("accounts.empty")}
          </p>
        ) : null}
      </div>

      <section className="mt-7 px-5">
        <div className="flex items-center gap-2">
          <Wand2 size={18} className="text-terracotta" />
          <h2 className="font-extrabold">{t("accounts.demoTitle")}</h2>
        </div>
        <p className="mt-1 text-sm opacity-65">{t("accounts.demoSub")}</p>

        <div className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((d) => {
            const Icon = roleIcon[d.role];
            return (
              <button
                key={d.id}
                onClick={() => {
                  startDemo(d.id);
                  open(d.role);
                }}
                className="press flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-charcoal/8"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest text-ivory">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">
                    {d.profile.name}
                  </span>
                  <span className="block truncate text-xs opacity-60">
                    {t(`role.${d.role}`)} · {d.profile.location}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-auto space-y-2 px-5 pt-8 pb-8">
        <Btn onClick={() => navigate({ to: "/role" })}>
          <span className="inline-flex items-center gap-2">
            <Plus size={18} /> {t("accounts.add")}
          </span>
        </Btn>
      </div>
    </Screen>
  );
}
