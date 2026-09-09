import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { transcribeAudio } from "@/lib/ai.functions";

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });

/**
 * Records a short voice note and returns the real transcript, in whichever
 * language the person is using.
 */
export function useVoiceNote(
  language: string | null | undefined,
  onResult: (text: string) => void,
) {
  const transcribe = useServerFn(transcribeAudio);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const resultRef = useRef(onResult);
  resultRef.current = onResult;

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

  const start = useCallback(async () => {
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
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
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
          if (res.text) resultRef.current(res.text);
          else setError("We couldn't hear any words. Please try again.");
        } catch {
          setError("Transcription didn't work just now. Try again or type instead.");
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      setError("Microphone is not available here. You can type instead.");
    }
  }, [language, transcribe]);

  const stop = useCallback(() => {
    setRecording(false);
    try {
      if (recRef.current?.state === "recording") recRef.current.stop();
    } catch {
      /* ignore */
    }
  }, []);

  return { recording, busy, error, setError, start, stop };
}
