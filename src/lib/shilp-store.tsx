import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LangCode = "hi" | "en" | "kn" | "ta" | "te";
export type Role = "artisan" | "buyer" | "org";

export type Costs = {
  material: string;
  labour: string;
  other: string;
  days: string;
};

export type Draft = {
  photo: string | null;
  originalPhoto: string | null;
  enhanced: boolean;
  transcript: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  material: string;
  craft: string;
  costs: Costs;
  price: string;
};

export type Profile = {
  name: string;
  age: string;
  location: string;
  craft: string;
  /** Data-URL profile photo chosen by the person. */
  avatar: string;
};


export type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  status: "published" | "draft";
  category: string;
  material: string;
  craft: string;
  keywords: string[];
  createdAt: number;
  /** Snapshot of the artisan who listed it, so buyers can see the maker. */
  seller: Profile;
};

export type Offer = {
  by: "buyer" | "artisan";
  price: string;
  note: string;
  at: number;
};

export type Inquiry = {
  id: string;
  buyer: string;
  buyerAvatar: string;
  buyerLocation: string;
  contact: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: string;
  sellerName: string;
  quantity: string;
  message: string;
  date: string;
  status: "new" | "negotiating" | "contacted" | "completed" | "accepted";
  /** Latest offer on the table, per piece. */
  offerPrice: string;
  /** Final price both sides settled on. */
  agreedPrice: string;
  offers: Offer[];
};


export const emptyDraft: Draft = {
  photo: null,
  originalPhoto: null,
  enhanced: false,
  transcript: "",
  title: "",
  description: "",
  keywords: [],
  category: "",
  material: "",
  craft: "",
  costs: { material: "", labour: "", other: "", days: "" },
  price: "",
};

export const emptyProfile: Profile = {
  name: "",
  age: "",
  location: "",
  craft: "",
  avatar: "",
};


type Session = {
  language: LangCode | null;
  role: Role | null;
  profile: Profile;
  draft: Draft;
};

type Market = {
  products: Product[];
  inquiries: Inquiry[];
};

const initialSession: Session = {
  language: null,
  role: null,
  profile: emptyProfile,
  draft: emptyDraft,
};

const initialMarket: Market = { products: [], inquiries: [] };

type Ctx = Session &
  Market & {
    ready: boolean;
    artisanName: string;
    /** Products listed by the person signed in right now. */
    myProducts: Product[];
    /** Published listings from every artisan on this device. */
    marketProducts: Product[];
    /** Inquiries an artisan received. */
    receivedInquiries: Inquiry[];
    /** Inquiries the signed-in buyer has sent. */
    sentInquiries: Inquiry[];
    set: (patch: Partial<Session>) => void;
    setProfile: (patch: Partial<Profile>) => void;
    patchDraft: (patch: Partial<Draft>) => void;
    resetDraft: () => void;
    publishDraft: (status?: Product["status"]) => Product;
    addInquiry: (
      i: Pick<
        Inquiry,
        | "buyer"
        | "buyerAvatar"
        | "buyerLocation"
        | "contact"
        | "productId"
        | "quantity"
        | "message"
      > & { offerPrice?: string },
    ) => string;

    setInquiryStatus: (id: string, status: Inquiry["status"]) => void;
    /** Put a new price on the table from either side. */
    addOffer: (id: string, offer: Omit<Offer, "at">) => void;
    /** Both sides settle on a final price. */
    acceptOffer: (id: string, price: string) => void;
    signOut: () => void;
  };

const StoreContext = createContext<Ctx | null>(null);
const SESSION_KEY = "shilpsetu.session.v2";
const MARKET_KEY = "shilpsetu.market.v2";

