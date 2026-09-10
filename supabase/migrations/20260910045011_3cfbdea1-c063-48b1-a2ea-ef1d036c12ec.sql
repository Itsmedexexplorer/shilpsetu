CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '0',
  status TEXT NOT NULL DEFAULT 'published',
  category TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  craft TEXT NOT NULL DEFAULT '',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  seller JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at_ms BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo app can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Demo app can add products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo app can update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Demo app can delete products" ON public.products FOR DELETE USING (true);

CREATE TABLE public.inquiries (
  id TEXT PRIMARY KEY,
  buyer TEXT NOT NULL DEFAULT '',
  buyer_avatar TEXT NOT NULL DEFAULT '',
  buyer_location TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  product_title TEXT NOT NULL DEFAULT '',
  product_image TEXT NOT NULL DEFAULT '',
  product_price TEXT NOT NULL DEFAULT '0',
  seller_name TEXT NOT NULL DEFAULT '',
  quantity TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  offer_price TEXT NOT NULL DEFAULT '',
  agreed_price TEXT NOT NULL DEFAULT '',
  offers JSONB NOT NULL DEFAULT '[]'::jsonb,
  kind TEXT NOT NULL DEFAULT 'single',
  org_name TEXT NOT NULL DEFAULT '',
  deadline TEXT NOT NULL DEFAULT '',
  deliver_to TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO anon, authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo app can read inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Demo app can add inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo app can update inquiries" ON public.inquiries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Demo app can delete inquiries" ON public.inquiries FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;