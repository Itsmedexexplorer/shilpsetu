import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { AreaField, Btn, Field, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { useShilp } from "@/lib/shilp-store";
import { isContact, LIMITS, toAmount } from "@/lib/validate";

export const Route = createFileRoute("/inquiry/$id")({
  head: () => ({
    meta: [
      { title: "Send an inquiry — SHILPSETU AI" },
      {
        name: "description",
        content: "Message the artisan directly about this handmade product.",
      },
      { property: "og:title", content: "Interested in this craft?" },
      { property: "og:description", content: "Send a direct inquiry to the artisan." },
    ],
  }),
  component: InquiryScreen,
});

function InquiryScreen() {
  const { id } = Route.useParams();
  const { products, addInquiry, profile, role } = useShilp();
  const t = useT();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const isArtisan = role === "artisan";
  const [form, setForm] = useState({
    name: profile.name,
    contact: "",
    qty: "1",
    offer: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);

  const nameOk = form.name.trim().length > 1;
  const contactOk = isContact(form.contact);
  const qty = Math.min(Math.max(toAmount(form.qty, LIMITS.quantity), 1), 99999);
  const valid = nameOk && contactOk;

  const send = () => {
    if (!valid) return;
    const created = addInquiry({
      buyer: form.name.trim(),
      buyerAvatar: profile.avatar,
      buyerLocation: profile.location,
      contact: form.contact.trim(),
      productId: id,
      quantity: String(qty),
      message: form.message.trim(),
      offerPrice: form.offer,
    });
    setNewId(created);
    setSent(true);
  };

  if (sent) {
    return (
      <Screen tone="forest">
        <div className="craft-texture flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-sage text-forest-deep">
            <Check size={36} strokeWidth={3} />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold">Inquiry sent to the artisan.</h1>
          <p className="mt-2 text-ivory/70">
            They will get back to you on the contact you shared.
          </p>
          <div className="mt-10 w-full space-y-2">
            {newId && form.offer.replace(/[^\d]/g, "") ? (
              <p className="mb-3 rounded-2xl bg-ivory/10 p-3 text-sm text-ivory/80">
                {t("inquiry.coachAfterReply")}
              </p>
            ) : null}
            <Btn
              variant="primary"
              onClick={() => navigate({ to: "/orders" })}
            >
              See inquiries
            </Btn>
            <Link
              to={isArtisan ? "/catalog" : "/market"}
              className="block py-2 text-sm text-ivory/70 underline"
            >
              {isArtisan ? "Back to catalog" : "Keep exploring crafts"}
            </Link>
          </div>
        </div>
      </Screen>
    );
  }



  return (
    <Screen>
      <TopBar title="Buyer inquiry" />
      <Title sub={product ? `About: ${product.title}` : undefined}>
        Interested in this craft?
      </Title>

      <div className="space-y-4 px-5">
        <Field
          label="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Field
          label="Phone / Email"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
        <Field
          label="Quantity"
          inputMode="numeric"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
        />
        <Field
          label={t("inquiry.offerLabel")}
          hint={t("inquiry.offerHint")}
          inputMode="numeric"
          placeholder={product?.price ?? ""}
          value={form.offer}
          onChange={(e) => setForm({ ...form, offer: e.target.value })}
        />
        <div
          className={`rounded-3xl border-2 p-4 transition-colors ${
            form.offer.replace(/[^\d]/g, "")
              ? "border-saffron bg-saffron/15"
              : "border-dashed border-charcoal/15 bg-white"
          }`}
        >
          <p className="text-sm font-extrabold">✦ {t("coach.title")}</p>
          <p className="mt-1 text-xs opacity-70">{t("inquiry.coachAfterReply")}</p>
        </div>


        <AreaField
          label="Message"
          value={form.message}
          onChange={(v) => setForm({ ...form, message: v })}
          rows={4}
        />
        <p className="text-xs opacity-55">
          No payment happens here. The artisan contacts you directly.
        </p>
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn disabled={!valid} className={valid ? "" : "opacity-40"} onClick={send}>
          Send Inquiry
        </Btn>
      </div>
    </Screen>
  );
}
