import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/images/generations";

const PROMPT =
  "Remove the background of this handmade craft product photo completely and place the product on a clean, seamless, softly lit studio background. " +
  "Keep the product itself exactly the same — same shape, colours, texture, carvings and proportions. Do not redesign or replace it. " +
  "Improve lighting, contrast and sharpness so it looks like a professional e-commerce product photo, centred with gentle shadow.";

export const Route = createFileRoute("/api/enhance-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { image } = (await request.json()) as { image?: string };
        if (!image || !image.startsWith("data:image")) {
          return new Response(JSON.stringify({ error: "No photo provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (image.length > 8_000_000) {
          return new Response(JSON.stringify({ error: "That photo is too large" }), {
            status: 413,
            headers: { "Content-Type": "application/json" },
          });
        }

        const upstream = await fetch(GATEWAY, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: PROMPT },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          return new Response(
            JSON.stringify({ error: detail.slice(0, 300) || "Enhancement failed" }),
            {
              status: upstream.status,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const json = (await upstream.json()) as {
          data?: { b64_json?: string; url?: string }[];
        };
        const first = json.data?.[0];
        const b64 = first?.b64_json;
        const url = b64 ? `data:image/png;base64,${b64}` : (first?.url ?? "");
        if (!url) {
          return new Response(JSON.stringify({ error: "No image returned" }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ image: url }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
