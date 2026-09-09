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
};

export type Inquiry = {
  id: string;
  buyer: string;
  contact: string;
  productId: string;
  productTitle: string;
  quantity: string;
  message: string;
  date: string;
  status: "new" | "contacted" | "completed";
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

type State = {
  language: LangCode | null;
  role: Role | null;
  artisanName: string;
  draft: Draft;
  products: Product[];
  inquiries: Inquiry[];
};

const initial: State = {
  language: null,
  role: null,
  artisanName: "Savitri",
  draft: emptyDraft,
  products: [],
  inquiries: [],
};

type Ctx = State & {
  ready: boolean;
  set: (patch: Partial<State>) => void;
  patchDraft: (patch: Partial<Draft>) => void;
  resetDraft: () => void;
  publishDraft: (status?: Product["status"]) => Product;
  addInquiry: (i: Omit<Inquiry, "id" | "date" | "status">) => void;
  setInquiryStatus: (id: string, status: Inquiry["status"]) => void;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = "shilpsetu.v1";

export function ShilpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore corrupted state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, ready]);

  const value = useMemo<Ctx>(() => {
    const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
    return {
      ...state,
      ready,
      set,
      patchDraft: (patch) =>
        setState((s) => ({ ...s, draft: { ...s.draft, ...patch } })),
      resetDraft: () => setState((s) => ({ ...s, draft: emptyDraft })),
      publishDraft: (status = "published") => {
        const d = state.draft;
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
        };
        setState((s) => ({ ...s, products: [product, ...s.products] }));
        return product;
      },
      addInquiry: (i) =>
        setState((s) => ({
          ...s,
          inquiries: [
            {
              ...i,
              id: `i${Date.now()}`,
              date: new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              }),
              status: "new",
            },
            ...s.inquiries,
          ],
        })),
      setInquiryStatus: (id, status) =>
        setState((s) => ({
          ...s,
          inquiries: s.inquiries.map((x) => (x.id === id ? { ...x, status } : x)),
        })),
    };
  }, [state, ready]);

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
