-- ============================================================================
-- Supabase Migration: 001_initial_schema.sql
-- Database schema for Baba Hafeez Food Business (Gujranwala)
-- Includes Tables, Constraints, Indexes, RLS Policies, and Secure RPCs
-- ============================================================================

-- 1. Sequence for clean, sequential order numbers (e.g. BH-1001, BH-1002...)
create sequence if not exists order_number_seq start with 1001;

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id serial primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  original_price numeric(10, 2) check (original_price is null or original_price >= price),
  description text,
  image_url text not null,
  badge text,
  prep_time text default '15-20 mins',
  spicy_level text default 'Regular',
  is_available boolean default true not null,
  is_featured boolean default false not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast category and availability queries
create index if not exists idx_products_category on public.products(category) where is_available = true;
create index if not exists idx_products_sort_order on public.products(sort_order);

-- 3. PROMO CODES TABLE (Server-side validation only)
create table if not exists public.promo_codes (
  id serial primary key,
  code text unique not null,
  percent_off numeric(5, 2) not null check (percent_off > 0 and percent_off <= 100),
  is_active boolean default true not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  area text not null,
  city text default 'Gujranwala' not null,
  notes text,
  payment_method text default 'cod' not null check (payment_method in ('cod')),
  items jsonb not null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null check (delivery_fee >= 0),
  discount numeric(10, 2) default 0 not null check (discount >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text default 'new' not null check (status in ('new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for status filtering and order lookup
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.products enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;

-- PRODUCTS POLICIES:
-- 1) Public can read all active products
create policy "Public can view active products"
  on public.products for select
  using (is_available = true);

-- 2) Authenticated admin has full access to products
create policy "Admin full access on products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- PROMO CODES POLICIES:
-- Only authenticated admin can view and manage promo codes directly
create policy "Admin full access on promo_codes"
  on public.promo_codes for all
  to authenticated
  using (true)
  with check (true);

-- ORDERS POLICIES:
-- 1) Public can INSERT orders (during checkout)
create policy "Public can insert orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- 2) Authenticated admin has full read/write access to orders
create policy "Admin full access on orders"
  on public.orders for all
  to authenticated
  using (true)
  with check (true);

-- Explicit table and schema grants for anon and authenticated roles
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select, insert on public.orders to anon, authenticated;
grant update, delete on public.orders to authenticated;
grant all on public.products to authenticated;
grant all on public.promo_codes to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- ============================================================================
-- SECURE STORED PROCEDURES (RPC)
-- ============================================================================

-- Function 1: Validate promo code without exposing table contents to public
create or replace function public.validate_promo_code(p_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_promo record;
begin
  select percent_off, is_active, expires_at into v_promo
  from public.promo_codes
  where upper(code) = upper(trim(p_code)) and is_active = true;

  if not found then
    return json_build_object('valid', false, 'message', 'Invalid promo code');
  end if;

  if v_promo.expires_at is not null and v_promo.expires_at < now() then
    return json_build_object('valid', false, 'message', 'Promo code has expired');
  end if;

  return json_build_object(
    'valid', true,
    'percent_off', v_promo.percent_off
  );
end;
$$;

-- Function 2: Secure Order Placement with Server-Side Price Recalculation
-- Guarantees the server NEVER trusts prices submitted from client state.
create or replace function public.place_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_area text,
  p_city text,
  p_notes text,
  p_cart_items jsonb,
  p_promo_code text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_item record;
  v_db_product record;
  v_verified_items jsonb := '[]'::jsonb;
  v_subtotal numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2) := 150;
  v_free_delivery_threshold numeric(10, 2) := 1500;
  v_discount numeric(10, 2) := 0;
  v_percent_off numeric(5, 2) := 0;
  v_grand_total numeric(10, 2) := 0;
  v_order_number text;
  v_order_id uuid;
begin
  -- Validate Customer Info
  if trim(p_customer_name) = '' or trim(p_phone) = '' or trim(p_address) = '' or trim(p_area) = '' then
    raise exception 'Customer name, phone, address, and delivery area are required';
  end if;

  if jsonb_array_length(p_cart_items) = 0 then
    raise exception 'Cart cannot be empty';
  end if;

  -- Verify each cart item with current DB price & availability
  for v_item in select * from jsonb_to_recordset(p_cart_items) as x(product_id int, quantity int) loop
    if v_item.quantity <= 0 then
      raise exception 'Invalid product quantity';
    end if;

    select id, name, price, is_available into v_db_product
    from public.products
    where id = v_item.product_id;

    if not found then
      raise exception 'Product ID % not found in catalog', v_item.product_id;
    end if;

    if not v_db_product.is_available then
      raise exception 'Item "%" is currently sold out', v_db_product.name;
    end if;

    v_subtotal := v_subtotal + (v_db_product.price * v_item.quantity);

    v_verified_items := v_verified_items || jsonb_build_object(
      'product_id', v_db_product.id,
      'name', v_db_product.name,
      'unit_price', v_db_product.price,
      'quantity', v_item.quantity,
      'item_subtotal', v_db_product.price * v_item.quantity
    );
  end loop;

  -- Apply Free Delivery rule if subtotal >= 1500
  if v_subtotal >= v_free_delivery_threshold then
    v_delivery_fee := 0;
  end if;

  -- Validate Promo Code if provided
  if p_promo_code is not null and trim(p_promo_code) <> '' then
    select percent_off into v_percent_off
    from public.promo_codes
    where upper(code) = upper(trim(p_promo_code))
      and is_active = true
      and (expires_at is null or expires_at > now());

    if found then
      v_discount := round((v_subtotal * (v_percent_off / 100.0)), 0);
    end if;
  end if;

  v_grand_total := v_subtotal + v_delivery_fee - v_discount;

  -- Generate sequential order number
  v_order_number := 'BH-' || nextval('order_number_seq')::text;

  -- Insert into public.orders
  insert into public.orders (
    order_number,
    customer_name,
    phone,
    address,
    area,
    city,
    notes,
    payment_method,
    items,
    subtotal,
    delivery_fee,
    discount,
    total,
    status
  ) values (
    v_order_number,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_address),
    trim(p_area),
    coalesce(nullif(trim(p_city), ''), 'Gujranwala'),
    trim(p_notes),
    'cod',
    v_verified_items,
    v_subtotal,
    v_delivery_fee,
    v_discount,
    v_grand_total,
    'new'
  )
  returning id into v_order_id;

  return json_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'customer_name', trim(p_customer_name),
    'phone', trim(p_phone),
    'address', trim(p_address),
    'area', trim(p_area),
    'city', coalesce(nullif(trim(p_city), ''), 'Gujranwala'),
    'items', v_verified_items,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'discount', v_discount,
    'total', v_grand_total,
    'status', 'new'
  );
