import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import demoAfter from "@/assets/vase-after.jpg";
import demoBefore from "@/assets/vase-before.jpg";
import { AiBadge, Btn, ErrorNote, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "AI Image Studio — SHILPSETU AI" },
      {
        name: "description",
        content:
          "Clean background, better lighting and studio framing for your product photo.",
      },
      { property: "og:title", content: "Make your product shine" },
      { property: "og:description", content: "Studio quality in seconds." },
    ],
  }),
  component: StudioScreen,
});

const steps = [
  "Removing background",
  "Improving lighting",
  "Enhancing details",
  "Optimizing framing",
];

/** Turn any image (asset URL or data URL) into a data URL the AI can read. */
async function toDataUrl(src: string, max = 1280): Promise<string> {
  const img = document.createElement("img");
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not read that photo"));
    img.src = src;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function StudioScreen() {
  const { draft, patchDraft } = useShilp();
  const navigate = useNavigate();
  const [done, setDone] = useState(0);
  const [split, setSplit] = useState(50);
  const [failed, setFailed] = useState(false);
  const [run, setRun] = useState(0);
  const [cleaned, setCleaned] = useState<string | null>(null);

  const before = draft.originalPhoto ?? demoBefore;
  const after = cleaned ?? before;
  const isDemo = false;

  useEffect(() => {
    let alive = true;
    setDone(0);
    setFailed(false);
    setCleaned(null);
    // Show the steps ticking along while the real work happens.
    const timers = [0, 1, 2].map((i) =>
      setTimeout(() => alive && setDone((d) => Math.max(d, i + 1)), 900 + i * 2200),
    );

    (async () => {
      try {
        const source = await toDataUrl(before);
        const res = await fetch("/api/enhance-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: source }),
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as { image?: string };
        if (!json.image) throw new Error("No image");
        if (!alive) return;
        setCleaned(json.image);
        setDone(steps.length);
      } catch {
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [run, before]);

  const finished = done >= steps.length && !!cleaned;

  return (
    <Screen>
      <TopBar title="AI Image Studio" step="2 / 8" />
      <Title sub="We clean the background and light — your original photo is always kept.">
        Make your product shine.
      </Title>

      <div className="px-5">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-charcoal">
          <img
            src={after}
            alt="Enhanced product"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={
              isDemo ? undefined : { filter: "contrast(1.12) saturate(1.12) brightness(1.08)" }
            }
          />
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${split}%` }}
          >
            <img
              src={before}
              alt="Original product"
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ width: `${(100 / Math.max(split, 1)) * 100}%`, maxWidth: "none" }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
            style={{ left: `${split}%` }}
          >
            <span className="absolute top-1/2 -left-4 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-black text-charcoal">
              ↔
            </span>
          </div>
          <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
            Before
          </span>
          <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-charcoal">
            After
          </span>
          <input
            aria-label="Compare before and after"
            type="range"
            min={2}
            max={98}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <AiBadge>{finished ? "Enhanced" : "Working…"}</AiBadge>
          <span className="text-xs font-bold opacity-60">
            {Math.min(done, steps.length)} / {steps.length}
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {steps.map((s, i) => {
            const ok = i < done;
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    ok ? "bg-forest text-ivory" : "bg-sand text-charcoal/40"
                  }`}
                >
                  {ok ? <Check size={15} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                <span className={`text-sm font-semibold ${ok ? "" : "opacity-50"}`}>{s}</span>
              </li>
            );
          })}
        </ul>

        {failed ? (
          <div className="mt-5">
            <ErrorNote
              message="We couldn't finish enhancing this photo."
              onRetry={() => setRun((r) => r + 1)}
              onSkip={() => {
                patchDraft({ photo: before, enhanced: false });
                navigate({ to: "/voice" });
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 px-5 pt-8 pb-8">
        <Btn
          className={finished ? "" : "opacity-40"}
          disabled={!finished}
          onClick={() => {
            patchDraft({ photo: after, enhanced: true });
            navigate({ to: "/voice" });
          }}
        >
          Use This Image
        </Btn>
        <button
          onClick={() => setRun((r) => r + 1)}
          className="press flex h-12 w-full items-center justify-center gap-2 text-sm font-bold opacity-70"
        >
          <RotateCcw size={16} /> Retry
        </button>
        <button
          onClick={() => setFailed(true)}
          className="block w-full text-center text-[0.65rem] tracking-widest uppercase opacity-25"
        >
          simulate failure
        </button>
      </div>
    </Screen>
  );
}
