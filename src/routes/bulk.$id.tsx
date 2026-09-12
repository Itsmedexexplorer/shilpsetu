import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Package } from "lucide-react";
import { useState } from "react";
import { AreaField, Btn, Field, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { rupees, useShilp } from "@/lib/shilp-store";
import { isContact, LIMITS, toAmount } from "@/lib/validate";

export const Route = createFileRoute("/bulk/$id")({
  head: () => ({
    meta: [
      { title: "Place a bulk order — SHILPSETU AI" },
      {
        name: "description",
        content:
          "Organisations can request large handmade orders directly from the artisan, with quantity, target price and delivery date.",
      },
      { property: "og:title", content: "Bulk order request" },
      {
        property: "og:description",
        content: "Order handmade crafts in quantity, straight from the maker.",
      },
    ],
  }),
  component: BulkScreen,
});

const presets = ["10", "25", "50", "100"];

function BulkScreen() {
  const { id } = Route.useParams();
  const { products, addInquiry, profile } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [form, setForm] = useState({
    org: profile.name,
    person: profile.name,
    contact: "",
    qty: "25",
    unit: "",
    deadline: "",
    deliverTo: profile.location,
    notes: "",
  });
  const [newId, setNewId] = useState<string | null>(null);

  const qty = Math.min(toAmount(form.qty, LIMITS.quantity), 99999);
  const unit = toAmount(form.unit) || toAmount(String(product?.price ?? ""));
  const total = qty * unit;
  const contactOk = isContact(form.contact);
  const valid = Boolean(form.org.trim()) && contactOk && qty > 0;

  const send = () => {
    const created = addInquiry({
      buyer: form.person.trim() || form.org.trim(),
      buyerAvatar: profile.avatar,
      buyerLocation: profile.location,
      contact: form.contact.trim(),
      productId: id,
      quantity: String(qty),
      message: form.notes,
      offerPrice: form.unit,
      kind: "bulk",
      orgName: form.org.trim(),
      deadline: form.deadline.trim(),
      deliverTo: form.deliverTo.trim(),
    });
    setNewId(created);
  };

  if (newId) {
    return (
      <Screen tone="forest">
        <div className="craft-texture flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-sage text-forest-deep">
            <Check size={36} strokeWidth={3} />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold">{t("bulk.sentTitle")}</h1>
          <p className="mt-2 text-ivory/70">{t("bulk.sentBody")}</p>
          <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold">
            {qty} × {rupees(unit)} = {rupees(total)}
          </p>
          <div className="mt-9 w-full space-y-2">
            {form.unit.replace(/[^\d]/g, "") ? (
              <Btn
                onClick={() => navigate({ to: "/negotiate/$id", params: { id: newId } })}
              >
                {t("coach.title")}
              </Btn>
            ) : null}
            <Btn
              variant={form.unit.replace(/[^\d]/g, "") ? "outline" : "primary"}
              onClick={() => navigate({ to: "/orders" })}
            >
              {t("bulk.seeOrders")}
            </Btn>
            <Link to="/market" className="block py-2 text-sm text-ivory/70 underline">
              {t("bulk.keepBrowsing")}
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title={t("bulk.top")} />
      <Title sub={product ? product.title : undefined}>{t("bulk.title")}</Title>

      <div className="space-y-4 px-5">
        {product ? (
          <div className="flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-charcoal/8">
            {product.image ? (
              <img
                src={product.image}
                alt=""
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sand text-forest">
                <Package size={22} />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-extrabold">{product.title}</p>
              <p className="text-sm font-bold text-terracotta">
                {rupees(product.price)} {t("bulk.perPiece")}
              </p>
            </div>
          </div>
        ) : null}

        <Field
          label={t("bulk.org")}
          placeholder={t("bulk.orgPh")}
          value={form.org}
          onChange={(e) => setForm({ ...form, org: e.target.value })}
        />
        <Field
          label={t("bulk.person")}
          value={form.person}
          onChange={(e) => setForm({ ...form, person: e.target.value })}
        />
        <Field
          label={t("bulk.contact")}
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />

        <div>
          <Field
            label={t("bulk.qty")}
            inputMode="numeric"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((q) => (
              <button
                key={q}
                onClick={() => setForm({ ...form, qty: q })}
                className={`press rounded-full px-4 py-2 text-sm font-bold ${
                  form.qty === q ? "bg-forest text-ivory" : "bg-sand text-charcoal/70"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <Field
          label={t("bulk.unit")}
          hint={t("bulk.unitHint")}
          inputMode="numeric"
          placeholder={product?.price ?? ""}
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />

        {qty > 0 && unit > 0 ? (
          <div className="animate-rise flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-ivory">
            <span className="text-xs font-bold tracking-[0.12em] uppercase opacity-70">
              {t("bulk.total")}
            </span>
            <span className="font-display text-2xl font-extrabold">
              {rupees(total)}
            </span>
          </div>
        ) : null}

        <Field
          label={t("bulk.deadline")}
          placeholder={t("bulk.deadlinePh")}
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <Field
          label={t("bulk.deliverTo")}
          placeholder={t("bulk.deliverToPh")}
          value={form.deliverTo}
          onChange={(e) => setForm({ ...form, deliverTo: e.target.value })}
        />
        <AreaField
          label={t("bulk.notes")}
          value={form.notes}
          onChange={(v) => setForm({ ...form, notes: v })}
          rows={4}
        />
        <p className="text-xs opacity-55">{t("bulk.note")}</p>
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn disabled={!valid} className={valid ? "" : "opacity-40"} onClick={send}>
          {t("bulk.send")}
        </Btn>
      </div>
    </Screen>
  );
}
