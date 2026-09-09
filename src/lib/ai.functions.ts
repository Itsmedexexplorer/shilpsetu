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
    const raw = (json.choices?.[0]?.message?.content ?? "{}")
      .replace(/^\s*```(?:json)?/i, "")
      .replace(/```\s*$/, "")
      .trim();
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

export type CoachResult = {
  counterPrice: string;
  floorPrice: string;
  verdict: string;
  reasons: string[];
  replyText: string;
};

/**
 * AI Bargain Coach. Given the craft, the artisan's own costs and the buyer's
 * offer, it suggests a fair counter-price with plain-language reasons.
 */
export const negotiate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().default(""),
        craft: z.string().default(""),
        material: z.string().default(""),
        listedPrice: z.string().default("0"),
        buyerOffer: z.string().default("0"),
        quantity: z.string().default("1"),
        note: z.string().default(""),
        costMaterial: z.string().default(""),
        costLabour: z.string().default(""),
        costOther: z.string().default(""),
        days: z.string().default(""),
        language: z.string().optional(),
        side: z.enum(["artisan", "buyer"]).default("artisan"),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<CoachResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const langName = LANG_NAME[data.language ?? "en"] ?? "English";
    const forArtisan = data.side === "artisan";

    const prompt = `You are a fair-price negotiation coach for Indian handmade crafts. All money is Indian Rupees.

Product: ${data.title || "handmade craft"}
Craft: ${data.craft || "handmade"} | Material: ${data.material || "unknown"}
Listed price: ${data.listedPrice} for 1 piece
Buyer wants quantity: ${data.quantity}
Buyer's offer (per piece): ${data.buyerOffer}
Artisan's own numbers: materials ${data.costMaterial || "not given"}, labour ${data.costLabour || "not given"}, other ${data.costOther || "not given"}, days of work ${data.days || "not given"}.
Extra note from the person: "${data.note || "(none)"}"

Advise the ${forArtisan ? "ARTISAN, who received this offer" : "BUYER, who is about to send this offer"}.
Never advise a price below the artisan's real cost of materials plus labour. A small bulk discount is reasonable when quantity is more than 3.

Return:
- counterPrice: a single realistic per-piece number, digits only, no currency symbol.
- floorPrice: the lowest per-piece number that still respects the artisan's cost, digits only.
- verdict: one short sentence saying whether the offer is fair, low, or generous.
- reasons: exactly 3 very short plain-language reasons, no jargon.
- replyText: a warm, respectful 2-sentence message the ${forArtisan ? "artisan can send to the buyer" : "buyer can send to the artisan"}.

Write verdict, reasons and replyText in ${langName}. Write numbers as plain digits.`;

    const res = await fetch(`${GATEWAY}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "coach",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                counterPrice: { type: "string" },
                floorPrice: { type: "string" },
                verdict: { type: "string" },
                reasons: { type: "array", items: { type: "string" } },
                replyText: { type: "string" },
              },
              required: [
                "counterPrice",
                "floorPrice",
                "verdict",
                "reasons",
                "replyText",
              ],
            },
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Coach failed (${res.status}): ${detail.slice(0, 300)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let done = false;
    while (!done) {
      const chunk = await reader.read();
      done = chunk.done;
      if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (evt.type === "response.output_text.delta" && evt.delta) {
            text += evt.delta;
          } else if (evt.type === "response.completed" && evt.response?.output_text) {
            if (!text) text = evt.response.output_text;
          }
        } catch {
          /* partial event, ignore */
        }
      }
    }

    const raw = text
      .replace(/^\s*```(?:json)?/i, "")
      .replace(/```\s*$/, "")
      .trim();
    if (!raw) throw new Error("The coach had nothing to say. Please try again.");

    const parsed = JSON.parse(raw) as Partial<CoachResult>;
    const digits = (v: unknown, fallback: string) => {
      // Models sometimes answer "₹1,000 (about 20% off)" — keep the first number only.
      const match = /\d[\d,]*/.exec(String(v ?? ""));
      const n = match ? match[0].replace(/,/g, "") : "";
      return n || fallback;
    };
    return {
      counterPrice: digits(parsed.counterPrice, data.listedPrice || "0"),
      floorPrice: digits(parsed.floorPrice, data.buyerOffer || "0"),
      verdict: parsed.verdict ?? "",
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : [],
      replyText: parsed.replyText ?? "",
    };
  });
