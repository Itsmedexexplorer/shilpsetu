import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import demoAfter from "@/assets/vase-after.jpg";
import { AiBadge, Btn, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/listing")({
  head: () => ({
    meta: [
      { title: "Your product story is ready — SHILPSETU AI" },
      {
        name: "description",
        content: "An editable title, description and keywords written from your voice.",
      },
      { property: "og:title", content: "Your product story is ready" },
      { property: "og:description", content: "Every AI field stays editable." },
    ],
  }),
  component: ListingScreen,
});

function ListingScreen() {
  const { draft } = useShilp();
  const navigate = useNavigate();
  const [lang, setLang] = useState<"en" | "hi">("en");

  const hiTitle = "हस्तनिर्मित मिट्टी की फूलदान";
  const hiDesc =
    "यह फूलदान पूरी तरह हाथ से बनाया गया है। पारंपरिक तरीके से बनी यह कलाकृति घर, दफ्तर और उपहार के लिए उपयुक्त है।";

  return (
    <Screen>
      <TopBar title="Generated Listing" step="4 / 8" />
      <Title sub="Read it once. Change anything you like.">
        Your product story is ready.
      </Title>

      <div className="px-5">
        <div className="relative overflow-hidden rounded-3xl bg-sand">
          <img
            src={draft.photo ?? demoAfter}
            alt={draft.title || "Product"}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
          <span className="absolute top-3 left-3">
            <AiBadge />
          </span>
        </div>

        <div className="mt-4 flex rounded-full bg-sand p-1 text-sm font-bold">
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`press flex-1 rounded-full py-2 ${lang === l ? "bg-forest text-ivory" : "opacity-60"}`}
            >
              {l === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-5">
          <Block label="Product title">
            <p className="text-2xl leading-tight font-extrabold">
              {lang === "en" ? draft.title : hiTitle}
            </p>
          </Block>
          <Block label="Description">
            <p className="leading-relaxed opacity-80">
              {lang === "en" ? draft.description : hiDesc}
            </p>
          </Block>
          <Block label="Keywords">
            <div className="flex flex-wrap gap-2">
              {draft.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-sage/25 px-3 py-1.5 text-sm font-bold text-forest"
                >
                  {k}
                </span>
              ))}
            </div>
          </Block>
          <div className="grid grid-cols-2 gap-3">
            <Block label="Category">
              <p className="font-bold">{draft.category}</p>
            </Block>
            <Block label="Material">
              <p className="font-bold">{draft.material}</p>
            </Block>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2 px-5 pt-8 pb-8">
        <Btn onClick={() => navigate({ to: "/edit" })}>Edit & Customize</Btn>
        <Btn variant="outline" onClick={() => navigate({ to: "/costs" })}>
          Looks Good
        </Btn>
      </div>
    </Screen>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-charcoal/8">
      <p className="mb-2 text-xs font-bold tracking-[0.12em] uppercase opacity-55">
        {label}
      </p>
      {children}
    </div>
  );
}
