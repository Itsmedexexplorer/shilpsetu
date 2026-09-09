import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, MessageSquare, Store, User } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";

const artisanItems = [
  { to: "/home", key: "nav.home", Icon: Home },
  { to: "/catalog", key: "nav.catalog", Icon: LayoutGrid },
  { to: "/orders", key: "nav.orders", Icon: MessageSquare },
  { to: "/profile", key: "nav.profile", Icon: User },
] as const;

const buyerItems = [
  { to: "/market", key: "nav.explore", Icon: Store },
  { to: "/orders", key: "nav.inquiries", Icon: MessageSquare },
  { to: "/profile", key: "nav.profile", Icon: User },
] as const;

/** Floating pill navigation. Screens using it should add bottom padding. */
export function BottomNav() {
  const t = useT();
  const { role } = useShilp();
  const items = role === "buyer" || role === "org" ? buyerItems : artisanItems;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:absolute"
      aria-label="Main"
    >
      <div className="animate-rise flex w-full max-w-[22rem] items-center justify-between gap-1 rounded-full border border-white/50 bg-white/85 p-1.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,.45)] backdrop-blur-xl">
        {items.map(({ to, key, Icon }) => (
          <Link
            key={to}
            to={to}
            className="press flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-charcoal/45 transition-colors"
            activeProps={{ className: "bg-forest text-ivory" }}
          >
            <Icon size={20} className="shrink-0" />
            <span className="max-w-full truncate text-[0.65rem] font-bold">
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
