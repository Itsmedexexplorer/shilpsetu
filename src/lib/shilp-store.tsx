import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deleteProductRemote,
  fetchMarket,
  patchInquiry,
  patchProductStatus,
  saveInquiry,
  saveProduct,
  subscribeMarket,
} from "@/lib/market-sync";

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
  status: "published" | "draft" | "soldout";
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
  /** A single buyer request, or an organisation's bulk order. */
  kind: "single" | "bulk";
  /** Organisation placing the bulk order. */
  orgName: string;
  /** When the organisation needs delivery. */
  deadline: string;
  /** Where the order must be delivered. */
  deliverTo: string;
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


/** A saved identity on this device. One person can switch between them. */
export type Account = {
  id: string;
  role: Role;
  profile: Profile;
  demo: boolean;
  createdAt: number;
};

type Session = {
  language: LangCode | null;
  role: Role | null;
  profile: Profile;
  draft: Draft;
  accountId: string | null;
};

export const DEMO_ACCOUNTS: Omit<Account, "createdAt">[] = [
  {
    id: "demo-artisan",
    role: "artisan",
    demo: true,
    profile: {
      name: "Meera Kumbhar",
      age: "42",
      location: "Kutch, Gujarat",
      craft: "Terracotta pottery",
      avatar: "",
    },
  },
  {
    id: "demo-buyer",
    role: "buyer",
    demo: true,
    profile: {
      name: "Ananya Rao",
      age: "29",
      location: "Bengaluru, Karnataka",
      craft: "",
      avatar: "",
    },
  },
  {
    id: "demo-org",
    role: "org",
    demo: true,
    profile: {
      name: "Craft Bazaar Collective",
      age: "",
      location: "New Delhi",
      craft: "Bulk buying for retail stores",
      avatar: "",
    },
  },
];

type Market = {
  products: Product[];
  inquiries: Inquiry[];
};

const initialSession: Session = {
  language: null,
  role: null,
  profile: emptyProfile,
  draft: emptyDraft,
  accountId: null,
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
    /** Mark a listing available again or out of stock. */
    setProductStatus: (id: string, status: Product["status"]) => void;
    /** Remove a listing for good. */
    deleteProduct: (id: string) => void;
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
      > & {
        offerPrice?: string;
        kind?: Inquiry["kind"];
        orgName?: string;
        deadline?: string;
        deliverTo?: string;
      },
    ) => string;


    setInquiryStatus: (id: string, status: Inquiry["status"]) => void;
    /** Put a new price on the table from either side. */
    addOffer: (id: string, offer: Omit<Offer, "at">) => void;
    /** Both sides settle on a final price. */
    acceptOffer: (id: string, price: string) => void;
    signOut: () => void;
    /** Every identity saved on this device. */
    accounts: Account[];
    /** Sign in as a saved identity. */
    useAccount: (id: string) => Account | undefined;
    /** Start a fresh empty identity with the chosen role. */
    createAccount: (role: Role, profile?: Profile) => string;
    /** Load one of the ready-made demo identities. */
    startDemo: (id: string) => Account | undefined;
    /** Same person, different side of the market. */
    switchRole: (role: Role) => void;
    /** Forget a saved identity on this device. */
    removeAccount: (id: string) => void;
  };

const StoreContext = createContext<Ctx | null>(null);
const SESSION_KEY = "shilpsetu.session.v2";
const MARKET_KEY = "shilpsetu.market.v2";
const ACCOUNTS_KEY = "shilpsetu.accounts.v1";

