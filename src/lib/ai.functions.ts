import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const LANG_NAME: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  kn: "Kannada",
  ta: "Tamil",
  te: "Telugu",
};

function b64ToBytes(b64: string) {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Real speech-to-text for the artisan's voice note. */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        audio: z.string().min(100),
        mime: z.string().default("audio/webm"),
        language: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const bytes = b64ToBytes(data.audio);
    const ext =
      ({
        "audio/webm": "webm",
        "audio/mp4": "mp4",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
      } as Record<string, string>)[data.mime.split(";")[0] ?? ""] ?? "webm";

    const form = new FormData();
    form.append("model", "google/gemini-3.5-transcribe");
    form.append("file", new Blob([bytes], { type: data.mime }), `recording.${ext}`);
    if (data.language && data.language !== "auto") form.append("language", data.language);

    const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Transcription failed (${res.status}): ${detail.slice(0, 300)}`);
    }
    const json = (await res.json()) as { text?: string };
    return { text: (json.text ?? "").trim() };
  });

export type ListingResult = {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  material: string;
  craft: string;
};

/** Looks at the actual photo (and the spoken story) to write the listing. */
export const analyzeProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        image: z.string().optional(),
        transcript: z.string().default(""),
        language: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ListingResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const langName = LANG_NAME[data.language ?? "en"] ?? "English";
    const content: unknown[] = [
      {
        type: "text",
        text: `You are helping an Indian artisan list a handmade product for sale online.
Look carefully at the photo and identify what the object ACTUALLY is (for example: a wooden elephant, a jute bag, a brass lamp, a painted plate, an embroidered cushion). Never guess "flower vase" unless the photo clearly shows one.
The artisan described it (may be in ${langName}): "${data.transcript || "(no description given)"}".
Write an honest, warm English listing based on what you can see.
Return JSON only with keys: title (max 8 words, names the real object), description (3 sentences), keywords (5-7 short strings), category, material, craft.`,
      },
    ];
    if (data.image?.startsWith("data:image")) {
      content.push({ type: "image_url", image_url: { url: data.image } });
    }

    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "user", content }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "listing",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                category: { type: "string" },
                material: { type: "string" },
                craft: { type: "string" },
              },
              required: [
                "title",
                "description",
                "keywords",
                "category",
                "material",
                "craft",
              ],
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Listing failed (${res.status}): ${detail.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as ListingResult;
    return {
      title: parsed.title || "Handmade Craft",
      description: parsed.description || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 7) : [],
      category: parsed.category || "Handmade",
      material: parsed.material || "Natural materials",
      craft: parsed.craft || "Handmade Craft",
    };
  });