export function ShilpProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(initialSession);
  const [market, setMarket] = useState<Market>(initialMarket);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) {
        const parsed = JSON.parse(s) as Session;
        setSession({
          ...initialSession,
          ...parsed,
          profile: { ...emptyProfile, ...(parsed.profile ?? {}) },
        });
      }

      const m = localStorage.getItem(MARKET_KEY);
      if (m) {
        const parsedMarket = { ...initialMarket, ...(JSON.parse(m) as Market) };
        // Older saved inquiries pre-date the bargain coach.
        parsedMarket.inquiries = (parsedMarket.inquiries ?? []).map((i) => ({
          ...i,
          offerPrice: i.offerPrice ?? "",
          agreedPrice: i.agreedPrice ?? "",
          offers: Array.isArray(i.offers) ? i.offers : [],
        }));
        setMarket(parsedMarket);
      }
    } catch {
      /* ignore corrupted state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* storage full or unavailable */
    }
  }, [session, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(MARKET_KEY, JSON.stringify(market));
    } catch {
      /* storage full or unavailable */
    }
  }, [market, ready]);

  const value = useMemo<Ctx>(() => {
    const me = session.profile.name.trim().toLowerCase();
    const myProducts = market.products.filter(
      (p) => !me || (p.seller?.name ?? "").trim().toLowerCase() === me,
    );

    return {
      ...session,
      ...market,
      ready,
      artisanName: session.profile.name || "Friend",
      myProducts,
      marketProducts: market.products.filter((p) => p.status === "published"),
      receivedInquiries: market.inquiries.filter(
        (i) => !me || i.sellerName.trim().toLowerCase() === me,
      ),
      sentInquiries: market.inquiries.filter(
        (i) => !!me && i.buyer.trim().toLowerCase() === me,
      ),
      set: (patch) => setSession((s) => ({ ...s, ...patch })),
      setProfile: (patch) =>
        setSession((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
      patchDraft: (patch) =>
        setSession((s) => ({ ...s, draft: { ...s.draft, ...patch } })),
      resetDraft: () => setSession((s) => ({ ...s, draft: emptyDraft })),
      publishDraft: (status = "published") => {
        const d = session.draft;
        const product: Product = {
          id: `p${Date.now()}`,
          title: d.title || "Untitled craft",
          description: d.description,
          image: d.photo ?? "",
          price: d.price || "0",
          status,
          category: d.category,
          material: d.material,
          craft: d.craft,
          keywords: d.keywords,
          createdAt: Date.now(),
          seller: { ...session.profile },
        };
        setMarket((m) => ({ ...m, products: [product, ...m.products] }));
        return product;
      },
      addInquiry: (i) => {
        const id = `i${Date.now()}`;
        setMarket((m) => {
          const product = m.products.find((p) => p.id === i.productId);
          const offerPrice = (i.offerPrice ?? "").replace(/[^\d]/g, "");
          return {
            ...m,
            inquiries: [
              {
                ...i,
                sellerName: product?.seller?.name ?? "",
                productTitle: product?.title ?? "Product",
                productImage: product?.image ?? "",
                productPrice: product?.price ?? "0",
                id,
                date: new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                }),
                status: offerPrice ? "negotiating" : "new",
                offerPrice,
                agreedPrice: "",
                offers: offerPrice
                  ? [
                      {
                        by: "buyer" as const,
                        price: offerPrice,
                        note: i.message,
                        at: Date.now(),
                      },
                    ]
                  : [],
              },
              ...m.inquiries,
            ],
          };
        });
        return id;
      },
      signOut: () => {
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          /* storage unavailable */
        }
        setSession(initialSession);
      },
      setInquiryStatus: (id, status) =>
        setMarket((m) => ({
          ...m,
          inquiries: m.inquiries.map((x) => (x.id === id ? { ...x, status } : x)),
        })),
      addOffer: (id, offer) =>
        setMarket((m) => ({
          ...m,
          inquiries: m.inquiries.map((x) =>
            x.id === id
              ? {
                  ...x,
                  offerPrice: offer.price,
                  status: x.status === "accepted" ? x.status : "negotiating",
                  offers: [...(x.offers ?? []), { ...offer, at: Date.now() }],
                }
              : x,
          ),
        })),
      acceptOffer: (id, price) =>
        setMarket((m) => ({
          ...m,
          inquiries: m.inquiries.map((x) =>
            x.id === id
              ? { ...x, agreedPrice: price, offerPrice: price, status: "accepted" }
              : x,
          ),
        })),
    };
  }, [session, market, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useShilp() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useShilp must be used inside ShilpProvider");
  return ctx;
}

export const LANGUAGES: { code: LangCode; native: string; label: string }[] = [
  { code: "hi", native: "हिंदी", label: "Hindi" },
  { code: "en", native: "English", label: "English" },
  { code: "kn", native: "ಕನ್ನಡ", label: "Kannada" },
  { code: "ta", native: "தமிழ்", label: "Tamil" },
  { code: "te", native: "తెలుగు", label: "Telugu" },
];

export function rupees(v: string | number) {
  const n = Number(v) || 0;
  return `₹${n.toLocaleString("en-IN")}`;
}
