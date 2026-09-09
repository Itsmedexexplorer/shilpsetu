import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AreaField, Btn, ErrorNote, Screen, Title, TopBar } from "@/components/shilp/ui";
import { transcribeAudio } from "@/lib/ai.functions";
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

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });

function VoiceScreen() {
  const { draft, patchDraft, language } = useShilp();
  const navigate = useNavigate();
  const transcribe = useServerFn(transcribeAudio);

  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState(draft.transcript);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(
    () => () => {
      try {
        recRef.current?.stream.getTracks().forEach((t) => t.stop());
        if (recRef.current?.state === "recording") recRef.current.stop();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm", "audio/mp4"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        if (blob.size < 2048) {
          setError("That recording was too short — please try again.");
          return;
        }
        setBusy(true);
        try {
          const audio = await blobToBase64(blob);
          const res = await transcribe({
            data: {
              audio,
              mime: blob.type || "audio/webm",
              language: language ?? "auto",
            },
          });
          if (res.text) setText(res.text);
          else setError("We couldn't hear any words. Please try again.");
        } catch {
          setError("Transcription didn't work just now. Try again or type below.");
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      setError("Microphone is not available here. You can type or use the example.");
    }
  };

  const stop = () => {
    setRecording(false);
    try {
      if (recRef.current?.state === "recording") recRef.current.stop();
    } catch {
      /* ignore */
    }
  };

  const go = () => {
    patchDraft({ transcript: text.trim() });
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
            disabled={busy}
            aria-label={recording ? "Stop recording" : "Start recording"}
            className={`press relative grid h-32 w-32 place-items-center rounded-full text-white ${
              recording ? "bg-terracotta" : "bg-forest"
            } ${busy ? "opacity-60" : ""}`}
          >
            {busy ? (
              <Loader2 size={44} className="animate-spin" />
            ) : recording ? (
              <Square size={40} fill="currentColor" />
            ) : (
              <Mic size={48} />
            )}
          </button>
        </div>

        <p className="mt-2 text-lg font-extrabold">
          {busy
            ? "Understanding your words…"
            : recording
              ? "Listening…"
              : text
                ? "Recorded"
                : "Tap to speak"}
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
        {error ? (
          <ErrorNote message={error} onRetry={start} onSkip={() => setError(null)} />
        ) : null}

        {text ? (
          <AreaField
            label="Your words (editable)"
            value={text}
            onChange={setText}
            rows={6}
          />
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
        <Btn className={text && !busy ? "" : "opacity-40"} disabled={!text || busy} onClick={go}>
          Generate Catalog
        </Btn>
      </div>
    </Screen>
  );
}
