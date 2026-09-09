import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/shilp/BottomNav";
import { Empty, Motif } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { rupees, useShilp, type Inquiry } from "@/lib/shilp-store";

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
  { key: "new", label: "orders.new" },
  { key: "contacted", label: "orders.contacted" },
  { key: "completed", label: "orders.completed" },
];

function OrdersScreen() {
  const { receivedInquiries, sentInquiries, setInquiryStatus, role } = useShilp();
  const t = useT();
  const isBuyer = role === "buyer" || role === "org";
  const [tab, setTab] = useState<Inquiry["status"]>("new");

  const source = isBuyer ? sentInquiries : receivedInquiries;
  const list = isBuyer ? source : source.filter((i) => i.status === tab);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <header className="px-5 pt-8">
        <Motif className="mb-4" />
        <h1 className="text-[2.2rem] font-extrabold">
          {isBuyer ? t("orders.sentTitle") : t("orders.title")}
        </h1>
        {isBuyer ? (
          <p className="mt-1 text-sm opacity-65">{t("orders.sentSub")}</p>
        ) : (
          <div className="mt-5 flex gap-2">
            {tabs.map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`press rounded-full px-4 py-2 text-sm font-bold ${
                  tab === tb.key ? "bg-forest text-ivory" : "bg-sand text-charcoal/70"
                }`}
              >
                {t(tb.label)}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mt-5 space-y-3 px-5 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        {list.length === 0 ? (
          <Empty
            title={isBuyer ? t("orders.sentEmptyTitle") : t("orders.emptyTitle")}
            body={isBuyer ? t("orders.sentEmptyBody") : t("orders.emptyBody")}
          />
        ) : (
          list.map((i) => (
            <div key={i.id} className="rounded-2xl bg-white p-4 ring-1 ring-charcoal/8">
              <div className="flex items-start gap-3">
                {i.productImage || i.buyerAvatar ? (
                  <img
                    src={isBuyer ? i.productImage || i.buyerAvatar : i.buyerAvatar || i.productImage}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-sand font-extrabold text-forest">
                    {(isBuyer ? i.productTitle : i.buyer).charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-extrabold">
                    {isBuyer ? i.productTitle : i.buyer}
                  </p>
                  <p className="truncate text-sm opacity-65">
                    {isBuyer
                      ? i.sellerName || t("market.anArtisan")
                      : [i.productTitle, i.buyerLocation].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold opacity-55">{i.date}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-sand px-3 py-1">
                  {t("orders.qty")} {i.quantity}
                </span>
                <span className="rounded-full bg-sand px-3 py-1">{i.contact}</span>
                {i.productPrice ? (
                  <span className="rounded-full bg-terracotta/10 px-3 py-1 text-terracotta">
                    {rupees(i.productPrice)}
                  </span>
                ) : null}
                <span className="rounded-full bg-forest/10 px-3 py-1 text-forest">
                  {t(`orders.${i.status}`)}
                </span>
              </div>
              {i.message ? (
                <p className="mt-3 text-sm opacity-75">{i.message}</p>
              ) : null}

              {isBuyer ? (
                <Link
                  to="/product/$id"
                  params={{ id: i.productId }}
                  className="mt-3 inline-block text-sm font-bold text-terracotta"
                >
                  {t("orders.viewProduct")}
                </Link>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {i.status !== "contacted" ? (
                      <button
                        onClick={() => setInquiryStatus(i.id, "contacted")}
                        className="press rounded-xl bg-forest px-4 py-2 text-sm font-bold text-ivory"
                      >
                        {t("orders.markContacted")}
                      </button>
                    ) : null}
                    {i.status !== "completed" ? (
                      <button
                        onClick={() => setInquiryStatus(i.id, "completed")}
                        className="press rounded-xl border-2 border-charcoal/15 px-4 py-2 text-sm font-bold"
                      >
                        {t("orders.complete")}
                      </button>
                    ) : null}
                  </div>
                  <Link
                    to="/product/$id"
                    params={{ id: i.productId }}
                    className="mt-3 inline-block text-sm font-bold text-terracotta"
                  >
                    {t("orders.viewProduct")}
                  </Link>
                </>
              )}

            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
