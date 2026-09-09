import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy, LayoutGrid, QrCode, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import demoAfter from "@/assets/vase-after.jpg";
import { Btn, Screen } from "@/components/shilp/ui";
import { prettyUrl, productUrl, qrUrl } from "@/lib/share";
import { rupees, useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/published")({
  validateSearch: (s: Record<string, unknown>) => ({ id: String(s["id"] ?? "") }),
  head: () => ({
    meta: [
      { title: "Your product is live — SHILPSETU AI" },
      {
        name: "description",
        content: "Share your published craft with buyers by link, WhatsApp or QR code.",
      },
      { property: "og:title", content: "Your product is live" },
      {
        property: "og:description",
        content: "Your craft is now visible to buyers across India.",
      },
    ],
  }),
  component: PublishedScreen,
});

function PublishedScreen() {
  const { id } = Route.useSearch();
  const { products, resetDraft } = useShilp();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id) ?? products[0];
  const [pop, setPop] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPop(true), 80);
    return () => clearTimeout(t);
  }, []);

  const url = product ? productUrl(product.id) : "";


  return (
    <Screen tone="forest">
      <div className="craft-texture flex flex-1 flex-col px-6 pt-14 pb-8">
        <div className="flex flex-col items-center text-center">
          <div
            className={`relative grid h-24 w-24 place-items-center rounded-full bg-sage/25 transition-all duration-700 ${
              pop ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <span className="animate-ring absolute h-24 w-24 rounded-full bg-sage/30" />
            <span className="grid h-16 w-16 place-items-center rounded-full bg-sage text-forest-deep">
              <Check size={34} strokeWidth={3} />
            </span>
          </div>
          <h1 className="mt-6 text-[2.4rem] leading-tight font-extrabold">
            Your product is live!
          </h1>
          <p className="mt-2 text-ivory/70">
            Your craft is now visible to buyers across India.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4 rounded-3xl bg-white/8 p-4">
          <img
            src={product?.image || demoAfter}
            alt={product?.title ?? "Product"}
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">
              {product?.title ?? "Your product"}
            </p>
            <p className="font-bold text-saffron">{rupees(product?.price ?? 0)}</p>
          </div>
        </div>

        {url ? (
          <div className="animate-rise mt-4 rounded-3xl bg-white/8 p-4">
            <p className="text-[0.65rem] font-bold tracking-[0.14em] uppercase opacity-60">
              Live buyer link
            </p>
            <div className="mt-2 flex items-center gap-3">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-bold text-saffron underline underline-offset-4"
              >
                {prettyUrl(url)}
              </a>
              <button
                aria-label="Copy live link"
                onClick={() => {
                  navigator.clipboard?.writeText(url);
                  toast.success("Live link copied");
                }}
                className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ivory text-charcoal"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Action
            Icon={Share2}
            label="Share on WhatsApp"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`${product?.title ?? "My craft"} — ${rupees(product?.price ?? 0)}\n${url}`)}`,
                "_blank",
              )
            }
          />
          <Action
            Icon={Copy}
            label="Copy Link"
            onClick={() => {
              navigator.clipboard?.writeText(url);
              toast.success("Link copied");
            }}
          />
          <Action Icon={QrCode} label="QR Code" onClick={() => setShowQr((v) => !v)} />
          <Action
            Icon={LayoutGrid}
            label="View in Catalog"
            onClick={() => navigate({ to: "/catalog" })}
          />
        </div>

        {showQr && url ? (
          <div className="animate-rise mt-4 grid place-items-center rounded-3xl bg-white p-5">
            <img
              src={qrUrl(url, 220)}
              alt="QR code linking to the product page"
              width={220}
              height={220}
            />
            <p className="mt-2 text-xs font-semibold text-charcoal/60">
              Show this at melas and exhibitions
            </p>
          </div>
        ) : null}

        <div className="mt-auto space-y-2 pt-10">
          <Btn
            onClick={() => {
              resetDraft();
              navigate({ to: "/capture" });
            }}
          >
            Add Another Product
          </Btn>
          {product ? (
            <Link to="/product/$id" params={{ id: product.id }} className="block">
              <span className="block py-3 text-center text-sm font-bold text-ivory/70 underline underline-offset-4">
                See the buyer view
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </Screen>
  );
}

function Action({
  Icon,
  label,
  onClick,
}: {
  Icon: typeof Copy;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="press flex h-24 flex-col justify-between rounded-3xl bg-white/8 p-4 text-left"
    >
      <Icon size={20} className="text-saffron" />
      <span className="text-sm leading-tight font-extrabold">{label}</span>
    </button>
  );
}
