import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, QrCode, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import artisanImg from "@/assets/artisan-hero.jpg";
import demoAfter from "@/assets/vase-after.jpg";
import { Btn } from "@/components/shilp/ui";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Handmade craft by a SHILPSETU artisan" },
      {
        name: "description",
        content:
          "A handmade product listing with artisan story, materials and direct inquiry.",
      },
      { property: "og:title", content: "Handmade craft — SHILPSETU AI" },
      {
        property: "og:description",
        content: "Made by hand. Contact the artisan directly.",
      },
    ],
  }),
  component: BuyerView,
});

function BuyerView() {
  const { id } = Route.useParams();
  const { products, artisanName } = useShilp();
  const navigate = useNavigate();
  const [qr, setQr] = useState(false);
  const p = products.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-ivory px-8 text-center">
        <h1 className="text-2xl font-extrabold">This listing isn't available</h1>
        <p className="text-sm opacity-65">It may have been removed by the artisan.</p>
        <Link to="/catalog" className="font-bold text-terracotta">
          Back to catalog
        </Link>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <div className="relative">
        <img
          src={p.image || demoAfter}
          alt={p.title}
          className="aspect-[4/5] w-full object-cover"
        />
        <button
          aria-label="Back"
          onClick={() => navigate({ to: "/catalog" })}
          className="press absolute top-5 left-5 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-charcoal backdrop-blur"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-5 right-5 flex gap-2">
          <button
            aria-label="Share"
            onClick={() => {
              navigator.clipboard?.writeText(url);
              toast.success("Link copied");
            }}
            className="press grid h-11 w-11 place-items-center rounded-full bg-white/85 text-charcoal backdrop-blur"
          >
            <Share2 size={18} />
          </button>
          <button
            aria-label="QR code"
            onClick={() => setQr((v) => !v)}
            className="press grid h-11 w-11 place-items-center rounded-full bg-white/85 text-charcoal backdrop-blur"
          >
            <QrCode size={18} />
          </button>
        </div>
      </div>

      <div className="-mt-8 flex-1 rounded-t-[2rem] bg-white px-6 pt-7">
        <span className="rounded-full bg-sage/25 px-3 py-1.5 text-xs font-extrabold tracking-wide text-forest uppercase">
          {p.craft || "Handmade"}
        </span>
        <h1 className="mt-4 text-[2.2rem] leading-[1.05] font-extrabold text-balance">
          {p.title}
        </h1>
        <p className="mt-3 font-display text-3xl font-extrabold text-terracotta">
          {rupees(p.price)}
        </p>

        <p className="mt-5 leading-relaxed opacity-75">{p.description}</p>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
          {[
            ["Material", p.material || "Handmade"],
            ["Craft", p.craft || "Traditional"],
            ["Availability", "Made to order"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-ivory p-3">
              <dt className="text-[0.65rem] font-bold tracking-wide uppercase opacity-55">
                {k}
              </dt>
              <dd className="mt-1 font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        {qr ? (
          <div className="animate-rise mt-6 grid place-items-center rounded-3xl bg-ivory p-5">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
              alt="QR code for this listing"
              width={200}
              height={200}
            />
          </div>
        ) : null}

        <div className="mt-8 flex gap-4 rounded-3xl bg-forest p-5 text-ivory">
          <img
            src={artisanImg}
            alt="The artisan"
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs tracking-[0.15em] uppercase opacity-60">Made by</p>
            <p className="text-lg font-extrabold">{artisanName} Devi</p>
            <p className="mt-1 text-sm opacity-75">
              {p.craft || "Craft"} artisan · Kutch, Gujarat. Working with clay from the
              village pond since she was fifteen.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs opacity-50">
          Ships across India. Bulk and institutional orders welcome.
        </p>
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-charcoal/10 bg-white/95 px-6 pt-4 pb-6 backdrop-blur">
        <Btn onClick={() => navigate({ to: "/inquiry/$id", params: { id: p.id } })}>
          Contact Artisan
        </Btn>
        <Btn
          variant="outline"
          onClick={() => navigate({ to: "/inquiry/$id", params: { id: p.id } })}
        >
          Bulk Order / Inquiry
        </Btn>
      </div>
    </div>
  );
}
