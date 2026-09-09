import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Images, Sparkles, X, Zap, ZapOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import demoPhoto from "@/assets/vase-before.jpg";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [
      { title: "Capture your product — SHILPSETU AI" },
      {
        name: "description",
        content: "Take or upload one clear photo of your handmade product.",
      },
      { property: "og:title", content: "Capture your product" },
      { property: "og:description", content: "Place the product in good light." },
    ],
  }),
  component: CaptureScreen,
});

function CaptureScreen() {
  const { patchDraft } = useShilp();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"photo" | "upload">("photo");
  const [flash, setFlash] = useState(false);
  const [camError, setCamError] = useState(false);
  const [shot, setShot] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode !== "photo") return;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setCamError(true));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [mode]);

  const use = (src: string) => {
    patchDraft({ photo: src, originalPhoto: src, enhanced: false });
    setShot(true);
    setTimeout(() => navigate({ to: "/studio" }), 320);
  };

  const shoot = () => {
    const v = videoRef.current;
    if (!v || camError || !v.videoWidth) return use(demoPhoto);
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    use(c.toDataURL("image/jpeg", 0.85));
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => use(String(r.result));
    r.readAsDataURL(f);
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-black text-white">
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <button
          aria-label="Close camera"
          onClick={() => navigate({ to: "/home" })}
          className="press grid h-11 w-11 place-items-center rounded-full bg-white/10"
        >
          <X size={20} />
        </button>
        <p className="text-sm font-bold tracking-[0.2em] uppercase">Capture Product</p>
        <button
          aria-label="Toggle flash"
          onClick={() => setFlash((f) => !f)}
          className="press grid h-11 w-11 place-items-center rounded-full bg-white/10"
        >
          {flash ? <Zap size={20} className="text-saffron" /> : <ZapOff size={20} />}
        </button>
      </div>

      <p className="relative z-10 mt-3 text-center text-sm text-white/70">
        Place the product in good light
      </p>

      <div className="relative mx-5 mt-4 flex-1 overflow-hidden rounded-3xl bg-neutral-900">
        {mode === "photo" && !camError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={demoPhoto}
            alt="Sample terracotta vase"
            loading="lazy"
            className="h-full w-full object-cover opacity-70"
          />
        )}

        {/* framing guides */}
        <div className="pointer-events-none absolute inset-6 rounded-2xl">
          {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map(
            (c) => (
              <span
                key={c}
                className={`absolute h-10 w-10 border-white/70 ${c} rounded-[6px]`}
              />
            ),
          )}
        </div>

        {camError ? (
          <p className="absolute inset-x-0 bottom-4 px-6 text-center text-xs text-white/70">
            Camera unavailable. Upload a photo or use the sample product.
          </p>
        ) : null}

        {shot ? <div className="absolute inset-0 animate-pulse bg-white/70" /> : null}
      </div>

      <div className="relative z-10 mt-5 flex justify-center">
        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold">
          {(["photo", "upload"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`press rounded-full px-6 py-2 capitalize ${
                mode === m ? "bg-terracotta text-white" : "text-white/70"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 items-center px-8 py-7">
        <button
          onClick={() => fileRef.current?.click()}
          className="press grid h-14 w-14 place-items-center rounded-2xl bg-white/10"
          aria-label="Choose from gallery"
        >
          <Images size={22} />
        </button>

        <button
          onClick={mode === "photo" ? shoot : () => fileRef.current?.click()}
          aria-label="Take photo"
          className="press mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/25 ring-4 ring-white/40"
        >
          <span className="h-16 w-16 rounded-full bg-white" />
        </button>

        <button
          onClick={() => use(demoPhoto)}
          className="press ml-auto flex h-14 items-center gap-2 rounded-2xl bg-white/10 px-4 text-xs font-bold"
        >
          <Sparkles size={16} className="text-saffron" /> Demo
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