export function ShilpProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(initialSession);
  const [market, setMarket] = useState<Market>(initialMarket);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
          kind: i.kind ?? "single",
          orgName: i.orgName ?? "",
          deadline: i.deadline ?? "",
          deliverTo: i.deliverTo ?? "",
        }));

        setMarket(parsedMarket);
      }

      const a = localStorage.getItem(ACCOUNTS_KEY);
      if (a) setAccounts(JSON.parse(a) as Account[]);
    } catch {
      /* ignore corrupted state */
    }
    setReady(true);
  }, []);

  // Everything listed or asked for lives online, so every phone sees the same market.
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const remote = await fetchMarket();
      if (alive && remote) setMarket(remote);
    };
    void pull();
    const unsubscribe = subscribeMarket(() => void pull());
    const onFocus = () => void pull();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
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

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      /* storage full or unavailable */
    }
  }, [accounts, ready]);

  // Keep the saved identity in step with edits made while signed in.
  useEffect(() => {
    if (!ready || !session.accountId || !session.role) return;
    setAccounts((list) =>
      list.map((a) =>
        a.id === session.accountId
          ? { ...a, role: session.role as Role, profile: session.profile }
          : a,
      ),
    );
  }, [ready, session.accountId, session.role, session.profile]);

  const value = useMemo<Ctx>(() => {
    const me = session.profile.name.trim().toLowerCase();
    const myProducts = market.products.filter(
      (p) => !me || (p.seller?.name ?? "").trim().toLowerCase() === me,
    );

    return {
      ...session,
      ...market,
      accounts,
      ready,
      artisanName: session.profile.name || "Friend",
      myProducts,
      marketProducts: market.products.filter(
        (p) => p.status === "published" || p.status === "soldout",
      ),
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
        void saveProduct(product);
        return product;
      },
      addInquiry: (i) => {
        const id = `i${Date.now()}`;
        const product = market.products.find((p) => p.id === i.productId);
        const offerPrice = (i.offerPrice ?? "").replace(/[^\d]/g, "");
        const inquiry: Inquiry = {
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
          kind: i.kind ?? "single",
          orgName: i.orgName ?? "",
          deadline: i.deadline ?? "",
          deliverTo: i.deliverTo ?? "",
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
        };
        setMarket((m) => ({ ...m, inquiries: [inquiry, ...m.inquiries] }));
        void saveInquiry(inquiry);
        return id;
      },
      signOut: () => {
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          /* storage unavailable */
        }
        setSession((s) => ({ ...initialSession, language: s.language }));
      },
      useAccount: (id) => {
        const acc = accounts.find((a) => a.id === id);
        if (acc)
          setSession((s) => ({
            ...s,
            accountId: acc.id,
            role: acc.role,
            profile: { ...emptyProfile, ...acc.profile },
            draft: emptyDraft,
          }));
        return acc;
      },
      createAccount: (role, profile) => {
        const id = `a${Date.now()}`;
        const p = { ...emptyProfile, ...(profile ?? {}) };
        setAccounts((list) => [
          ...list,
          { id, role, profile: p, demo: false, createdAt: Date.now() },
        ]);
        setSession((s) => ({
          ...s,
          accountId: id,
          role,
          profile: p,
          draft: profile ? s.draft : emptyDraft,
        }));
        return id;
      },
      startDemo: (id) => {
        const seed = DEMO_ACCOUNTS.find((d) => d.id === id);
        if (!seed) return undefined;
        const existing = accounts.find((a) => a.id === id);
        const acc: Account = existing ?? { ...seed, createdAt: Date.now() };
        if (!existing) setAccounts((list) => [...list, acc]);
        setSession((s) => ({
          ...s,
          accountId: acc.id,
          role: acc.role,
          profile: { ...emptyProfile, ...acc.profile },
          draft: emptyDraft,
        }));
        return acc;
      },
      switchRole: (role) => setSession((s) => ({ ...s, role })),
      removeAccount: (id) => {
        setAccounts((list) => list.filter((a) => a.id !== id));
        setSession((s) =>
          s.accountId === id ? { ...initialSession, language: s.language } : s,
        );
      },
      setProductStatus: (id, status) => {
        setMarket((m) => ({
          ...m,
          products: m.products.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
        void patchProductStatus(id, status);
      },
      deleteProduct: (id) => {
        setMarket((m) => ({
          ...m,
          products: m.products.filter((p) => p.id !== id),
        }));
        void deleteProductRemote(id);
      },
      setInquiryStatus: (id, status) => {
        setMarket((m) => ({
          ...m,
          inquiries: m.inquiries.map((x) => (x.id === id ? { ...x, status } : x)),
        }));
        void patchInquiry(id, { status });
      },
      addOffer: (id, offer) => {
        const current = market.inquiries.find((x) => x.id === id);
        const offers = [...(current?.offers ?? []), { ...offer, at: Date.now() }];
        const status: Inquiry["status"] =
          current?.status === "accepted" ? "accepted" : "negotiating";
        setMarket((m) => ({
          ...m,
          inquiries: m.inquiries.map((x) =>
            x.id === id ? { ...x, offerPrice: offer.price, status, offers } : x,
          ),
        }));
        void patchInquiry(id, { offerPrice: offer.price, status, offers });
      },
      acceptOffer: (id, price) => {
        setMarket((m) => ({
          ...m,
          inquiries: m.inquiries.map((x) =>
            x.id === id
              ? { ...x, agreedPrice: price, offerPrice: price, status: "accepted" }
              : x,
          ),
        }));
        void patchInquiry(id, {
          agreedPrice: price,
          offerPrice: price,
          status: "accepted",
        });
      },
    };
  }, [session, market, accounts, ready]);

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
