import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import demoAfter from "@/assets/vase-after.jpg";
import { Btn, Screen, Title, TopBar } from "@/components/shilp/ui";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review your listing — SHILPSETU AI" },
      {
        name: "description",
        content: "Final check before your craft becomes visible to buyers.",
      },
      { property: "og:title", content: "Review your listing" },
      { property: "og:description", content: "Edit anything, then publish." },
    ],
  }),
  component: ReviewScreen,
});

function ReviewScreen() {
  const { draft, publishDraft } = useShilp();
  const navigate = useNavigate();

  const rows: [string, string, "/edit" | "/costs" | "/price"][] = [
    ["Title", draft.title, "/edit"],
    ["Description", draft.description, "/edit"],
    ["Price", rupees(draft.price), "/price"],
    ["Category", draft.category, "/edit"],
    ["Material", draft.material, "/edit"],
    ["Keywords", draft.keywords.join(", "), "/edit"],
  ];

  const publish = () => {
    const p = publishDraft("published");
    navigate({ to: "/published", search: { id: p.id } });
  };

  return (
    <Screen>
      <TopBar title="Review & Publish" step="8 / 8" />
      <Title sub="Once published, buyers across India can see this listing.">
        Review your listing
      </Title>

      <div className="px-5">
        <img
          src={draft.photo ?? demoAfter}
          alt={draft.title || "Product"}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-3xl object-cover"
        />

        <div className="mt-5 divide-y divide-charcoal/10 overflow-hidden rounded-3xl bg-white ring-1 ring-charcoal/8">
          {rows.map(([label, value, to]) => (
            <div key={label} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] font-bold tracking-[0.12em] uppercase opacity-55">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold break-words">
                  {value || "—"}
                </p>
              </div>
              <Link
                to={to}
                className="press shrink-0 rounded-xl bg-sand px-3 py-2 text-xs font-bold"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sage/20 p-4 text-xs font-semibold text-forest">
          <Eye size={16} className="mt-0.5 shrink-0" />
          Publishing makes this product visible to buyers and shareable by link or QR.
        </p>
      </div>

      <div className="mt-auto space-y-2 px-5 pt-8 pb-8">
        <Btn variant="forest" onClick={publish}>
          Publish Product
        </Btn>
        <Btn variant="ghost" onClick={() => navigate({ to: "/edit" })}>
          Keep editing
        </Btn>
      </div>
    </Screen>
  );
}
