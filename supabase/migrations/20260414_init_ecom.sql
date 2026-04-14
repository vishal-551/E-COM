create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'customer');
create type public.order_status as enum ('Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled');
create type public.discount_type as enum ('fixed', 'percentage');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role app_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  brand text,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  sku text unique,
  featured boolean not null default false,
  is_active boolean not null default true,
  thumbnail_url text,
  thumbnail_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_stock on public.products(stock);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_text text,
  image_url text not null,
  image_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value numeric(12,2) not null check (discount_value >= 0),
  min_order_amount numeric(12,2) not null default 0,
  expiry_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status order_status not null default 'Pending',
  payment_method text not null,
  payment_status text not null default 'unpaid',
  subtotal numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  coupon_code text,
  shipping_address jsonb not null,
  courier_name text,
  tracking_id text,
  dispatch_date date,
  estimated_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_thumbnail_url text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active = true);
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.admin_activity_logs enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy "admin profiles manage" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "public active categories" on public.categories for select using (is_active = true or public.is_admin());
create policy "admin categories manage" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "public active products" on public.products for select using (is_active = true or public.is_admin());
create policy "admin products manage" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "public product images" on public.product_images for select using (true);
create policy "admin product images manage" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "own orders read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "own orders insert" on public.orders for insert with check (user_id = auth.uid() or public.is_admin());
create policy "admin update orders" on public.orders for update using (public.is_admin());

create policy "order items read by order owner" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
create policy "order items insert by owner/admin" on public.order_items for insert with check (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
create policy "admin manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "admin coupons manage" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "auth users can read active coupons" on public.coupons for select using (is_active = true or public.is_admin());

create policy "public banners read" on public.banners for select using (is_active = true or public.is_admin());
create policy "admin banners manage" on public.banners for all using (public.is_admin()) with check (public.is_admin());

create policy "public create enquiry" on public.enquiries for insert with check (true);
create policy "admin enquiries manage" on public.enquiries for all using (public.is_admin()) with check (public.is_admin());

create policy "public settings read" on public.site_settings for select using (true);
create policy "admin settings manage" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "own cart manage" on public.cart_items for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own wishlist manage" on public.wishlists for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "admin logs manage" on public.admin_activity_logs for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings(key, value)
values('global', jsonb_build_object(
  'storeName', 'Khushi Jewellery',
  'homeHeadline', 'Premium Artificial Jewellery Collection',
  'footerText', 'Affordable luxury jewellery with premium finish and trusted service.',
  'supportEmail', 'support@example.com',
  'supportPhone', '+91 90000 00000',
  'instagram', '#',
  'facebook', '#',
  'youtube', '#',
  'whatsapp', '#'
))
on conflict (key) do nothing;

insert into public.categories(name, slug, is_active) values
('Necklaces', 'necklaces', true),
('Earrings', 'earrings', true),
('Bracelets', 'bracelets', true),
('Rings', 'rings', true)
on conflict (slug) do nothing;
