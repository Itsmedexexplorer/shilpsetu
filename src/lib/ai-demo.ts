/**
 * Demo "AI" layer. Deterministic, offline, and instant — so the flow never
 * breaks on stage. Shapes match what a real model response would provide.
 */

export const DEMO_TRANSCRIPT =
  "यह एक हाथ से बनी मिट्टी की फूलदान है। इसे बनाने में मुझे लगभग तीन दिन लगते हैं। मैं इसे गाँव की चिकनी मिट्टी से बनाती हूँ और ऊपर पारंपरिक नक्काशी करती हूँ। यह घर, दफ्तर और उपहार के लिए बहुत सुंदर लगती है।";

const DICT: { match: RegExp; craft: string; material: string; category: string }[] =
  [
    {
      match: /मिट्टी|terracotta|clay|pottery|कुम्हार/i,
      craft: "Pottery",
      material: "Terracotta clay",
      category: "Home Decor",
    },
    {
      match: /बुन|basket|बाँस|bamboo|cane|weav/i,
      craft: "Weaving",
      material: "Natural cane",
      category: "Storage & Baskets",
    },
    {
      match: /कपड़|saree|fabric|block print|कढ़ाई|embroider/i,
      craft: "Handloom & Textile",
      material: "Handwoven cotton",
      category: "Textiles",
    },
    {
      match: /लकड़ी|wood|carv/i,
      craft: "Wood Craft",
      material: "Seasoned wood",
      category: "Home Decor",
    },
  ];

export type GeneratedListing = {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  material: string;
  craft: string;
};

export function generateListing(transcript: string): GeneratedListing {
  const hit = DICT.find((d) => d.match.test(transcript));
  const craft = hit?.craft ?? "Handmade Craft";
  const material = hit?.material ?? "Natural materials";
  const category = hit?.category ?? "Handmade";

  const isVase = /फूलदान|vase|pot|मटका/i.test(transcript);
  const noun = isVase ? "Flower Vase" : craft === "Weaving" ? "Basket" : "Craft Piece";
  const matWord = material.split(" ")[0] ?? "Handmade";
  const title = `Handcrafted ${matWord} ${noun}`;

  const description = [
    `A ${noun.toLowerCase()} shaped entirely by hand using ${material.toLowerCase()}.`,
    `Made with traditional ${craft.toLowerCase()} techniques passed down through generations, each piece carries small variations that machine-made goods cannot copy.`,
    `Beautiful for homes, workspaces and gifting — and finished with care by the artisan who made it.`,
  ].join(" ");

  const keywords = [
    matWord,
    craft,
    "Handmade",
    "Eco-friendly",
    noun,
    "Indian Craft",
  ];

  return { title, description, keywords, category, material, craft };
}

export type PriceAdvice = {
  total: number;
  low: number;
  target: number;
  high: number;
  profit: number;
};

export function advisePrice(total: number): PriceAdvice {
  const base = Math.max(total, 50);
  const round = (n: number) => Math.round(n / 10) * 10;
  const low = round(base * 1.3);
  const target = round(base * 1.57);
  const high = round(base * 1.86);
  return { total: base, low, target, high, profit: target - base };
}

export const PIPELINE = [
  "Understanding your product",
  "Listening to your story",
  "Writing your description",
  "Finding useful keywords",
  "Preparing a fair price",
  "Ready",
] as const;
