import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Screen } from "@/components/shilp/ui";
import { generateListing, PIPELINE } from "@/lib/ai-demo";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Creating your catalog — SHILPSETU AI" },
      {
        name: "description",
        content: "Your photo and your story become a complete product listing.",
      },
      { property: "og:title", content: "Creating your catalog" },
      { property: "og:description", content: "Photo, voice and price in one pass." },
    ],
  }),
  component: ProcessingScreen,
});

function ProcessingScreen() {
  const { draft, patchDraft } = useShilp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = PIPELINE.map((_, i) => setTimeout(() => setStep(i + 1), 550 * (i + 1)));
    const done = setTimeout(() => {
      const g = generateListing(draft.transcript);
      patchDraft(g);
      navigate({ to: "/listing" });
    }, 550 * PIPELINE.length + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen tone="forest">
      <div className="craft-texture flex flex-1 flex-col justify-center px-7 py-14">
        <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-60">
          Please wait
        </p>
        <h1 className="mt-3 text-[2.4rem] leading-tight font-extrabold">
          Creating your catalog…
        </h1>

        <div className="mt-10 space-y-1">
          {PIPELINE.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <div key={label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black transition-all duration-300 ${
                      state === "done"
                        ? "bg-saffron text-charcoal"
                        : state === "active"
                          ? "scale-110 bg-terracotta text-white"
                          : "bg-white/10 text-white/40"
                    }`}
                  >
                    {state === "done" ? <Check size={16} /> : i + 1}
                  </span>
                  {i < PIPELINE.length - 1 ? (
                    <span
                      className={`my-1 w-0.5 flex-1 ${state === "todo" ? "bg-white/10" : "bg-saffron/60"}`}
                      style={{ height: 22 }}
                    />
                  ) : null}
                </div>
                <p
                  className={`pt-1.5 text-lg font-bold transition-opacity ${
                    state === "todo" ? "opacity-35" : "opacity-100"
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500"
            style={{ width: `${(step / PIPELINE.length) * 100}%` }}
          />
        </div>
        <p className="mt-4 text-sm opacity-60">
          Nothing is published yet. You will review everything first.
        </p>
      </div>
    </Screen>
  );
}
