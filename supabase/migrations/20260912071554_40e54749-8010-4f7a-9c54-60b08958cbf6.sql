alter table public.products
  add constraint products_title_len check (char_length(title) <= 120) not valid,
  add constraint products_desc_len check (char_length(coalesce(description,'')) <= 1200) not valid,
  add constraint products_price_len check (char_length(coalesce(price,'')) <= 12) not valid,
  add constraint products_category_len check (char_length(coalesce(category,'')) <= 60) not valid,
  add constraint products_material_len check (char_length(coalesce(material,'')) <= 60) not valid,
  add constraint products_craft_len check (char_length(coalesce(craft,'')) <= 60) not valid,
  add constraint products_image_len check (char_length(coalesce(image,'')) <= 3000000) not valid,
  add constraint products_status_valid check (status in ('published','draft','soldout')) not valid,
  add constraint products_keywords_size check (pg_column_size(keywords) <= 4000) not valid;

alter table public.inquiries
  add constraint inq_buyer_len check (char_length(coalesce(buyer,'')) <= 80) not valid,
  add constraint inq_contact_len check (char_length(coalesce(contact,'')) <= 80) not valid,
  add constraint inq_location_len check (char_length(coalesce(buyer_location,'')) <= 80) not valid,
  add constraint inq_message_len check (char_length(coalesce(message,'')) <= 800) not valid,
  add constraint inq_quantity_len check (char_length(coalesce(quantity,'')) <= 8) not valid,
  add constraint inq_offer_len check (char_length(coalesce(offer_price,'')) <= 12) not valid,
  add constraint inq_agreed_len check (char_length(coalesce(agreed_price,'')) <= 12) not valid,
  add constraint inq_org_len check (char_length(coalesce(org_name,'')) <= 100) not valid,
  add constraint inq_deadline_len check (char_length(coalesce(deadline,'')) <= 60) not valid,
  add constraint inq_deliver_len check (char_length(coalesce(deliver_to,'')) <= 100) not valid,
  add constraint inq_avatar_len check (char_length(coalesce(buyer_avatar,'')) <= 400000) not valid,
  add constraint inq_prodimage_len check (char_length(coalesce(product_image,'')) <= 3000000) not valid,
  add constraint inq_offers_size check (pg_column_size(offers) <= 20000) not valid;

drop policy if exists "Demo app can delete inquiries" on public.inquiries;
revoke delete on public.inquiries from anon, authenticated;