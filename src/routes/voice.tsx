import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AreaField, Btn, ErrorNote, Screen, Title, TopBar } from "@/components/shilp/ui";
import { DEMO_TRANSCRIPT } from "@/lib/ai-demo";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Describe your product by voice — SHILPSETU AI" },
      {
        name: "description",
        content: "Just speak naturally in your language. No typing required.",
      },
      { property: "og:title", content: "Describe your product" },
      { property: "og:description", content: "Speak naturally. We'll do the rest." },
    ],
  }),
  component: VoiceScreen,
});

const LANG_TAG: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
};

function VoiceScreen() {
  const { draft, patchDraft, language } = useShilp();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState(draft.transcript);
  const [unsure, setUnsure] = useState(false);
  const recRef = useRef<any>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      recRef.current?.stop?.();
      if (simRef.current) clearInterval(simRef.current);
    },
    [],
  );

  const simulate = () => {
    let i = 0;
    setUnsure(false);
    simRef.current = setInterval(() => {
      i += 3;
      setText(DEMO_TRANSCRIPT.slice(0, i));
      if (i >= DEMO_TRANSCRIPT.length) stop();
    }, 45);
  };

  const start = () => {
    setRecording(true);
    setText("");
    const SR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) return simulate();
    try {
      const rec = new SR();
      rec.lang = LANG_TAG[language ?? "hi"] ?? "hi-IN";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let out = "";
        for (let i = 0; i < e.results.length; i++) out += e.results[i][0].transcript;
        setText(out);
        setUnsure(e.results[e.results.length - 1][0].confidence < 0.55);
      };
      rec.onerror = () => {
        recRef.current = null;
        simulate();
      };
      rec.onend = () => setRecording(false);
      rec.start();
      recRef.current = rec;
      // Safety net: if the mic gives us nothing, fall back to the demo voice note.
      window.setTimeout(() => {
        if (recRef.current === rec && !heardRef.current) {
          try {
            rec.onend = null;
            rec.stop();
          } catch {
            /* ignore */
          }
          recRef.current = null;
          setRecording(true);
          simulate();
        }
      }, 3500);
    } catch {
      simulate();
    }
  };


  const stop = () => {
    setRecording(false);
    recRef.current?.stop?.();
    recRef.current = null;
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
  };

  const go = () => {
    patchDraft({ transcript: text.trim() || DEMO_TRANSCRIPT });
    navigate({ to: "/processing" });
  };

  return (
    <Screen>
      <TopBar title="Voice Input" step="3 / 8" />
      <Title sub="Just speak naturally. We'll do the rest — no typing needed.">
        Describe your product
      </Title>

      <div className="flex flex-col items-center px-5">
        <div className="relative grid h-44 w-44 place-items-center">
          {recording ? (
            <>
              <span className="animate-ring absolute h-32 w-32 rounded-full bg-terracotta/40" />
              <span
                className="animate-ring absolute h-32 w-32 rounded-full bg-terracotta/30"
                style={{ animationDelay: ".6s" }}
              />
            </>
          ) : null}
          <button
            onClick={recording ? stop : start}
            aria-label={recording ? "Stop recording" : "Start recording"}
            className={`press relative grid h-32 w-32 place-items-center rounded-full text-white ${
              recording ? "bg-terracotta" : "bg-forest"
            }`}
          >
            {recording ? <Square size={40} fill="currentColor" /> : <Mic size={48} />}
          </button>
        </div>

        <p className="mt-2 text-lg font-extrabold">
          {recording ? "Listening…" : text ? "Recorded" : "Tap to speak"}
        </p>

        <div className="mt-4 flex h-12 items-end gap-1.5">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 origin-bottom rounded-full ${recording ? "animate-bar bg-forest" : "bg-charcoal/15"}`}
              style={{
                height: `${18 + ((i * 37) % 30)}px`,
                animationDelay: `${(i % 7) * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3 px-5">
        {unsure ? (
          <ErrorNote
            message="Some words were hard to hear."
            onRetry={start}
            onSkip={() => setUnsure(false)}
          />
        ) : null}

        {text ? (
          <AreaField label="Your words (editable)" value={text} onChange={setText} rows={6} />
        ) : (
          <button
            onClick={() => setText(DEMO_TRANSCRIPT)}
            className="press w-full rounded-2xl border-2 border-dashed border-charcoal/15 p-4 text-left text-sm opacity-70"
          >
            Example: “यह एक हाथ से बनी मिट्टी की फूलदान है…” — tap to use the demo
            recording.
          </button>
        )}
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn className={text ? "" : "opacity-40"} disabled={!text} onClick={go}>
          Generate Catalog
        </Btn>
      </div>
    </Screen>
  );
}
