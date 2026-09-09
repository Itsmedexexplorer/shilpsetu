import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Handshake, Package, QrCode, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import demoAfter from "@/assets/vase-after.jpg";
import { Btn } from "@/components/shilp/ui";
import { useT } from "@/lib/i18n";
import { prettyUrl, productUrl, qrUrl } from "@/lib/share";
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
  const { products, role } = useShilp();
  const t = useT();
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

  const url = productUrl(p.id);

  const copy = () => {
    navigator.clipboard?.writeText(url);
    toast.success("Live link copied");
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: p.title, text: p.description, url });
        return;
      } catch {
        /* user dismissed */
      }
    }
    copy();
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <div className="relative overflow-hidden">
        <img
          src={p.image || demoAfter}
          alt={p.title}
          className="animate-zoom aspect-[4/5] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent" />
        <button
          aria-label="Back"
          onClick={() =>
            navigate({ to: role === "artisan" ? "/catalog" : "/market" })
          }
          className="press absolute top-5 left-5 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-charcoal backdrop-blur"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-5 right-5 flex gap-2">
          <button
            aria-label="Share"
            onClick={share}
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

      <div className="animate-rise -mt-8 flex-1 rounded-t-[2rem] bg-white px-6 pt-7 shadow-[0_-16px_40px_-32px_rgba(0,0,0,.6)]">
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
            <div key={k} className="lift rounded-2xl bg-ivory p-3">
              <dt className="text-[0.65rem] font-bold tracking-wide uppercase opacity-55">
                {k}
              </dt>
              <dd className="mt-1 font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-3xl border-2 border-charcoal/10 bg-ivory p-4">
          <p className="text-[0.65rem] font-bold tracking-[0.14em] uppercase opacity-55">
            Live page link
          </p>
          <div className="mt-2 flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-sm font-bold text-forest underline underline-offset-4"
            >
              {prettyUrl(url)}
            </a>
            <button
              aria-label="Copy link"
              onClick={copy}
              className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-charcoal text-white"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="mt-2 text-xs opacity-55">
            Share this link on WhatsApp — it opens the live buyer page.
          </p>
        </div>

        {qr ? (
          <div className="animate-rise mt-6 grid place-items-center rounded-3xl bg-ivory p-5">
            <img
              src={qrUrl(url, 200)}
              alt="QR code for this listing"
              width={200}
              height={200}
            />
            <p className="mt-2 text-xs font-semibold opacity-60">
              Scan to open the live page
            </p>
          </div>
        ) : null}

        <div className="lift mt-8 flex gap-4 rounded-3xl bg-forest p-5 text-ivory">
          {p.seller?.avatar ? (
            <img
              src={p.seller.avatar}
              alt=""
              loading="lazy"
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <span className="font-display grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-ivory/15 text-3xl font-extrabold">
              {(p.seller?.name || "S").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs tracking-[0.15em] uppercase opacity-60">Made by</p>
            <p className="text-lg font-extrabold">
              {p.seller?.name || "A SHILPSETU artisan"}
            </p>
            <p className="mt-1 text-sm opacity-75">
              {[
                p.seller?.craft || p.craft || "Craft",
                p.seller?.location,
                p.seller?.age ? `${p.seller.age} years` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>


        <p className="mt-6 text-xs opacity-50">
          Ships across India. Bulk and institutional orders welcome.
        </p>
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-charcoal/10 bg-white/95 px-6 pt-4 pb-6 backdrop-blur">
        {role === "org" ? (
          <Btn
            icon={<Package size={20} />}
            onClick={() => navigate({ to: "/bulk/$id", params: { id: p.id } })}
          >
            {t("bulk.cta")}
          </Btn>
        ) : (
          <Btn onClick={() => navigate({ to: "/inquiry/$id", params: { id: p.id } })}>
            Contact Artisan
          </Btn>
        )}
        <Btn
          variant="forest"
          icon={<Handshake size={20} />}
          onClick={() => navigate({ to: "/inquiry/$id", params: { id: p.id } })}
        >
          {t("product.makeOffer")}
        </Btn>
      </div>

    </div>
  );
}
