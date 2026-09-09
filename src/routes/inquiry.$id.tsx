import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { AreaField, Btn, Field, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useShilp } from "@/lib/shilp-store";

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
  const { products, addInquiry, profile } = useShilp();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [form, setForm] = useState({
    name: profile.name,
    contact: "",
    qty: "1",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const valid = form.name.trim() && form.contact.trim();

  const send = () => {
    addInquiry({
      buyer: form.name.trim(),
      contact: form.contact.trim(),
      productId: id,
      productTitle: product?.title ?? "Product",
      quantity: form.qty || "1",
      message: form.message,
    });
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
            <Btn onClick={() => navigate({ to: "/orders" })}>See inquiries</Btn>
            <Link to="/catalog" className="block py-2 text-sm text-ivory/70 underline">
              Back to catalog
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
