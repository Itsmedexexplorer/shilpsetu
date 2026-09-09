import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, MessageSquare, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/catalog", label: "Catalog", Icon: LayoutGrid },
  { to: "/orders", label: "Orders", Icon: MessageSquare },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 mt-auto grid grid-cols-4 border-t border-charcoal/10 bg-ivory/95 pt-2 pb-5 backdrop-blur">
      {items.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className="press flex flex-col items-center gap-1 text-charcoal/45 data-[status=active]:text-terracotta"
          activeProps={{ className: "font-bold" }}
        >
          <Icon size={22} />
          <span className="text-[0.7rem] font-bold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
