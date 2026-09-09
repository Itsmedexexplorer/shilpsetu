import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/shilp/BottomNav";
import { Empty, Motif } from "@/components/shilp/ui";
import { useShilp, type Inquiry } from "@/lib/shilp-store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders & Inquiries — SHILPSETU AI" },
      {
        name: "description",
        content: "Track buyer inquiries from new to contacted to completed.",
      },
      { property: "og:title", content: "Orders & Inquiries" },
      { property: "og:description", content: "Every buyer who reached out to you." },
    ],
  }),
  component: OrdersScreen,
});

const tabs: { key: Inquiry["status"]; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "completed", label: "Completed" },
];

function OrdersScreen() {
  const { inquiries, setInquiryStatus } = useShilp();
  const [tab, setTab] = useState<Inquiry["status"]>("new");
  const list = inquiries.filter((i) => i.status === tab);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <header className="px-5 pt-8">
        <Motif className="mb-4" />
        <h1 className="text-[2.2rem] font-extrabold">Inquiries</h1>
        <div className="mt-5 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`press rounded-full px-4 py-2 text-sm font-bold ${
                tab === t.key ? "bg-forest text-ivory" : "bg-sand text-charcoal/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-5 space-y-3 px-5 pb-8">
        {list.length === 0 ? (
          <Empty
            title="Nothing in this list"
            body="When a buyer sends an inquiry from your listing, it appears here."
          />
        ) : (
          list.map((i) => (
            <div key={i.id} className="rounded-2xl bg-white p-4 ring-1 ring-charcoal/8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">{i.buyer}</p>
                  <p className="truncate text-sm opacity-65">{i.productTitle}</p>
                </div>
                <span className="shrink-0 text-xs font-bold opacity-55">{i.date}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-sand px-3 py-1">Qty {i.quantity}</span>
                <span className="rounded-full bg-sand px-3 py-1">{i.contact}</span>
              </div>
              {i.message ? (
                <p className="mt-3 text-sm opacity-75">{i.message}</p>
              ) : null}
              <div className="mt-4 flex gap-2">
                {i.status !== "contacted" ? (
                  <button
                    onClick={() => setInquiryStatus(i.id, "contacted")}
                    className="press rounded-xl bg-forest px-4 py-2 text-sm font-bold text-ivory"
                  >
                    Mark contacted
                  </button>
                ) : null}
                {i.status !== "completed" ? (
                  <button
                    onClick={() => setInquiryStatus(i.id, "completed")}
                    className="press rounded-xl border-2 border-charcoal/15 px-4 py-2 text-sm font-bold"
                  >
                    Complete
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