end;
$$;

-- Function 3: Safe lookup for OrderSuccess screen by order number
create or replace function public.get_order_by_number(p_order_number text)
returns json
language plpgsql
security definer
as $$
declare
  v_order record;
begin
  select 
    id, order_number, customer_name, phone, address, area, city,
    items, subtotal, delivery_fee, discount, total, status, created_at
  into v_order
  from public.orders
  where upper(order_number) = upper(trim(p_order_number));

  if not found then
    return null;
  end if;

  return json_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'customer_name', v_order.customer_name,
    'phone', v_order.phone,
    'address', v_order.address,
    'area', v_order.area,
    'city', v_order.city,
    'items', v_order.items,
    'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee,
    'discount', v_order.discount,
    'total', v_order.total,
    'status', v_order.status,
    'created_at', v_order.created_at
  );
end;
$$;

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================
insert into public.products (name, category, price, original_price, description, image_url, badge, prep_time, spicy_level, is_available, is_featured, sort_order)
values
  ('Classic Zinger Burger', 'burgers', 450, 520, 'Crispy golden fried chicken fillet seasoned with secret spices, topped with iceberg lettuce and creamy garlic mayo in a toasted sesame bun.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80', 'Bestseller', '15-20 mins', 'Medium', true, true, 1),
  ('Crispy Chicken Deluxe', 'burgers', 420, 480, 'Juicy minced chicken patty grilled to perfection with cheddar cheese slice, fresh pickles, onions, and signature house sauce.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', 'Popular', '15-20 mins', 'Mild', true, true, 2),
  ('Double Crunch Tower Zinger', 'burgers', 650, 750, 'Two colossal layers of crunchy zinger fillets, double melted cheddar cheese, smoky BBQ drizzle, and crispy onion rings.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80', 'Chef''s Special', '20-25 mins', 'Hot', true, true, 3),
  ('Smash Beef Gourmet Burger', 'burgers', 590, 650, '100% prime beef smash patty seared with caramelized onions, American cheese, and secret tangy sauce on a soft brioche bun.', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80', 'Premium Beef', '20 mins', 'Mild', true, false, 4),
  ('Solo Zinger Deal', 'deals', 620, 750, '1 Classic Zinger Burger + 1 Regular Golden Crinkle Fries + 1 Chilled 345ml Soft Drink.', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80', 'Hot Deal', '15 mins', 'Medium', true, true, 5),
  ('Family Feast Box (Feeds 4)', 'deals', 2199, 2600, '2 Classic Zingers + 2 Chicken Deluxe Burgers + 1 Large Bucket of Crinkle Fries + 6 Hot Wings + 1.5L Chilled Soft Drink.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', 'Mega Saver', '25-30 mins', 'Variety', true, true, 6),
  ('Spicy Hot Wings (6 Pcs)', 'sides', 340, 390, 'Tender chicken wings marinated in peri-peri spices, deep fried with a crunchy coating and served with garlic chili dip.', 'https://images.unsplash.com/photo-1527477321075-d3e7b8681935?w=800&auto=format&fit=crop&q=80', 'Crispy', '15 mins', 'Hot', true, false, 7),
  ('Cheesy Loaded Beast Fries', 'sides', 380, 420, 'Golden crispy potato fries topped with hot liquid cheddar cheese, chopped crispy chicken bits, jalapeno slices, and special dynamite mayo.', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&auto=format&fit=crop&q=80', 'Must Try', '12-15 mins', 'Medium', true, true, 8),
  ('Crispy Chicken Tenders (4 Pcs)', 'sides', 350, 390, '100% chicken breast tenderloins fried golden brown with sweet honey mustard dip.', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80', 'Kids Favorite', '12 mins', 'Mild', true, false, 9),
  ('Chilled Soft Drink (Can / Bottle)', 'drinks', 120, 120, 'Choose from ice-cold Pepsi, 7Up, Mirinda, or Mountain Dew to refresh your taste buds.', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80', 'Chilled', 'Instant', 'None', true, false, 10),
  ('Fresh Mint Lemonade', 'drinks', 190, 220, 'Freshly squeezed lemon juice blended with crushed mint leaves, black salt, and sparkling soda.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', 'Refreshing', '5 mins', 'None', true, false, 11)
on conflict do nothing;
