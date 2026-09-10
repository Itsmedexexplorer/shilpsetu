import { supabase } from "@/integrations/supabase/client";
import type { Inquiry, Product } from "@/lib/shilp-store";

/** Keep photos small enough to travel between phones quickly. */
export function shrinkDataUrl(src: string, max = 1100): Promise<string> {
  if (!src.startsWith("data:image")) return Promise.resolve(src);
  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(src);
    img.onload = () => {
      try {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        if (scale === 1 && src.length < 400_000) return resolve(src);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        resolve(src);
      }
    };
    img.src = src;
  });
}

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

export function rowToProduct(r: Row): Product {
  return {
    id: str(r["id"]),
    title: str(r["title"], "Untitled craft"),
    description: str(r["description"]),
    image: str(r["image"]),
    price: str(r["price"], "0"),
    status: (str(r["status"], "published") as Product["status"]) ?? "published",
    category: str(r["category"]),
    material: str(r["material"]),
    craft: str(r["craft"]),
    keywords: Array.isArray(r["keywords"]) ? (r["keywords"] as string[]) : [],
    createdAt: Number(r["created_at_ms"]) || 0,
    seller: (r["seller"] ?? {}) as Product["seller"],
  };
}

export function rowToInquiry(r: Row): Inquiry {
  return {
    id: str(r["id"]),
    buyer: str(r["buyer"]),
    buyerAvatar: str(r["buyer_avatar"]),
    buyerLocation: str(r["buyer_location"]),
    contact: str(r["contact"]),
    productId: str(r["product_id"]),
    productTitle: str(r["product_title"], "Product"),
    productImage: str(r["product_image"]),
    productPrice: str(r["product_price"], "0"),
    sellerName: str(r["seller_name"]),
    quantity: str(r["quantity"]),
    message: str(r["message"]),
    date: str(r["date"]),
    status: (str(r["status"], "new") as Inquiry["status"]) ?? "new",
    offerPrice: str(r["offer_price"]),
    agreedPrice: str(r["agreed_price"]),
    offers: Array.isArray(r["offers"]) ? (r["offers"] as Inquiry["offers"]) : [],
    kind: (str(r["kind"], "single") as Inquiry["kind"]) ?? "single",
    orgName: str(r["org_name"]),
    deadline: str(r["deadline"]),
    deliverTo: str(r["deliver_to"]),
  };
}

function inquiryToRow(i: Inquiry) {
  return {
    id: i.id,
    buyer: i.buyer,
    buyer_avatar: i.buyerAvatar,
    buyer_location: i.buyerLocation,
    contact: i.contact,
    product_id: i.productId,
    product_title: i.productTitle,
    product_image: i.productImage,
    product_price: i.productPrice,
    seller_name: i.sellerName,
    quantity: i.quantity,
    message: i.message,
    date: i.date,
    status: i.status,
    offer_price: i.offerPrice,
    agreed_price: i.agreedPrice,
    offers: i.offers,
    kind: i.kind,
    org_name: i.orgName,
    deadline: i.deadline,
    deliver_to: i.deliverTo,
  };
}

const anyDb = supabase as unknown as {
  from: (t: string) => any;
  channel: (n: string) => any;
  removeChannel: (c: unknown) => void;
};

export async function fetchMarket(): Promise<{
  products: Product[];
  inquiries: Inquiry[];
} | null> {
  try {
    const [p, i] = await Promise.all([
      anyDb.from("products").select("*").order("created_at", { ascending: false }),
      anyDb.from("inquiries").select("*").order("created_at", { ascending: false }),
    ]);
    if (p.error || i.error) return null;
    return {
      products: (p.data ?? []).map(rowToProduct),
      inquiries: (i.data ?? []).map(rowToInquiry),
    };
  } catch {
    return null;
  }
}

export async function saveProduct(product: Product) {
  const image = await shrinkDataUrl(product.image);
  const avatar = await shrinkDataUrl(product.seller?.avatar ?? "", 256);
  await anyDb.from("products").upsert({
    id: product.id,
    title: product.title,
    description: product.description,
    image,
    price: product.price,
    status: product.status,
    category: product.category,
    material: product.material,
    craft: product.craft,
    keywords: product.keywords,
    seller: { ...product.seller, avatar },
    created_at_ms: product.createdAt,
  });
}

export async function saveInquiry(inquiry: Inquiry) {
  const row = inquiryToRow(inquiry);
  row.buyer_avatar = await shrinkDataUrl(row.buyer_avatar, 256);
  row.product_image = await shrinkDataUrl(row.product_image);
  await anyDb.from("inquiries").upsert(row);
}

export async function patchInquiry(id: string, patch: Partial<Inquiry>) {
  const full = inquiryToRow({ ...(patch as Inquiry), id });
  const row: Record<string, unknown> = { id };
  const keyMap: Record<keyof Inquiry, string> = {
    id: "id",
    buyer: "buyer",
    buyerAvatar: "buyer_avatar",
    buyerLocation: "buyer_location",
    contact: "contact",
    productId: "product_id",
    productTitle: "product_title",
    productImage: "product_image",
    productPrice: "product_price",
    sellerName: "seller_name",
    quantity: "quantity",
    message: "message",
    date: "date",
    status: "status",
    offerPrice: "offer_price",
    agreedPrice: "agreed_price",
    offers: "offers",
    kind: "kind",
    orgName: "org_name",
    deadline: "deadline",
    deliverTo: "deliver_to",
  };
  for (const key of Object.keys(patch) as (keyof Inquiry)[]) {
    const column = keyMap[key];
    row[column] = (full as Record<string, unknown>)[column];
  }
  await anyDb.from("inquiries").update(row).eq("id", id);
}

/** Flip a listing between available and out of stock. */
export async function patchProductStatus(id: string, status: Product["status"]) {
  await anyDb.from("products").update({ status }).eq("id", id);
}

/** Remove a listing everywhere. */
export async function deleteProductRemote(id: string) {
  await anyDb.from("products").delete().eq("id", id);
}

/** Call `onChange` whenever any phone adds or edits a listing or inquiry. */
export function subscribeMarket(onChange: () => void) {
  const channel = anyDb
    .channel("shilpsetu-market")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "inquiries" }, onChange)
    .subscribe();
  return () => anyDb.removeChannel(channel);
}
